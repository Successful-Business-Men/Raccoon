# Seagull

Resourceful tools for hostile terrain — a small set of free, private tools for
trans people and allies navigating the current legal landscape around
gender-affirming care, discrimination, and forced relocation.

## What's in here

| Route          | Tool                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| `/`            | Landing page                                                             |
| `/document`    | Documentation Agent — conversational intake → PDF incident packet        |
| `/map`         | Care Map — state-by-state status for HRT, surgery, ID changes, shield laws |
| `/continuity`  | Continuity Planner — structured form → personalized migration checklist  |
| `/about`       | Mission, disclaimers, partner orgs                                       |

All Claude calls run server-side. PDF generation runs server-side via
`@react-pdf/renderer`. Optional sign-in is via Supabase magic link.

## Local setup

```bash
cp .env.example .env.local      # then fill in values
npm install
npm run dev
```

Open <http://localhost:3000>.

### Required env vars

| Variable                        | Purpose                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| `ANTHROPIC_API_KEY`             | Claude API key — needed for `/document` and `/continuity`. |
| `ANTHROPIC_MODEL` (optional)    | Model id. Defaults to `claude-sonnet-4-5`.                 |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (optional — enables save).            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key.                                         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only key for cron writes.                           |
| `CRON_SECRET`                   | Shared secret for `/api/cron/update`. Vercel cron sends this as `Authorization: Bearer …`. |

Without Supabase, the app still runs — saves and magic-link sign-in are
disabled, the rest works.

## Supabase schema

Open the SQL editor in your Supabase project and run [`supabase/schema.sql`](supabase/schema.sql).
That creates `sessions`, `saved_documents`, `saved_continuity_plans`, all with
row-level security so users can only see their own rows.

## Data you'll need to plug in

The codebase scaffolds around three data shapes. Replace the placeholders:

- [`data/protections.json`](data/protections.json) — federal + per-state
  protection statutes for the Documentation Agent. Shape: `ProtectionsFile`
  in [`types/index.ts`](types/index.ts).
- [`data/care_status.ts`](data/care_status.ts) — per-state procedure statuses
  for the Care Map. Currently seeded with deterministic placeholder values so
  the UI exercises the legend.
- [`data/insurance.json`](data/insurance.json) — per-state insurance notes for
  the Continuity Planner.

TypeScript types for each live in [`types/index.ts`](types/index.ts).

## Scraper stubs

The cron route `/api/cron/update` fans out to four scrapers (all currently
TODO stubs):

- [`lib/scrapers/legiscan.ts`](lib/scrapers/legiscan.ts)
- [`lib/scrapers/lambda_legal_feed.ts`](lib/scrapers/lambda_legal_feed.ts)
- [`lib/scrapers/map_tracker.ts`](lib/scrapers/map_tracker.ts)
- [`lib/scrapers/kff_tracker.ts`](lib/scrapers/kff_tracker.ts)

Each returns `Partial<StateCareData>[]`; the cron route merges results.

The cron is wired in [`vercel.json`](vercel.json) to run every Monday at
11:00 UTC.

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set every env var from `.env.example` in the Vercel project settings
   (Production + Preview).
4. Run `supabase/schema.sql` in your Supabase project.
5. In your Supabase auth settings, add your Vercel URL to **Site URL** and
   **Redirect URLs** (e.g. `https://your-app.vercel.app/api/auth/callback`).
6. First deploy will install Vercel cron from `vercel.json`.

## Tech

- Next.js 14 App Router · TypeScript · Tailwind
- `@anthropic-ai/sdk` for Claude (tool use + streaming)
- `@react-pdf/renderer` for PDFs
- `react-simple-maps` for the US map (topology pulled from us-atlas via CDN)
- `@supabase/ssr` for optional auth

## Not legal or medical advice

Seagull is documentation and organizational support. It does not give legal
advice, prescribe medication, or recommend providers. For emergencies:
**Trans Lifeline 877-565-8860**.
