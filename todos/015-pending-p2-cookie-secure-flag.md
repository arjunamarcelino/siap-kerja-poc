---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, security, go]
dependencies: []
---

# Cookie Secure Flag Disabled

## Problem Statement

Auth cookies set `Secure: false`, meaning JWT tokens are sent over plain HTTP. Also, `SameSite` is set after `SetCookie`, which may not apply to the cookie.

## Findings

- **File:** `services/api/internal/handler/auth.go:54, 83`
- **Flagged by:** Security Sentinel

## Proposed Solutions

### Option A: Environment-based Secure flag (Recommended)
- Set `Secure: true` when `ENV=production`
- Call `SetSameSite` before `SetCookie`
- **Effort:** Small
- **Risk:** Low

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
