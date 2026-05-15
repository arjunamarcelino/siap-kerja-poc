---
status: pending
priority: p2
issue_id: "026"
tags: [code-review, data-integrity, go, logic-error]
dependencies: []
---

# Step Completion Uses Length Comparison, Not Set Containment

## Problem Statement

In `services/api/internal/service/roadmap_progress.go`, step completion is determined by comparing `len(completedItems)` against `len(step.Resources) + len(step.Skills)`. This counts items but does not verify that the completed items actually match the step's resources and skills. A user could toggle unrelated items and still mark a step as "complete," leading to incorrect progress tracking and misleading completion status.

## Findings

- **File:** `services/api/internal/service/roadmap_progress.go:171-172` — `if len(completedItems) >= totalItems`
- **Flagged by:** Data Integrity Agent, Simplicity Agent
- **Evidence:** The completed_items array is stored per-step in the JSONB column, but nothing prevents items from other steps leaking in or stale items remaining after roadmap changes. The count-based comparison treats any N items as equivalent to the correct N items.
- **Context:** This is particularly problematic if the roadmap structure changes after items were toggled — previously valid completed items may no longer correspond to current step items, yet the step would still appear complete if the count matches.

## Proposed Solutions

### Option A: Validate completed items are a subset of step items (Recommended)
- Check that each completed item exists in the step's resources + skills list before counting it toward completion.
- **Pros:** Accurate completion status, resilient to data model changes, prevents false completions
- **Cons:** Slightly more computation per check (set intersection)
- **Effort:** Small
- **Risk:** Low

### Option B: Keep count-based but add a comment explaining the assumption
- If the data model guarantees items cannot leak across steps (e.g., enforced at the toggle endpoint), document this invariant explicitly.
- **Pros:** No code change, clarifies intent for future maintainers
- **Cons:** Does not protect against stale items or data model changes; relies on undocumented invariant
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Step completion only triggers when all of the step's actual resources and skills are marked complete
- [ ] Stale or unrelated completed items do not count toward step completion
- [ ] Existing progress data continues to work correctly after the fix
- [ ] Unit tests cover the edge case of mismatched completed items

## Technical Details

- **Affected files:** `services/api/internal/service/roadmap_progress.go`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
