package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type JobMatchingHandler struct {
	service *service.JobMatchingService
}

func NewJobMatchingHandler(s *service.JobMatchingService) *JobMatchingHandler {
	return &JobMatchingHandler{service: s}
}

func (h *JobMatchingHandler) GetJobMatches(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	result, err := h.service.ComputeJobMatches(c.Request.Context(), userID.(string))
	if err != nil {
		if errors.Is(err, service.ErrNoCVAnalysis) {
			response.Error(c, http.StatusNotFound, "No CV analysis found. Please upload your CV first.")
			return
		}
		log.Printf("Failed to compute job matches for user %s: %v", userID, err)
		response.Error(c, http.StatusInternalServerError, "Unable to compute job matches. Please try again later.")
		return
	}

	response.Success(c, result)
}
