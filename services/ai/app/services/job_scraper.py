import asyncio
import json
import logging

import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class ScrapedJob(BaseModel):
    """Typed model for scraped job data."""

    title: str
    company: str
    required_skills: list[str]
    description: str


ROLE_SEARCH_QUERIES: dict[str, str] = {
    "Data Analyst": "data+analyst",
    "UI/UX Designer": "ui+ux+designer",
    "AI / ML Engineer": "machine+learning+engineer",
    "Product Manager": "product+manager",
    "Backend Developer": "backend+developer",
    "Frontend Developer": "frontend+developer",
    "Full Stack Developer": "full+stack+developer",
    "DevOps Engineer": "devops+engineer",
    "Data Scientist": "data+scientist",
    "Mobile Developer": "mobile+developer",
}

SCRAPE_TIMEOUT_SECONDS = 15
CACHE_TTL_SECONDS = 6 * 60 * 60  # 6 hours


async def scrape_glints_jobs(
    target_role: str,
    *,
    limit: int = 10,
    redis_client=None,
) -> list[ScrapedJob]:
    """Scrape job listings from Glints for the target role.

    Returns empty list on failure — analysis proceeds using LLM knowledge.
    """
    query = ROLE_SEARCH_QUERIES.get(target_role)
    if not query:
        logger.warning("No search query mapping for role: %s", target_role)
        return []

    cache_key = f"glints_jobs:{target_role.lower().replace(' ', '_').replace('/', '_')}"

    # Check Redis cache first
    if redis_client:
        try:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.info("Returning cached Glints results for %s", target_role)
                return [ScrapedJob(**j) for j in json.loads(cached)]
        except Exception:
            logger.warning("Redis cache read failed", exc_info=True)

    url = f"https://glints.com/id/opportunities/jobs/explore?keyword={query}&country=ID"

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(SCRAPE_TIMEOUT_SECONDS, connect=5.0),
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml",
            },
        ) as client:
            await asyncio.sleep(1.0)  # Politeness delay
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        jobs = _parse_glints_html(soup, limit=limit)

        if not jobs:
            logger.warning(
                "No jobs parsed from Glints for '%s' — page may use client-side rendering",
                target_role,
            )
            return []

        # Cache results in Redis
        if redis_client and jobs:
            try:
                serialized = json.dumps([j.model_dump() for j in jobs])
                await redis_client.set(cache_key, serialized, ex=CACHE_TTL_SECONDS)
            except Exception:
                logger.warning("Redis cache write failed", exc_info=True)

        return jobs

    except (httpx.HTTPError, Exception):
        logger.warning(
            "Job scraping failed for role '%s', falling back to LLM knowledge",
            target_role,
            exc_info=True,
        )
        return []


def _parse_glints_html(soup: BeautifulSoup, *, limit: int = 10) -> list[ScrapedJob]:
    """Parse job listings from Glints HTML.

    This parser uses multiple fallback selectors since Glints may change
    their HTML structure at any time.
    """
    jobs: list[ScrapedJob] = []

    # Try common Glints job card selectors
    job_cards = (
        soup.select("div[data-test='job-card']")
        or soup.select("div.job-card")
        or soup.select("a[href*='/opportunities/jobs/']")
    )

    for card in job_cards[:limit]:
        try:
            title_el = (
                card.select_one("h2")
                or card.select_one("[class*='JobTitle']")
                or card.select_one("[class*='title']")
            )
            company_el = (
                card.select_one("[class*='CompanyName']")
                or card.select_one("[class*='company']")
                or card.select_one("span")
            )
            desc_el = card.select_one("[class*='description']") or card

            title = title_el.get_text(strip=True) if title_el else ""
            company = company_el.get_text(strip=True) if company_el else ""
            description = desc_el.get_text(strip=True) if desc_el else ""

            if not title:
                continue

            # Extract skills from description text (common patterns)
            skills: list[str] = []
            skill_el = card.select_one("[class*='skill']")
            if skill_el:
                skill_tags = skill_el.select("span")
                skills = [s.get_text(strip=True) for s in skill_tags if s.get_text(strip=True)]

            jobs.append(
                ScrapedJob(
                    title=title,
                    company=company,
                    required_skills=skills,
                    description=description[:500],  # Truncate long descriptions
                )
            )
        except Exception:
            continue

    return jobs
