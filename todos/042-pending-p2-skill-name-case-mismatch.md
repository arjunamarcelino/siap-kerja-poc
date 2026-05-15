---
status: pending
priority: p2
issue_id: "042"
tags: [code-review, data-integrity]
dependencies: []
---

# Case Sensitivity Mismatch Creates Duplicate Skill Rows

## Problem Statement

Skill names are normalized inconsistently across the system:
- Seed data uses title-case: "Python", "JavaScript", "React"
- Python embedding service normalizes to lowercase: `s.strip().lower()`
- Go job matching normalizes to lowercase: `strings.ToLower(s)`

The `skills` table has `UNIQUE (name)`. Since "Python" != "python" in PostgreSQL, the upsert creates separate rows: "Python" (from seed, no embedding) and "python" (from embedding service, with embedding). This results in dead rows from seed data that never get embeddings.

## Findings

- **Source:** Data Integrity Guardian agent
- **Location:** `infra/seed/seed.sql`, `services/ai/app/services/embedding_service.py:25`, `services/api/internal/service/job_matching.go:231`

## Proposed Solutions

### Option A: Normalize seed data to lowercase (Recommended)
Change seed SQL to use lowercase skill names. This matches what the embedding service and Go normalization produce.

**Effort:** Small | **Risk:** Low

### Option B: Add a LOWER() generated column or trigger
Store a normalized form automatically at the database level.

**Effort:** Medium | **Risk:** Low

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
