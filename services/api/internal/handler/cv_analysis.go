package handler

import (
	"errors"
	"io"
	"net/http"
	"path/filepath"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/pkg/response"
	"github.com/gin-gonic/gin"
)

const maxUploadSize = 5 << 20 // 5 MB

type CVAnalysisHandler struct {
	cvAnalysisService *service.CVAnalysisService
}

func NewCVAnalysisHandler(cvAnalysisService *service.CVAnalysisService) *CVAnalysisHandler {
	return &CVAnalysisHandler{cvAnalysisService: cvAnalysisService}
}

func (h *CVAnalysisHandler) AnalyzeCV(c *gin.Context) {
	// 1. Enforce size limit
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUploadSize)

	// 2. Parse multipart form
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		if err.Error() == "http: request body too large" {
			response.Error(c, http.StatusRequestEntityTooLarge, "File too large. Maximum is 5 MB.")
			return
		}
		response.Error(c, http.StatusBadRequest, "File is required")
		return
	}
	defer file.Close()

	// 3. Validate file type via magic bytes
	headerBytes := make([]byte, 5)
	if _, err := io.ReadFull(file, headerBytes); err != nil {
		response.Error(c, http.StatusBadRequest, "Could not read file")
		return
	}
	if string(headerBytes[:5]) != "%PDF-" {
		response.Error(c, http.StatusUnprocessableEntity, "Only PDF files are accepted")
		return
	}
	// Seek back to beginning after reading magic bytes
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process file")
		return
	}

	// 4. Read career aspiration from form
	careerAspiration := c.PostForm("career_aspiration")
	if careerAspiration == "" {
		response.Error(c, http.StatusBadRequest, "career_aspiration is required")
		return
	}

	// 5. Get user_id from auth context
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// 6. Sanitize filename
	sanitizedFilename := filepath.Base(header.Filename)

	// 7. Delegate to service
	result, err := h.cvAnalysisService.Analyze(
		c.Request.Context(),
		userID.(string),
		file,
		sanitizedFilename,
		careerAspiration,
	)
	if err != nil {
		if errors.Is(err, service.ErrAIServiceUnavailable) {
			response.Error(c, http.StatusBadGateway, "AI service is temporarily unavailable")
			return
		}
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, result)
}

func (h *CVAnalysisHandler) GetAnalyses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	analyses, err := h.cvAnalysisService.GetAnalyses(c.Request.Context(), userID.(string))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch analyses")
		return
	}

	if analyses == nil {
		analyses = []*model.CVAnalysis{}
	}

	response.Success(c, analyses)
}

func (h *CVAnalysisHandler) GetAnalysis(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	id := c.Param("id")
	analysis, err := h.cvAnalysisService.GetAnalysis(c.Request.Context(), id, userID.(string))
	if err != nil {
		if errors.Is(err, repository.ErrAnalysisNotFound) {
			response.Error(c, http.StatusNotFound, "Analysis not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to fetch analysis")
		return
	}

	response.Success(c, analysis)
}
