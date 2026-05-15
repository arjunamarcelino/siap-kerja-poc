# SiapKerja API Service

Go backend service for the SiapKerja monorepo.

## Architecture

Clean Architecture: handler -> service -> repository

- **handler**: HTTP request/response handling, input validation, cookie management
- **service**: Business logic, JWT generation/validation, password hashing
- **repository**: Database queries using pgx (no ORM)
- **middleware**: Auth (JWT from cookies) and CORS
- **model**: Data structures
- **pkg/response**: Standardized JSON response helpers

## Adding New Endpoints

1. Define the model in `internal/model/`
2. Create repository methods in `internal/repository/`
3. Create service methods in `internal/service/`
4. Create handler in `internal/handler/`
5. Register the route in `internal/router/router.go`

## Running

```bash
# Development with hot-reload
air

# Build and run directly
go build -o ./tmp/main ./cmd/server && ./tmp/main
```

## Testing

```bash
go test ./... -v
```

## Key Conventions

- **Database**: pgx for PostgreSQL queries (no ORM)
- **Auth**: JWT tokens stored in HttpOnly cookies (cookie name: `access_token`)
- **Error responses**: `{"message": "..."}` format
- **Success responses**: `{"data": ...}` format
- **Config**: Environment variables loaded via `internal/config/config.go`
- **AI proxy**: Requests to `/api/ai/*` are forwarded to AI_SERVICE_URL

## Environment Variables

| Variable       | Description              | Default |
|----------------|--------------------------|---------|
| DATABASE_URL   | PostgreSQL connection    | -       |
| REDIS_URL      | Redis connection         | -       |
| JWT_SECRET     | JWT signing secret       | -       |
| AI_SERVICE_URL | AI microservice base URL | -       |
| PORT           | HTTP server port         | 8080    |
