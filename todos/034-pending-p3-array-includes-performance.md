---
status: pending
priority: p3
issue_id: "034"
tags: [code-review, performance, frontend, typescript]
dependencies: []
---

# Array.includes() in Render Loop (Use Set for Performance)

## Problem Statement

In `services/web/src/app/dashboard/roadmap/page.tsx`, the render loop checks whether each roadmap item is completed using `completedItems.includes(itemName)`, which is O(n) per lookup. Inside a `.map()` render loop, this results in O(n*m) complexity where n is the number of completed items and m is the number of items being rendered. Converting `completedItems` to a `Set` before rendering would provide O(1) lookups.

## Findings

- **File:** `services/web/src/app/dashboard/roadmap/page.tsx`
- **Flagged by:** Performance agent
- **Evidence:** `completedItems` is stored as an array in state and checked with `.includes()` inside `.map()` render loops for each roadmap step's items. Current roadmap steps likely have fewer than 20 items per step, so the performance impact is negligible at current scale. This would only matter with significantly larger lists.

## Proposed Solutions

### Option A: Convert completedItems to Set before rendering (Recommended)
- Add `const completedSet = new Set(completedItems)` before the render return
- Replace `completedItems.includes(item)` with `completedSet.has(item)`
- **Pros:** O(1) lookups, trivial change, good habit for scalability
- **Cons:** Marginal improvement at current scale; Set creation itself has overhead
- **Effort:** Small
- **Risk:** Low

### Option B: Leave as-is with a comment
- Add a comment noting that `.includes()` is acceptable at current scale
- Revisit if item counts grow significantly
- **Pros:** No code change needed; avoids premature optimization
- **Cons:** Could become a real issue if roadmap complexity increases
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Either `completedItems` lookups use a Set for O(1) performance, or a comment documents the decision to keep `.includes()` at current scale
- [ ] No regressions in roadmap item completion display

## Technical Details

- **Affected files:** `services/web/src/app/dashboard/roadmap/page.tsx`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
