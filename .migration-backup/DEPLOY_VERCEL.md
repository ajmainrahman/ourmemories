# Deploying to Vercel

This project is set up to deploy as a single Vercel project: the React +
Vite frontend (`artifacts/memories`) is served statically, and the Express
API (`artifacts/api-server/src/routes`) runs as a Node serverless function
mounted at `/api/*`.

## What's already configured

- **`vercel.json`** — install/build commands, the static `outputDirectory`,
  and rewrites that route `/api/*` to the serverless function and everything
  else to `index.html` (SPA routing).
- **`api/index.ts`** — Vercel serverless entry. It builds a fresh Express
  app, mounts the same router used in development, and exports it as the
  default handler.
- **`api/[...path].ts`** — re-exports the handler so every `/api/*` URL is
  caught by one function.
- **`.vercelignore`** — keeps unrelated artifacts (mockup sandbox, dist
  folders, Replit metadata) out of the upload.

## One-time setup in Vercel

1. **Import the repository** in the Vercel dashboard. Select
   "Other" / no preset — `vercel.json` already supplies the build settings.

2. **Set the framework preset to "Other"** (let `vercel.json` drive the
   build). Don't set a Root Directory — the monorepo root is correct.

3. **Add environment variables** (Settings → Environment Variables):

   | Name             | Value                                                     |
   | ---------------- | --------------------------------------------------------- |
   | `DATABASE_URL`   | Postgres connection string (Neon, Supabase, RDS, etc.)    |
   | `NODE_ENV`       | `production`                                              |

   The DB must be reachable from Vercel functions. Neon's serverless
   Postgres works well; Replit's built-in DB is not externally addressable.

4. **Run the schema migration** against your production DB once before the
   first deploy. From a machine with access to that DB:

   ```bash
   DATABASE_URL=<your-prod-url> pnpm --filter @workspace/db exec drizzle-kit push --force
   ```

5. **Deploy.** Vercel will run:

   ```
   corepack enable && pnpm install --no-frozen-lockfile
   pnpm --filter @workspace/api-spec run codegen
   pnpm --filter @workspace/memories run build
   ```

   And serve the result.

## Notes

- The frontend uses relative `/api/...` URLs, so it works in both dev
  (Replit proxy) and production (Vercel rewrites) without code changes.
- Cold starts: Express + Drizzle are lightweight, but the first request
  after idle may take ~1–2s.
- If you'd like to seed sample memories on the prod DB:
  `DATABASE_URL=<prod-url> pnpm --filter @workspace/scripts run seed-memories`.
