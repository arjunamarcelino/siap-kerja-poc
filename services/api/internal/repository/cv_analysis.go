package repository

import (
	"context"
	"errors"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrAnalysisNotFound = errors.New("analysis not found")

type CVAnalysisRepository struct {
	db *pgxpool.Pool
}

func NewCVAnalysisRepository(db *pgxpool.Pool) *CVAnalysisRepository {
	return &CVAnalysisRepository{db: db}
}

func (r *CVAnalysisRepository) SaveAnalysis(ctx context.Context, a *model.CVAnalysis) error {
	return r.db.QueryRow(ctx,
		`INSERT INTO cv_analyses (
			user_id, career_aspiration, cv_filename,
			identified_skills, skill_gaps, matching_skills,
			required_skills, roadmap, experience_level,
			cv_summary, jobs_analyzed, estimated_duration
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at`,
		a.UserID, a.CareerAspiration, a.CVFilename,
		a.IdentifiedSkills, a.SkillGaps, a.MatchingSkills,
		a.RequiredSkills, a.Roadmap, a.ExperienceLevel,
		a.CVSummary, a.JobsAnalyzed, a.EstimatedDuration,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *CVAnalysisRepository) GetAnalysesByUserID(ctx context.Context, userID string) ([]*model.CVAnalysis, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, user_id, career_aspiration, cv_filename,
			identified_skills, skill_gaps, matching_skills,
			required_skills, roadmap, experience_level,
			cv_summary, jobs_analyzed, estimated_duration, created_at
		FROM cv_analyses
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 20`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var analyses []*model.CVAnalysis
	for rows.Next() {
		a := &model.CVAnalysis{}
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.CareerAspiration, &a.CVFilename,
			&a.IdentifiedSkills, &a.SkillGaps, &a.MatchingSkills,
			&a.RequiredSkills, &a.Roadmap, &a.ExperienceLevel,
			&a.CVSummary, &a.JobsAnalyzed, &a.EstimatedDuration, &a.CreatedAt,
		); err != nil {
			return nil, err
		}
		analyses = append(analyses, a)
	}
	return analyses, rows.Err()
}

func (r *CVAnalysisRepository) GetAnalysisByID(ctx context.Context, id, userID string) (*model.CVAnalysis, error) {
	a := &model.CVAnalysis{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, career_aspiration, cv_filename,
			identified_skills, skill_gaps, matching_skills,
			required_skills, roadmap, experience_level,
			cv_summary, jobs_analyzed, estimated_duration, created_at
		FROM cv_analyses
		WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(
		&a.ID, &a.UserID, &a.CareerAspiration, &a.CVFilename,
		&a.IdentifiedSkills, &a.SkillGaps, &a.MatchingSkills,
		&a.RequiredSkills, &a.Roadmap, &a.ExperienceLevel,
		&a.CVSummary, &a.JobsAnalyzed, &a.EstimatedDuration, &a.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAnalysisNotFound
		}
		return nil, err
	}
	return a, nil
}
