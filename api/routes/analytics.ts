import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"

const app = new Hono()

app.use("/*", requireAuth)

app.get("/:siteId", async (c) => {
  const userId = c.get("userId")
  const siteId = c.req.param("siteId")

  const site = await db.site.findFirst({ where: { id: siteId, userId } })
  if (!site) return c.json({ error: "Not found" }, 404)

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const logs = await db.consentLog.findMany({
    where: { siteId, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  })

  const total = logs.length
  const accepted = logs.filter((l) => l.choice === "accepted").length
  const rejected = logs.filter((l) => l.choice === "rejected").length
  const partial = logs.filter((l) => l.choice === "partial").length
  const analyticsRate = total ? logs.filter((l) => l.analytics).length / total : 0
  const marketingRate = total ? logs.filter((l) => l.marketing).length / total : 0

  return c.json({ total, accepted, rejected, partial, analyticsRate, marketingRate, logs: logs.slice(-50) })
})

export default app
