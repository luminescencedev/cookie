# Day 3 — Sites API (CRUD)

## Context
Days 1–2 done. Auth works end-to-end. Today we build all site management API routes. The free plan is now **event-based** (5 000 consent events/month) rather than site-count-based — harder to game, fairer to users, and aligns with how competitors monetize.

## Goal
By end of today, all site management routes are working. A logged-in user can create, list, update, and delete sites. Each site automatically gets a default BannerConfig. Free plan limits are enforced per monthly event volume, not per number of sites.

---

## Tasks

### 1. Write the sites routes
`api/routes/sites.ts`:
```typescript
import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"

export const sitesRoutes = new Hono<{
  Variables: { userId: string }
}>()

sitesRoutes.use("*", requireAuth)

const FREE_MONTHLY_LIMIT = 5_000

// GET /api/sites
sitesRoutes.get("/", async (c) => {
  const userId = c.get("userId")

  const sites = await db.site.findMany({
    where: { userId },
    include: {
      config: true,
      _count: { select: { consentLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return c.json(sites)
})

// GET /api/sites/:id
sitesRoutes.get("/:id", async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.param()

  const site = await db.site.findFirst({
    where: { id, userId },
    include: { config: true },
  })

  if (!site) return c.json({ error: "Site not found" }, 404)
  return c.json(site)
})

// POST /api/sites
// No site count limit on free plan — limits are event-based instead
sitesRoutes.post("/", async (c) => {
  const userId = c.get("userId")
  const body = await c.req.json()
  const { domain, name } = body

  if (!domain || !name) {
    return c.json({ error: "domain and name are required" }, 400)
  }

  const site = await db.site.create({
    data: {
      userId,
      domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      name,
      config: { create: {} }, // default BannerConfig
    },
    include: { config: true },
  })

  return c.json(site, 201)
})

// PATCH /api/sites/:id/config
// Increments configVersion on every save → forces re-consent on all users
sitesRoutes.patch("/:id/config", async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.param()
  const body = await c.req.json()

  const site = await db.site.findFirst({ where: { id, userId } })
  if (!site) return c.json({ error: "Site not found" }, 404)

  // showBranding=false is a pro feature
  if (body.showBranding === false) {
    const subscription = await db.subscription.findUnique({ where: { userId } })
    if (subscription?.plan !== "pro") {
      return c.json({ error: "Removing branding requires a Pro plan" }, 403)
    }
  }

  // Strip fields that should not be updated directly
  const { id: _id, siteId: _siteId, configVersion: _cv, ...safeUpdates } = body

  const config = await db.bannerConfig.update({
    where: { siteId: id },
    data: {
      ...safeUpdates,
      configVersion: { increment: 1 }, // ← key: forces re-consent
    },
  })

  return c.json(config)
})

// DELETE /api/sites/:id
sitesRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId")
  const { id } = c.req.param()

  const site = await db.site.findFirst({ where: { id, userId } })
  if (!site) return c.json({ error: "Site not found" }, 404)

  await db.site.delete({ where: { id } })
  return c.json({ ok: true })
})

// GET /api/sites/usage — monthly event usage for the current user
sitesRoutes.get("/usage/current", async (c) => {
  const userId = c.get("userId")
  const month = getCurrentMonth()

  const [usage, subscription] = await Promise.all([
    db.monthlyEventCount.findUnique({ where: { userId_month: { userId, month } } }),
    db.subscription.findUnique({ where: { userId } }),
  ])

  const isPro = subscription?.plan === "pro"

  return c.json({
    count: usage?.count ?? 0,
    limit: isPro ? null : FREE_MONTHLY_LIMIT, // null = unlimited
    month,
    isPro,
  })
})
```

### 2. Helper: monthly event counter
Add to `api/lib/usage.ts`:
```typescript
import { db } from "./db"

const FREE_MONTHLY_LIMIT = 5_000

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7) // "YYYY-MM"
}

/**
 * Increments the monthly event counter for the user who owns siteId.
 * Returns { allowed: boolean } — false if free plan limit exceeded.
 */
export async function incrementAndCheck(siteId: string): Promise<{ allowed: boolean }> {
  // Get site owner
  const site = await db.site.findUnique({
    where: { id: siteId },
    select: { userId: true },
  })
  if (!site) return { allowed: false }

  const { userId } = site
  const month = getCurrentMonth()

  // Check plan
  const subscription = await db.subscription.findUnique({ where: { userId } })
  const isPro = subscription?.plan === "pro"

  if (isPro) {
    // Still increment for analytics, but always allow
    await upsertCount(userId, month)
    return { allowed: true }
  }

  // Free plan: check current count before incrementing
  const current = await db.monthlyEventCount.findUnique({
    where: { userId_month: { userId, month } },
  })

  if ((current?.count ?? 0) >= FREE_MONTHLY_LIMIT) {
    return { allowed: false }
  }

  await upsertCount(userId, month)
  return { allowed: true }
}

async function upsertCount(userId: string, month: string) {
  await db.monthlyEventCount.upsert({
    where: { userId_month: { userId, month } },
    update: { count: { increment: 1 } },
    create: { userId, month, count: 1 },
  })
}
```

### 3. Mount routes in `api/index.ts`
```typescript
import { sitesRoutes } from "./routes/sites"

app.route("/api/sites", sitesRoutes)
```

### 4. Test all routes
```bash
# Create a site
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -H "Cookie: [session]" \
  -d '{"domain":"example.com","name":"My Site"}'

# List sites
curl http://localhost:3000/api/sites -H "Cookie: [session]"

# Update config (note: configVersion auto-increments)
curl -X PATCH http://localhost:3000/api/sites/[ID]/config \
  -H "Content-Type: application/json" \
  -H "Cookie: [session]" \
  -d '{"title":"Custom title","primaryColor":"#3b82f6","analyticsEnabled":true,"marketingEnabled":true}'

# Check usage
curl http://localhost:3000/api/sites/usage/current -H "Cookie: [session]"

# Delete
curl -X DELETE http://localhost:3000/api/sites/[ID] -H "Cookie: [session]"
```

---

## Definition of done
- [ ] `POST /api/sites` creates a site with a default BannerConfig (no site limit on free plan)
- [ ] `GET /api/sites` returns only the current user's sites
- [ ] `PATCH /api/sites/:id/config` updates the config and increments `configVersion`
- [ ] `DELETE /api/sites/:id` removes the site (cascades to config + logs)
- [ ] `GET /api/sites/usage/current` returns monthly event count and limit
- [ ] All routes return 401 without session
- [ ] TypeScript types file created (`src/lib/types.ts`)

---

## Common issues
- **`configVersion` not incrementing:** Make sure you use `{ increment: 1 }` in the Prisma `data` object, not a hardcoded value — otherwise concurrent saves will conflict
- **Cascade delete not working:** Check `onDelete: Cascade` is set on Site → BannerConfig and Site → ConsentLog in schema.prisma
- **Usage endpoint conflicts with `:id` route:** The `/usage/current` route must be declared before `/:id` in the Hono router, otherwise `current` gets interpreted as the site ID
