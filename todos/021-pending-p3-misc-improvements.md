---
status: pending
priority: p3
issue_id: "021"
tags: [code-review, quality]
dependencies: []
---

# Miscellaneous Improvements

## Items

- **pdfplumber `layout=True`** slower than needed for CV text extraction (`services/ai/app/services/pdf_parser.py:31`)
- **`with_structured_output` called per-request** — cache in `__init__` (`services/ai/app/services/llm_service.py:66,91`)
- **Error response body read without size limit** at `services/api/internal/service/cv_analysis.go:94` — use `io.LimitReader`
- **No `updated_at` column** on `cv_analyses` table
- **CASCADE FK** may silently remove analyses when user deleted
- **Inline `User` type** in dashboard should be in shared types (`services/web/src/app/dashboard/page.tsx:9-15`)
- **`CAREER_ROLES` not sorted alphabetically** for dropdown UX

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |
