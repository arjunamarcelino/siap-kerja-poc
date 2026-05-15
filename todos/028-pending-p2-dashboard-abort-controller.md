---
status: pending
priority: p2
issue_id: "028"
tags: [code-review, frontend, typescript, race-condition, consistency]
dependencies: []
---

# Dashboard Missing AbortController Cleanup on Unmount

## Problem Statement

In `services/web/src/app/dashboard/page.tsx`, the `useEffect` that fetches user data and latest analysis does not use an AbortController. If the component unmounts before the fetch completes (e.g., user navigates away quickly), the `.then()` callbacks will attempt to set state on an unmounted component. While React will not crash, this is a memory leak and can cause unexpected behavior. This is inconsistent with other pages in the app that correctly implement AbortController cleanup.

## Findings

- **File:** `services/web/src/app/dashboard/page.tsx:25-41` — `useEffect` with two parallel fetches, no AbortController
- **Flagged by:** Frontend Races Agent
- **Evidence:** The results page (`/dashboard/results/page.tsx`) correctly uses AbortController for its fetches. The roadmap page also implements AbortController. The dashboard page is the outlier that does not follow this established pattern.
- **Context:** This is both a correctness issue (potential memory leak) and a consistency issue (deviates from the pattern used elsewhere in the codebase).

## Proposed Solutions

### Option A: Add AbortController matching the pattern used in results page (Recommended)
- Create an AbortController in the useEffect, pass its signal to both fetch calls, and call `controller.abort()` in the cleanup function.
- **Pros:** Consistent with existing codebase patterns, eliminates memory leak, standard React best practice
- **Cons:** None significant
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Dashboard useEffect creates an AbortController and passes the signal to all fetch calls
- [ ] The useEffect cleanup function calls `controller.abort()`
- [ ] Aborted fetches are handled gracefully (no error toasts for aborted requests)
- [ ] Pattern is consistent with the implementation in `/dashboard/results/page.tsx`

## Technical Details

- **Affected files:** `services/web/src/app/dashboard/page.tsx`
- **Related:** `services/web/src/app/dashboard/results/page.tsx` (reference implementation with AbortController)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
