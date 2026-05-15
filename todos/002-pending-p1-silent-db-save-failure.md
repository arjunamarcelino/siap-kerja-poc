---
status: pending
priority: p1
issue_id: "002"
tags: [code-review, data-integrity, go]
dependencies: []
---

# Silent DB Save Failure Returns Zero-Value Fields to Client

## Problem Statement

When `repo.SaveAnalysis()` fails, the service logs a warning but still returns the analysis to the client. The `ID` and `CreatedAt` fields (populated by `RETURNING id, created_at`) remain zero-valued — the client receives `"id": ""` and `"created_at": "0001-01-01T00:00:00Z"`. The user believes their analysis was saved, but it cannot be retrieved later via `GET /api/ai/analyses`.

## Findings

- **File:** `services/api/internal/service/cv_analysis.go:133-136`
- **Flagged by:** Data Integrity Guardian, Data Migration Expert, Architecture Strategist
- **Evidence:**
  ```go
  if err := s.repo.SaveAnalysis(ctx, analysis); err != nil {
      log.Printf("WARNING: failed to save analysis to database: %v", err)
  }
  ```

## Proposed Solutions

### Option A: Return the error (Recommended for POC)
- Return the error so the handler responds with 500
- The expensive AI result is lost, but the user gets a clear error
- **Pros:** Simple, honest, no misleading data
- **Cons:** Expensive AI computation is lost
- **Effort:** Small
- **Risk:** Low

### Option B: Return result with persistence flag
- Generate UUID client-side before INSERT
- Set `CreatedAt` to `time.Now()` as fallback
- Add `"persisted": false` flag to response
- **Pros:** Preserves AI result, user is informed
- **Cons:** More complex, frontend needs to handle the flag
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Client never receives empty `id` or zero-value `created_at`
- [ ] User is informed if persistence failed
- [ ] No silent data loss

## Technical Details

- **Affected files:** `services/api/internal/service/cv_analysis.go`, `services/api/internal/handler/cv_analysis.go`
- **Related:** `services/api/internal/repository/cv_analysis.go` (RETURNING clause)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/1
