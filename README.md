# SiapKerja

AI-powered Career Navigation based on Real Job Market Demand.

## Quick Start

```bash
# Clone and enter
git clone https://github.com/arjunamarcelino/siap-kerja-poc.git
cd siap-kerja-poc

# First-time setup
make setup
# Edit .env with your GOOGLE_API_KEY

# Start development
make dev
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8080
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

## Architecture

```
Browser → Next.js (:3000) → Go API (:8080) → Python AI (:8000)
                                    ↓               ↓
                              PostgreSQL (:5432)  Gemini API
                              Redis (:6379)
```

## Services

| Service | Tech | Port | Description |
|---------|------|------|-------------|
| `web` | Next.js, Tailwind, TypeScript | 3000 | Frontend application |
| `api` | Go, Gin, pgx | 8080 | Backend API gateway |
| `ai` | Python, FastAPI, LangChain | internal | AI/ML processing |

## Development

```bash
make dev          # Start all services with hot-reload
make down         # Stop all services
make logs         # Tail all logs
make logs-api     # Tail specific service logs
make test         # Run all tests
make lint         # Lint all services
make migrate      # Run database migrations
make seed         # Seed sample data
make psql         # Connect to PostgreSQL
make help         # Show all commands
```

## Prerequisites

- Docker and Docker Compose (v5+)
- Gemini API key

## Team

- **AI Engineer:** Arjuna Marcelino
- **Backend:** Jerikho Silaban
- **Frontend:** James Silaban
