---
status: pending
priority: p3
issue_id: "019"
tags: [code-review, quality]
dependencies: ["003"]
---

# target_role vs career_aspiration Naming Inconsistency

## Problem Statement

The same concept has two names across services: `target_role` (AI service, frontend results) and `career_aspiration` (Go API, database, frontend form). This adds cognitive load when tracing data flow.

## Findings

- **Flagged by:** Code Simplicity Reviewer, Architecture Strategist
- Related to todo #003

## Proposed Solutions

- Pick one name and use everywhere (recommend `career_aspiration` as the user-facing term)
- **Effort:** Medium (touches all three services)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
