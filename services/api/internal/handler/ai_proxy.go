package handler

import (
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type AIProxyHandler struct {
	aiServiceURL string
	httpClient   *http.Client
}

func NewAIProxyHandler(aiServiceURL string) *AIProxyHandler {
	return &AIProxyHandler{
		aiServiceURL: strings.TrimRight(aiServiceURL, "/"),
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

func (h *AIProxyHandler) ProxyToAI(c *gin.Context) {
	// Map the incoming path to the AI service path
	// /api/ai/analyze-cv   -> /analyze-cv
	// /api/ai/generate-roadmap -> /generate-roadmap
	// /api/ai/match-jobs   -> /match-jobs
	originalPath := c.Request.URL.Path
	aiPath := strings.TrimPrefix(originalPath, "/api/ai")

	targetURL := h.aiServiceURL + aiPath

	// Read the incoming request body
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to read request body")
		return
	}
	defer c.Request.Body.Close()

	// Create the proxied request
	proxyReq, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, targetURL, strings.NewReader(string(body)))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create proxy request")
		return
	}

	// Forward relevant headers
	proxyReq.Header.Set("Content-Type", c.GetHeader("Content-Type"))
	if userID, exists := c.Get("user_id"); exists {
		proxyReq.Header.Set("X-User-ID", userID.(string))
	}

	// Execute the request
	resp, err := h.httpClient.Do(proxyReq)
	if err != nil {
		response.Error(c, http.StatusBadGateway, "AI service unavailable")
		return
	}
	defer resp.Body.Close()

	// Read the AI service response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to read AI service response")
		return
	}

	// Forward response headers
	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, value)
		}
	}

	// Write the response
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}
