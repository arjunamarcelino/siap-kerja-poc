---
status: pending
priority: p2
issue_id: "029"
tags: [code-review, frontend, typescript, ux]
dependencies: []
---

# Dashboard Parallel Fetches with Unsynchronized Loading State

## Problem Statement

In `services/web/src/app/dashboard/page.tsx`, `setLoading(false)` is called in the `.finally()` of the first fetch (`/api/users/me`), but the second fetch (`/api/ai/analyses`) may still be in flight. The loading state does not represent the true loading state of all data on the page. This can cause a layout shift when the analysis data arrives after the loading spinner has already been dismissed.

## Findings

- **File:** `services/web/src/app/dashboard/page.tsx:26-29` — loading set to false after user fetch, regardless of analysis fetch status
- **Flagged by:** Frontend Races Agent
- **Evidence:** The user fetch's `.finally()` block calls `setLoading(false)`, but the analysis fetch runs independently. The `latestAnalysis` state may update after the UI has rendered in its "loaded" state, causing content to pop in unexpectedly.
- **Context:** The analysis fetch appears to be intentionally fire-and-forget ("silently — don't block dashboard"), so this may be intentional design. However, the resulting layout shift affects user experience.

## Proposed Solutions

### Option A: Accept current behavior with a comment (Recommended if intentional)
- Add a code comment explaining that the analysis fetch is intentionally non-blocking and that the loading state only covers the user data fetch.
- **Pros:** No behavior change, documents intent for future maintainers
- **Cons:** Does not address the layout shift
- **Effort:** Small
- **Risk:** Low

### Option B: Use `Promise.allSettled` to wait for both fetches
- Wrap both fetches in `Promise.allSettled()` and set `loading` to false only after both complete.
- **Pros:** Loading state accurately reflects all data, no layout shift, cleaner UX
- **Cons:** Dashboard render is blocked by the slower of the two fetches
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Loading state accurately reflects whether all visible data has been fetched, OR the intentional non-blocking behavior is documented with a clear code comment
- [ ] No unexpected layout shifts when analysis data arrives
- [ ] Dashboard remains responsive and does not block on failed fetches

## Technical Details

- **Affected files:** `services/web/src/app/dashboard/page.tsx`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
