# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A GDPR-compliant cookie consent banner SaaS, built day by day following `docs/day-01.md` through `docs/day-15.md`. The project spec is in `docs/00-project-context.md`.

**Progress: Day 1 complete, starting Day 2.**

## What is being built

A cookie consent SaaS where users sign up, register their websites, customize a consent banner with granular categories (necessary / analytics / marketing), and embed a `<script>` tag. The dashboard shows analytics on consent choices. Competing with Cookiebot at a lower price point (€5/mo vs €14/mo).

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vite 8 + React 19 + TypeScript 5 + Tailwind CSS v4 |
| Auth | Better Auth |
| Backend API | Hono v4 (Vercel Edge Functions) |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Database | Supabase Postgres |
| Payments | Stripe |
| Rate limiting | None (Upstash removed — no-ops in `api/lib/ratelimit.ts`) |
| Hosting | Vercel |
| Package manager | pnpm v9+ (Node.js ≥ 20.19 required) |

## Commands

```bash
pnpm dev              # Vite frontend on :5173
pnpm dev:api          # Hono API on :3000 (tsx watch)
pnpm build            # build:snippet → tsc → vite build
pnpm build:snippet    # bundle snippet/banner.ts → public/banner.js (via esbuild)
pnpm db:generate      # generate Prisma client
pnpm db:push          # apply schema to DB (non-destructive)
pnpm db:studio        # Prisma Studio UI
```

No test or lint scripts are configured.

## Architecture

### Folder structure (target state after all 15 days)

```
cookieconsent/
├── src/                        # React frontend (Vite)
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx / Signup.tsx
│   │   └── dashboard/          # Sites, SiteDetail, Settings, Analytics
│   ├── components/
│   │   ├── ui/                 # reusable primitives
│   │   └── dashboard/          # BannerPreview, Analytics, etc.
│   └── lib/
│       ├── auth-client.ts      # Better Auth client
│       ├── api.ts              # typed HTTP client
│       └── types.ts            # BannerConfig, Site, Subscription, MonthlyUsage
├── api/                        # Hono backend → Vercel Edge Functions
│   ├── index.ts                # app entry, CORS, route registration
│   ├── lib/
│   │   ├── auth.ts             # Better Auth server config
│   │   ├── db.ts               # Prisma singleton with PrismaPg adapter
│   │   ├── middleware.ts        # requireAuth (sets c.get("userId"))
│   │   ├── stripe.ts           # Stripe client + webhook handlers
│   │   ├── ratelimit.ts        # Upstash rate limiters
│   │   └── usage.ts            # monthly event quota tracking
│   └── routes/
│       ├── auth.ts             # Better Auth passthrough
│       ├── sites.ts            # site CRUD
│       ├── consent.ts          # public: config fetch + consent log
│       ├── analytics.ts        # aggregated consent stats per site
│       └── billing.ts          # Stripe checkout, portal, webhook
├── prisma/schema.prisma
├── snippet/banner.ts           # consent banner source → bundled to public/banner.js
├── public/banner.js            # minified snippet served to customer sites
├── scripts/build-snippet.mjs  # esbuild config for the snippet
├── prisma.config.ts            # Prisma v7 config (schema path, datasource)
└── vercel.json
```

### Key concepts

**Config versioning & re-consent:** Every `BannerConfig` save increments `configVersion`. The snippet stores the version in `localStorage` with the consent choice; a mismatch causes the banner to re-appear. This is the mechanism for GDPR re-consent when legal copy changes.

**Monthly event quota:** `MonthlyEventCount` table tracks consents per `userId + "YYYY-MM"`. Free plan is capped at 5,000/month — the API checks this before inserting a `ConsentLog` and returns 429 when exceeded.

**Rate limiting:** Removed — `api/lib/ratelimit.ts` exports no-ops that always return `{ success: true }`. Upstash was cut to avoid cost. Can be added back later.

**CORS split:** `/api/consent/*` uses `origin: "*"` (snippet runs on any site); all other `/api/*` routes use credentialed CORS restricted to `FRONTEND_URL`.

**Prisma v7 quirks:** Client output goes to `../generated/client`, not `node_modules`. Config lives in `prisma.config.ts` (not inside `schema.prisma`). Import from `"../generated/client"`, not `"@prisma/client"`.

**Snippet build:** `VITE_API_URL` is baked into `public/banner.js` at build time. For production, this env var must be set before running `pnpm build:snippet`.

**Tailwind v4:** Uses `@tailwindcss/vite` plugin. Import in CSS with `@import "tailwindcss"`, not `@tailwind base/components/utilities`.

**Supabase connection:** Free tier blocks direct connections on port 5432. `DIRECT_URL` must use the pooler host (`aws-0-*.pooler.supabase.com`) at port **5432** (session mode), not the db host. `DATABASE_URL` uses the same pooler host at port **6543** (transaction mode).

**Vite 8 React plugin:** Uses `@vitejs/plugin-react-oxc` (not `@vitejs/plugin-react`) — Vite 8 recommendation for better performance.

## Plans

- **Free:** 5,000 consent events/month, branding shown, 30-day log history
- **Pro (€5/mo):** unlimited events, remove branding, CSV export

## Environment variables

```
DATABASE_URL              # Supabase pooled URL (?pgbouncer=true)
DIRECT_URL                # Supabase direct URL (used by Prisma migrations)
BETTER_AUTH_SECRET
BETTER_AUTH_URL           # http://localhost:3000 (dev) | https://yourdomain (prod)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
FRONTEND_URL              # http://localhost:5173 (dev)
VITE_API_URL              # http://localhost:3000 (dev) — baked into banner.js at build
```
