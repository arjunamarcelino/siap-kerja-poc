---
status: pending
priority: p2
issue_id: "010"
tags: [code-review, performance, python]
dependencies: []
---

# Timeout Chain Gap Leaves Orphan LLM Calls

## Problem Statement

The Go HTTP client timeout is 110s, but the AI service has no internal timeout on LLM calls. If Go times out and disconnects, the Python service continues processing (burning Gemini API quota). No explicit timeout on the FastAPI endpoint.

## Findings

- **File:** `services/api/internal/service/cv_analysis.go:33` (110s client timeout)
- **File:** `services/ai/app/routers/analysis.py` (no endpoint timeout)
- **Flagged by:** Performance Oracle, Architecture Strategist

## Proposed Solutions

### Option A: Add asyncio.wait_for to AI endpoint (Recommended)
- Wrap `run_full_analysis` with `asyncio.wait_for(timeout=100.0)`
- Return 504 on timeout
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] AI endpoint has explicit timeout below Go client timeout
- [ ] Orphan LLM calls are cancelled on timeout

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
