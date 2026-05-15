package repository

import (
	"context"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type JobListingRepository struct {
	db *pgxpool.Pool
}

func NewJobListingRepository(db *pgxpool.Pool) *JobListingRepository {
	return &JobListingRepository{db: db}
}

// GetByRole fetches job listings matching the given role.
func (r *JobListingRepository) GetByRole(ctx context.Context, role string) ([]model.JobListing, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, title, company, role, required_skills, description
		FROM job_listings WHERE role = $1
		ORDER BY id`,
		role,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []model.JobListing
	for rows.Next() {
		var j model.JobListing
		if err := rows.Scan(&j.ID, &j.Title, &j.Company, &j.Role, &j.RequiredSkills, &j.Description); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}
