# SiapKerja Monorepo Structure

**Date:** 2026-05-15
**Status:** Decided
**Participants:** Arjuna Marcelino

## What We're Building

A monorepo containing all three SiapKerja services -- Next.js frontend, Go backend, and Python AI service -- orchestrated with Docker Compose. The repo includes full starter code with working health checks, DB connections, CI/CD pipelines, and database migrations.

### Scope

- **In scope:** Monorepo structure, Docker Compose orchestration, per-service Dockerfiles, starter boilerplate for all 3 services, PostgreSQL + pgvector + Redis setup, GitHub Actions CI/CD, database migrations, seed data scripts, JWT auth scaffold, `.env` management, Makefile for common commands.
- **Out of scope:** Production deployment config (Kubernetes, cloud infra), monitoring/observability, the actual SiapKerja feature logic (CV parsing, roadmap generation, job scraping).

## Why This Approach

**Chosen: Service-Centric Layout (Approach A)**

```
siapkerja/
├── services/
│   ├── web/              # Next.js + Tailwind frontend
│   ├── api/              # Go (Golang) backend
│   └── ai/               # Python FastAPI + LangChain AI service
├── infra/
│   ├── docker/           # Per-service Dockerfiles (api.Dockerfile, web.Dockerfile, ai.Dockerfile)
│   ├── migrations/       # PostgreSQL migrations (shared)
│   └── seed/             # Database seed data scripts
├── docker-compose.yml    # Orchestrates all services + DB + Redis
├── Makefile              # Dev commands (up, down, migrate, seed, test)
├── .github/
│   └── workflows/        # CI/CD pipelines
├── .env.example          # Shared environment template
├── .gitignore
└── README.md
```

**Rationale:**
- Groups all services under `services/` keeping the root directory clean
- Centralizes infrastructure concerns (Docker, migrations) in `infra/`
- Each team member works in their own service folder with minimal conflicts
- Migrations are centralized since all services share the same PostgreSQL instance
- Scales if additional services are added later without restructuring

**Rejected alternatives:**
- *Flat Layout* -- Root gets cluttered as config files accumulate. Harder to distinguish service dirs from infra dirs.
- *Domain-Driven (apps/ + services/ + packages/)* -- Over-engineered for a 3-person hackathon team. `packages/shared` adds indirection without immediate value when services communicate via REST.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Monorepo scope | All 3 services in one repo | Team of 3, hackathon timeline, easier coordination |
| Orchestration | Docker Compose | Simple, no extra monorepo framework overhead, each service has its own Dockerfile |
| Folder structure | Service-centric (`services/` + `infra/`) | Clean root, clear ownership, good balance of simplicity and organization |
| Service communication | REST APIs everywhere | Simple, well-understood, debuggable. No need for gRPC/queues at MVP stage |
| API routing pattern | Go backend as gateway | Frontend only calls Go. Go proxies AI requests to Python. Single API surface, single CORS config, auth handled in one place |
| Authentication | JWT-based | Stateless, works well with Go backend + Next.js frontend, simple to implement |
| Scaffolding level | Full starter code | Each service gets working hello-world with routes, DB connection, health checks |
| Database | PostgreSQL + pgvector + Redis | pgvector for skill embeddings, Redis for caching job market data and AI responses |
| CI/CD | GitHub Actions | Standard for GitHub-hosted repos, free tier sufficient for hackathon |
| Dev experience | Docker Compose with volume mounts | Hot-reload for all services during local development |

## Service Details

### `services/web` -- Next.js Frontend
- **Tech:** Next.js, Tailwind CSS, TypeScript
- **Responsibilities:** CV upload UI, career roadmap visualization, job recommendation dashboard, study tracker
- **Communicates with:** Go backend only (single API gateway)
- **Port:** 3000

### `services/api` -- Go Backend
- **Tech:** Go, standard library or chi/gin router, sqlx/pgx for DB
- **Responsibilities:** API routing, JWT auth, CV file storage, job scraping orchestration, user management
- **Communicates with:** PostgreSQL, Redis, Python AI service via REST
- **Port:** 8080

### `services/ai` -- Python AI Service (internal, not exposed to frontend)
- **Tech:** Python, FastAPI, LangChain, Gemini API
- **Responsibilities:** CV parsing & skill extraction, skill gap analysis, roadmap generation, job matching/recommendation, micro-challenge generation
- **Communicates with:** PostgreSQL (pgvector for embeddings), Gemini API. Called by Go backend only.
- **Port:** 8000 (Docker internal network only)

### Infrastructure
- **PostgreSQL:** Primary database with pgvector extension for semantic skill embeddings
- **Redis:** Caching job market data and AI responses
- **Migrations:** Managed centrally in `infra/migrations/`, run via Makefile target
- **Seed data:** Initial data scripts in `infra/seed/` for development (sample skills, career paths, test users)

## Open Questions

- **Go router choice:** chi vs gin vs standard library `net/http`? (Can decide during implementation)
- **Migration tool:** golang-migrate, goose, or raw SQL files? (Can decide during implementation)
- **CV file storage:** Local filesystem in Docker volume vs cloud storage (S3/GCS)? Local is fine for hackathon.
- **Job scraping strategy:** Which job portals to target first? API-based (if available) or web scraping?

## Next Steps

1. Run `/workflows:plan` to generate the detailed implementation plan for scaffolding this monorepo
2. Scaffold the folder structure and Docker Compose setup
3. Initialize each service with starter code
4. Set up CI/CD pipeline
5. Begin feature development per team role assignments
