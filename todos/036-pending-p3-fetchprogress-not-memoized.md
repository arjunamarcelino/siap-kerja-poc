---
status: pending
priority: p3
issue_id: "036"
tags: [code-review, frontend, typescript, react-hooks]
dependencies: []
---

# fetchProgress Not Memoized (Potential Stale Closure)

## Problem Statement

In `services/web/src/app/dashboard/roadmap/page.tsx`, `fetchProgress` is a regular function declared in the component body. It is called from `useEffect` (on mount) and from event handlers. Since it is not wrapped in `useCallback`, it is recreated on every render. If called from a stale closure, it could read outdated state values. While the current usage pattern is safe, this risk would increase if `fetchProgress` were added as a dependency to other hooks.

## Findings

- **File:** `services/web/src/app/dashboard/roadmap/page.tsx`
- **Flagged by:** Frontend races agent, TypeScript agent
- **Evidence:** `fetchProgress` reads and sets multiple state variables but is not wrapped in `useCallback`. It is currently called from a `useEffect` on mount and from an analysis change handler. The stale closure risk is low in the current usage but would increase if:
  - `fetchProgress` were passed as a prop to a child component
  - `fetchProgress` were listed as a dependency in another `useEffect`
  - The component's render frequency increased

## Proposed Solutions

### Option A: Wrap in useCallback with proper dependencies (Recommended)
- Wrap `fetchProgress` in `useCallback` with the correct dependency array
- Prevents stale closures if usage patterns expand
- **Pros:** Defensive coding; follows React best practices for functions used in effects; safe to add as dependency to other hooks
- **Cons:** Slightly more boilerplate; dependency array must be kept accurate
- **Effort:** Small
- **Risk:** Low

### Option B: Leave as-is with a comment
- Add a comment noting the current usage is safe and stale closure risk is low
- Revisit if `fetchProgress` is used in more places
- **Pros:** No code change; avoids unnecessary abstraction for current usage
- **Cons:** Could become a bug source if usage pattern changes without updating the function
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Either `fetchProgress` is wrapped in `useCallback` with correct dependencies, or a comment documents that the current usage pattern is safe
- [ ] No regressions in progress fetching behavior on the roadmap page
- [ ] ESLint `react-hooks/exhaustive-deps` rule passes without warnings related to `fetchProgress`

## Technical Details

- **Affected files:** `services/web/src/app/dashboard/roadmap/page.tsx`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
