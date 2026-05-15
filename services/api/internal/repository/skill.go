package repository

import (
	"context"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	pgvec "github.com/pgvector/pgvector-go"
)

type SkillRepository struct {
	db *pgxpool.Pool
}

func NewSkillRepository(db *pgxpool.Pool) *SkillRepository {
	return &SkillRepository{db: db}
}

// GetSkillsByName fetches skills with embeddings matching the given names.
func (r *SkillRepository) GetSkillsByName(ctx context.Context, names []string) ([]model.Skill, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, name, category, embedding FROM skills
		WHERE name = ANY($1) AND embedding IS NOT NULL`,
		names,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []model.Skill
	for rows.Next() {
		var s model.Skill
		if err := rows.Scan(&s.ID, &s.Name, &s.Category, &s.Embedding); err != nil {
			return nil, err
		}
		skills = append(skills, s)
	}
	return skills, rows.Err()
}

// UpsertSkillEmbeddings batch-inserts or updates skill embeddings.
func (r *SkillRepository) UpsertSkillEmbeddings(ctx context.Context, skills []model.Skill) error {
	if len(skills) == 0 {
		return nil
	}

	batch := &pgx.Batch{}
	for _, s := range skills {
		batch.Queue(
			`INSERT INTO skills (name, embedding)
			VALUES ($1, $2)
			ON CONFLICT (name) DO UPDATE SET embedding = EXCLUDED.embedding`,
			s.Name, pgvec.NewVector(s.Embedding.Slice()),
		)
	}

	br := r.db.SendBatch(ctx, batch)
	defer br.Close()

	for range skills {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}
	return nil
}

// GetSkillMatch computes the pairwise cosine similarity match between user skills
// and job-required skills. Returns match percentage, matched skills, and missing skills.
func (r *SkillRepository) GetSkillMatch(
	ctx context.Context,
	userSkillNames []string,
	jobSkillNames []string,
) (matchPct int, matched []string, missing []string, err error) {
	if len(userSkillNames) == 0 || len(jobSkillNames) == 0 {
		return 0, nil, jobSkillNames, nil
	}

	err = r.db.QueryRow(ctx, `
		WITH user_skills AS (
			SELECT name, embedding FROM skills
			WHERE name = ANY($1) AND embedding IS NOT NULL
		),
		job_skills AS (
			SELECT name, embedding FROM skills
			WHERE name = ANY($2) AND embedding IS NOT NULL
		),
		pairwise AS (
			SELECT js.name AS job_skill_name,
				MAX(1 - (js.embedding <=> us.embedding)) AS best_similarity
			FROM job_skills js
			CROSS JOIN user_skills us
			GROUP BY js.name
		)
		SELECT
			COALESCE(ROUND(
				(COUNT(*) FILTER (WHERE best_similarity >= 0.75))::numeric
				/ NULLIF(COUNT(*), 0) * 100
			), 0)::int AS match_percentage,
			COALESCE(ARRAY_AGG(job_skill_name) FILTER (WHERE best_similarity >= 0.75), '{}') AS matched_skills,
			COALESCE(ARRAY_AGG(job_skill_name) FILTER (WHERE best_similarity < 0.75), '{}') AS missing_skills
		FROM pairwise`,
		userSkillNames,
		jobSkillNames,
	).Scan(&matchPct, &matched, &missing)

	if err != nil {
		return 0, nil, nil, err
	}

	// Add job skills that had no embeddings to the missing list
	inPairwise := make(map[string]bool)
	for _, s := range matched {
		inPairwise[s] = true
	}
	for _, s := range missing {
		inPairwise[s] = true
	}
	for _, s := range jobSkillNames {
		if !inPairwise[s] {
			missing = append(missing, s)
		}
	}

	return matchPct, matched, missing, nil
}
