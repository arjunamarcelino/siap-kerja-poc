---
status: pending
priority: p1
issue_id: "024"
tags: [code-review, data-integrity, frontend, typescript, race-condition]
dependencies: []
---

# Stale Closure in Debounced PATCH Rollback

## Problem Statement

In `services/web/src/app/dashboard/roadmap/page.tsx`, when the debounced PATCH fails, the rollback restores `previousProgress` — but this value was captured at the time of the optimistic update, not the last server-confirmed state. If multiple toggles fire before the PATCH, the rollback target is stale and may restore an incorrect state that includes other optimistic (unconfirmed) changes.

## Findings

- **File:** `services/web/src/app/dashboard/roadmap/page.tsx` — handleToggle closure, rollback logic
- **Flagged by:** Frontend Race Condition Specialist, TypeScript Reviewer
- **Evidence:** The `handleToggle` function captures `previousProgress` via closure before applying the optimistic update. Consider this sequence:
  1. Toggle A fires — captures state S0, applies optimistically to S1
  2. Toggle B fires before A's PATCH completes — captures S1, applies optimistically to S2
  3. B's PATCH fails — rollback restores S1 (which includes unconfirmed toggle A), not S0 (the last server-confirmed state)
- This is closely related to Finding 023 (debounce drops toggles) — combined, they create a scenario where rollback can produce phantom state that never existed on the server
- The rollback may restore a state containing optimistic changes from other in-flight requests that also haven't been confirmed

## Proposed Solutions

### Option A: Track last server-confirmed state separately (Recommended)
- Maintain a `confirmedProgress` ref that only updates on successful PATCH responses
- On rollback, always restore from `confirmedProgress` instead of the closure-captured `previousProgress`
- **Pros:** Always correct rollback target, clear separation of optimistic vs confirmed state
- **Cons:** Extra ref to manage, must update on every successful response
- **Effort:** Small
- **Risk:** Low

### Option B: Remove optimistic updates entirely
- Only update the UI after the server confirms the PATCH was successful
- **Pros:** UI always matches server state, no rollback logic needed at all
- **Cons:** Perceived latency on each toggle (user waits for round-trip)
- **Effort:** Small
- **Risk:** Low

### Option C: Fix alongside debounce removal (Finding 023)
- If each toggle PATCHes immediately without debounce (as proposed in Finding 023 Option A), the stale closure problem is largely mitigated since each request uses current state at time of click
- Still need rollback logic for network failures, but the window for stale closures shrinks significantly
- **Pros:** Addresses root cause by reducing the window where closures go stale
- **Cons:** Still needs rollback handling for network failures; not a complete fix in isolation
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Rollback after PATCH failure restores the last server-confirmed state
- [ ] Multiple rapid toggles followed by a failure do not produce phantom state
- [ ] UI accurately reflects server state after any error scenario
- [ ] Integration with debounce fix (Finding 023) is consistent

## Technical Details

- **Affected files:**
  - `services/web/src/app/dashboard/roadmap/page.tsx` — handleToggle closure, rollback logic
- **Related:**
  - Finding 023 (debounce drops toggles) — these two issues compound: the debounce causes only one PATCH to fire, and the stale closure means that PATCH's rollback target is incorrect
  - Finding 022 (backend race condition) — even with correct frontend rollback, the backend must also handle concurrent writes atomically

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
