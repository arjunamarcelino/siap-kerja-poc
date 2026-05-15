import logging

from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import Settings
from app.models.schemas import CVExtraction, GapAndRoadmap
from app.services.job_scraper import ScrapedJob

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an expert HR analyst and career advisor specializing in the "
    "Indonesian tech job market. You provide accurate, actionable advice "
    "based on real market data."
)

CV_EXTRACTION_PROMPT = """\
Analyze the following CV text and extract:
1. All technical and soft skills (use standardized names, e.g. 'JavaScript' not 'JS')
2. The candidate's experience level (junior, mid, or senior)
3. A 2-3 sentence professional summary focusing ONLY on skills and experience. \
Do NOT include the person's name, email, phone number, or address.

CV Text:
{cv_text}
"""

GAP_ANALYSIS_PROMPT = """\
You are analyzing a candidate's skills against job market requirements for the role: {target_role}

The candidate has these skills:
{identified_skills}

Experience level: {experience_level}

{job_market_context}

Based on this information:
1. List the skills required by the job market for this role
2. Identify which skills the candidate is missing (skill gaps)
3. Identify which skills the candidate already has that match requirements
4. Create a detailed, ordered learning roadmap to close the skill gaps
5. For each roadmap step, suggest 2-3 specific, preferably free learning resources
6. Estimate a realistic total duration for completing the roadmap

Focus on practical, actionable recommendations relevant to the Indonesian tech market.
"""


class LLMService:
    """Wrapper around Google Generative AI models via LangChain."""

    def __init__(self, settings: Settings) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.google_api_key,
            temperature=0,
        )

    async def extract_cv_data(self, cv_text: str) -> CVExtraction:
        """Extract skills, experience level, and summary from CV text."""
        structured_llm = self.llm.with_structured_output(
            CVExtraction, method="json_schema"
        )

        prompt = CV_EXTRACTION_PROMPT.format(cv_text=cv_text)
        messages = [
            ("system", SYSTEM_PROMPT),
            ("human", prompt),
        ]

        result = await structured_llm.ainvoke(messages)
        logger.info(
            "Extracted %d skills, level=%s",
            len(result.identified_skills),
            result.experience_level,
        )
        return result

    async def analyze_gaps_and_roadmap(
        self,
        cv_data: CVExtraction,
        job_listings: list[ScrapedJob],
        target_role: str,
    ) -> GapAndRoadmap:
        """Analyze skill gaps and generate a learning roadmap in a single LLM call."""
        structured_llm = self.llm.with_structured_output(
            GapAndRoadmap, method="json_schema"
        )

        if job_listings:
            job_context = "Here are real job listings from the Indonesian job market:\n\n"
            for i, job in enumerate(job_listings, 1):
                job_context += f"{i}. {job.title} at {job.company}\n"
                if job.required_skills:
                    job_context += f"   Required skills: {', '.join(job.required_skills)}\n"
                job_context += f"   Description: {job.description[:300]}\n\n"
        else:
            job_context = (
                f"No live job listings were available. Use your knowledge of typical "
                f"requirements for {target_role} roles in Indonesia's tech industry."
            )

        prompt = GAP_ANALYSIS_PROMPT.format(
            target_role=target_role,
            identified_skills=", ".join(cv_data.identified_skills),
            experience_level=cv_data.experience_level,
            job_market_context=job_context,
        )
        messages = [
            ("system", SYSTEM_PROMPT),
            ("human", prompt),
        ]

        result = await structured_llm.ainvoke(messages)
        logger.info(
            "Gap analysis: %d required, %d gaps, %d matching, %d roadmap steps",
            len(result.required_skills),
            len(result.skill_gaps),
            len(result.matching_skills),
            len(result.roadmap),
        )
        return result
