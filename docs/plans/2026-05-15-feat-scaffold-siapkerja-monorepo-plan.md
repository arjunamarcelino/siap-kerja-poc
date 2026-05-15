---
title: "feat: Scaffold SiapKerja Monorepo"
type: feat
date: 2026-05-15
brainstorm: docs/brainstorms/2026-05-15-siapkerja-monorepo-brainstorm.md
deepened: 2026-05-15
---

# Scaffold SiapKerja Monorepo

## Enhancement Summary

**Deepened on:** 2026-05-15
**Review agents used:** Security Sentinel, Architecture Strategist, Performance Oracle, Code Simplicity Reviewer, Data Integrity Guardian, Deployment Verification, Python Reviewer, TypeScript Reviewer, Pattern Recognition Specialist
**Documentation sources:** Context7 (dbmate, air)

### Critical Fixes (Must apply during implementation)

1. **AI service missing `migrate` dependency** — Add `migrate: { condition: service_completed_successfully }` to `ai` service in docker-compose.yml
2. **`make seed` broken** — Seed file is at `infra/seed/seed.sql` but not mounted in postgres container. Fix: use `docker compose exec -T postgres psql ... < infra/seed/seed.sql`
3. **AI service port exposed to host** — Remove `ports: "8000:8000"` from `ai` service (keep only in override for debugging). It should be internal-only per architecture
4. **`infra/postgres/init.sql` duplicates migration** — Remove entirely; pgvector extension is already handled by migration `20260515000001`
5. **Redundant `idx_users_email` index** — Remove `CREATE INDEX idx_users_email ON users(email)`, the UNIQUE constraint already creates an index
6. **`created_at`/`updated_at` missing NOT NULL** — Add `NOT NULL` to both timestamp columns
7. **No `updated_at` trigger** — Add an `updated_at` auto-update trigger function
8. **`apiFetch` bugs** — Fix headers overwrite, add generic return type, separate server/client base URLs
9. **Python deps: use psycopg3** — Replace `psycopg2-binary` with `psycopg[binary]>=3.2.0`
10. **GEMINI_API_KEY mismatch** — LangChain expects `GOOGLE_API_KEY` by default; must pass API key explicitly to model constructors
11. **Web service missing healthcheck** — Add healthcheck and `/api/health` route to Next.js
12. **DATABASE_URL protocol inconsistency** — Standardize on `postgresql://` for all services
13. **Error response format mismatch** — Go uses `{"message":...}`, FastAPI defaults to `{"detail":...}`. Standardize both

### Simplification Opportunities (hackathon YAGNI)

- Remove production Dockerfile stages (builder + prod) — only need `dev` for hackathon
- Remove Docker network segregation (`backend`/`frontend`) — use default network
- Merge `docker-compose.override.yml` into `docker-compose.yml` — one file is simpler for a hackathon
- Consider dropping Redis entirely if no feature currently uses it (add later when needed)
- Simplify JWT: single access token with 24h expiry instead of access+refresh pair
- Remove `redis.conf` (not mounted, default Redis config is fine)

### Key Improvements From Research

- **dbmate**: Use `--wait` flag for DB readiness instead of relying solely on `depends_on`; use `--no-dump-schema` to skip schema file generation
- **air**: Set `poll = true` in `.air.toml` for Docker volume compatibility; add `exclude_regex` for generated files
- **FastAPI**: Use lifespan context manager for startup/shutdown; use `pydantic-settings` with `model_config = SettingsConfigDict(extra="ignore")` to prevent crashes from extra env vars
- **CI**: Add Redis service container to Go API CI job for integration tests

## Overview

Scaffold a polyglot monorepo for the SiapKerja platform containing three services (Next.js frontend, Go backend, Python FastAPI AI service), orchestrated by Docker Compose with PostgreSQL + pgvector, Redis, JWT authentication, database migrations, seed data, GitHub Actions CI/CD, and a self-documenting Makefile.

The goal is a working development environment where a developer can clone the repo, copy `.env.example` to `.env`, run `make dev`, and have all services running with hot-reload.

## Problem Statement / Motivation

The SiapKerja project requires three distinct services written in three different languages. Without a well-structured monorepo from the start, the team of three will waste hackathon time on integration issues, inconsistent environments, and coordination overhead. A solid scaffold with Docker Compose ensures every team member has an identical development environment from the first commit.

## Proposed Solution

