import logging

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import Settings
from app.models.schemas import SkillEmbeddingResult

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, settings: Settings) -> None:
        self.model = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.google_api_key,
            task_type="SEMANTIC_SIMILARITY",
            output_dimensionality=768,
        )

    async def embed_skills(
        self, skill_names: list[str]
    ) -> list[SkillEmbeddingResult]:
        if not skill_names:
            return []
        normalized = [s.strip().lower() for s in skill_names if s.strip()]
        if not normalized:
            return []
        vectors = await self.model.aembed_documents(normalized)
        return [
            SkillEmbeddingResult(skill=name, embedding=vec)
            for name, vec in zip(normalized, vectors, strict=True)
        ]
