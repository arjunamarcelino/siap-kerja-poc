package repository

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProgressNotFound = errors.New("progress not found")

type RoadmapProgressRepository struct {
	db *pgxpool.Pool
}

func NewRoadmapProgressRepository(db *pgxpool.Pool) *RoadmapProgressRepository {
	return &RoadmapProgressRepository{db: db}
}

func (r *RoadmapProgressRepository) GetProgress(ctx context.Context, analysisID, userID string) (json.RawMessage, error) {
	var progress json.RawMessage
	err := r.db.QueryRow(ctx,
		`SELECT progress FROM roadmap_progress
		WHERE analysis_id = $1 AND user_id = $2`,
		analysisID, userID,
	).Scan(&progress)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return json.RawMessage("{}"), nil
		}
		return nil, err
	}
	return progress, nil
}

func (r *RoadmapProgressRepository) UpsertProgress(ctx context.Context, userID, analysisID string, progress json.RawMessage) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO roadmap_progress (user_id, analysis_id, progress)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, analysis_id) DO UPDATE
		SET progress = $3, updated_at = NOW()`,
		userID, analysisID, progress,
	)
	return err
}
