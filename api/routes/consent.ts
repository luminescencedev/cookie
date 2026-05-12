import { Hono } from "hono"
import { db } from "../lib/db"
import { configRatelimit, consentRatelimit } from "../lib/ratelimit"
import { checkAndIncrementUsage } from "../lib/usage"

const app = new Hono()

app.get("/config/:siteId", async (c) => {
  const siteId = c.req.param("siteId")

  try {
    const { success } = await configRatelimit.limit(siteId)
    if (!success) return c.json({ error: "Rate limit exceeded" }, 429)
  } catch {
    console.warn("Upstash unreachable, skipping rate limit")
  }

  const config = await db.bannerConfig.findUnique({ where: { siteId } })
  if (!config) return c.json({ error: "Not found" }, 404)
  return c.json(config)
})

app.post("/log", async (c) => {
  const body = await c.req.json<{
    siteId: string
    choice: string
    necessary: boolean
    analytics: boolean
    marketing: boolean
    configVersion: number
  }>()

  try {
    const { success } = await consentRatelimit.limit(body.siteId)
    if (!success) return c.json({ error: "Rate limit exceeded" }, 429)
  } catch {
    console.warn("Upstash unreachable, skipping rate limit")
  }

  const site = await db.site.findUnique({ where: { id: body.siteId } })
  if (!site) return c.json({ error: "Not found" }, 404)

  const { allowed } = await checkAndIncrementUsage(site.userId)
  if (!allowed) return c.json({ error: "Monthly quota exceeded" }, 429)

  const log = await db.consentLog.create({
    data: {
      siteId: body.siteId,
      choice: body.choice,
      necessary: body.necessary,
      analytics: body.analytics,
      marketing: body.marketing,
      configVersion: body.configVersion,
      userAgent: c.req.header("user-agent"),
    },
  })
  return c.json(log, 201)
})

export default app
