import { Hono } from "hono"
import { db } from "../lib/db"
import { configRatelimit, consentRatelimit } from "../lib/ratelimit"
import { incrementAndCheck } from "../lib/usage"

export const consentRoutes = new Hono()

consentRoutes.get("/config/:siteId", async (c) => {
  const { siteId } = c.req.param()

  try {
    const { success } = await configRatelimit.limit(siteId)
    if (!success) return c.json({ error: "Too many requests" }, 429)
  } catch {
    // fail open — don't break the banner
  }

  const config = await db.bannerConfig.findUnique({ where: { siteId } })
  if (!config) return c.json({ error: "Site not found" }, 404)

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

consentRoutes.post("/log", async (c) => {
  const body = await c.req.json()
  const { siteId, choice, necessary, analytics, marketing, configVersion } = body

  if (!siteId || !["accepted", "rejected", "partial"].includes(choice)) {
    return c.json({ error: "Invalid payload" }, 400)
  }

  try {
    const { success } = await consentRatelimit.limit(siteId)
    if (!success) return c.json({ error: "Rate limit exceeded" }, 429)
  } catch {
    // fail open
  }

  const { allowed } = await incrementAndCheck(siteId)
  if (!allowed) {
    // return 200 — not the visitor's fault the site owner hit their limit
    return c.json({ ok: true, stored: false })
  }

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
