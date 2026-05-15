---
status: pending
priority: p2
issue_id: "025"
tags: [code-review, security, go, validation]
dependencies: ["014"]
---

# No UUID Format Validation on `:id` Path Parameter

## Problem Statement

In `services/api/internal/handler/roadmap_progress.go`, the `:id` param (analysis ID) from the URL path is used directly in database queries without validating it is a proper UUID format. A malformed ID will produce a cryptic PostgreSQL error rather than a clean 400 response. While pgx parameterized queries prevent SQL injection, passing unexpected strings to the database layer is poor practice and degrades the user experience with unclear error messages.

## Findings

- **File:** `services/api/internal/handler/roadmap_progress.go:29,79` — `c.Param("id")` used without UUID validation
- **Flagged by:** Security Sentinel, Data Integrity Agent
- **Evidence:** The analysis ID extracted from the URL path is passed directly to service/repository layers without any format check. Malformed UUIDs (e.g., `abc`, `../other-path`, empty string) will reach PostgreSQL and produce driver-level errors that bubble up as 500 Internal Server Error.
- **Context:** Existing todo 014 covers UUID validation generally for PR #1, but this is a new endpoint added in PR #2 that introduces additional unvalidated UUID path params.

## Proposed Solutions

### Option A: Add UUID regex validation in handler (Recommended)
- Add a `uuid.Parse()` check (from `google/uuid` package) immediately after extracting the param, returning 400 if invalid.
- **Pros:** Simple, fast, immediately clear error messages for clients
- **Cons:** Validation logic repeated per handler if not centralized
- **Effort:** Small
- **Risk:** Low

### Option B: Add middleware for all UUID path params
- Create a reusable Gin middleware that validates any path parameter matching a known set of names (`:id`, `:analysisId`, etc.) as valid UUIDs.
- **Pros:** Centralized, reusable across all handlers, eliminates repeated validation
- **Cons:** More upfront effort, may be too broad if some `:id` params are not UUIDs
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Malformed UUID path parameters return HTTP 400 with a clear error message
- [ ] Valid UUIDs continue to work as before
- [ ] Error message follows the project convention: `{"message": "..."}`
- [ ] No internal PostgreSQL error details are leaked to clients for bad IDs

## Technical Details

- **Affected files:** `services/api/internal/handler/roadmap_progress.go`
- **Related:** Todo 014 (general UUID validation for PR #1 endpoints)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #2 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/2
