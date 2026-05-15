package model

import pgvec "github.com/pgvector/pgvector-go"

// Skill represents a row in the skills table.
type Skill struct {
	ID        int          `json:"id" db:"id"`
	Name      string       `json:"name" db:"name"`
	Category  string       `json:"category" db:"category"`
	Embedding pgvec.Vector `json:"-" db:"embedding"`
}

// ScrapedJob matches the AI service scraper response.
type ScrapedJob struct {
	Title          string   `json:"title"`
	Company        string   `json:"company"`
	RequiredSkills []string `json:"required_skills"`
	Description    string   `json:"description"`
}

// JobListing represents a row in the job_listings table.
type JobListing struct {
	ID             int      `json:"id" db:"id"`
	Title          string   `json:"title" db:"title"`
	Company        string   `json:"company" db:"company"`
	Role           string   `json:"role" db:"role"`
	RequiredSkills []string `json:"required_skills" db:"required_skills"`
	Description    string   `json:"description" db:"description"`
}

// JobMatchResult is a single job's match details.
type JobMatchResult struct {
	Title           string   `json:"title"`
	Company         string   `json:"company"`
	MatchPercentage int      `json:"match_percentage"`
	MatchedSkills   []string `json:"matched_skills"`
	MissingSkills   []string `json:"missing_skills"`
	TotalRequired   int      `json:"total_required"`
}

// JobMatchResponse is the top-level response for GET /api/job-matches.
type JobMatchResponse struct {
	Matches []JobMatchResult `json:"matches"`
}
