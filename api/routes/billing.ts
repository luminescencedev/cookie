import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"
import { stripe } from "../lib/stripe"

const app = new Hono()

app.get("/usage", requireAuth, async (c) => {
  const userId = c.get("userId")
  const month = new Date().toISOString().slice(0, 7)
  const subscription = await db.subscription.findUnique({ where: { userId } })
  const isPro = subscription?.plan === "pro" && subscription?.status === "active"

  const record = await db.monthlyEventCount.findUnique({
    where: { userId_month: { userId, month } },
  })

  return c.json({
    count: record?.count ?? 0,
    limit: isPro ? null : 5000,
    month,
    plan: subscription?.plan ?? "free",
  })
})

app.post("/checkout", requireAuth, async (c) => {
  const userId = c.get("userId")
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return c.json({ error: "Not found" }, 404)

  let subscription = await db.subscription.findUnique({ where: { userId } })
  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
    await db.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customerId, plan: "free" },
      update: { stripeCustomerId: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard/settings?upgraded=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
  })

  return c.json({ url: session.url })
})

app.post("/portal", requireAuth, async (c) => {
  const userId = c.get("userId")
  const subscription = await db.subscription.findUnique({ where: { userId } })
  if (!subscription?.stripeCustomerId) return c.json({ error: "No subscription" }, 400)

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
  })

  return c.json({ url: session.url })
})

app.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature")!
  const body = await c.req.text()

  let event: ReturnType<typeof stripe.webhooks.constructEvent>
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return c.json({ error: "Invalid signature" }, 400)
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const customerId = session.customer as string
    const sub = await db.subscription.findUnique({ where: { stripeCustomerId: customerId } })
    if (sub) {
      await db.subscription.update({
        where: { stripeCustomerId: customerId },
        data: { plan: "pro", status: "active", stripeSubId: session.subscription as string },
      })
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const stripeSub = event.data.object
    const customerId = stripeSub.customer as string
    await db.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        plan: stripeSub.status === "active" ? "pro" : "free",
        status: stripeSub.status,
      },
    })
  }

  return c.json({ ok: true })
})

export default app
