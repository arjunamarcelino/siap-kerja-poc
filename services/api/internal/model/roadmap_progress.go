package model

import (
	"encoding/json"
	"time"
)

type RoadmapProgress struct {
	ID         string          `json:"id" db:"id"`
	UserID     string          `json:"user_id" db:"user_id"`
	AnalysisID string          `json:"analysis_id" db:"analysis_id"`
	Progress   json.RawMessage `json:"progress" db:"progress"`
	CreatedAt  time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at" db:"updated_at"`
}
