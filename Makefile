.PHONY: help dev down build test lint migrate seed clean logs

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ===== DEVELOPMENT =====
setup: ## First-time setup: copy env and start services
	@test -f .env || cp .env.example .env
	@echo "Created .env from .env.example (edit with your GOOGLE_API_KEY)"
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
