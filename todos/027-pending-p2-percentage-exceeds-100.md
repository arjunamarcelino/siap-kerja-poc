---
status: pending
priority: p2
issue_id: "027"
tags: [code-review, data-integrity, go]
dependencies: []
---

# Progress Percentage Can Exceed 100%

## Problem Statement

In `services/api/internal/service/roadmap_progress.go`, the `computePercentage` function sums completed items across all steps and divides by total items. There is no cap on the result — if `completed_items` contains stale entries for items that were later removed from the roadmap, or if items leak across steps, the percentage could exceed 100%. The frontend displays this percentage directly in the progress bar, which would render incorrectly.

## Findings

- **File:** `services/api/internal/service/roadmap_progress.go:202-226` — `computePercentage` function
- **Flagged by:** Data Integrity Agent, Performance Agent
- **Evidence:** No `min(percentage, 100)` cap exists in the computation. The function divides `totalCompleted` by `totalItems` and multiplies by 100, returning the raw result. If the roadmap is edited to remove items after a user has already marked them complete, the numerator can exceed the denominator.
- **Context:** The frontend progress bar component consumes this percentage value directly without client-side capping, so values over 100 would cause visual rendering issues.

## Proposed Solutions

### Option A: Cap at 100 with `math.Min(percentage, 100)` (Recommended)
- Add a simple guard at the end of `computePercentage` to ensure the return value never exceeds 100.
- **Pros:** Minimal change, immediate fix, prevents visual bugs
- **Cons:** Does not address the root cause of stale completed items
- **Effort:** Small
- **Risk:** Low

### Option B: Filter completed items against current roadmap items before counting
- Before summing, intersect the completed items with the current step's resources and skills, discarding stale entries.
- **Pros:** Fixes the root cause, ensures accurate data, synergizes with todo 026
- **Cons:** More computation, may need to handle migration of existing stale data
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] `computePercentage` never returns a value greater than 100
- [ ] Progress bar renders correctly even with stale completed items in the database
- [ ] Existing progress data is not corrupted by the fix
- [ ] Unit test covers the edge case where completed items exceed total items

## Technical Details

- **Affected files:** `services/api/internal/service/roadmap_progress.go`
- **Related:** Todo 026 (step completion logic may also produce stale items)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
