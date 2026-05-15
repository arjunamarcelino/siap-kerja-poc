---
status: pending
priority: p2
issue_id: "031"
tags: [code-review, architecture, go, simplicity]
dependencies: []
---

# Redundant Handler-Level Conditional Validation

## Problem Statement

In `services/api/internal/handler/roadmap_progress.go`, the handler validates the toggle request body with conditional checks (lines 65-77) for `step_index`, `item_type`, and `item_name`. However, the service layer in `services/api/internal/service/roadmap_progress.go` also performs its own validation of these same fields. This creates duplicated validation logic that can drift out of sync over time, leading to inconsistent error messages and maintenance burden.

## Findings

- **File:** `services/api/internal/handler/roadmap_progress.go:65-77` — Handler validates `step_index`, `item_type`, `item_name`
- **File:** `services/api/internal/service/roadmap_progress.go` — Service also validates these fields
- **Flagged by:** Simplicity Agent
- **Evidence:** Both layers check for valid `item_type` values and non-empty `item_name`. If the allowed `item_type` values change, both locations must be updated. The Clean Architecture pattern prescribes that the handler should validate HTTP concerns (format, required fields, content type), while the service validates business rules (valid step index, item type semantics).
- **Context:** The project follows Clean Architecture with handler, service, and repository layers. Validation responsibilities should be clearly delineated between these layers.

## Proposed Solutions

### Option A: Remove handler validation, let service handle it (Recommended)
- Remove the conditional validation from the handler. Let the service layer own all business validation and return domain-level errors. The handler maps domain errors to appropriate HTTP status codes.
- **Pros:** Single source of truth for validation rules, follows Clean Architecture, easier to maintain
- **Cons:** Handler must map service errors to HTTP statuses (may need error type definitions)
- **Effort:** Small
- **Risk:** Low

### Option B: Keep handler for input shape, remove service validation
- Handler validates input shape (required fields, types). Service trusts the handler and focuses on business logic only.
- **Pros:** Early rejection of malformed requests before hitting the service layer
- **Cons:** Business logic leaks into the handler layer, validation rules may still drift
- **Effort:** Small
- **Risk:** Medium (business logic in handler violates Clean Architecture)

## Acceptance Criteria

- [ ] Validation logic for toggle request fields exists in exactly one layer
- [ ] Invalid requests still return appropriate HTTP 400 responses with clear error messages
- [ ] Error messages follow the project convention: `{"message": "..."}`
- [ ] No regression in request validation behavior

## Technical Details

- **Affected files:** `services/api/internal/handler/roadmap_progress.go`, `services/api/internal/service/roadmap_progress.go`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
