package model

import (
	"encoding/json"
	"time"
)

type CVAnalysis struct {
	ID               string          `json:"id" db:"id"`
	UserID           string          `json:"user_id" db:"user_id"`
	CareerAspiration string          `json:"career_aspiration" db:"career_aspiration"`
	CVFilename       string          `json:"cv_filename" db:"cv_filename"`
	IdentifiedSkills json.RawMessage `json:"identified_skills" db:"identified_skills"`
	SkillGaps        json.RawMessage `json:"skill_gaps" db:"skill_gaps"`
	MatchingSkills   json.RawMessage `json:"matching_skills" db:"matching_skills"`
	RequiredSkills   json.RawMessage `json:"required_skills" db:"required_skills"`
	Roadmap          json.RawMessage `json:"roadmap" db:"roadmap"`
	ExperienceLevel  string          `json:"experience_level" db:"experience_level"`
	CVSummary        string          `json:"cv_summary" db:"cv_summary"`
	JobsAnalyzed     int             `json:"jobs_analyzed" db:"jobs_analyzed"`
	EstimatedDuration string         `json:"estimated_duration" db:"estimated_duration"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
}
