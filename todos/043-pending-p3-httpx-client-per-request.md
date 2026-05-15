---
status: pending
priority: p3
issue_id: "043"
tags: [code-review, performance]
dependencies: []
---

# New httpx.AsyncClient Created Per Jooble Request

## Problem Statement

`services/ai/app/services/job_scraper.py:147-150` creates a new `httpx.AsyncClient` for every Jooble API call. This means a new TCP connection + TLS handshake each time (~100-300ms overhead). The client should be created once at startup and reused.

## Proposed Solutions

Create the client once in `dependencies.py` via `@lru_cache` and pass it to `fetch_jooble_jobs`.

**Effort:** Small | **Risk:** None

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
