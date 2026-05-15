---
status: pending
priority: p1
issue_id: "004"
tags: [code-review, security, go]
dependencies: []
---

# Content-Disposition Header Injection in Multipart Forwarding

## Problem Statement

The filename from the upload is interpolated directly into the Content-Disposition header without sanitizing characters meaningful in MIME headers. `filepath.Base()` only strips directory components — it does not escape `"`, `\r`, or `\n` characters. A crafted filename like `evil".pdf` could break or inject into the MIME header.

## Findings

- **File:** `services/api/internal/service/cv_analysis.go:66`
- **Flagged by:** Security Sentinel
- **Evidence:**
  ```go
  partHeader.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, filename))
  ```

## Proposed Solutions

### Option A: Sanitize dangerous characters (Recommended)
- Strip `"`, `\r`, `\n` from filename before interpolation
- **Pros:** Simple, targeted fix
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

### Option B: Use Go's mime.FormatMediaType
- Use `mime.FormatMediaType("form-data", map[string]string{"name": "file", "filename": filename})`
- **Pros:** Handles all escaping correctly per RFC
- **Cons:** Slightly more verbose
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Filenames with `"`, `\r`, `\n` characters do not break MIME headers
- [ ] Normal filenames still work correctly

## Technical Details

- **Affected files:** `services/api/internal/service/cv_analysis.go`

## Work Log

| Date | Action |
|------|--------|
| 2026-05-15 | Created from PR #1 code review |

## Resources

- PR: https://github.com/arjunamarcelino/siap-kerja-poc/pull/1
