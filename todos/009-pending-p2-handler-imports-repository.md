---
status: pending
priority: p2
issue_id: "009"
tags: [code-review, architecture, go]
dependencies: []
---

# Handler Imports Repository Package Directly

## Problem Statement

The CV analysis handler imports `repository.ErrAnalysisNotFound` directly, violating Clean Architecture's dependency rule. The handler should depend only on the service layer. The auth handler correctly uses `service.ErrEmailAlreadyExists` — this should follow the same pattern.

## Findings

- **File:** `services/api/internal/handler/cv_analysis.go:10-11, 125`
- **Flagged by:** Architecture Strategist

## Proposed Solutions

### Option A: Define service-level sentinel error (Recommended)
- Add `ErrAnalysisNotFound` to the service package
- Service translates repository error to service error
- Handler only imports service package
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Handler does not import repository package
- [ ] Service translates repository errors to service-level errors

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
