---
status: pending
priority: p2
issue_id: "040"
tags: [code-review, security]
dependencies: []
---

# Jooble API Key Exposed in URL Logs

## Problem Statement

In `services/ai/app/services/job_scraper.py:143`, the Jooble API key is embedded in the URL path: `https://jooble.org/api/{api_key}`. This follows Jooble's API design, but when the HTTP call fails (line 157), `exc_info=True` logs the full traceback including the URL with the API key.

## Findings

- **Source:** Security Sentinel agent
- **Location:** `services/ai/app/services/job_scraper.py:143,155-161`

## Proposed Solutions

### Option A: Suppress traceback in Jooble error logging (Recommended)
Change `exc_info=True` to `exc_info=False` on the Jooble failure log line. Log only the exception message, not the full traceback.

**Effort:** Small | **Risk:** None

## Acceptance Criteria

- [ ] Jooble API error logs do not contain the API key
- [ ] Errors are still logged (just without the URL in the traceback)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
