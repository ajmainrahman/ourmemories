# Our Memories

## Overview

A shared journal app called **Our Memories** — a quiet little place for two people to capture small moments, sealed letters, photo memories, and to look back on the journey together.

This is a pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- `artifacts/memories` — the journal frontend (React + Vite + wouter, TanStack Query, Tailwind v4, shadcn/ui). Served at `/`.
- `artifacts/api-server` — Express API server. Served at `/api`. Routes: auth, memories, letters, stats, replies, bucket-list, milestones, health.
- `artifacts/mockup-sandbox` — design sandbox.

## Pages

- `/` Home (today summary, stats, recent + on-this-day, mood breakdown)
- `/journal` browse memories, `/journal/new`, `/journal/:id`, `/journal/:id/edit`
- `/letters` sealed letters, `/letters/new`, `/letters/:id`
- `/bucket-list` shared bucket list / wishlist (categories incl. custom, optional deadline with "X days remaining" badge, inline edit)
- `/milestones` anniversaries with days-since and countdown counters (inline edit)
- `/calendar` calendar view, `/insights` aggregate charts

## Auth

- Email + password sign-in shared between two users (everyone signed in sees the same journal).
- JWT in httpOnly cookie (`om_session`), 7-day expiry. Signed with `SESSION_SECRET` env var.
- All API routes except `/api/healthz` and `/api/auth/*` require authentication.
- Replies on memories are signed by the logged-in user; bucket list items track who added them.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
