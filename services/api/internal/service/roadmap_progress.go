package service

import (
	"context"
	"encoding/json"
	"errors"
	"math"
	"strconv"
	"time"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
)

var (
	ErrInvalidStep     = errors.New("step not found in roadmap")
	ErrInvalidSkill    = errors.New("skill not found in step")
	ErrInvalidResource = errors.New("resource index out of bounds")
	ErrInvalidType     = errors.New("type must be skill or resource")
)

type RoadmapProgressService struct {
	progressRepo *repository.RoadmapProgressRepository
	analysisRepo *repository.CVAnalysisRepository
}

func NewRoadmapProgressService(
	progressRepo *repository.RoadmapProgressRepository,
	analysisRepo *repository.CVAnalysisRepository,
) *RoadmapProgressService {
	return &RoadmapProgressService{
		progressRepo: progressRepo,
		analysisRepo: analysisRepo,
	}
}

type ToggleRequest struct {
	Step  int    `json:"step"`
	Type  string `json:"type"`
	Value string `json:"value"`
	Index *int   `json:"index"`
	Done  bool   `json:"done"`
}

type ProgressResponse struct {
	Progress           json.RawMessage `json:"progress"`
	ProgressPercentage float64         `json:"progress_percentage"`
}

type stepProgress struct {
	SkillsDone    []string `json:"skills_done"`
	ResourcesDone []int    `json:"resources_done"`
	CompletedAt   *string  `json:"completed_at"`
}

type roadmapStep struct {
	Step          int      `json:"step"`
	SkillsCovered []string `json:"skills_covered"`
	Resources     []string `json:"resources"`
}

func (s *RoadmapProgressService) GetProgress(ctx context.Context, analysisID, userID string) (*ProgressResponse, error) {
	// Verify analysis exists and belongs to user
	roadmapJSON, err := s.analysisRepo.GetRoadmapByID(ctx, analysisID, userID)
	if err != nil {
		return nil, err
	}

	progress, err := s.progressRepo.GetProgress(ctx, analysisID, userID)
	if err != nil {
		return nil, err
	}

	var roadmap []roadmapStep
	if err := json.Unmarshal(roadmapJSON, &roadmap); err != nil {
		return nil, err
	}

	var progressMap map[string]*stepProgress
	if err := json.Unmarshal(progress, &progressMap); err != nil {
		return nil, err
	}

	pct := computePercentage(roadmap, progressMap)

	return &ProgressResponse{
		Progress:           progress,
		ProgressPercentage: pct,
	}, nil
}

func (s *RoadmapProgressService) ToggleItem(ctx context.Context, userID, analysisID string, req ToggleRequest) (*ProgressResponse, error) {
	// 1. Load roadmap (validates analysis exists + ownership)
	roadmapJSON, err := s.analysisRepo.GetRoadmapByID(ctx, analysisID, userID)
	if err != nil {
		return nil, err
	}

	var roadmap []roadmapStep
	if err := json.Unmarshal(roadmapJSON, &roadmap); err != nil {
		return nil, err
	}

	// 2. Validate step exists
	stepIdx := req.Step - 1
	if stepIdx < 0 || stepIdx >= len(roadmap) {
		return nil, ErrInvalidStep
	}
	step := roadmap[stepIdx]

	// 3. Validate skill/resource exists in step
	switch req.Type {
	case "skill":
		if !contains(step.SkillsCovered, req.Value) {
			return nil, ErrInvalidSkill
		}
	case "resource":
		if req.Index == nil || *req.Index < 0 || *req.Index >= len(step.Resources) {
			return nil, ErrInvalidResource
		}
	default:
		return nil, ErrInvalidType
	}

	// 4. Load current progress
	progressJSON, err := s.progressRepo.GetProgress(ctx, analysisID, userID)
	if err != nil {
		return nil, err
	}

	var progressMap map[string]*stepProgress
	if err := json.Unmarshal(progressJSON, &progressMap); err != nil {
		return nil, err
	}
	if progressMap == nil {
		progressMap = make(map[string]*stepProgress)
	}

	// 5. Ensure step entry exists
	stepKey := strconv.Itoa(req.Step)

	sp, ok := progressMap[stepKey]
	if !ok {
		sp = &stepProgress{
			SkillsDone:    []string{},
			ResourcesDone: []int{},
		}
		progressMap[stepKey] = sp
	}

	// 6. Toggle the item
	switch req.Type {
	case "skill":
		if req.Done {
			if !contains(sp.SkillsDone, req.Value) {
				sp.SkillsDone = append(sp.SkillsDone, req.Value)
			}
		} else {
			sp.SkillsDone = removeString(sp.SkillsDone, req.Value)
		}
	case "resource":
		if req.Done {
			if !containsInt(sp.ResourcesDone, *req.Index) {
				sp.ResourcesDone = append(sp.ResourcesDone, *req.Index)
			}
		} else {
			sp.ResourcesDone = removeInt(sp.ResourcesDone, *req.Index)
		}
	}

	// 7. Evaluate step completion
	allSkillsDone := len(sp.SkillsDone) >= len(step.SkillsCovered)
	allResourcesDone := len(sp.ResourcesDone) >= len(step.Resources)

	if allSkillsDone && allResourcesDone {
		if sp.CompletedAt == nil {
			now := time.Now().UTC().Format(time.RFC3339)
			sp.CompletedAt = &now
		}
	} else {
		sp.CompletedAt = nil
	}

	// 8. Save updated progress
	newProgressJSON, err := json.Marshal(progressMap)
	if err != nil {
		return nil, err
	}

	if err := s.progressRepo.UpsertProgress(ctx, userID, analysisID, newProgressJSON); err != nil {
		return nil, err
	}

	// 9. Compute and return percentage
	pct := computePercentage(roadmap, progressMap)

	return &ProgressResponse{
		Progress:           newProgressJSON,
		ProgressPercentage: pct,
	}, nil
}

func computePercentage(roadmap []roadmapStep, progressMap map[string]*stepProgress) float64 {
	totalItems := 0
	doneItems := 0

	for _, step := range roadmap {
		stepSkills := len(step.SkillsCovered)
		stepResources := len(step.Resources)
		totalItems += stepSkills + stepResources

		stepKey := strconv.Itoa(step.Step)
		sp, ok := progressMap[stepKey]
		if !ok {
			continue
		}
		doneItems += len(sp.SkillsDone)
		doneItems += len(sp.ResourcesDone)
	}

	if totalItems == 0 {
		return 100.0
	}

	pct := float64(doneItems) / float64(totalItems) * 100
	return math.Round(pct*10) / 10
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func containsInt(slice []int, item int) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}

func removeString(slice []string, item string) []string {
	result := make([]string, 0, len(slice))
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

func removeInt(slice []int, item int) []int {
	result := make([]int, 0, len(slice))
	for _, v := range slice {
		if v != item {
			result = append(result, v)
		}
	}
	return result
}
