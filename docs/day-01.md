# Day 1 — Project init + foundation

## Context
Starting from zero. No files exist yet. Today we set up the entire project foundation: Vite frontend, Hono backend, Prisma schema connected to Supabase, and Upstash Redis for rate limiting.

## Goal
By the end of today, the project scaffolds correctly, the database schema is pushed to Supabase, and both the dev frontend and API server run without errors.

---

## Tasks

### 1. Install pnpm (if not already installed)
```bash
npm install -g pnpm
pnpm --version
```

### 2. Init the Vite project
> **Vite 8 (March 2026):** Requires Node.js 20.19+ or 22.12+.
```bash
pnpm create vite@8 cookieconsent -- --template react-ts
cd cookieconsent
```

### 3. Install all dependencies
```bash
# Backend
pnpm add hono@4 better-auth @prisma/client@7 stripe@22 @hono/node-server@2 @prisma/adapter-pg pg

# Rate limiting (Upstash)
pnpm add @upstash/redis @upstash/ratelimit

# Frontend
pnpm add react-router@7

# Tailwind v4
pnpm add tailwindcss@4 @tailwindcss/vite

# Dev
pnpm add -D prisma@7 typescript@5 @types/node tsx dotenv vite@8 @vitejs/plugin-react@6 esbuild
```

### 4. Configure Tailwind v4
`vite.config.ts`:
```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css` (replace everything):
```css
@import "tailwindcss";
```

### 5. Create the full folder structure
```
api/
  index.ts
  lib/
    auth.ts
    db.ts
    stripe.ts
    ratelimit.ts      ← new
  routes/
    auth.ts
    sites.ts
    consent.ts
    analytics.ts
    billing.ts
src/
  pages/
    Landing.tsx
    Login.tsx
    Signup.tsx
    dashboard/
      Index.tsx
      Sites.tsx
      SiteDetail.tsx
      Settings.tsx
  components/
    ui/
    dashboard/
  lib/
    auth-client.ts
    api.ts
    types.ts
prisma/
  schema.prisma
snippet/
  banner.ts
public/
scripts/
  build-snippet.mjs
.env
.env.example
vercel.json
```

### 6. Write the Prisma schema
`prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/client"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  sessions          Session[]
  accounts          Account[]
  sites             Site[]
  subscription      Subscription?
  monthlyEventCount MonthlyEventCount[]
}

model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model Site {
  id        String   @id @default(cuid())
  userId    String
  domain    String
  name      String
  createdAt DateTime @default(now())
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  config      BannerConfig?
  consentLogs ConsentLog[]
}

model BannerConfig {
  id            String  @id @default(cuid())
  siteId        String  @unique
  configVersion Int     @default(1)

  language         String  @default("auto")
  title            String  @default("We use cookies")
  description      String  @default("This site uses cookies to improve your experience.")
  acceptLabel      String  @default("Accept all")
  rejectLabel      String  @default("Reject all")
  privacyPolicyUrl String?

  analyticsEnabled Boolean @default(true)
  marketingEnabled Boolean @default(true)

  position        String  @default("bottom")
  primaryColor    String  @default("#000000")
  backgroundColor String  @default("#ffffff")
  showBranding    Boolean @default(true)

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
}

model ConsentLog {
  id            String   @id @default(cuid())
  siteId        String
  choice        String
  necessary     Boolean  @default(true)
  analytics     Boolean  @default(false)
  marketing     Boolean  @default(false)
  configVersion Int      @default(1)
  userAgent     String?
  country       String?
  createdAt     DateTime @default(now())
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@index([siteId, createdAt])
}

model MonthlyEventCount {
  id     String @id @default(cuid())
  userId String
  month  String
  count  Int    @default(0)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, month])
}

model Subscription {
  id               String    @id @default(cuid())
  userId           String    @unique
  stripeCustomerId String?   @unique
  stripeSubId      String?   @unique
  plan             String    @default("free")
  status           String    @default("active")
  currentPeriodEnd DateTime?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 7. Create `prisma.config.ts`
```typescript
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
})
```

### 8. Set up environment variables
`.env`:
```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
BETTER_AUTH_SECRET="generated-secret"
BETTER_AUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
STRIPE_PRO_PRICE_ID="price_placeholder"
FRONTEND_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

> **Upstash:** Create a free account at upstash.com → create a Redis database → copy REST URL and token. The free tier (10k requests/day) is more than enough for development.

### 9. Push schema to Supabase
```bash
pnpm db:push
pnpm db:generate
```

### 10. Create Prisma client singleton
`api/lib/db.ts`:
```typescript
import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const db = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

### 11. Create Upstash rate limiter
`api/lib/ratelimit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Sliding window: 200 consent log requests per siteId per hour
export const consentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(200, "1 h"),
  prefix: "cc:consent",
  analytics: false,
})

// Stricter limit for config fetches: 500 per siteId per hour
export const configRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(500, "1 h"),
  prefix: "cc:config",
  analytics: false,
})
```

### 12. Create minimal Hono server
`api/index.ts`:
```typescript
import "dotenv/config"
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()

// Public CORS for snippet endpoints
app.use("/api/consent/*", cors({ origin: "*" }))

// Credentialed CORS for dashboard
app.use("*", cors({
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
  credentials: true,
}))

app.get("/health", (c) => c.json({ ok: true }))

export default app
```

### 13. TypeScript types for the frontend
`src/lib/types.ts`:
```typescript
export interface BannerConfig {
  id: string
  siteId: string
  configVersion: number
  language: "auto" | "en" | "fr" | "de" | "es" | "it"
  title: string
  description: string
  acceptLabel: string
  rejectLabel: string
  privacyPolicyUrl: string | null
  analyticsEnabled: boolean
  marketingEnabled: boolean
  position: "bottom" | "modal"
  primaryColor: string
  backgroundColor: string
  showBranding: boolean
}

export interface Site {
  id: string
  userId: string
  domain: string
  name: string
  createdAt: string
  config: BannerConfig | null
  _count?: { consentLogs: number }
}

export interface Subscription {
  plan: "free" | "pro"
  status: string
  currentPeriodEnd: string | null
}

export interface MonthlyUsage {
  count: number
  limit: number
  month: string
}
```

### 14. Add dev scripts to `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "dev:api": "tsx watch api/index.ts",
    "build": "pnpm build:snippet && tsc && vite build",
    "build:snippet": "node scripts/build-snippet.mjs",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=8"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 15. Create `.npmrc`
```
shared-workspace-lockfile=false
strict-peer-dependencies=false
```

### 16. `vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Definition of done
- [ ] `pnpm dev` starts frontend on :5173
- [ ] `pnpm dev:api` starts API on :3000
- [ ] `GET http://localhost:3000/health` returns `{ "ok": true }`
- [ ] `pnpm db:studio` shows all tables including `MonthlyEventCount`
- [ ] Upstash env vars set (even if placeholder for now)
- [ ] Tailwind styles work

---

## Common issues
- **Upstash not reachable:** The free tier has a rate limit itself. If you hit it in dev, just set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to placeholder values — the rate limiter will throw and you can catch it gracefully
- **Prisma generate fails:** Run `pnpm db:push` first, then `pnpm db:generate`
- **Supabase connection error:** Use pooled URL for `DATABASE_URL`, direct URL for `DIRECT_URL`
