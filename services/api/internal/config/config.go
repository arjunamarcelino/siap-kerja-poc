package config

import "os"

type Config struct {
	DatabaseURL  string
	RedisURL     string
	JWTSecret    string
	AIServiceURL string
	Port         string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		DatabaseURL:  os.Getenv("DATABASE_URL"),
		RedisURL:     os.Getenv("REDIS_URL"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
		AIServiceURL: os.Getenv("AI_SERVICE_URL"),
		Port:         port,
	}
}
