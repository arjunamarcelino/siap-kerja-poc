---
title: Job Matching Based on CV Analysis and Learning Progress
date: 2026-05-15
status: complete
---

# Job Matching Feature

## What We're Building

A job matching feature that shows users real job listings ranked by how well they match, using vector similarity (pgvector) for semantic skill matching. The feature combines the user's original CV skills with skills they've completed on their learning roadmap to compute an "effective skill set" that reflects their current capabilities -- not just what was on their CV.

**Core output:** Top 10 job listings from Glints, each with a per-job match percentage, matched skills, and missing skills. The match score is computed using pgvector cosine similarity between the user's effective skills and each job's required skills.

**Key differentiator:** Unlike static CV matching, this system accounts for learning progress. A user who has completed 80% of their roadmap will match more jobs than when they first uploaded their CV.

## Why This Approach

**Vector similarity (pgvector) was chosen over alternatives:**

- **vs. Algorithmic string matching:** String matching misses equivalences ("JS" != "JavaScript", "React" != "React.js"). Vector embeddings capture semantic similarity, so "Machine Learning" and "ML" naturally cluster together.
- **vs. LLM-scored matching:** LLM scoring requires a Gemini API call per request (~5-10s latency). Vector similarity is computed in PostgreSQL in milliseconds after embeddings exist. Avoids per-request AI costs.
- **vs. Hybrid approach:** Starting with pure pgvector keeps it simple. LLM scoring can be layered on later if needed.

**Embedding generation:** Embeddings are generated on-the-fly via Gemini's embedding API when a new skill is encountered, then cached in the `skills` table. The skills table already has an `embedding vector(768)` column with an HNSW index -- this infrastructure is ready to use.

## Key Decisions

1. **Data source:** Reuse existing Glints scraper (`job_scraper.py`). Already cached in Redis with 6-hour TTL.
2. **Effective skills = CV skills + roadmap-completed skills.** The user's skill set grows as they progress through their learning roadmap.
3. **Compute on-demand.** No persistence of match results -- generate fresh each time the user visits the page. Simpler, always up-to-date with latest progress.
4. **Top 10 results.** Consistent with the scraper's default limit. Fits well on one page.
5. **Per-job match score.** Each listing shows its own match % based on skill vector overlap. No single "overall readiness" score.
6. **On-the-fly embedding generation.** When a skill not yet in the `skills` table is encountered (from CV or job listing), generate its embedding via Gemini embedding API and cache it. The skills table grows organically.

## Architecture

**Responsibility split:**
- **AI service (Python):** Generates embeddings for skills via Gemini `text-embedding-004` (768-dim, matching existing `vector(768)` column). Scrapes job listings from Glints. Exposes a `/embed-skills` endpoint.
- **Go API:** Orchestrates the flow. Calls AI service for embeddings + job listings. Stores embeddings in the `skills` table. Runs pgvector cosine similarity queries in PostgreSQL. Returns ranked results to the frontend.
- **PostgreSQL (pgvector):** Stores skill embeddings, computes cosine similarity at query time via `<=>` operator.

**Cold-start mitigation:** The first request for a user will be slower because embeddings must be generated for skills not yet in the table. Subsequent requests are fast because embeddings are cached in the `skills` table. The scraper's Redis cache (6-hour TTL) also avoids repeated Glints scraping.

## Feature Scope

### What's included (MVP)

- AI service endpoint (`/embed-skills`) for generating skill embeddings via Gemini
- Go API stores embeddings in `skills` table, runs pgvector similarity queries
- Go API endpoint that combines CV analysis + roadmap progress + vector similarity scoring
- Frontend page at `/dashboard/jobs` showing ranked job listings with match scores
- Dashboard card update: convert "Coming soon" to active link when analysis exists
- Each job card shows: title, company, match %, matched skills (green), missing skills (amber)

### What's NOT included (future)

- Job application tracking
- Saved/bookmarked jobs
- Job alerts/notifications
- External links to apply on Glints
- Historical match score tracking over time
- Filter/sort controls on the job list

## Open Questions

1. **Match score formula:** Simple average cosine similarity across all user skills vs. all job skills? Or weighted by skill importance? (To be decided during planning.)
2. **Minimum match threshold:** Should we filter out jobs below a certain match % (e.g., < 30%), or always show the top 10 regardless of score?
