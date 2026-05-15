package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/model"
	"github.com/arjunamarcelino/siap-kerja-poc/services/api/internal/repository"
	pgvec "github.com/pgvector/pgvector-go"
	"golang.org/x/sync/errgroup"
)

var ErrNoCVAnalysis = errors.New("no CV analysis found")

type JobMatchingService struct {
	skillRepo    *repository.SkillRepository
	cvRepo       *repository.CVAnalysisRepository
	progressRepo *repository.RoadmapProgressRepository
	aiServiceURL string
	httpClient   *http.Client
}

func NewJobMatchingService(
	skillRepo *repository.SkillRepository,
	cvRepo *repository.CVAnalysisRepository,
	progressRepo *repository.RoadmapProgressRepository,
	aiServiceURL string,
) *JobMatchingService {
	return &JobMatchingService{
		skillRepo:    skillRepo,
		cvRepo:       cvRepo,
		progressRepo: progressRepo,
		aiServiceURL: aiServiceURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type skillProgress struct {
	SkillsDone []string `json:"skills_done"`
}

func (s *JobMatchingService) ComputeJobMatches(ctx context.Context, userID string) (*model.JobMatchResponse, error) {
	// Step 1: Fetch CV analysis and roadmap progress in parallel
	var latestAnalysis *model.CVAnalysis
	var progressJSON json.RawMessage

	g, gCtx := errgroup.WithContext(ctx)

	g.Go(func() error {
		analyses, err := s.cvRepo.GetAnalysesByUserID(gCtx, userID)
		if err != nil {
			return fmt.Errorf("fetch CV analyses: %w", err)
		}
		if len(analyses) == 0 {
			return ErrNoCVAnalysis
		}
		latestAnalysis = analyses[0]
		return nil
	})

	// We need the analysis ID for progress, but we can start this goroutine
	// and it will use latestAnalysis after g.Wait()
	g.Go(func() error {
		// Progress query needs analysisID, which we don't have yet.
		// We'll fetch progress after the wait.
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	// Now fetch progress with the analysis ID
	var err error
	progressJSON, err = s.progressRepo.GetProgress(ctx, latestAnalysis.ID, userID)
	if err != nil {
		log.Printf("Failed to fetch progress for analysis %s: %v", latestAnalysis.ID, err)
		// Non-fatal: proceed without progress
		progressJSON = json.RawMessage("{}")
	}

	// Step 2: Merge into effective skills
	var cvSkills []string
	if err := json.Unmarshal(latestAnalysis.IdentifiedSkills, &cvSkills); err != nil {
		return nil, fmt.Errorf("parse CV skills: %w", err)
	}

	var progressMap map[string]*skillProgress
	if err := json.Unmarshal(progressJSON, &progressMap); err != nil {
		progressMap = make(map[string]*skillProgress)
	}

	effectiveSkills := mergeEffectiveSkills(cvSkills, progressMap)

	// Step 3: Fetch job listings from AI service
	jobs, err := s.fetchJobs(ctx, latestAnalysis.CareerAspiration)
	if err != nil {
		return nil, fmt.Errorf("fetch jobs: %w", err)
	}

	if len(jobs) == 0 {
		return &model.JobMatchResponse{Matches: []model.JobMatchResult{}}, nil
	}

	// Step 4-5: Ensure all skills have embeddings
	if err := s.ensureEmbeddings(ctx, effectiveSkills, jobs); err != nil {
		log.Printf("Partial embedding failure: %v", err)
		// Non-fatal: proceed with whatever embeddings exist
	}

	// Step 6: Compute match for each job
	var results []model.JobMatchResult
	for _, job := range jobs {
		if len(job.RequiredSkills) == 0 {
			continue
		}

		normalizedJobSkills := normalizeSkills(job.RequiredSkills)
		matchPct, matched, missing, err := s.skillRepo.GetSkillMatch(ctx, effectiveSkills, normalizedJobSkills)
		if err != nil {
			log.Printf("Failed to compute match for job %q: %v", job.Title, err)
			continue
		}

		results = append(results, model.JobMatchResult{
			Title:           job.Title,
			Company:         job.Company,
			MatchPercentage: matchPct,
			MatchedSkills:   matched,
			MissingSkills:   missing,
			TotalRequired:   len(job.RequiredSkills),
		})
	}

	// Step 7: Sort by match percentage DESC, take top 10
	sort.Slice(results, func(i, j int) bool {
		return results[i].MatchPercentage > results[j].MatchPercentage
	})

	if len(results) > 10 {
		results = results[:10]
	}

	// Ensure non-nil arrays in response
	for i := range results {
		if results[i].MatchedSkills == nil {
			results[i].MatchedSkills = []string{}
		}
		if results[i].MissingSkills == nil {
			results[i].MissingSkills = []string{}
		}
	}

	return &model.JobMatchResponse{Matches: results}, nil
}

func mergeEffectiveSkills(cvSkills []string, progressMap map[string]*skillProgress) []string {
	seen := make(map[string]bool)
	var result []string

	for _, s := range cvSkills {
		norm := strings.TrimSpace(strings.ToLower(s))
		if norm != "" && !seen[norm] {
			seen[norm] = true
			result = append(result, norm)
		}
	}

	for _, sp := range progressMap {
		if sp == nil {
			continue
		}
		for _, s := range sp.SkillsDone {
			norm := strings.TrimSpace(strings.ToLower(s))
			if norm != "" && !seen[norm] {
				seen[norm] = true
				result = append(result, norm)
			}
		}
	}

	return result
}

func normalizeSkills(skills []string) []string {
	result := make([]string, 0, len(skills))
	for _, s := range skills {
		norm := strings.TrimSpace(strings.ToLower(s))
		if norm != "" {
			result = append(result, norm)
		}
	}
	return result
}

func (s *JobMatchingService) fetchJobs(ctx context.Context, careerAspiration string) ([]model.ScrapedJob, error) {
	reqURL := fmt.Sprintf("%s/scrape-jobs?role=%s", s.aiServiceURL, url.QueryEscape(careerAspiration))

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("AI service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status %d", resp.StatusCode)
	}

	var jobs []model.ScrapedJob
	if err := json.NewDecoder(resp.Body).Decode(&jobs); err != nil {
		return nil, fmt.Errorf("parse jobs response: %w", err)
	}

	return jobs, nil
}

// ensureEmbeddings checks which skills are missing embeddings and generates them.
func (s *JobMatchingService) ensureEmbeddings(ctx context.Context, userSkills []string, jobs []model.ScrapedJob) error {
	// Collect all unique skill names
	allSkills := make(map[string]bool)
	for _, sk := range userSkills {
		allSkills[sk] = true
	}
	for _, job := range jobs {
		for _, sk := range job.RequiredSkills {
			norm := strings.TrimSpace(strings.ToLower(sk))
			if norm != "" {
				allSkills[norm] = true
			}
		}
	}

	allNames := make([]string, 0, len(allSkills))
	for name := range allSkills {
		allNames = append(allNames, name)
	}

	// Check which already have embeddings
	existing, err := s.skillRepo.GetSkillsByName(ctx, allNames)
	if err != nil {
		return fmt.Errorf("fetch existing skills: %w", err)
	}

	hasEmbedding := make(map[string]bool)
	for _, sk := range existing {
		hasEmbedding[sk.Name] = true
	}

	var missing []string
	for _, name := range allNames {
		if !hasEmbedding[name] {
			missing = append(missing, name)
		}
	}

	if len(missing) == 0 {
		return nil
	}

	// Call AI service to generate embeddings
	embeddings, err := s.generateEmbeddings(ctx, missing)
	if err != nil {
		return fmt.Errorf("generate embeddings: %w", err)
	}

	// Upsert into DB
	skills := make([]model.Skill, len(embeddings))
	for i, emb := range embeddings {
		skills[i] = model.Skill{
			Name:      emb.Skill,
			Embedding: pgvec.NewVector(emb.Embedding),
		}
	}

	if err := s.skillRepo.UpsertSkillEmbeddings(ctx, skills); err != nil {
		return fmt.Errorf("upsert embeddings: %w", err)
	}

	return nil
}

type embeddingResult struct {
	Skill     string    `json:"skill"`
	Embedding []float32 `json:"embedding"`
}

type embedSkillsRequest struct {
	Skills []string `json:"skills"`
}

type embedSkillsResponse struct {
	Embeddings []embeddingResult `json:"embeddings"`
}

func (s *JobMatchingService) generateEmbeddings(ctx context.Context, skills []string) ([]embeddingResult, error) {
	body, err := json.Marshal(embedSkillsRequest{Skills: skills})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.aiServiceURL+"/embed-skills", strings.NewReader(string(body)))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("AI service unavailable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("embed-skills returned status %d", resp.StatusCode)
	}

	var result embedSkillsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("parse embeddings response: %w", err)
	}

	return result.Embeddings, nil
}
