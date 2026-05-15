package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	db  *pgxpool.Pool
	rdb *redis.Client
}

func NewHealthHandler(db *pgxpool.Pool, rdb *redis.Client) *HealthHandler {
	return &HealthHandler{db: db, rdb: rdb}
}

func (h *HealthHandler) Health(c *gin.Context) {
	var errs []string

	if err := h.db.Ping(c.Request.Context()); err != nil {
		errs = append(errs, "database: "+err.Error())
	}

	if err := h.rdb.Ping(c.Request.Context()).Err(); err != nil {
		errs = append(errs, "redis: "+err.Error())
	}

	if len(errs) > 0 {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "degraded",
			"service": "api",
			"errors":  errs,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "api",
	})
}
