---
status: pending
priority: p2
issue_id: "038"
tags: [code-review, performance, database]
dependencies: []
---

# N+1 Query Pattern in Job Match Computation

## Problem Statement

`ComputeJobMatches` in `services/api/internal/service/job_matching.go:126-146` calls `skillRepo.GetSkillMatch()` inside a loop for each job. Each call executes a full SQL query with a CROSS JOIN between user skills and job skills. For 10 jobs, this fires 10 separate database round-trips, each computing up to 15x15=225 cosine similarity operations.

## Findings

- **Source:** Performance Oracle agent
- **Location:** `services/api/internal/service/job_matching.go:126-146`, `services/api/internal/repository/skill.go:81-107`
- **Current impact:** 10 DB round-trips per request with O(U*J) CROSS JOIN each
- **At scale:** 20+ jobs = 20+ round-trips; concurrent users multiply this

## Proposed Solutions

### Option A: Batch all matching into a single SQL query (Recommended)
Pass all job skill groups at once, compute all pairwise similarities in one round-trip using CTEs or LATERAL joins.

**Effort:** Medium | **Risk:** Low

### Option B: Use pgvector nearest-neighbor instead of CROSS JOIN
Replace brute-force CROSS JOIN with pgvector's `ORDER BY ... <=> ... LIMIT 1` to leverage the HNSW index.

**Effort:** Medium | **Risk:** Low

## Acceptance Criteria

- [ ] Job matching uses at most 1-2 database queries regardless of job count
- [ ] Results remain identical to current CROSS JOIN approach
- [ ] `go build ./...` passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
