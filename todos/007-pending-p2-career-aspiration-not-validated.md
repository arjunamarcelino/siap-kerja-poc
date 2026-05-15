---
status: pending
priority: p2
issue_id: "007"
tags: [code-review, security, go]
dependencies: []
---

# Career Aspiration Not Validated at Go API Layer

## Problem Statement

The Go handler accepts any string for `career_aspiration` and forwards it to the AI service. Validation only happens in Python via `CareerRole` StrEnum. Invalid values still trigger a full HTTP round-trip to the AI service before being rejected.

## Findings

- **File:** `services/api/internal/handler/cv_analysis.go:59-63`
- **Flagged by:** Security Sentinel, Architecture Strategist

## Proposed Solutions

### Option A: Validate against allowed roles in Go handler (Recommended)
- Define allowed career roles as a map in Go
- Reject invalid values at the gateway with 400
- **Effort:** Small
- **Risk:** Low — must keep in sync with Python CareerRole enum

## Acceptance Criteria

- [ ] Invalid career aspirations rejected at Go layer with 400
- [ ] Valid career aspirations pass through unchanged
- [ ] Allowed values match Python CareerRole enum

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