Service-centric monorepo layout with Docker Compose orchestration. Each service gets full starter code with health checks, DB connections, and hot-reload. Infrastructure (Dockerfiles, migrations, seed data) lives in a separate `infra/` directory.

## Technical Approach

### Final Architecture

```
siapkerja/
├── services/
│   ├── web/                          # Next.js + Tailwind + TypeScript
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── globals.css
│   │   │   │   └── api/
│   │   │   │       └── health/
│   │   │   │           └── route.ts
│   │   │   ├── components/
│   │   │   │   └── ui/
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   └── utils.ts
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── middleware.ts
│   │   ├── public/
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── postcss.config.mjs
│   │   └── CLAUDE.md
│   │
│   ├── api/                          # Go + Gin + pgx
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   │   └── config.go
│   │   │   ├── handler/
│   │   │   │   ├── health.go
│   │   │   │   └── auth.go
│   │   │   ├── middleware/
│   │   │   │   ├── auth.go
│   │   │   │   └── cors.go
│   │   │   ├── model/
│   │   │   │   └── user.go
│   │   │   ├── repository/
│   │   │   │   └── user.go
│   │   │   ├── service/
│   │   │   │   └── auth.go
│   │   │   └── router/
│   │   │       └── router.go
│   │   ├── pkg/
│   │   │   └── response/
│   │   │       └── response.go
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── .air.toml
│   │   └── CLAUDE.md
│   │
│   └── ai/                          # Python + FastAPI + LangChain
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── dependencies.py
│       │   ├── routers/
│       │   │   ├── __init__.py
│       │   │   └── health.py
│       │   ├── services/
│       │   │   ├── __init__.py
│       │   │   └── llm_service.py
│       │   └── models/
│       │       ├── __init__.py
│       │       └── schemas.py
│       ├── tests/
│       │   ├── __init__.py
│       │   └── test_health.py
│       ├── pyproject.toml
│       └── CLAUDE.md
│
├── infra/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── web.Dockerfile
│   │   └── ai.Dockerfile
│   ├── migrations/
│   │   ├── Dockerfile
│   │   └── db/
│   │       └── migrations/
│   │           ├── 20260515000001_enable_pgvector.sql
│   │           ├── 20260515000002_create_users.sql
│   │           └── 20260515000003_create_skills.sql
│   └── seed/
│       └── seed.sql
│
├── docker-compose.yml
├── Makefile
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
└── .github/
    └── workflows/
        └── ci.yml
```

### Technology Choices (Resolved from Brainstorm)

| Component | Choice | Rationale |
|---|---|---|
| Go router | Gin | User's established preference from existing projects |
| Go DB driver | pgx via pgxpool | Direct PostgreSQL driver, no ORM overhead for hackathon |
| Migration tool | dbmate | Language-agnostic, plain SQL files, Docker-native |
| Frontend package manager | pnpm | User's established preference for Next.js projects |
| pgvector image | `pgvector/pgvector:pg17` | Pre-compiled extension, zero manual setup |
| Go hot-reload | air (cosmtrek/air) | Community standard for Go live-reload in Docker |
| Python hot-reload | uvicorn `--reload` | Built-in, no extra tooling |
| Next.js hot-reload | Next.js dev server (built-in) | Built-in Fast Refresh |
| JWT library (Go) | `golang-jwt/jwt/v5` | Standard, well-maintained |
| Password hashing | `golang.org/x/crypto/bcrypt` | Standard library extension |

### Implementation Phases

---

#### Phase 1: Root Configuration & Infrastructure

Create the root-level files that tie everything together.

**1.1 `.gitignore`**

```gitignore
# services/web/.gitignore (created by Next.js init)

# ===== Environment =====
.env
.env.local
.env.*.local
!.env.example

# ===== Python =====
__pycache__/
*.py[cod]
.venv/
.pytest_cache/
.ruff_cache/
.mypy_cache/
.coverage
htmlcov/

# ===== Node =====
node_modules/
.pnpm-store/
*.tsbuildinfo
coverage/

# ===== Go =====
tmp/

# ===== OS =====
.DS_Store
Thumbs.db

# ===== IDE =====
.idea/
.vscode/
*.swp
*.swo

# ===== AI tools =====
.augment/
.cursor/
```

**1.2 `.env.example`**

