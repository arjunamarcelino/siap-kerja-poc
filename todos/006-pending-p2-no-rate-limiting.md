---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, security, performance, go]
dependencies: []
---

# No Rate Limiting on CV Analysis Endpoint

## Problem Statement

The `POST /api/ai/analyze-cv` endpoint triggers expensive LLM calls and web scraping with no per-user rate limiting. A user could flood this endpoint, exhausting Gemini API quota and causing resource exhaustion.

## Findings

- **File:** `services/api/internal/router/router.go:53`
- **Flagged by:** Security Sentinel, Performance Oracle, Data Integrity Guardian

## Proposed Solutions

### Option A: Redis-based per-user rate limiting (Recommended)
- Use Redis INCR with TTL to limit analyses per user per hour (e.g., 5/hour)
- Return HTTP 429 when exceeded
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Users are limited to N analyses per hour
- [ ] 429 response with clear message when limit exceeded

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
