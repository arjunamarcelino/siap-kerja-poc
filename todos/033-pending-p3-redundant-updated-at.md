---
status: pending
priority: p3
issue_id: "033"
tags: [code-review, simplicity, go, sql]
dependencies: []
---

# Redundant updated_at = NOW() in Upsert SQL

## Problem Statement

In `services/api/internal/repository/roadmap_progress.go:43`, the upsert SQL includes `updated_at = NOW()` in the `ON CONFLICT ... DO UPDATE SET` clause. However, the migration at `infra/migrations/db/migrations/20260515000005_create_roadmap_progress.sql` creates a trigger (`update_roadmap_progress_updated_at`) that automatically updates `updated_at` on any row modification. The explicit `updated_at = NOW()` in the query is therefore redundant.

## Findings

- **File:** `services/api/internal/repository/roadmap_progress.go:43` — `updated_at = NOW()` in the upsert ON CONFLICT clause
- **File:** `infra/migrations/db/migrations/20260515000005_create_roadmap_progress.sql` — Creates trigger `update_roadmap_progress_updated_at`
- **Flagged by:** Migration agent, Data integrity agent
- **Evidence:** The trigger fires `BEFORE UPDATE` and sets `updated_at = NOW()` automatically. The explicit assignment in the SQL query produces the same result but is redundant. This is not harmful, just unnecessary.

## Proposed Solutions

### Option A: Remove `updated_at = NOW()` from the upsert (Recommended)
- Let the database trigger handle `updated_at` exclusively
- Keeps a single source of truth for timestamp management
- **Pros:** Reduces redundancy, avoids potential confusion about which mechanism sets the timestamp
- **Cons:** Developers reading the query alone won't see that `updated_at` is managed
- **Effort:** Small
- **Risk:** Low

### Option B: Keep it for explicitness with a comment
- Add a comment explaining the trigger also handles this, but keeping it for belt-and-suspenders clarity
- **Pros:** Query is self-documenting; defensive coding approach
- **Cons:** Maintains redundancy; could diverge from trigger behavior if trigger logic changes
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Either the redundant `updated_at = NOW()` is removed from the upsert query, or a comment is added explaining why it's kept alongside the trigger
- [ ] `updated_at` is correctly updated on upsert operations (verified via test or manual check)

## Technical Details

- **Affected files:** `services/api/internal/repository/roadmap_progress.go`
- **Related:** `infra/migrations/db/migrations/20260515000005_create_roadmap_progress.sql`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
