---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, security, go]
dependencies: []
---

# Internal Error Messages Leaked to Clients

## Problem Statement

When `service.Analyze()` returns a non-sentinel error, the raw internal error string is sent directly to the client via `c.JSON(500, gin.H{"message": err.Error()})`. This can expose internal details such as the AI service URL, network errors, database errors, and stack traces.

The existing auth handler uses hardcoded user-friendly messages like `"Failed to register user"` — this handler should follow the same pattern.

## Findings

- **File:** `services/api/internal/handler/cv_analysis.go:89`
- **Flagged by:** Security Sentinel, Architecture Strategist, Pattern Recognition Specialist
- **Evidence:** `response.Error(c, http.StatusInternalServerError, err.Error())` passes raw error strings from `fmt.Errorf("failed to create form file: %w", err)` and AI service error messages directly to the client.

## Proposed Solutions

### Option A: Generic error message with server-side logging (Recommended)
- Replace `err.Error()` with a generic message: `"Failed to analyze CV. Please try again."`
- Log the actual error server-side: `log.Printf("ERROR: CV analysis failed: %v", err)`
- **Pros:** Simple, consistent with auth handler pattern
- **Cons:** Less informative for users on known errors (e.g., quota exceeded)
- **Effort:** Small
- **Risk:** Low

### Option B: Sentinel error mapping
- Define sentinel errors for each known case (`ErrAIQuotaExhausted`, `ErrAIUnavailable`, etc.)
- Map each to a user-friendly message in the handler
- Fall back to generic message for unknown errors
- **Pros:** Provides meaningful messages for known errors
- **Cons:** More code to maintain
- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] No internal error details (URLs, stack traces, DB errors) are exposed to clients
- [ ] Known error types return user-friendly messages
- [ ] Unknown errors return a generic message
- [ ] All errors are logged server-side with full detail

## Technical Details

- **Affected files:** `services/api/internal/handler/cv_analysis.go`
- **Related:** `services/api/internal/service/cv_analysis.go:100-101` (AI error forwarding)

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/1
