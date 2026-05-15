---
status: pending
priority: p2
issue_id: "008"
tags: [code-review, architecture, python]
dependencies: []
---

# HTTPException Raised in Python Service Layer

## Problem Statement

`AnalysisService` raises `fastapi.HTTPException` directly, coupling the service layer to the HTTP framework. This violates Clean Architecture — the service layer should raise domain exceptions, and the router should translate them to HTTP responses.

## Findings

- **File:** `services/ai/app/services/analysis_service.py:36-37, 54-71`
- **Flagged by:** Architecture Strategist, Kieran Python Reviewer

## Proposed Solutions

### Option A: Domain exceptions translated in router (Recommended)
- Define `CVParseError`, `AIQuotaExhaustedError`, `AIServiceError` in service layer
- Catch and translate to HTTPException in the router
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Service layer raises domain exceptions, not HTTPException
- [ ] Router translates domain exceptions to HTTP responses

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
