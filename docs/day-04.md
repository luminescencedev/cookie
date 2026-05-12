# Day 4 — Consent public API + Analytics routes

## Context
Days 1–3 done. Today we build the public consent API (called by the banner snippet) and the analytics API (called by the dashboard). Key improvements over the baseline:
- Consent log stores **category choices** (necessary/analytics/marketing)
- Rate limiting uses **Upstash Redis** — survives Vercel cold starts
- Monthly event quota is enforced via the `incrementAndCheck` helper from Day 3
- Analytics returns **category breakdown**

## Goal
By end of today, the snippet can fetch a site's banner config and log granular consent choices without auth. The dashboard can query full consent stats including category breakdown.

---

## Tasks

### 1. Write the consent routes
`api/routes/consent.ts`:
```typescript
import { Hono } from "hono"
import { db } from "../lib/db"
import { consentRatelimit, configRatelimit } from "../lib/ratelimit"
import { incrementAndCheck } from "../lib/usage"

export const consentRoutes = new Hono()

// GET /api/consent/config/:siteId
// Public — called by the JS snippet on page load
consentRoutes.get("/config/:siteId", async (c) => {
  const { siteId } = c.req.param()

  // Rate limit by siteId to prevent enumeration / abuse
  try {
    const { success } = await configRatelimit.limit(siteId)
    if (!success) return c.json({ error: "Too many requests" }, 429)
  } catch {
    // If Upstash is unreachable, fail open (don't break the banner)
  }

  const config = await db.bannerConfig.findUnique({
    where: { siteId },
  })

  if (!config) return c.json({ error: "Site not found" }, 404)

  // Return only public-safe fields
  return c.json({
    configVersion:    config.configVersion,
    language:         config.language,
    title:            config.title,
    description:      config.description,
    acceptLabel:      config.acceptLabel,
    rejectLabel:      config.rejectLabel,
    privacyPolicyUrl: config.privacyPolicyUrl,
    analyticsEnabled: config.analyticsEnabled,
    marketingEnabled: config.marketingEnabled,
    position:         config.position,
    primaryColor:     config.primaryColor,
    backgroundColor:  config.backgroundColor,
    showBranding:     config.showBranding,
  })
})

// POST /api/consent/log
// Public — called by the JS snippet after user makes a choice
consentRoutes.post("/log", async (c) => {
  const body = await c.req.json()
  const { siteId, choice, necessary, analytics, marketing, configVersion } = body

  // Validate choice
  if (!siteId || !["accepted", "rejected", "partial"].includes(choice)) {
    return c.json({ error: "Invalid payload" }, 400)
  }

  // Rate limit by siteId — prevents flood abuse
  try {
    const { success } = await consentRatelimit.limit(siteId)
    if (!success) return c.json({ error: "Rate limit exceeded" }, 429)
  } catch {
    // Fail open if Upstash unreachable — consent is more important than rate limiting
  }

  // Check monthly quota (enforces free plan limit)
  const { allowed } = await incrementAndCheck(siteId)
  if (!allowed) {
    // Return 200 to the snippet — not the user's fault the site owner hit their limit
    // The snippet still stores consent locally; we just don't persist it server-side
    return c.json({ ok: true, stored: false })
  }

  // Verify site exists
  const site = await db.site.findUnique({ where: { id: siteId } })
  if (!site) return c.json({ error: "Site not found" }, 404)

  await db.consentLog.create({
    data: {
      siteId,
      choice,
      necessary: necessary ?? true,
      analytics: analytics ?? (choice === "accepted"),
      marketing: marketing ?? (choice === "accepted"),
      configVersion: configVersion ?? 1,
      userAgent: c.req.header("user-agent") ?? null,
    },
  })

  return c.json({ ok: true, stored: true })
})
```

