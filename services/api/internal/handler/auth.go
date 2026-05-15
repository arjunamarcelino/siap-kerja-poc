package handler

import (
	"errors"
	"net/http"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.authService.Register(c.Request.Context(), req.Email, req.Password, req.FullName)
	if err != nil {
		if errors.Is(err, service.ErrEmailAlreadyExists) {
			response.Error(c, http.StatusConflict, "Email already exists")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to register user")
		return
	}

	token, err := h.authService.GenerateToken(user.ID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	c.SetCookie("access_token", token, 86400, "/", "", false, true)
	c.SetSameSite(http.SameSiteLaxMode)

	response.Created(c, user)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			response.Error(c, http.StatusUnauthorized, "Invalid email or password")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to login")
		return
	}

	token, err := h.authService.GenerateToken(user.ID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	c.SetCookie("access_token", token, 86400, "/", "", false, true)
	c.SetSameSite(http.SameSiteLaxMode)

	response.Success(c, user)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetSameSite(http.SameSiteLaxMode)

	response.Success(c, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(string))
	if err != nil {
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	response.Success(c, user)
}
