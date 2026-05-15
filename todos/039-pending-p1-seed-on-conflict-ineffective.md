---
status: pending
priority: p1
issue_id: "039"
tags: [code-review, data-integrity, database]
dependencies: []
---

# Seed ON CONFLICT DO NOTHING Is Ineffective for job_listings

## Problem Statement

`infra/seed/seed.sql` uses `ON CONFLICT DO NOTHING` for the `job_listings` INSERT, but the `job_listings` table (migration 20260515000006) has **no unique constraint**. Without a unique constraint, `ON CONFLICT DO NOTHING` never triggers a conflict -- every `make seed` run inserts duplicate rows. This doubles, triples, etc. the job listings, inflating match results.

The `skills` and `users` INSERTs work correctly because those tables have unique constraints on `name` and `email` respectively.

## Findings

- **Source:** Data Integrity Guardian agent
- **Location:** `infra/seed/seed.sql:40`, `infra/migrations/db/migrations/20260515000006_create_job_listings.sql`
- **Impact:** Running `make seed` multiple times creates duplicate job listings

## Proposed Solutions

### Option A: Add unique constraint + fix seed conflict target (Recommended)
Add `UNIQUE (title, company, role)` to the migration and update seed SQL to `ON CONFLICT (title, company, role) DO NOTHING`.

**Effort:** Small | **Risk:** Low

## Acceptance Criteria

- [ ] `job_listings` table has a unique constraint
- [ ] Seed SQL specifies the correct conflict target
- [ ] Running `make seed` twice does not produce duplicates
- [ ] Existing data is not affected

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-05-15 | Created from PR #3 review | |
