---
title: CV Upload & Career Analysis - Core Feature
date: 2026-05-15
type: feat
---

# CV Upload & Career Analysis - Core Feature

## What We're Building

The core product flow: user uploads their CV (PDF) and selects a target career from a preset dropdown. The AI service scrapes live job listings from Indonesian portals (Glints, JobStreet, LinkedIn), extracts the skill requirements, analyzes the CV against those requirements, and produces two outputs:

1. **Skill Gap Analysis** - Current skills vs. required skills for the target role
2. **Learning Roadmap** - Step-by-step learning plan to close the gaps

This is the gateway feature — all other features (job matching, micro-challenges, progress tracking) depend on this analysis being completed first.

## User Flow

1. User lands on dashboard (authenticated)
2. Clicks "Upload CV" card
3. Uploads PDF file + selects target career from dropdown (e.g. Data Analyst, UI/UX Designer, AI Engineer, Product Manager)
4. Clicks "Analyze"
5. Loading state while: PDF is parsed → jobs are scraped → LLM analyzes
6. Results page shows: identified skills, skill gaps, personalized learning roadmap

## Key Decisions

- **CV format**: PDF only — parsed server-side in the Python AI service
- **Career aspiration input**: Dropdown from curated preset roles (not free text)
- **Job data source**: Live scraping from Glints / JobStreet / LinkedIn at analysis time
- **Architecture**: Synchronous — scrape + analyze in a single request, user sees loading spinner
- **Core output**: Skill gap analysis + learning roadmap (no job matching in v1)
- **Storage**: Save analysis results to DB so user can revisit without re-analyzing

## What Already Exists

- Go API has proxy routes wired: `POST /api/ai/analyze-cv`, `/api/ai/generate-roadmap`, `/api/ai/match-jobs`
- Python AI service has Gemini 2.0 Flash via LangChain configured
- Pydantic schemas defined: `CVAnalysisRequest/Response`, `RoadmapRequest/Response`
- LLM service has stub methods (`analyze_cv()`, `generate_roadmap()`) returning mock data
- Frontend dashboard has 3 "Coming soon" placeholder cards
- Skills table with pgvector embeddings exists
- Auth system fully working

## What Needs to Be Built

### Backend (Go API)
- File upload endpoint (multipart form) to accept PDF
- Forward PDF + aspiration to AI service
- Persist analysis results
- New DB migrations: `cv_analyses` table

### AI Service (Python)
- PDF text extraction (pdfplumber or PyPDF2)
- Job scraping module (Glints/JobStreet)
- Real LLM prompts for skill extraction from CV
- Real LLM prompts for gap analysis (CV skills vs. job requirements)
- Real LLM prompts for roadmap generation
- Wire up routers for `/analyze-cv` and `/generate-roadmap`

### Frontend (Next.js)
- CV upload page with file picker + career dropdown
- Loading/progress state during analysis
- Results page: skill gap visualization + roadmap display

## Open Questions

- Which specific portal to prioritize for scraping (Glints has a more accessible structure)?
- How many jobs to scrape per analysis (10? 20? affects latency)?
- Should we combine analyze-cv + generate-roadmap into a single endpoint for simplicity?
- Preset role list: what roles to include? (Data Analyst, UI/UX Designer, AI Engineer, Product Manager, Backend Developer, Frontend Developer, DevOps Engineer, Data Scientist?)

## Preset Career Roles (Draft)

- Data Analyst
- UI/UX Designer
- AI / ML Engineer
- Product Manager
- Backend Developer
- Frontend Developer
- Full Stack Developer
- DevOps Engineer
- Data Scientist
- Mobile Developer
