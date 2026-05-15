---
status: pending
priority: p2
issue_id: "013"
tags: [code-review, data-integrity, go]
dependencies: ["005"]
---

# Missing nil Guard on Roadmap Field

## Problem Statement

If the AI returns `null` for roadmap, `result.Roadmap` is nil `json.RawMessage`. Passing nil to INSERT violates the `NOT NULL` constraint (DEFAULT only applies when column is omitted). Combined with silent DB save failure (#002), the user gets a response with no ID.

## Findings

- **File:** `services/api/internal/service/cv_analysis.go:126`
- **Flagged by:** Data Integrity Guardian

## Proposed Solutions

### Option A: Default nil to empty array (Recommended)
- `if result.Roadmap == nil { result.Roadmap = json.RawMessage("[]") }`
- Apply same pattern to all slice fields
- **Effort:** Small
- **Risk:** Low

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
