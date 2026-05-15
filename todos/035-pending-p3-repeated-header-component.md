---
status: pending
priority: p3
issue_id: "035"
tags: [code-review, frontend, typescript, duplication]
dependencies: []
---

# Repeated Header Component Across Dashboard Pages

## Problem Statement

The dashboard header (logo + back/logout button) is duplicated across multiple page files: `page.tsx`, `results/page.tsx`, `roadmap/page.tsx`, and `analyze/page.tsx`. Each page re-implements the same header markup with minor variations (back button vs logout button). All share the same structure: logo on the left, action button on the right, `border-b`, `max-w-7xl` container.

## Findings

- **File:** `services/web/src/app/dashboard/page.tsx:64-76` — Header with logout button
- **File:** `services/web/src/app/dashboard/results/page.tsx:56-70` — Header with back link
- **File:** `services/web/src/app/dashboard/roadmap/page.tsx` — Header with back link
- **File:** `services/web/src/app/dashboard/analyze/page.tsx` — Header variant
- **Flagged by:** TypeScript agent
- **Evidence:** All four pages contain nearly identical header markup with the same layout structure. Only the right-side action button differs (logout vs back navigation). This is classic DRY violation, though acceptable in POC/hackathon contexts.

## Proposed Solutions

### Option A: Extract shared DashboardHeader component (Recommended)
- Create a `DashboardHeader` component that accepts an `action` prop for the right-side button
- Replace all four inline headers with the shared component
- **Pros:** Single source of truth for header layout; easy to update styling globally
- **Cons:** Minor abstraction overhead; need to design a flexible API for the action prop
- **Effort:** Small
- **Risk:** Low

### Option B: Use a layout.tsx for dashboard routes
- Move the header into `services/web/src/app/dashboard/layout.tsx`
- Use route-aware logic or context to determine the correct action button
- **Pros:** Header is truly shared via Next.js layout mechanism; no prop drilling needed
- **Cons:** More complex to vary the action button per route; layout changes affect all child routes
- **Effort:** Medium
- **Risk:** Low

### Option C: Leave as-is
- Accept duplication as POC/hackathon code
- Revisit if the dashboard grows beyond the current set of pages
- **Pros:** No code change; avoids premature abstraction
- **Cons:** Duplication increases maintenance burden as pages are added
- **Effort:** None
- **Risk:** None

## Acceptance Criteria

- [ ] Dashboard header is either extracted into a shared component/layout, or duplication is documented as an accepted trade-off
- [ ] All dashboard pages render the correct header with proper action buttons
- [ ] No visual regressions in header appearance across all dashboard routes

## Technical Details

- **Affected files:**
  - `services/web/src/app/dashboard/page.tsx`
  - `services/web/src/app/dashboard/results/page.tsx`
  - `services/web/src/app/dashboard/roadmap/page.tsx`
  - `services/web/src/app/dashboard/analyze/page.tsx`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
