---
status: pending
priority: p1
issue_id: "022"
tags: [code-review, security, data-integrity, go, concurrency]
dependencies: []
---

# Read-Modify-Write Race Condition in ToggleItem (No Transaction)

## Problem Statement

In `services/api/internal/service/roadmap_progress.go`, the `ToggleItem` method performs a read-modify-write cycle (GetByAnalysisID -> modify JSON -> Upsert) without any transaction wrapping. Two concurrent toggle requests can read the same state, each apply their own toggle, and the last write wins — silently discarding the other user's change.

## Findings

- **File:** `services/api/internal/service/roadmap_progress.go:91-200` — ToggleItem reads progress, modifies in-memory, then upserts without BEGIN/COMMIT
- **Flagged by:** Data Integrity Guardian, Performance Optimizer, Simplicity Advocate, Architecture Strategist
- **Evidence:** The repository's `Upsert` uses `ON CONFLICT DO UPDATE` but this does not protect the read-modify-write cycle. The entire sequence of GetByAnalysisID -> in-memory JSON modification -> Upsert executes without transactional isolation.
- Under concurrent usage (user rapidly clicking checkboxes), data loss is likely — the last write silently overwrites all intermediate changes

## Proposed Solutions

### Option A: Wrap in a database transaction (Recommended)
- Add `BeginTx`/`Commit` around the read-modify-write cycle in ToggleItem
- Use `SELECT ... FOR UPDATE` on the read to hold a row-level lock during the transaction
- **Pros:** Standard pattern, strong consistency, well-understood by Go developers
- **Cons:** Slightly more complex repository interface to accept a transaction context
- **Effort:** Small
- **Risk:** Low

### Option B: Use PostgreSQL jsonb_set in a single UPDATE
- Move the toggle logic into SQL so read and write are atomic in a single statement
- Use `jsonb_set()` or a PL/pgSQL function to toggle the specific item in-place
- **Pros:** Eliminates the race entirely, no transaction needed, single round-trip
- **Cons:** More complex SQL, harder to unit test, toggle logic split between Go and SQL
- **Effort:** Medium
- **Risk:** Low

### Option C: Optimistic locking with version column
- Add a `version` column to the roadmap_progress table
- Read the version on fetch, increment on write, fail if the version changed between read and write
- Retry on conflict
- **Pros:** No long-held locks, scales well under contention
- **Cons:** Requires retry logic on conflict, schema migration needed, more complex error handling
- **Effort:** Medium
- **Risk:** Medium

## Acceptance Criteria

- [ ] Concurrent toggle requests do not silently discard each other's changes
- [ ] Toggle operation is atomic (either fully applied or not)
- [ ] Tests verify concurrent toggle behavior
- [ ] No data loss under rapid sequential toggling

## Technical Details

- **Affected files:**
  - `services/api/internal/service/roadmap_progress.go` — ToggleItem method
  - `services/api/internal/repository/roadmap_progress.go` — Upsert method (needs transaction support)
- **Related:** The Upsert method uses `ON CONFLICT DO UPDATE` which handles insert-vs-update atomically, but the preceding read + in-memory modification is not covered by this guarantee

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
