import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"
import { getCurrentMonth } from "../lib/usage"

const FREE_MONTHLY_LIMIT = 5_000

export const sitesRoutes = new Hono<{ Variables: { userId: string } }>()

sitesRoutes.use("*", requireAuth)

sitesRoutes.get("/", async (c) => {
  const userId = c.get("userId")
  const sites = await db.site.findMany({
    where: { userId },
    include: { config: true, _count: { select: { consentLogs: true } } },
    orderBy: { createdAt: "desc" },
  })
  return c.json(sites)
})

// Must be declared before /:id to avoid "current" being treated as an id
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
    limit: isPro ? null : FREE_MONTHLY_LIMIT,
    month,
    isPro,
  })
})

sitesRoutes.get("/:id", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({
    where: { id: c.req.param("id"), userId },
    include: { config: true, _count: { select: { consentLogs: true } } },
  })
  if (!site) return c.json({ error: "Site not found" }, 404)
  return c.json(site)
})

sitesRoutes.post("/", async (c) => {
  const userId = c.get("userId")
  const body = await c.req.json<{ domain: string; name: string }>()
  const { domain, name } = body

  if (!domain || !name) return c.json({ error: "domain and name are required" }, 400)

  const site = await db.site.create({
    data: {
      userId,
      domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      name,
      config: { create: {} },
    },
    include: { config: true },
  })
  return c.json(site, 201)
})

sitesRoutes.patch("/:id/config", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({ where: { id: c.req.param("id"), userId } })
  if (!site) return c.json({ error: "Site not found" }, 404)

  const body = await c.req.json()

  if (body.showBranding === false) {
    const subscription = await db.subscription.findUnique({ where: { userId } })
    if (subscription?.plan !== "pro") {
      return c.json({ error: "Removing branding requires a Pro plan" }, 403)
    }
  }

  const { id: _id, siteId: _siteId, configVersion: _cv, ...safeUpdates } = body

  const config = await db.bannerConfig.update({
    where: { siteId: site.id },
    data: { ...safeUpdates, configVersion: { increment: 1 } },
  })
  return c.json(config)
})

sitesRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({ where: { id: c.req.param("id"), userId } })
  if (!site) return c.json({ error: "Site not found" }, 404)
  await db.site.delete({ where: { id: site.id } })
  return c.json({ ok: true })
})
