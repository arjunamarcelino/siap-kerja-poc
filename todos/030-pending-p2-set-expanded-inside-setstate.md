---
status: pending
priority: p2
issue_id: "030"
tags: [code-review, frontend, typescript, react-antipattern]
dependencies: []
---

# setExpandedStep Called Inside setState Updater

## Problem Statement

In `services/web/src/app/dashboard/roadmap/page.tsx`, the `handleToggle` function calls `setExpandedStep` inside a `setState` updater function for `setProgress`. Calling one setState inside another's updater is an anti-pattern in React — it can cause unexpected batching behavior and makes the code harder to reason about. The updater function passed to setState should be a pure function that computes the next state, not one that triggers additional side effects.

## Findings

- **File:** `services/web/src/app/dashboard/roadmap/page.tsx` — `handleToggle` calls `setExpandedStep` within `setProgress` updater
- **Flagged by:** TypeScript Agent, Frontend Races Agent
- **Evidence:** Inside the `setProgress(prev => { ... })` callback, `setExpandedStep(...)` is called conditionally. React may batch these updates unpredictably, and the behavior of calling a state setter inside another state setter's updater is not part of React's documented API contract.
- **Context:** The expanded step state change should be independent of the progress state change. These are two separate pieces of state that should be updated separately at the top level of the event handler.

## Proposed Solutions

### Option A: Move setExpandedStep call outside the setState updater (Recommended)
- Compute the new progress state and the new expanded step independently. Call both `setProgress` and `setExpandedStep` at the top level of the `handleToggle` function, not nested inside each other.
- **Pros:** Follows React best practices, clearer data flow, predictable batching behavior
- **Cons:** May require extracting the completion check logic to compute both values before setting state
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `setExpandedStep` is not called inside any `setState` updater function
- [ ] Both state updates happen at the top level of the event handler
- [ ] Toggle functionality continues to work correctly (items toggle, steps auto-expand on completion)
- [ ] No regression in the roadmap progress tracking behavior

## Technical Details

- **Affected files:** `services/web/src/app/dashboard/roadmap/page.tsx`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
