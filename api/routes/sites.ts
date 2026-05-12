import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"

const app = new Hono()

app.use("/*", requireAuth)

app.get("/", async (c) => {
  const userId = c.get("userId")
  const sites = await db.site.findMany({
    where: { userId },
    include: { config: true, _count: { select: { consentLogs: true } } },
    orderBy: { createdAt: "desc" },
  })
  return c.json(sites)
})

app.post("/", async (c) => {
  const userId = c.get("userId")
  const { name, domain } = await c.req.json<{ name: string; domain: string }>()
  const site = await db.site.create({
    data: {
      userId,
      name,
      domain,
      config: { create: {} },
    },
    include: { config: true },
  })
  return c.json(site, 201)
})

app.get("/:id", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({
    where: { id: c.req.param("id"), userId },
    include: { config: true, _count: { select: { consentLogs: true } } },
  })
  if (!site) return c.json({ error: "Not found" }, 404)
  return c.json(site)
})

app.put("/:id/config", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({ where: { id: c.req.param("id"), userId } })
  if (!site) return c.json({ error: "Not found" }, 404)

  const body = await c.req.json()
  const config = await db.bannerConfig.update({
    where: { siteId: site.id },
    data: { ...body, configVersion: { increment: 1 } },
  })
  return c.json(config)
})

app.delete("/:id", async (c) => {
  const userId = c.get("userId")
  const site = await db.site.findFirst({ where: { id: c.req.param("id"), userId } })
  if (!site) return c.json({ error: "Not found" }, 404)
  await db.site.delete({ where: { id: site.id } })
  return c.json({ ok: true })
})

export default app