### 2. Write the analytics routes
`api/routes/analytics.ts`:
```typescript
import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"

export const analyticsRoutes = new Hono<{
  Variables: { userId: string }
}>()

analyticsRoutes.use("*", requireAuth)

// GET /api/analytics/:siteId
analyticsRoutes.get("/:siteId", async (c) => {
  const userId = c.get("userId")
  const { siteId } = c.req.param()

  const site = await db.site.findFirst({ where: { id: siteId, userId } })
  if (!site) return c.json({ error: "Site not found" }, 404)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [total, accepted, rejected, partial, analyticsConsented, marketingConsented] =
    await Promise.all([
      db.consentLog.count({ where: { siteId } }),
      db.consentLog.count({ where: { siteId, choice: "accepted" } }),
      db.consentLog.count({ where: { siteId, choice: "rejected" } }),
      db.consentLog.count({ where: { siteId, choice: "partial" } }),
      db.consentLog.count({ where: { siteId, analytics: true } }),
      db.consentLog.count({ where: { siteId, marketing: true } }),
    ])

  const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0
  const analyticsRate = total > 0 ? Math.round((analyticsConsented / total) * 100) : 0
  const marketingRate = total > 0 ? Math.round((marketingConsented / total) * 100) : 0

  // Last 30 days — daily breakdown
  const logs = await db.consentLog.findMany({
    where: { siteId, createdAt: { gte: thirtyDaysAgo } },
    select: { choice: true, analytics: true, marketing: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  const byDay: Record<string, { accepted: number; rejected: number; partial: number }> = {}
  for (const log of logs) {
    const day = log.createdAt.toISOString().slice(0, 10)
    if (!byDay[day]) byDay[day] = { accepted: 0, rejected: 0, partial: 0 }
    byDay[day][log.choice as "accepted" | "rejected" | "partial"]++
  }

  const dailyData = Object.entries(byDay).map(([date, counts]) => ({ date, ...counts }))

  // Recent logs — last 10
  const recentLogs = await db.consentLog.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      choice: true,
      necessary: true,
      analytics: true,
      marketing: true,
      configVersion: true,
      createdAt: true,
      userAgent: true,
    },
  })

  return c.json({
    total,
    accepted,
    rejected,
    partial,
    acceptRate,
    analyticsConsented,
    marketingConsented,
    analyticsRate,
    marketingRate,
    dailyData,
    recentLogs,
  })
})

// GET /api/analytics/:siteId/export — pro only
analyticsRoutes.get("/:siteId/export", async (c) => {
  const userId = c.get("userId")
  const { siteId } = c.req.param()

  const [site, subscription] = await Promise.all([
    db.site.findFirst({ where: { id: siteId, userId } }),
    db.subscription.findUnique({ where: { userId } }),
  ])

  if (!site) return c.json({ error: "Site not found" }, 404)
  if (subscription?.plan !== "pro") {
    return c.json({ error: "Export requires a Pro plan" }, 403)
  }

  const logs = await db.consentLog.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      choice: true,
      necessary: true,
      analytics: true,
      marketing: true,
      configVersion: true,
      createdAt: true,
      userAgent: true,
      country: true,
    },
  })

  const csv = [
    "id,choice,necessary,analytics,marketing,configVersion,date,userAgent,country",
    ...logs.map((l) =>
      [
        l.id,
        l.choice,
        l.necessary,
        l.analytics,
        l.marketing,
        l.configVersion,
        l.createdAt.toISOString(),
        `"${(l.userAgent ?? "").replace(/"/g, "'")}"`,
        l.country ?? "",
      ].join(",")
    ),
  ].join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="consent-export-${siteId}.csv"`,
    },
  })
})
```

### 3. Mount both routes in `api/index.ts`
```typescript
import { consentRoutes } from "./routes/consent"
import { analyticsRoutes } from "./routes/analytics"

app.route("/api/consent", consentRoutes)
app.route("/api/analytics", analyticsRoutes)
```

### 4. Seed test data with category choices
```bash
# Accepted all
curl -X POST http://localhost:3000/api/consent/log \
  -H "Content-Type: application/json" \
  -d '{"siteId":"[ID]","choice":"accepted","necessary":true,"analytics":true,"marketing":true,"configVersion":1}'

# Rejected all
curl -X POST http://localhost:3000/api/consent/log \
  -H "Content-Type: application/json" \
  -d '{"siteId":"[ID]","choice":"rejected","necessary":true,"analytics":false,"marketing":false,"configVersion":1}'

# Partial — analytics only
curl -X POST http://localhost:3000/api/consent/log \
  -H "Content-Type: application/json" \
  -d '{"siteId":"[ID]","choice":"partial","necessary":true,"analytics":true,"marketing":false,"configVersion":1}'
```

### 5. Test analytics
```bash
curl http://localhost:3000/api/analytics/[ID] -H "Cookie: [session]"
```

Expected:
```json
{
  "total": 3,
  "accepted": 1,
  "rejected": 1,
  "partial": 1,
  "acceptRate": 33,
  "analyticsConsented": 2,
  "marketingConsented": 1,
  "analyticsRate": 67,
  "marketingRate": 33,
  "dailyData": [...],
  "recentLogs": [...]
}
```

### 6. Test rate limiting
```bash
# Spam 210 requests — should start getting 429 after 200
for i in $(seq 1 210); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/consent/log \
    -H "Content-Type: application/json" \
    -d '{"siteId":"[ID]","choice":"accepted","necessary":true,"analytics":true,"marketing":true,"configVersion":1}'
done
```

---

## Definition of done
- [ ] `GET /api/consent/config/:siteId` returns full config including `configVersion` and categories
- [ ] `POST /api/consent/log` stores `necessary`, `analytics`, `marketing`, `configVersion`
- [ ] `POST /api/consent/log` returns `{ ok: true, stored: false }` when monthly limit exceeded (no 4xx to user)
- [ ] Rate limiting returns 429 after sustained abuse (test above)
- [ ] Rate limiter fails open if Upstash is unreachable
- [ ] `GET /api/analytics/:siteId` returns category consent rates
- [ ] `GET /api/analytics/:siteId/export` returns 403 on free plan, CSV on pro

---

## Common issues
- **Upstash cold start:** The `Redis.fromEnv()` call reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from env. Make sure both are set in `.env`
- **`stored: false` vs error:** We intentionally return 200 when the monthly limit is hit — the snippet still stores consent in `localStorage`, users just won't see it in analytics. This is the right UX (not the visitor's problem)
- **`partial` choice not in original schema:** Make sure your Prisma schema has no enum on `choice` — it's a plain `String` field so `"partial"` works without migration
