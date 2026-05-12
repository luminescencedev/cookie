import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"

export const analyticsRoutes = new Hono<{ Variables: { userId: string } }>()

analyticsRoutes.use("*", requireAuth)

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

  const recentLogs = await db.consentLog.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, choice: true, necessary: true, analytics: true, marketing: true, configVersion: true, createdAt: true, userAgent: true },
  })

  return c.json({ total, accepted, rejected, partial, acceptRate, analyticsConsented, marketingConsented, analyticsRate, marketingRate, dailyData, recentLogs })
})

analyticsRoutes.get("/:siteId/export", async (c) => {
  const userId = c.get("userId")
  const { siteId } = c.req.param()

  const [site, subscription] = await Promise.all([
    db.site.findFirst({ where: { id: siteId, userId } }),
    db.subscription.findUnique({ where: { userId } }),
  ])

  if (!site) return c.json({ error: "Site not found" }, 404)
  if (subscription?.plan !== "pro") return c.json({ error: "Export requires a Pro plan" }, 403)

  const logs = await db.consentLog.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    select: { id: true, choice: true, necessary: true, analytics: true, marketing: true, configVersion: true, createdAt: true, userAgent: true, country: true },
  })

  const csv = [
    "id,choice,necessary,analytics,marketing,configVersion,date,userAgent,country",
    ...logs.map((l) =>
      [l.id, l.choice, l.necessary, l.analytics, l.marketing, l.configVersion, l.createdAt.toISOString(), `"${(l.userAgent ?? "").replace(/"/g, "'")}"`, l.country ?? ""].join(",")
    ),
  ].join("\n")

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="consent-export-${siteId}.csv"`,
    },
  })
})
