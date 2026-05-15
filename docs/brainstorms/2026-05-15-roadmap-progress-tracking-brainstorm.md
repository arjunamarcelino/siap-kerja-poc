# Brainstorm: Roadmap Progress Tracking

**Date:** 2026-05-15
**Status:** Ready for planning
**Feature:** Interactive roadmap with progress tracking per CV analysis

---

## What We're Building

An interactive roadmap page (`/dashboard/roadmap`) where users can view their AI-generated learning roadmap and track progress by checking off individual skills, resources, and steps. The page defaults to the latest analysis but allows switching to older ones via a dropdown.

**Key behaviors:**
- Page is gated: shows an empty state with CTA if the user has no analyses
- Default view shows the latest analysis roadmap
- Users can switch between roadmaps from different analyses via a dropdown/selector
- Each roadmap step displays checkable skills and resources
- Steps auto-complete server-side: the PATCH handler compares checked items against the original roadmap step in `cv_analyses.roadmap` to determine completion
- Progress is persisted server-side in PostgreSQL (survives across devices)
- An overall progress bar/percentage shows completion across all steps

## Why This Approach

**JSONB progress table** — a new `roadmap_progress` table with one row per analysis and a JSONB column for progress state.

Reasons:
- Matches existing codebase patterns (skills, roadmap, etc. already stored as JSONB)
- Clean separation: analysis data stays immutable in `cv_analyses`, mutable progress lives in its own table
- Single migration, single API endpoint — appropriate for POC scope
- Flexible enough to add fields later without schema changes
- Avoids over-engineering with normalized tables for a hackathon project

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page access | `/dashboard/roadmap` with latest-by-default + history dropdown | Users get a dedicated page, can revisit old roadmaps |
| Tracking granularity | Step + skills + resources | Full granularity gives users fine-grained control |
| Completion logic | Semi-automatic, server-side | Skills/resources are manual; PATCH handler auto-sets `completed_at` when all sub-items for a step are done (compared against original roadmap data) |
| No-analysis state | Empty state with CTA | Show the page but prompt user to analyze CV first |
| Storage | Server-side PostgreSQL | Persists across devices, consistent with app architecture |
| Schema approach | New `roadmap_progress` table with JSONB | Clean separation, matches existing patterns |

## Data Design

### New table: `roadmap_progress`

```sql
CREATE TABLE roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES cv_analyses(id) ON DELETE CASCADE,
    progress JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, analysis_id)
);
```

### Progress JSONB shape

```json
{
  "1": {
    "skills_done": ["Python", "Pandas"],
    "resources_done": [0, 2],
    "completed_at": "2026-05-15T10:30:00Z"
  },
  "2": {
    "skills_done": [],
    "resources_done": [1],
    "completed_at": null
  }
}
```

- Keys are step numbers (as strings)
- `skills_done`: array of skill name strings that have been checked off
- `resources_done`: array of resource indices (0-based) that have been checked off
- `completed_at`: auto-set when all skills + resources for the step are done; cleared if any are unchecked

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ai/analyses/:id/progress` | Get progress for a specific analysis |
| `PATCH` | `/api/ai/analyses/:id/progress` | Toggle a skill/resource completion |

**PATCH body:**
```json
{
  "step": 1,
  "type": "skill",
  "value": "Python",
  "done": true
}
```
or
```json
{
  "step": 1,
  "type": "resource",
  "index": 0,
  "done": true
}
```

## Frontend Structure

- **Page:** `/dashboard/roadmap/page.tsx` (client component)
- **Components:**
  - `RoadmapTimeline` — vertical timeline of steps with expand/collapse
  - `RoadmapStepCard` — individual step with checkable skills and resources
  - `ProgressBar` — overall completion percentage
  - `AnalysisSelector` — dropdown to switch between analyses
  - `EmptyRoadmap` — CTA for users with no analyses

## Open Questions

- Should the analysis selector dropdown show all analyses, or only those where the user has started tracking progress?
