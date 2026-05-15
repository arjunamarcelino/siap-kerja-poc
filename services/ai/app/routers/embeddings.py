import logging

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_embedding_service, get_llm_service, get_redis_client
from app.models.schemas import EmbedSkillsRequest, EmbedSkillsResponse
from app.services.embedding_service import EmbeddingService
from app.services.job_scraper import ScrapedJob, fetch_jooble_jobs
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["embeddings"])


@router.post("/embed-skills", response_model=EmbedSkillsResponse)
async def embed_skills(
    req: EmbedSkillsRequest,
    svc: EmbeddingService = Depends(get_embedding_service),
) -> EmbedSkillsResponse:
    """Generate embeddings for a list of skill names."""
    try:
        results = await svc.embed_skills(req.skills)
    except Exception:
        logger.exception("Embedding generation failed")
        raise HTTPException(status_code=500, detail="Embedding generation failed")
    return EmbedSkillsResponse(embeddings=results)


@router.get("/scrape-jobs", response_model=list[ScrapedJob])
async def scrape_jobs(
    role: str = Query(..., min_length=1, max_length=100),
    redis_client=Depends(get_redis_client),
    llm_service: LLMService = Depends(get_llm_service),
) -> list[ScrapedJob]:
    """Fetch job listings from Jooble for a given role. Uses Redis cache."""
    return await fetch_jooble_jobs(
        role, redis_client=redis_client, llm_service=llm_service
    )
