---
status: pending
priority: p2
issue_id: "016"
tags: [code-review, architecture]
dependencies: ["007"]
---

# Three Sources of Truth for Career Roles

## Problem Statement

Career roles are defined independently in Python (CareerRole enum), Python (ROLE_SEARCH_QUERIES), and TypeScript (CAREER_ROLES). Must be manually kept in sync — any addition to one must be reflected in all three.

## Findings

- **Files:** `services/ai/app/models/schemas.py:11-23`, `services/ai/app/services/job_scraper.py:21-32`, `services/web/src/types/analysis.ts:1-12`
- **Flagged by:** Architecture Strategist, Code Simplicity Reviewer

## Proposed Solutions

### Option A: API endpoint for career roles (Recommended for production)
- Go API exposes `GET /api/career-roles` returning allowed values
- Frontend fetches dynamically
- **Effort:** Medium

### Option B: Document coupling explicitly (Recommended for POC)
- Add comments in each file referencing the others
- **Effort:** Small

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
