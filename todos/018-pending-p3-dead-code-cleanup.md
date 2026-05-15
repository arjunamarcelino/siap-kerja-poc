---
status: pending
priority: p3
issue_id: "018"
tags: [code-review, quality, python]
dependencies: []
---

# Dead Code Cleanup in Python AI Service

## Problem Statement

Several unused functions and models exist in the AI service codebase.

## Findings

- `get_db_session` placeholder in `dependencies.py:15-22` — never used by any router
- `get_app_settings` in `dependencies.py:10-12` — trivial passthrough, never used
- `ErrorResponse` schema in `schemas.py:101-102` — never referenced
- `except (httpx.HTTPError, Exception)` in `job_scraper.py:105` — redundant, `Exception` is superclass

## Proposed Solutions

- Remove dead functions and unused schema
- Simplify redundant exception catch to `except Exception:`
- **Effort:** Small

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
