# Our Memories

A private, beautifully kept interactive web journal for two people to capture
and revisit their shared memories. Warm, intimate, paper-like aesthetic — not
an admin dashboard.

## Architecture

This is a pnpm monorepo with three artifacts:

- **`artifacts/memories`** (`@workspace/memories`) — React + Vite frontend.
  Slug `memories`, served at `/`.
- **`artifacts/api-server`** (`@workspace/api-server`) — Fastify API at `/api/*`.
- **`artifacts/mockup-sandbox`** (`@workspace/mockup-sandbox`) — design
  scaffolding (unused for shipped UI).

Shared libs:

- **`lib/api-spec`** — OpenAPI spec (single source of truth).
- **`lib/api-client-react`** — orval-generated React Query hooks.
- **`lib/db`** — Drizzle ORM + schema. Database is Replit Postgres.

## Domain

**Memory** — `title`, `body`, `memoryDate` (YYYY-MM-DD), optional `location`,
optional `mood` (joyful, peaceful, silly, romantic, adventurous, nostalgic,
grateful, bittersweet), `author` (`self` | `partner` | `both`), `tags[]`,
`photos[]` (URLs), `favorite` flag.

**Letter** — sealed note for the future. `fromAuthor` (`self` | `partner`),
optional `subject`, `body`, `unsealsAt` (date). The API returns `body: null`
and `sealed: true` until `unsealsAt <= today`. Marked `read` on first open.

## Frontend

- React 19, Vite 7, Wouter for routing, TanStack Query, Framer Motion,
  Recharts, react-day-picker, Tailwind v4, shadcn/ui.
- Fonts: Fraunces (serif), Plus Jakarta Sans (UI), Caveat (script accents).
- Palette: cream paper background, terracotta-rose primary, sage accent.
- Pages: Home (dashboard), Journal (filterable grid + timeline), MemoryNew,
  MemoryDetail, MemoryEdit, CalendarPage, Insights (charts + tag cloud),
  Letters (sealed/open lists), LetterNew, LetterDetail.

## API

- `GET/POST /api/memories`, `GET/PUT/DELETE /api/memories/:id`,
  `POST /api/memories/:id/favorite` (toggle).
- `GET /api/memories/recent`, `GET /api/memories/on-this-day`.
- `GET /api/stats/overview`, `/api/stats/mood-breakdown`,
  `/api/stats/tags`, `/api/stats/timeline`.
- `GET/POST /api/letters`, `GET/DELETE /api/letters/:id`,
  `POST /api/letters/:id/open` (mark read after unsealing).

## Deployment

- **Replit:** the existing workflows already serve the app.
- **Vercel:** `vercel.json` + `api/index.ts` adapt the Express app as a
  serverless function. See `DEPLOY_VERCEL.md` for the full guide.

## Scripts

- `pnpm --filter @workspace/scripts run seed-memories` — seed 10 sample memories.
