package middleware

import (
	"net/http"
	"strings"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/service"
	"github.com/gin-gonic/gin"
)

func AuthRequired(authService *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get token from cookie first
		tokenString, err := c.Cookie("access_token")
		if err != nil || tokenString == "" {
			// Fallback: try Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Authentication required"})
				c.Abort()
				return
			}
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid authorization header"})
				c.Abort()
				return
			}
			tokenString = parts[1]
		}

		userID, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
