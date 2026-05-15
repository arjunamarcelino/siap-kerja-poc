---
status: pending
priority: p1
issue_id: "005"
tags: [code-review, data-integrity, go]
dependencies: []
---

# json.Marshal Errors Silently Swallowed

## Problem Statement

Four `json.Marshal` calls discard errors. If any field is nil, `json.Marshal(nil)` produces `"null"`, not `"[]"`, which will violate the `jsonb_typeof(...) = 'array'` CHECK constraint in the database, causing a silent INSERT failure (compounded by issue #002).

## Findings

- **File:** `services/api/internal/service/cv_analysis.go:112-115`
- **Flagged by:** Data Integrity Guardian, Pattern Recognition Specialist
- **Evidence:**
  ```go
  identifiedSkillsJSON, _ := json.Marshal(result.IdentifiedSkills)
  skillGapsJSON, _ := json.Marshal(result.SkillGaps)
  matchingSkillsJSON, _ := json.Marshal(result.MatchingSkills)
  requiredSkillsJSON, _ := json.Marshal(result.RequiredSkills)
  ```

## Proposed Solutions

### Option A: Check errors and add nil guards (Recommended)
- Check marshal errors
- Default nil slices to empty slice before marshaling
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Marshal errors are checked and propagated
- [ ] Nil slices default to `[]` not `null`
- [ ] Same nil guard applied to `Roadmap` (`json.RawMessage`)

## Technical Details

- **Affected files:** `services/api/internal/service/cv_analysis.go`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/1
