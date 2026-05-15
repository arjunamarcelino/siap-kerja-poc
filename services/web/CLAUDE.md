# SiapKerja Web (Frontend)

Next.js App Router frontend with TypeScript and Tailwind CSS.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- pnpm

## Development

```bash
pnpm dev        # Start dev server (port 3000)
pnpm build      # Production build
pnpm lint       # Run ESLint
pnpm test       # Run tests
```

## Conventions

- Server components by default, `"use client"` only when needed
- App Router file conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- API calls via `@/lib/api.ts` (`apiFetch<T>()` wrapper)
- Styles via Tailwind utility classes
- Import alias: `@/*` maps to `src/*`

## API Client

```typescript
import { apiFetch } from "@/lib/api";

// Type-safe API calls
const user = await apiFetch<User>("/api/users/me");
```

- SSR uses `API_INTERNAL_URL` (Docker internal network)
- Client-side uses `NEXT_PUBLIC_API_URL` (browser accessible)

## Adding Pages

1. Create `src/app/<route>/page.tsx`
2. For protected routes, the middleware redirects to `/login` if no `access_token` cookie

## Health Check

- `GET /api/health` → `{"status": "ok", "service": "web"}`
