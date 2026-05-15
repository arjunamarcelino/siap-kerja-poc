---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, quality, python]
dependencies: []
---

# No Redis Connection Cleanup on Shutdown

## Problem Statement

The AI service creates a Redis client via `@lru_cache` but has no shutdown hook to close it, leaking connections.

## Findings

- **File:** `services/ai/app/dependencies.py:30-33`
- **Flagged by:** Kieran Python Reviewer

## Proposed Solutions

### Option A: Add cleanup in lifespan handler (Recommended)
- Close Redis client in the `lifespan` context manager's shutdown phase
- **Effort:** Small
- **Risk:** Low

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
