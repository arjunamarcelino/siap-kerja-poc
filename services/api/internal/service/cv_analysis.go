package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
)

var ErrAIServiceUnavailable = errors.New("AI service is temporarily unavailable")

type CVAnalysisService struct {
	repo         *repository.CVAnalysisRepository
	aiServiceURL string
	httpClient   *http.Client
}

func NewCVAnalysisService(repo *repository.CVAnalysisRepository, aiServiceURL string) *CVAnalysisService {
	return &CVAnalysisService{
		repo:         repo,
		aiServiceURL: aiServiceURL,
		httpClient: &http.Client{
			Timeout: 110 * time.Second,
		},
	}
}

// aiAnalysisResult mirrors the Python AnalysisResult Pydantic model.
type aiAnalysisResult struct {
	IdentifiedSkills  []string          `json:"identified_skills"`
	ExperienceLevel   string            `json:"experience_level"`
	CVSummary         string            `json:"cv_summary"`
	RequiredSkills    []string          `json:"required_skills"`
	SkillGaps         []string          `json:"skill_gaps"`
	MatchingSkills    []string          `json:"matching_skills"`
	Roadmap           json.RawMessage   `json:"roadmap"`
	EstimatedDuration string            `json:"estimated_duration"`
	JobsAnalyzed      int               `json:"jobs_analyzed"`
	TargetRole        string            `json:"target_role"`
}

func (s *CVAnalysisService) Analyze(
	ctx context.Context,
	userID string,
	fileData io.Reader,
	filename string,
	careerAspiration string,
) (*model.CVAnalysis, error) {
	// 1. Build multipart request for AI service
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := io.Copy(part, fileData); err != nil {
		return nil, fmt.Errorf("failed to copy file data: %w", err)
	}
	if err := writer.WriteField("career_aspiration", careerAspiration); err != nil {
		return nil, fmt.Errorf("failed to write career field: %w", err)
	}
	writer.Close() // Must close before creating request — writes trailing boundary

	// 2. Forward to AI service
	req, err := http.NewRequestWithContext(ctx, "POST", s.aiServiceURL+"/analyze-cv", &buf)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, ErrAIServiceUnavailable
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		// Parse error message from AI service
		var errResp struct {
			Message string `json:"message"`
		}
		if json.Unmarshal(body, &errResp) == nil && errResp.Message != "" {
			return nil, fmt.Errorf("%s", errResp.Message)
		}
		return nil, fmt.Errorf("AI service returned status %d", resp.StatusCode)
	}

	// 3. Parse AI response
	var result aiAnalysisResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	// 4. Marshal list fields to JSON for storage
	identifiedSkillsJSON, _ := json.Marshal(result.IdentifiedSkills)
	skillGapsJSON, _ := json.Marshal(result.SkillGaps)
	matchingSkillsJSON, _ := json.Marshal(result.MatchingSkills)
	requiredSkillsJSON, _ := json.Marshal(result.RequiredSkills)

	// 5. Build model and save
	analysis := &model.CVAnalysis{
		UserID:            userID,
		CareerAspiration:  careerAspiration,
		CVFilename:        filename,
		IdentifiedSkills:  identifiedSkillsJSON,
		SkillGaps:         skillGapsJSON,
		MatchingSkills:    matchingSkillsJSON,
		RequiredSkills:    requiredSkillsJSON,
		Roadmap:           result.Roadmap,
		ExperienceLevel:   result.ExperienceLevel,
		CVSummary:         result.CVSummary,
		JobsAnalyzed:      result.JobsAnalyzed,
		EstimatedDuration: result.EstimatedDuration,
	}

	if err := s.repo.SaveAnalysis(ctx, analysis); err != nil {
		// Log DB error but still return result — expensive AI computation shouldn't be lost
		log.Printf("WARNING: failed to save analysis to database: %v", err)
	}

	return analysis, nil
}

func (s *CVAnalysisService) GetAnalyses(ctx context.Context, userID string) ([]*model.CVAnalysis, error) {
	return s.repo.GetAnalysesByUserID(ctx, userID)
}

func (s *CVAnalysisService) GetAnalysis(ctx context.Context, id, userID string) (*model.CVAnalysis, error) {
	return s.repo.GetAnalysisByID(ctx, id, userID)
}
