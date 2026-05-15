import asyncio
import logging

from fastapi import HTTPException
from langchain_google_genai.chat_models import ChatGoogleGenerativeAIError

from app.models.schemas import AnalysisResult
from app.services.job_scraper import scrape_glints_jobs
from app.services.llm_service import LLMService
from app.services.pdf_parser import PDFParseError, extract_text_from_pdf

logger = logging.getLogger(__name__)


class AnalysisService:
    """Orchestrates the full CV analysis pipeline."""

    def __init__(self, llm_service: LLMService, redis_client=None) -> None:
        self.llm_service = llm_service
        self.redis_client = redis_client

    async def run_full_analysis(
        self, pdf_bytes: bytes, target_role: str
    ) -> AnalysisResult:
        """Run the complete analysis pipeline:
        1. Parse PDF and scrape jobs in parallel
        2. Extract CV skills via LLM
        3. Gap analysis + roadmap via LLM
        """
        # Phase 1: Parse PDF and scrape jobs IN PARALLEL
        try:
            cv_text, job_listings = await asyncio.gather(
                asyncio.to_thread(extract_text_from_pdf, pdf_bytes),
                scrape_glints_jobs(target_role, redis_client=self.redis_client),
            )
        except PDFParseError as e:
            raise HTTPException(422, f"Failed to parse PDF: {e}") from e

        logger.info(
            "Phase 1 complete: %d chars extracted, %d jobs scraped",
            len(cv_text),
            len(job_listings),
        )

        try:
            # Phase 2: Extract skills from CV (depends on cv_text)
            cv_data = await self.llm_service.extract_cv_data(cv_text)

            # Phase 3: Gap analysis + roadmap in SINGLE LLM call
            gap_and_roadmap = await self.llm_service.analyze_gaps_and_roadmap(
                cv_data=cv_data,
                job_listings=job_listings,
                target_role=target_role,
            )
        except ChatGoogleGenerativeAIError as e:
            msg = str(e)
            if "RESOURCE_EXHAUSTED" in msg or "429" in msg:
                raise HTTPException(
                    429,
                    "AI quota exceeded. Please wait a minute and try again.",
                ) from e
            raise HTTPException(
                502, "AI model returned an error. Please try again."
            ) from e

        return AnalysisResult(
            identified_skills=cv_data.identified_skills,
            experience_level=cv_data.experience_level,
            cv_summary=cv_data.cv_summary,
            required_skills=gap_and_roadmap.required_skills,
            skill_gaps=gap_and_roadmap.skill_gaps,
            matching_skills=gap_and_roadmap.matching_skills,
            roadmap=gap_and_roadmap.roadmap,
            estimated_duration=gap_and_roadmap.estimated_duration,
            jobs_analyzed=len(job_listings),
            target_role=target_role,
        )
