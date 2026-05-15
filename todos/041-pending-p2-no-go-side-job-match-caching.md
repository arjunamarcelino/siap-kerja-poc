---
status: pending
priority: p2
issue_id: "041"
tags: [code-review, performance]
dependencies: []
---

# No Go-Side Caching for Job Match Results

## Problem Statement

`GET /api/job-matches` triggers a heavy pipeline on every request: DB query for CV analysis, HTTP call to Python AI for Jooble jobs, HTTP call for embeddings, and N pgvector similarity queries. The Python AI caches Jooble results in Redis (6h TTL), but the Go API has no caching. For the same user with unchanged CV/progress, the entire pipeline repeats unnecessarily.

## Findings

- **Source:** Architecture Strategist agent
- **Location:** `services/api/internal/service/job_matching.go`
- **Note:** Redis client is already initialized in main.go but not passed to JobMatchingService

## Proposed Solutions

### Option A: Cache JobMatchResponse in Redis with user+analysis key
Key: `job_matches:{user_id}:{analysis_id}`, TTL: 15 minutes. Invalidate on CV upload or progress change.

**Effort:** Medium | **Risk:** Low

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
