import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.routers import health

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan: runs setup on startup and teardown on shutdown."""
    logger.info("AI service started")
    yield


app = FastAPI(
    title="SiapKerja AI Service",
    lifespan=lifespan,
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Return errors in {"message": "..."} format instead of FastAPI's default
    {"detail": "..."} structure."""
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", str(exc))
    return JSONResponse(
        status_code=status_code,
        content={"message": detail},
    )


app.include_router(health.router)
