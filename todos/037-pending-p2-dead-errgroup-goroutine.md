---
status: pending
priority: p2
issue_id: "037"
tags: [code-review, architecture, simplification]
dependencies: []
---

# Dead errgroup with Empty Goroutine

## Problem Statement

`ComputeJobMatches` in `services/api/internal/service/job_matching.go:60-84` creates an `errgroup` to "parallelize" two fetches, but the second goroutine is entirely empty (returns nil immediately). The comment admits the dependency: "Progress query needs analysisID, which we don't have yet." Progress is fetched sequentially after `g.Wait()` anyway.

This adds cognitive overhead, misleads future maintainers into thinking parallelism is happening, and imports `golang.org/x/sync/errgroup` for no benefit.

## Findings

- **Source:** Architecture, Performance, and Simplicity reviewers all flagged this independently
- **Location:** `services/api/internal/service/job_matching.go:60-84`
- **Impact:** No correctness bug, but misleading code structure

## Proposed Solutions

### Option A: Remove errgroup, use sequential calls (Recommended)
Replace the errgroup with two simple sequential calls.

**Effort:** Small | **Risk:** None

## Acceptance Criteria

- [ ] errgroup removed from `ComputeJobMatches`
- [ ] CV analysis and progress fetched sequentially
- [ ] `errgroup` import removed if unused elsewhere
- [ ] `go build ./...` passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | Three independent review agents flagged this |
