package router

import (
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/config"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/handler"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/middleware"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func Setup(db *pgxpool.Pool, rdb *redis.Client, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Middleware
	r.Use(middleware.CORS())

	// Repositories
	userRepo := repository.NewUserRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)

	// Handlers
	healthHandler := handler.NewHealthHandler(db, rdb)
	authHandler := handler.NewAuthHandler(authService)
	aiProxyHandler := handler.NewAIProxyHandler(cfg.AIServiceURL)

	// Health check
	r.GET("/health", healthHandler.Health)

	// Auth routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthRequired(authService))
	{
		// User routes
		protected.GET("/users/me", authHandler.GetCurrentUser)

		// AI proxy routes
		protected.POST("/ai/analyze-cv", aiProxyHandler.ProxyToAI)
		protected.POST("/ai/generate-roadmap", aiProxyHandler.ProxyToAI)
		protected.POST("/ai/match-jobs", aiProxyHandler.ProxyToAI)
	}

	return r
}
