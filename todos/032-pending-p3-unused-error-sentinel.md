---
status: pending
priority: p3
issue_id: "032"
tags: [code-review, simplicity, go, dead-code]
dependencies: []
---

# Unused ErrProgressNotFound Sentinel Error

## Problem Statement

In `services/api/internal/repository/roadmap_progress.go:12`, `ErrProgressNotFound` is declared but never used. The `GetByAnalysisID` method returns `(nil, nil)` when no row is found instead of returning this sentinel error. This constitutes dead code that may confuse future developers about the intended error-handling contract.

## Findings

- **File:** `services/api/internal/repository/roadmap_progress.go:12`
- **Flagged by:** Simplicity agent
- **Evidence:** `var ErrProgressNotFound = errors.New("progress not found")` is declared at package level but the `GetByAnalysisID` method returns `(nil, nil)` when `pgx.ErrNoRows` is encountered, never wrapping or returning the sentinel error.

## Proposed Solutions

### Option A: Remove the unused sentinel (Recommended)
- Delete the `ErrProgressNotFound` declaration entirely
- Dead code cleanup keeps the codebase lean
- **Pros:** Eliminates confusion, reduces dead code
- **Cons:** If a not-found error is needed later, it must be re-added
- **Effort:** Small
- **Risk:** Low

### Option B: Use the sentinel in GetByAnalysisID
- Change `GetByAnalysisID` to return `(nil, ErrProgressNotFound)` when no rows are found
- Callers would need to check for this sentinel to distinguish "no progress" from actual errors
- **Pros:** Provides a proper typed error for not-found cases, follows Go sentinel error conventions
- **Cons:** Requires updating all callers to handle the new error; current `(nil, nil)` pattern may be intentional for optional data
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `ErrProgressNotFound` is either removed or actively used in the repository methods
- [ ] If used, all callers of `GetByAnalysisID` correctly handle the sentinel error
- [ ] No dead code remains in the repository file

## Technical Details

- **Affected files:** `services/api/internal/repository/roadmap_progress.go`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
