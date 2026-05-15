from functools import lru_cache

import redis.asyncio as aioredis

from app.config import Settings, get_settings
from app.services.analysis_service import AnalysisService
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService


def get_app_settings() -> Settings:
    """FastAPI dependency that returns the settings singleton."""
    return get_settings()


async def get_db_session():
    """FastAPI dependency that yields a database session.

    This will be implemented once the database layer is set up.
    For now it yields None as a placeholder so routers can already
    declare the dependency in their signatures.
    """
    yield None


@lru_cache
def _get_llm_service() -> LLMService:
    return LLMService(get_settings())


@lru_cache
def _get_redis_client():
    settings = get_settings()
    return aioredis.from_url(settings.redis_url)


def get_redis_client():
    """FastAPI dependency that returns the Redis client."""
    return _get_redis_client()


def get_analysis_service() -> AnalysisService:
    """FastAPI dependency that returns the analysis service."""
    return AnalysisService(
        llm_service=_get_llm_service(),
        redis_client=_get_redis_client(),
    )


@lru_cache
def _get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_settings())


def get_embedding_service() -> EmbeddingService:
    """FastAPI dependency that returns the embedding service."""
    return _get_embedding_service()
