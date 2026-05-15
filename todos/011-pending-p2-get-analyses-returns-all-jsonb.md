---
status: pending
priority: p2
issue_id: "011"
tags: [code-review, performance, go]
dependencies: []
---

# GetAnalyses Returns All JSONB Columns for List View

## Problem Statement

The list endpoint fetches all columns including `roadmap`, `identified_skills`, `skill_gaps` etc. For a list view, only metadata fields are needed. This transfers 5-10x more data than necessary.

## Findings

- **File:** `services/api/internal/repository/cv_analysis.go:39-48`
- **Flagged by:** Performance Oracle

## Proposed Solutions

### Option A: Lightweight list query (Recommended)
- Select only summary fields for list view
- Create `CVAnalysisSummary` model for list responses
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] List endpoint returns only metadata fields
- [ ] Detail endpoint still returns full data

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
