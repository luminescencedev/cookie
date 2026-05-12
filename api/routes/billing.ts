import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"
import { stripe } from "../lib/stripe"
import { auth } from "../lib/auth"
import Stripe from "stripe"

export const billingRoutes = new Hono<{ Variables: { userId: string } }>()

billingRoutes.get("/subscription", requireAuth, async (c) => {
  const userId = c.get("userId")
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  })
  return c.json(subscription ?? { plan: "free", status: "active", currentPeriodEnd: null })
})

billingRoutes.post("/checkout", requireAuth, async (c) => {
  const userId = c.get("userId")

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  const userEmail = session!.user.email

  let subscription = await db.subscription.findUnique({ where: { userId } })
  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail })
    customerId = customer.id
    await db.subscription.upsert({
      where: { userId },
      update: { stripeCustomerId: customerId },
      create: { userId, stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings?canceled=true`,
  })

  return c.json({ url: checkoutSession.url })
})

billingRoutes.post("/portal", requireAuth, async (c) => {
  const userId = c.get("userId")
  const subscription = await db.subscription.findUnique({ where: { userId } })
  if (!subscription?.stripeCustomerId) return c.json({ error: "No active subscription" }, 404)

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
  })

  return c.json({ url: portalSession.url })
})

billingRoutes.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature")!
  const body = await c.req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return c.json({ error: "Invalid signature" }, 400)
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session
      await db.subscription.update({
        where: { stripeCustomerId: s.customer as string },
        data: { stripeSubId: s.subscription as string, plan: "pro", status: "active" },
      })
      break
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      await db.subscription.update({
        where: { stripeCustomerId: sub.customer as string },
        data: {
          plan: sub.status === "active" ? "pro" : "free",
          status: sub.status,
        },
      })
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await db.subscription.update({
        where: { stripeCustomerId: sub.customer as string },
        data: { plan: "free", status: "canceled", stripeSubId: null },
      })
      break
    }
  }

  return c.json({ received: true })
})
