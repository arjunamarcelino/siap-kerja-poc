import json
import logging
from typing import TYPE_CHECKING

import httpx
from pydantic import BaseModel

from app.config import get_settings

if TYPE_CHECKING:
    from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class ScrapedJob(BaseModel):
    """Typed model for scraped job data."""

    title: str
    company: str
    required_skills: list[str]
    description: str


CACHE_TTL_SECONDS = 6 * 60 * 60  # 6 hours
JOOBLE_TIMEOUT_SECONDS = 15

# Common tech skills for fast keyword extraction from descriptions.
KNOWN_SKILLS: set[str] = {
    # Languages
    "python", "javascript", "typescript", "java", "go", "golang", "rust",
    "c++", "c#", "ruby", "php", "swift", "kotlin", "scala", "r", "dart",
    "sql", "html", "css",
    # Frameworks / Libraries
    "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "express",
    "django", "flask", "fastapi", "spring", "spring boot", "rails",
    "laravel", ".net", "gin", "fiber", "nest.js", "tailwind", "bootstrap",
    "flutter", "react native",
    # Data / ML
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "spark",
    "hadoop", "kafka", "airflow", "dbt", "tableau", "power bi", "looker",
    "machine learning", "deep learning", "nlp", "computer vision",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "cassandra", "sqlite", "firebase",
    # Cloud / Infra
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
    "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd",
    "linux", "nginx", "cloudflare",
    # Tools / Practices
    "git", "jira", "figma", "rest api", "graphql", "grpc",
    "microservices", "agile", "scrum", "tdd", "devops",
    "node.js", "rabbitmq",
}


def _extract_skills_keyword(text: str) -> list[str]:
    """Fast keyword-based skill extraction from job description text."""
    lower = text.lower()
    found: list[str] = []
    for skill in KNOWN_SKILLS:
        if skill in lower:
            # Title-case for display (e.g. "python" -> "Python")
            found.append(skill.title() if skill.islower() else skill)
    return sorted(set(found))


async def _extract_skills_llm(
    jobs: list[dict],
    llm_service: "LLMService",
) -> dict[int, list[str]]:
    """Use LLM to batch-extract skills for jobs that got <2 from keywords.

    Returns a mapping of job index -> extracted skills list.
    """
    # Build a compact prompt with all jobs that need extraction
    prompt_parts: list[str] = []
    indices: list[int] = []
    for idx, job in jobs:
        prompt_parts.append(
            f"[{idx}] {job.get('title', '')} at {job.get('company', '')}: "
            f"{job.get('snippet', '')[:400]}"
        )
        indices.append(idx)

    prompt = (
        "Extract technical skills from each job listing below. "
        "Return a JSON object mapping the index number to a list of skill names.\n\n"
        + "\n".join(prompt_parts)
    )

    try:
        from langchain_core.messages import HumanMessage, SystemMessage

        messages = [
            SystemMessage(content="You extract technical skills from job descriptions. Return valid JSON only."),
            HumanMessage(content=prompt),
        ]
        response = await llm_service.llm.ainvoke(messages)
        content = response.content.strip()
        # Strip markdown code fences if present
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
        result = json.loads(content)
        return {int(k): v for k, v in result.items() if isinstance(v, list)}
    except Exception:
        logger.warning("LLM skill extraction failed, using keyword results only", exc_info=True)
        return {}


async def fetch_jooble_jobs(
    target_role: str,
    *,
    limit: int = 10,
    redis_client=None,
    llm_service: "LLMService | None" = None,
) -> list[ScrapedJob]:
    """Fetch job listings from the Jooble API for the target role.

    Returns empty list on failure so callers can fall back gracefully.
    """
    settings = get_settings()
    if not settings.jooble_api_key:
        logger.info("JOOBLE_API_KEY not set, skipping Jooble fetch")
        return []

    cache_key = f"jooble_jobs:{target_role.lower().replace(' ', '_').replace('/', '_')}"

    # Check Redis cache
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info("Returning cached Jooble results for %s", target_role)
                return [ScrapedJob(**j) for j in json.loads(cached)]
        except Exception:
            logger.warning("Redis cache read failed", exc_info=True)

    # Call Jooble API
    url = f"https://jooble.org/api/{settings.jooble_api_key}"
    payload = {"keywords": target_role, "location": "Indonesia"}

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(JOOBLE_TIMEOUT_SECONDS, connect=5.0),
        ) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()

        data = resp.json()
        raw_jobs = data.get("jobs", [])[:limit]
    except (httpx.HTTPError, Exception):
        logger.warning(
            "Jooble API call failed for role '%s'",
            target_role,
            exc_info=True,
        )
        return []

    if not raw_jobs:
        logger.info("Jooble returned 0 jobs for '%s'", target_role)
        return []

    # Two-pass skill extraction
    jobs: list[ScrapedJob] = []
    needs_llm: list[tuple[int, dict]] = []

    for i, raw in enumerate(raw_jobs):
        title = raw.get("title", "").strip()
        company = raw.get("company", "").strip()
        snippet = raw.get("snippet", "").strip()

        if not title:
            continue

        skills = _extract_skills_keyword(f"{title} {snippet}")

        job = ScrapedJob(
            title=title,
            company=company,
            required_skills=skills,
            description=snippet[:500],
        )
        jobs.append(job)

        if len(skills) < 2:
            needs_llm.append((i, raw))

    # Optional LLM pass for jobs with few keyword-extracted skills
    if needs_llm and llm_service:
        llm_results = await _extract_skills_llm(needs_llm, llm_service)
        for idx, skills in llm_results.items():
            if 0 <= idx < len(jobs):
                # Merge with existing, deduplicate
                existing = set(s.lower() for s in jobs[idx].required_skills)
                merged = list(jobs[idx].required_skills)
                for sk in skills:
                    if sk.lower() not in existing:
                        merged.append(sk)
                        existing.add(sk.lower())
                jobs[idx].required_skills = merged

    # Cache results in Redis
    if redis_client and jobs:
        try:
            serialized = json.dumps([j.model_dump() for j in jobs])
            await redis_client.set(cache_key, serialized, ex=CACHE_TTL_SECONDS)
        except Exception:
            logger.warning("Redis cache write failed", exc_info=True)

    logger.info("Fetched %d jobs from Jooble for '%s'", len(jobs), target_role)
    return jobs
