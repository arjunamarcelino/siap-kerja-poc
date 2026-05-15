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
	r.MaxMultipartMemory = 8 << 20 // 8 MB

	// Middleware
	r.Use(middleware.CORS())

	// Repositories
	userRepo := repository.NewUserRepository(db)
	cvAnalysisRepo := repository.NewCVAnalysisRepository(db)
	progressRepo := repository.NewRoadmapProgressRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	cvAnalysisService := service.NewCVAnalysisService(cvAnalysisRepo, cfg.AIServiceURL)
	progressService := service.NewRoadmapProgressService(progressRepo, cvAnalysisRepo)

	// Handlers
	healthHandler := handler.NewHealthHandler(db, rdb)
	authHandler := handler.NewAuthHandler(authService)
	cvAnalysisHandler := handler.NewCVAnalysisHandler(cvAnalysisService)
	progressHandler := handler.NewRoadmapProgressHandler(progressService)

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

		// CV analysis routes
		protected.POST("/ai/analyze-cv", cvAnalysisHandler.AnalyzeCV)
		protected.GET("/ai/analyses", cvAnalysisHandler.GetAnalyses)
		protected.GET("/ai/analyses/:id", cvAnalysisHandler.GetAnalysis)

		// Roadmap progress routes
		protected.GET("/ai/analyses/:id/progress", progressHandler.GetProgress)
		protected.PATCH("/ai/analyses/:id/progress", progressHandler.ToggleProgress)
	}

	return r
}
