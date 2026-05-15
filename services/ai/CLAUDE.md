# SiapKerja AI Service

Python microservice providing AI-powered features (CV analysis, learning roadmaps, job matching).

## Stack

- **FastAPI** + **Pydantic** for HTTP API and request/response validation.
- **LangChain** with `langchain-google-genai` for AI orchestration (Gemini models).
- **PostgreSQL** (via `psycopg` + `SQLAlchemy`) for persistence.
- **Redis** for caching and rate-limiting.
- **pydantic-settings** for typed configuration (`extra="ignore"` to tolerate extra env vars).

## Project layout

```
services/ai/
  app/
    main.py          # FastAPI application, lifespan, exception handler
    config.py        # Settings (pydantic-settings) + get_settings() singleton
    dependencies.py  # FastAPI dependency functions
    routers/         # One module per feature (health, cv, roadmap, ...)
    services/        # Business logic (LLMService, etc.)
    models/
      schemas.py     # Pydantic request/response models
  tests/             # pytest test modules
  pyproject.toml     # Package metadata and dependencies
```

## Adding a new endpoint

1. Create a new router module in `app/routers/` (e.g. `app/routers/cv.py`).
2. Define the route using `APIRouter`.
3. Register the router in `app/main.py` with `app.include_router(...)`.
4. Add request/response Pydantic models in `app/models/schemas.py`.

## Error responses

All errors are returned in `{"message": "..."}` format via the custom exception handler in `app/main.py`. Do **not** use FastAPI's default `{"detail": "..."}` shape.

## Configuration

Settings are loaded from environment variables by `pydantic-settings`. Required vars:

- `GOOGLE_API_KEY` -- Google AI / Gemini API key.
- `DATABASE_URL` -- PostgreSQL connection string.
- `REDIS_URL` -- Redis connection string (defaults to `redis://localhost:6379`).

The `SettingsConfigDict(extra="ignore")` directive ensures the app does not crash when unrelated environment variables are present.

## Running locally

```bash
cd services/ai
uvicorn app.main:app --reload --port 8001
```

## Testing

```bash
pytest -v
```

## Linting

```bash
ruff check .
```