```bash
# ===== DATABASE =====
POSTGRES_DB=siap_kerja
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# ===== REDIS =====
REDIS_URL=redis://redis:6379

# ===== JWT =====
JWT_SECRET=dev-secret-change-in-production

# ===== AI SERVICE =====
GOOGLE_API_KEY=your_gemini_api_key_here

# ===== INTERNAL (Docker network) =====
API_INTERNAL_URL=http://api:8080
AI_INTERNAL_URL=http://ai:8000

# ===== FRONTEND =====
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Research Insight — .env.example:** Renamed `GEMINI_API_KEY` → `GOOGLE_API_KEY` to match LangChain's `ChatGoogleGenerativeAI` default env var. If you need a different name, pass `google_api_key=` explicitly in the model constructor. Added separate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` is not needed for hackathon — single `JWT_SECRET` with 24h expiry is sufficient.

**1.3 `docker-compose.yml`**

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg17
    restart: unless-stopped
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  migrate:
    build:
      context: ./infra/migrations
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable

  api:
    build:
      context: ./services/api
      dockerfile: ../../infra/docker/api.Dockerfile
      target: dev
    ports:
      - "8080:8080"
    volumes:
      - ./services/api:/app
      - /app/tmp
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable
      REDIS_URL: redis://redis:6379
      AI_SERVICE_URL: http://ai:8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 15s
    command: air -c .air.toml

  ai:
    build:
      context: ./services/ai
      dockerfile: ../../infra/docker/ai.Dockerfile
      target: dev
    env_file:
      - .env
    volumes:
      - ./services/ai:/app
      - /app/__pycache__
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 15s
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir /app/app

  web:
    build:
      context: ./services/web
      dockerfile: ../../infra/docker/web.Dockerfile
      target: dev
    ports:
      - "3000:3000"
    volumes:
      - ./services/web:/app
      - /app/node_modules
      - /app/.next
    env_file:
      - .env
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
      API_INTERNAL_URL: http://api:8080
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 20s
    command: pnpm dev

volumes:
  postgres_data:
  redis_data:
```

> **Research Insights — docker-compose.yml (13 fixes applied):**
>
> **Fixes from review agents:**
> - **Removed `infra/postgres/init.sql` volume mount** — pgvector extension is already handled by migration `20260515000001`. Dual creation caused rollback state mismatch (Data Integrity, Simplicity)
> - **Added `migrate` dependency to `ai` service** — AI service needs tables to exist before connecting (Deployment, Architecture, Pattern Recognition)
> - **Removed `ports: "8000:8000"` from `ai` service** — Internal-only per architecture decision; not accessible from host (Security, Architecture)
> - **Added `API_INTERNAL_URL` env var to `web` service** — Needed for SSR server-side API calls (Architecture)
> - **Added healthcheck to `web` service** — Was the only service without one (Pattern Recognition, Architecture)
> - **Standardized `DATABASE_URL` to `postgresql://` everywhere** — Was inconsistent (`postgres://` for api, `postgresql://` for ai). Both work but `postgresql://` is the official protocol (Pattern Recognition)
> - **Replaced Python `urllib` healthcheck with `curl -f`** — Python subprocess import is slow and wasteful for a health probe; `curl` is available in `python:3.12-slim` (Performance, Python Reviewer)
> - **Removed Docker network segregation** — `backend`/`frontend` networks add complexity without security benefit for a hackathon. Docker Compose default network is sufficient (Simplicity)
> - **Merged `docker-compose.override.yml` content into main file** — Volume mounts, commands, and hot-reload config are now inline. One file is simpler for a hackathon; no override file needed (Simplicity)
>
> **Performance considerations:**
> - Consider adding `shm_size: 256mb` to postgres for better query performance
> - Use `--wait` flag with dbmate in migrate Dockerfile for extra DB readiness safety

~~**1.4 `docker-compose.override.yml`**~~ — *Removed: merged into `docker-compose.yml` for simplicity (Simplicity Reviewer)*

**1.5 `Makefile`**

