---
status: pending
priority: p3
issue_id: "044"
tags: [code-review, architecture]
dependencies: []
---

# Hardcoded 0.75 Cosine Similarity Threshold

## Problem Statement

`services/api/internal/repository/skill.go:99-103` hardcodes `0.75` as the cosine similarity threshold in SQL. This tuning parameter will need adjustment as embedding models change. It should be a named constant or config value.

## Proposed Solutions

Extract to a constant `const skillMatchThreshold = 0.75` and pass as a query parameter.

**Effort:** Small | **Risk:** None

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
