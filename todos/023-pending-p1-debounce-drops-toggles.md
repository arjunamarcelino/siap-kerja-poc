---
status: pending
priority: p1
issue_id: "023"
tags: [code-review, data-integrity, frontend, typescript, race-condition]
dependencies: []
---

# Frontend Debounce Drops Intermediate Toggles

## Problem Statement

In `services/web/src/app/dashboard/roadmap/page.tsx`, the `handleToggle` function uses a 300ms debounce with `clearTimeout` before sending the PATCH request. If a user clicks multiple checkboxes within 300ms, only the last click's PATCH is sent — all intermediate toggles are silently lost. The UI shows them as toggled (optimistic update), but the server never receives them.

## Findings

- **File:** `services/web/src/app/dashboard/roadmap/page.tsx` — handleToggle uses `clearTimeout(debounceRef.current)` then `setTimeout(..., 300)`
- **Flagged by:** Performance Optimizer, TypeScript Reviewer, Frontend Race Condition Specialist
- **Evidence:** Each new toggle call cancels the previous pending PATCH via `clearTimeout`, so only the final toggle in a 300ms window actually fires. The PATCH payload only contains the single toggled item, not all pending changes accumulated during the debounce window.
- User experience impact: checkboxes appear checked (optimistic update applied immediately) but revert on page reload because the server never received the intermediate toggles

## Proposed Solutions

### Option A: Remove debounce, send PATCH immediately for each toggle (Recommended)
- Remove the `clearTimeout`/`setTimeout` wrapper and send the PATCH request immediately on each toggle
- **Pros:** Every toggle is persisted, no data loss, simplest implementation
- **Cons:** More network requests (one per toggle)
- **Effort:** Small
- **Risk:** Low

### Option B: Batch pending toggles and send all at once after debounce
- Accumulate all toggled items in a Set during the debounce window
- After 300ms of inactivity, send a single PATCH containing all accumulated toggles
- **Pros:** Fewer network requests, no data loss
- **Cons:** More complex state management, need to track pending toggles separately
- **Effort:** Medium
- **Risk:** Low

### Option C: Queue-based approach with sequential processing
- Queue each toggle operation and process them sequentially
- Wait for server confirmation of each PATCH before sending the next
- **Pros:** Guaranteed ordering, each toggle confirmed before next
- **Cons:** Slower perceived UX (serial requests), complex queue management
- **Effort:** Large
- **Risk:** Medium

## Acceptance Criteria

- [ ] All checkbox toggles are persisted to the server
- [ ] Rapid clicking of multiple checkboxes does not lose any toggles
- [ ] UI state matches server state after all requests complete
- [ ] No silent data loss under any toggle pattern

## Technical Details

- **Affected files:**
  - `services/web/src/app/dashboard/roadmap/page.tsx` — handleToggle function, debounceRef
- **Related:** This issue compounds with Finding 022 (backend race condition) — even if the frontend sends all toggles, the backend must handle concurrent writes safely. Also directly related to Finding 024 (stale closure rollback).

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
