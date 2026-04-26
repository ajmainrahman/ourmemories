# Our Memories

## Overview

A shared journal app called **Our Memories** — a quiet little place for two people to capture small moments, sealed letters, photo memories, and to look back on the journey together.

This is a pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- `artifacts/memories` — the journal frontend (React + Vite + wouter, TanStack Query, Tailwind v4, shadcn/ui). Served at `/`.
- `artifacts/api-server` — Express API server. Served at `/api`. Routes: memories, letters, stats, health.
- `artifacts/mockup-sandbox` — design sandbox.

## Pages

- `/` Home (today summary, stats, recent + on-this-day, mood breakdown)
- `/journal` browse memories, `/journal/new`, `/journal/:id`, `/journal/:id/edit`
- `/letters` sealed letters, `/letters/new`, `/letters/:id`
- `/calendar` calendar view, `/insights` aggregate charts

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
