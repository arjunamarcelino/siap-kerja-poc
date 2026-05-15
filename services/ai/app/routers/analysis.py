import asyncio
import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.models.schemas import AnalysisResult, CareerRole
from app.services.analysis_service import AnalysisService
from app.dependencies import get_analysis_service

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

_semaphore = asyncio.Semaphore(3)


@router.post("/analyze-cv", response_model=AnalysisResult)
async def analyze_cv(
    file: UploadFile = File(...),
    career_aspiration: CareerRole = Form(...),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisResult:
    """Analyze a CV against job market requirements for the target career role."""

    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(422, "Only PDF files are accepted")

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(422, "File too large. Maximum is 5 MB.")

    # Validate magic bytes
    if not contents[:5].startswith(b"%PDF-"):
        raise HTTPException(422, "File is not a valid PDF")

    # Limit concurrent analyses to prevent memory exhaustion
    async with _semaphore:
        return await analysis_service.run_full_analysis(contents, career_aspiration)