```makefile
.PHONY: help dev down build test lint migrate seed clean logs

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ===== DEVELOPMENT =====
setup: ## First-time setup: copy env and start services
	@test -f .env || cp .env.example .env
	@echo "Created .env from .env.example (edit with your GEMINI_API_KEY)"
	docker compose up --build

dev: ## Start all services with hot-reload
	docker compose up --build

dev-d: ## Start all services in background
	docker compose up --build -d

down: ## Stop all services
	docker compose down

down-v: ## Stop all services and remove volumes
	docker compose down -v

logs: ## Tail all service logs
	docker compose logs -f

logs-%: ## Tail logs for a specific service (e.g., make logs-api)
	docker compose logs -f $*

# ===== DATABASE =====
migrate: ## Run pending migrations
	docker compose run --rm migrate

migrate-new: ## Create migration (usage: make migrate-new NAME=create_jobs)
	docker compose run --rm migrate dbmate new $(NAME)

migrate-down: ## Rollback last migration
	docker compose run --rm migrate dbmate rollback

migrate-status: ## Show migration status
	docker compose run --rm migrate dbmate status

seed: ## Seed database with sample data
	docker compose exec -T postgres psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-siap_kerja} < infra/seed/seed.sql

# ===== TESTING =====
test: ## Run all tests
	@$(MAKE) test-api test-ai test-web

test-api: ## Run Go API tests
	docker compose exec api go test ./... -v -count=1

test-ai: ## Run Python AI service tests
	docker compose exec ai pytest -v

test-web: ## Run frontend tests
	docker compose exec web pnpm test

# ===== LINTING =====
lint: ## Lint all services
	@$(MAKE) lint-api lint-ai lint-web

lint-api: ## Lint Go code
	docker compose exec api golangci-lint run ./...

lint-ai: ## Lint Python code
	docker compose exec ai ruff check .

lint-web: ## Lint frontend code
	docker compose exec web pnpm lint

# ===== UTILITIES =====
psql: ## Connect to PostgreSQL
	docker compose exec postgres psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-siap_kerja}

redis-cli: ## Connect to Redis
	docker compose exec redis redis-cli

shell-%: ## Open shell in service (e.g., make shell-api)
	docker compose exec $* sh
```

> **Research Insight — Makefile:** Fixed `make seed` — was referencing `/docker-entrypoint-initdb.d/seed.sql` inside the postgres container, but the seed file was never mounted there. Now pipes `infra/seed/seed.sql` from the host via stdin (Deployment Verification). The `migrate-new` command creates files inside the container — consider adding a volume mount or running dbmate locally instead (Architecture Strategist). The `-T` flag is needed for `exec` in non-interactive contexts.

**1.6 `CLAUDE.md`** (root)

```markdown
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
```

---

#### Phase 2: Infrastructure Files

**2.1 `infra/docker/api.Dockerfile`**

```dockerfile
FROM golang:1.23-alpine AS dev
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]
```

> **Research Insight — api.Dockerfile:** Removed prod stages (builder + prod) — YAGNI for hackathon. Add back when preparing for deployment (Simplicity Reviewer). If you need `wget` for healthcheck, ensure it's available in the base image (`golang:1.23-alpine` includes it).

**2.2 `infra/docker/ai.Dockerfile`**

```dockerfile
FROM python:3.12-slim AS dev
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e ".[dev]"
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

> **Research Insight — ai.Dockerfile:** Removed prod stages — YAGNI for hackathon (Simplicity). Added `curl` install for healthcheck command. `python:3.12-slim` does not include `curl` by default (Performance Oracle).

**2.3 `infra/docker/web.Dockerfile`**

```dockerfile
FROM node:22-alpine AS dev
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
```

> **Research Insight — web.Dockerfile:** Removed deps/builder/prod stages — YAGNI for hackathon (Simplicity). Keep `output: "standalone"` in `next.config.mjs` so production Dockerfile stages can be added later without config changes.

**2.4 `infra/migrations/Dockerfile`**

```dockerfile
FROM ghcr.io/amacneil/dbmate:2
COPY db/ /db/
ENTRYPOINT ["dbmate", "--wait", "--no-dump-schema", "--migrations-dir", "/db/migrations", "up"]
```

> **Research Insight — dbmate:** Added `--wait` flag (from Context7 docs) which makes dbmate poll the database until it's reachable before running migrations. This provides a safety net beyond Docker `depends_on: service_healthy`. Use `--no-dump-schema` to avoid creating a `schema.sql` dump file inside the container.

**2.5 `infra/migrations/db/migrations/20260515000001_enable_pgvector.sql`**

```sql
-- migrate:up
CREATE EXTENSION IF NOT EXISTS vector;

