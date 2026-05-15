# SiapKerja

AI-powered Career Navigation based on Real Job Market Demand.

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript, pnpm
- **Backend:** Go, Gin, pgx, JWT
- **AI Service:** Python, FastAPI, LangChain, Gemini API
- **Database:** PostgreSQL 17 + pgvector
- **Cache:** Redis 7
- **Orchestration:** Docker Compose
- **Migrations:** dbmate (plain SQL)
- **CI/CD:** GitHub Actions

## Architecture

```
Browser → Next.js (:3000) → Go API (:8080) → Python AI (:8000)
                                    ↓               ↓
                              PostgreSQL (:5432)  Gemini API
                              Redis (:6379)
```

- Frontend only calls Go backend (single API gateway)
- AI service is internal, not exposed to frontend
- JWT auth via HttpOnly cookies

## Commands

```bash
make setup       # First-time: copy .env.example, start services
make dev         # Start all services with hot-reload
make down        # Stop all services
make test        # Run all tests
make lint        # Lint all services
make migrate     # Run pending migrations
make seed        # Seed database
make psql        # Connect to PostgreSQL
```

## Folder Structure

- `services/web/` — Next.js frontend (see services/web/CLAUDE.md)
- `services/api/` — Go backend (see services/api/CLAUDE.md)
- `services/ai/` — Python AI service (see services/ai/CLAUDE.md)
- `infra/docker/` — Per-service Dockerfiles (dev stage only for hackathon)
- `infra/migrations/` — dbmate SQL migrations
- `infra/seed/` — Database seed data (run with `make seed`)

## Conventions

- Commit messages: imperative mood (Add, Fix, Update, Remove)
- Branch naming: `feature/<description>`, `fix/<description>`
- Never commit `.env` files
- All services must have a `/health` endpoint
- Go: Clean Architecture layers (handler → service → repository)
- Python: FastAPI routers + Pydantic schemas
- Frontend: App Router, server components by default
- Error responses: `{"message": "..."}` format across all services
- DATABASE_URL: always use `postgresql://` protocol
