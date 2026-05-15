---
status: pending
priority: p1
issue_id: "003"
tags: [code-review, architecture, go, frontend]
dependencies: []
---

# target_role Not Persisted in Go Model/DB

## Problem Statement

The AI service returns `target_role` in its response, but the Go `CVAnalysis` model and DB table have no `target_role` column. The frontend displays `data.target_role` which renders as an empty string. For historical analyses fetched from DB, `target_role` is entirely absent.

The `career_aspiration` field IS stored and is semantically the same value — there are two names for the same concept across services.

## Findings

- **File:** `services/api/internal/model/cv_analysis.go` (missing field)
- **File:** `services/web/src/app/dashboard/analyze/page.tsx:360` (`data.target_role` renders empty)
- **Flagged by:** Architecture Strategist, TypeScript Reviewer

## Proposed Solutions

### Option A: Use career_aspiration consistently (Recommended)
- Remove `target_role` from TypeScript `AnalysisResult` interface
- Update frontend to use `career_aspiration` everywhere
- Remove `target_role` from Python `AnalysisResult` schema
- **Pros:** Single name for single concept, no DB migration needed
- **Cons:** Need to update frontend and AI response schema
- **Effort:** Small
- **Risk:** Low

### Option B: Add target_role to Go model and DB
- Add DB migration for `target_role` column
- Map it in Go service from AI response
- **Pros:** Preserves AI response field
- **Cons:** Redundant with `career_aspiration`, requires migration
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Target role displays correctly in analysis results
- [ ] Historical analyses show the correct role
- [ ] Single naming convention across all services

## Technical Details

- **Affected files:** `services/api/internal/model/cv_analysis.go`, `services/web/src/types/analysis.ts`, `services/web/src/app/dashboard/analyze/page.tsx`, `services/ai/app/models/schemas.py`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/1