-- migrate:down
DROP EXTENSION IF EXISTS vector;
```

**2.6 `infra/migrations/db/migrations/20260515000002_create_users.sql`**

```sql
-- migrate:up

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
DROP TABLE IF EXISTS users;
DROP FUNCTION IF EXISTS trigger_set_updated_at();
```

> **Research Insights — users migration (3 fixes):**
> - **Added `NOT NULL` to timestamps** — Without it, an explicit `INSERT INTO users(..., created_at) VALUES (..., NULL)` would succeed, creating rows with null timestamps (Data Integrity)
> - **Removed `CREATE INDEX idx_users_email`** — The `UNIQUE` constraint on `email` already creates a unique B-tree index. The extra index was redundant and would slow down writes (Data Integrity)
> - **Added `trigger_set_updated_at()` trigger** — Without this, `updated_at` stays at the initial value after UPDATE operations, making audit trails unreliable (Data Integrity)

**2.7 `infra/migrations/db/migrations/20260515000003_create_skills.sql`**

```sql
-- migrate:up
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_embedding ON skills USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_skills_category ON skills(category);

-- migrate:down
DROP TABLE IF EXISTS skills;
```

> **Research Insight — skills migration:** The HNSW index on `embedding` column is fine to create now but will only be useful once data is inserted. For better index build performance, consider creating the index after initial data load. The `vector(768)` dimension must match the model you use — `text-embedding-004` outputs 768-dimensional vectors, so this is correct. If you switch models, update the dimension (Performance Oracle).

~~**2.8 `infra/postgres/init.sql`**~~ — *Removed: pgvector extension creation is already handled by migration `20260515000001`. Having it in both places causes rollback state mismatch — rolling back the migration wouldn't actually drop the extension since `init.sql` would re-create it on restart (Data Integrity, Simplicity).*

**2.9 `infra/seed/seed.sql`**

```sql
-- Sample skill categories for development
INSERT INTO skills (name, category) VALUES
    ('Python', 'Programming Language'),
    ('JavaScript', 'Programming Language'),
    ('TypeScript', 'Programming Language'),
    ('Go', 'Programming Language'),
    ('SQL', 'Database'),
    ('PostgreSQL', 'Database'),
    ('React', 'Frontend Framework'),
    ('Next.js', 'Frontend Framework'),
    ('Tailwind CSS', 'Frontend Framework'),
    ('FastAPI', 'Backend Framework'),
    ('Gin', 'Backend Framework'),
    ('Docker', 'DevOps'),
    ('Git', 'DevOps'),
    ('Machine Learning', 'AI/ML'),
    ('Data Analysis', 'Data'),
    ('Figma', 'Design'),
    ('UI/UX Design', 'Design'),
    ('Product Management', 'Management'),
    ('Agile/Scrum', 'Management'),
    ('Communication', 'Soft Skill')
ON CONFLICT (name) DO NOTHING;

-- Sample test user (password: "password123")
INSERT INTO users (email, password_hash, full_name) VALUES
    ('test@siapkerja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User')
ON CONFLICT (email) DO NOTHING;
```

> **Research Insight — seed.sql:** The hardcoded bcrypt hash is acceptable for dev seed data but add a clear comment that this must never be used in production (Security Sentinel). Generate the hash at seed time or use the register endpoint instead. The `ON CONFLICT DO NOTHING` is good — makes the seed idempotent.

---

#### Phase 3: Go Backend Service (`services/api/`)

**3.1 `services/api/go.mod`**

```go
module github.com/arjunamarcelino/siap-kerja-poc/services/api

