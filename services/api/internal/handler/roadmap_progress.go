package handler

import (
	"errors"
	"log"
	"net/http"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type RoadmapProgressHandler struct {
	progressService *service.RoadmapProgressService
}

func NewRoadmapProgressHandler(s *service.RoadmapProgressService) *RoadmapProgressHandler {
	return &RoadmapProgressHandler{progressService: s}
}

func (h *RoadmapProgressHandler) GetProgress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	id := c.Param("id")
	result, err := h.progressService.GetProgress(c.Request.Context(), id, userID.(string))
	if err != nil {
		if errors.Is(err, repository.ErrAnalysisNotFound) {
			response.Error(c, http.StatusNotFound, "Analysis not found")
			return
		}
		log.Printf("Failed to get progress for analysis %s: %v", id, err)
		response.Error(c, http.StatusInternalServerError, "Failed to fetch progress")
		return
	}

	response.Success(c, result)
}

type toggleProgressRequest struct {
	Step  int    `json:"step" binding:"required,min=1"`
	Type  string `json:"type" binding:"required,oneof=skill resource"`
	Value string `json:"value" binding:"max=200"`
	Index *int   `json:"index" binding:"omitempty,min=0"`
	Done  bool   `json:"done"`
}

func (h *RoadmapProgressHandler) ToggleProgress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	var req toggleProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Conditional field validation
	switch req.Type {
	case "skill":
		if req.Value == "" {
			response.Error(c, http.StatusBadRequest, "value is required when type is skill")
			return
		}
	case "resource":
		if req.Index == nil {
			response.Error(c, http.StatusBadRequest, "index is required when type is resource")
			return
		}
	}

	id := c.Param("id")
	toggleReq := service.ToggleRequest{
		Step:  req.Step,
		Type:  req.Type,
		Value: req.Value,
		Index: req.Index,
		Done:  req.Done,
	}

	result, err := h.progressService.ToggleItem(c.Request.Context(), userID.(string), id, toggleReq)
	if err != nil {
		if errors.Is(err, service.ErrInvalidStep) || errors.Is(err, service.ErrInvalidSkill) ||
			errors.Is(err, service.ErrInvalidResource) || errors.Is(err, service.ErrInvalidType) {
			response.Error(c, http.StatusUnprocessableEntity, err.Error())
			return
		}
		if errors.Is(err, repository.ErrAnalysisNotFound) {
			response.Error(c, http.StatusNotFound, "Analysis not found")
			return
		}
		log.Printf("Failed to toggle progress for analysis %s: %v", id, err)
		response.Error(c, http.StatusInternalServerError, "Failed to update progress")
		return
	}

	response.Success(c, result)
}