go 1.23

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/jackc/pgx/v5 v5.7.1
    github.com/redis/go-redis/v9 v9.7.0
    golang.org/x/crypto v0.28.0
)
```

**3.2 `services/api/cmd/server/main.go`**

Minimal entry point: load config, connect to DB/Redis, wire router, start server. Includes graceful shutdown.

**3.3 `services/api/internal/config/config.go`**

Load from environment variables: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `PORT`.

**3.4 `services/api/internal/router/router.go`**

```
GET  /health                    → handler.Health
POST /api/auth/register         → handler.Register
POST /api/auth/login            → handler.Login
POST /api/auth/logout           → handler.Logout
GET  /api/users/me              → [auth middleware] handler.GetCurrentUser
POST /api/ai/analyze-cv         → [auth middleware] proxy to AI service
POST /api/ai/generate-roadmap   → [auth middleware] proxy to AI service
POST /api/ai/match-jobs         → [auth middleware] proxy to AI service
```

> **Research Insights — Go routes (3 changes):**
> - **Removed `/api/auth/refresh`** — Single token with 24h expiry for hackathon; refresh token rotation is YAGNI (Simplicity)
> - **Replaced wildcard `POST /api/ai/*path` with explicit routes** — Wildcard proxy creates an SSRF risk (any internal AI endpoint becomes reachable) and makes the API surface undiscoverable. List specific proxied endpoints instead (Security, Architecture)
> - **Add HTTP server timeouts** — Set `ReadTimeout`, `WriteTimeout`, and `IdleTimeout` on `http.Server` to prevent slow-loris attacks (Performance, Security)

**3.5 `services/api/internal/handler/health.go`**

Returns `{"status": "ok", "service": "api"}`. Also pings DB and Redis to verify connectivity.

**3.6 `services/api/internal/handler/auth.go`**

- `Register`: validate input, hash password with bcrypt, insert user, set JWT in HttpOnly cookie
- `Login`: validate credentials, set JWT in HttpOnly cookie
- `Logout`: clear auth cookie

**3.7 `services/api/internal/middleware/auth.go`**

Extract JWT from `access_token` cookie, validate, set user context. Return 401 if invalid/missing.

**3.8 `services/api/internal/middleware/cors.go`**

Allow origin `http://localhost:3000`, allow credentials, expose headers.

**3.9 `services/api/internal/model/user.go`**

```go
type User struct {
    ID           string    `json:"id"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"`
    FullName     string    `json:"full_name"`
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

**3.10 `services/api/internal/repository/user.go`**

`CreateUser`, `GetUserByEmail`, `GetUserByID` using pgx queries.

**3.11 `services/api/internal/service/auth.go`**

Business logic: `Register`, `Login`, `GenerateToken`, `ValidateToken`. Token lifetime: 24h. Cookies: HttpOnly, SameSite=Lax (Lax over Strict for development compatibility), Secure=false in dev.

> **Research Insight — Auth:** Simplified to single JWT with 24h expiry instead of access+refresh token pair. Refresh token rotation, revocation lists, and sliding windows are YAGNI for a hackathon (Simplicity). Add rate limiting on `/api/auth/login` and `/api/auth/register` to prevent brute-force (Security — implement via Gin middleware or a simple in-memory counter).

**3.12 `services/api/pkg/response/response.go`**

Standard JSON response helpers: `Success(c, data)`, `Error(c, status, message)`. Error responses must use `{"message": "..."}` format — ensure the AI service also returns errors in this format (not FastAPI's default `{"detail": "..."}`).

> **Research Insight — Response format:** Go and Python must agree on error shape. Standardize on `{"message": "..."}` for all error responses. In FastAPI, use a custom exception handler to override the default `{"detail": "..."}` format (Pattern Recognition).

**3.13 `services/api/.air.toml`**

```toml
[build]
  cmd = "go build -o ./tmp/main ./cmd/server"
  bin = "./tmp/main"
  include_ext = ["go"]
  exclude_dir = ["tmp", "vendor"]
  exclude_regex = ["_test\\.go$"]
  delay = 1000
  poll = true
  poll_interval = 500
```

> **Research Insight — .air.toml (from Context7):** Added `poll = true` with `poll_interval = 500` — required for reliable file change detection inside Docker containers with bind mounts. Standard filesystem events (inotify/fsnotify) don't work reliably across Docker volume mounts. Added `exclude_regex` for test files to avoid unnecessary rebuilds when editing tests.

**3.14 `services/api/CLAUDE.md`**

Document: Go conventions, Clean Architecture layers, how to add new endpoints, test commands.

---

#### Phase 4: Python AI Service (`services/ai/`)

**4.1 `services/ai/pyproject.toml`**

```toml
[project]
name = "siap-kerja-ai"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "langchain>=0.3.0",
    "langchain-google-genai>=2.0.0",
    "langchain-postgres>=0.0.12",
    "psycopg[binary]>=3.2.0",
    "sqlalchemy>=2.0.0",
    "redis>=5.0.0",
    "pydantic-settings>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24.0",
    "httpx>=0.27.0",
    "ruff>=0.6.0",
]
```

> **Research Insights — pyproject.toml (2 fixes):**
> - **Replaced `psycopg2-binary` with `psycopg[binary]>=3.2.0`** — psycopg2 is legacy; psycopg3 has native async support, better connection pooling, and is actively maintained (Python Reviewer)
> - **Replaced `pgvector>=0.3.0` with `langchain-postgres>=0.0.12`** — `langchain-postgres` provides the `PGVector` vectorstore integration that works with LangChain's retrieval chain. The standalone `pgvector` package is for raw psycopg usage, not LangChain (Python Reviewer)

**4.2 `services/ai/app/main.py`**

FastAPI app with lifespan handler, health endpoint, router registration.

**4.3 `services/ai/app/config.py`**

Pydantic `BaseSettings` loading `GOOGLE_API_KEY`, `DATABASE_URL`, `REDIS_URL`.

> **Research Insight — config.py:** Use `model_config = SettingsConfigDict(extra="ignore")` in your BaseSettings class to prevent validation errors when Docker Compose passes extra env vars (like `POSTGRES_DB`) that your config doesn't define (Python Reviewer). Rename `GEMINI_API_KEY` → `GOOGLE_API_KEY` to match LangChain's expected env var name, or pass the key explicitly: `ChatGoogleGenerativeAI(google_api_key=settings.google_api_key)`.

**4.4 `services/ai/app/routers/health.py`**

Returns `{"status": "ok", "service": "ai"}`.

**4.5 `services/ai/app/services/llm_service.py`**

Initialize `ChatGoogleGenerativeAI` with `gemini-2.0-flash` and `GoogleGenerativeAIEmbeddings` with `text-embedding-004`.

**4.6 `services/ai/tests/test_health.py`**

Basic test using `httpx.AsyncClient` to verify `/health` returns 200.

**4.7 `services/ai/CLAUDE.md`**

Document: FastAPI conventions, how to add new routers, LangChain patterns, test commands.

---

#### Phase 5: Next.js Frontend (`services/web/`)

**5.1 Initialize with `pnpm create next-app`**

Use: App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory, import alias `@/*`.

**5.2 `services/web/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};
export default nextConfig;
```

**5.3 `services/web/src/app/layout.tsx`**

Root layout with Inter font, basic metadata for "SiapKerja".

**5.4 `services/web/src/app/page.tsx`**

Simple landing page with project title and description. Links to `/login`.

**5.5 `services/web/src/lib/api.ts`**

Fetch wrapper that prepends API URL, includes credentials for cookies. Uses separate base URLs for server-side (Docker internal) vs client-side (browser) calls.

```typescript
const API_URL =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || "http://api:8080"   // SSR: Docker network
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"; // Browser

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const { headers: customHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...customHeaders },
    ...restOptions,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

> **Research Insights — apiFetch (3 fixes):**
> - **Added generic return type `<T>`** — Eliminates implicit `any` return. Callers get type safety: `const user = await apiFetch<User>("/api/users/me")` (TypeScript Reviewer)
> - **Fixed headers overwrite bug** — Destructure `headers` from options before spreading `...restOptions`, so custom headers merge correctly instead of being overwritten by `...options` (TypeScript Reviewer)
> - **Added server/client URL distinction** — SSR (server components, route handlers) runs inside Docker and must use the internal Docker network URL (`http://api:8080`). Browser requests use `NEXT_PUBLIC_API_URL`. Without this, SSR calls fail with DNS resolution errors (Architecture Strategist)

**5.6 `services/web/src/middleware.ts`**

Protect `/dashboard` routes — redirect to `/login` if no `access_token` cookie. Must include a `config.matcher` export to define which routes the middleware applies to.

```typescript
export { default } from "./middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

> **Research Insight — middleware.ts:** Next.js middleware requires an explicit `matcher` config or it runs on every request including static assets, `_next/` paths, and API routes. Always define a matcher to scope it (TypeScript Reviewer).

**5.7 Add `/api/health` route handler for healthcheck**

Create `services/web/src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: "ok", service: "web" });
}
```

> **Research Insight — Web healthcheck:** The web service was the only service without a healthcheck. This `/api/health` route handler enables the Docker healthcheck defined in `docker-compose.yml` (Pattern Recognition, Architecture).

**5.8 `services/web/CLAUDE.md`**

Document: Next.js App Router conventions, component patterns, API client usage.

---

#### Phase 6: GitHub Actions CI/CD

**6.1 `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      api: ${{ steps.filter.outputs.api }}
      ai: ${{ steps.filter.outputs.ai }}
      web: ${{ steps.filter.outputs.web }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            api:
              - 'services/api/**'
            ai:
              - 'services/ai/**'
            web:
              - 'services/web/**'

  api:
    needs: changes
    if: needs.changes.outputs.api == 'true'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg17
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports: ["5432:5432"]
        options: --health-cmd "pg_isready" --health-interval 5s --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: --health-cmd "redis-cli ping" --health-interval 5s --health-retries 3
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.23"
          cache-dependency-path: services/api/go.sum
      - run: go test ./... -v -race -count=1
        working-directory: services/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db?sslmode=disable
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
      - run: CGO_ENABLED=0 go build -o /dev/null ./cmd/server
        working-directory: services/api

  ai:
    needs: changes
    if: needs.changes.outputs.ai == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip
          cache-dependency-path: services/ai/pyproject.toml
      - run: pip install ".[dev]"
        working-directory: services/ai
      - run: ruff check .
        working-directory: services/ai
      - run: pytest -v
        working-directory: services/ai

  web:
    needs: changes
    if: needs.changes.outputs.web == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - run: pnpm install --frozen-lockfile
        working-directory: services/web
      - run: pnpm lint
        working-directory: services/web
      - run: pnpm build
        working-directory: services/web
```

> **Research Insights — CI/CD (2 fixes):**
> - **Added Redis service container to Go API CI job** — The Go API connects to Redis on startup. Without a Redis service container in CI, tests that initialize the app will fail (Architecture, Deployment Verification)
> - **Standardized `DATABASE_URL` to `postgresql://`** — Consistent with the docker-compose.yml fix (Pattern Recognition)

---

## Acceptance Criteria

### Functional Requirements

- [ ] `make setup` copies `.env.example` to `.env` and starts all services
- [ ] `make dev` starts all 6 containers (postgres, redis, migrate, api, ai, web)
- [ ] All three services respond on their health endpoints:
  - `GET http://localhost:8080/health` → 200
  - `GET http://localhost:8000/health` → 200
  - `http://localhost:3000` → renders landing page
- [ ] Hot-reload works: editing Go/Python/TypeScript source triggers automatic restart/refresh
- [ ] `POST /api/auth/register` creates a user and sets JWT cookies
- [ ] `POST /api/auth/login` validates credentials and sets JWT cookies
- [ ] Protected routes return 401 without valid cookie
- [ ] `make migrate` runs pending dbmate migrations
- [ ] `make migrate-new NAME=xxx` creates a new migration file
- [ ] `make seed` populates sample data
- [ ] `make test` runs tests for all services
- [ ] `make psql` connects to PostgreSQL interactively
- [ ] GitHub Actions CI runs only changed-service jobs on PR

### Non-Functional Requirements

- [ ] Each Dockerfile has a `dev` stage (prod stages deferred — add for deployment)
- [ ] No secrets committed (`.env` in `.gitignore`)
- [ ] AI service has no published ports (internal Docker network only)
- [ ] CLAUDE.md exists at root and in each service directory
- [ ] All health endpoints include service name in response
- [ ] Error responses use `{"message": "..."}` format consistently across Go and Python
- [ ] `DATABASE_URL` uses `postgresql://` protocol consistently everywhere

## Dependencies & Prerequisites

- Docker and Docker Compose installed (v5+)
- GitHub repository at `arjunamarcelino/siap-kerja-poc`
- Gemini API key (for AI service to function beyond health check)

## ERD

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        timestamptz created_at
        timestamptz updated_at
    }

    skills {
        serial id PK
        varchar name UK
        varchar category
        vector embedding
        timestamptz created_at
    }
```

## References & Research

### Internal References

- Brainstorm document: `docs/brainstorms/2026-05-15-siapkerja-monorepo-brainstorm.md`
- User's Go conventions: Gin router, Clean Architecture, multi-stage Alpine Dockerfiles
- User's Python conventions: FastAPI + Pydantic, ruff linting, pytest
- User's Next.js conventions: App Router, Tailwind, pnpm, shadcn-style components
- User's Docker Compose conventions: health checks, `depends_on` conditions, named volumes

### External References

- [dbmate - Language-agnostic migrations](https://github.com/amacneil/dbmate)
- [pgvector Docker image](https://hub.docker.com/r/pgvector/pgvector)
- [Docker Compose best practices](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/)
- [FastAPI Docker deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Next.js standalone output](https://nextjs.org/docs/app/building-your-application/deploying)
- [Go project layout](https://go.dev/doc/modules/layout)
- [air - Go hot-reload](https://github.com/air-verse/air)
- [dorny/paths-filter for CI](https://github.com/dorny/paths-filter)
- [LangChain Google Gemini integration](https://python.langchain.com/docs/integrations/chat/google_generative_ai/)
