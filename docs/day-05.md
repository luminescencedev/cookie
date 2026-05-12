# Day 5 — Stripe billing

## Context
Days 1–4 done. All API routes are complete: auth, sites CRUD, public consent endpoints, and analytics. Today we add Stripe so users can upgrade from free to Pro.

## Goal
By end of today, users can click "Upgrade" and be redirected to Stripe Checkout. After payment, their plan is updated to "pro" in the database via a webhook.

---

## Tasks

### 1. Set up Stripe account
- Go to stripe.com → create account
- Go to Developers → API keys → copy `sk_test_...` key to `.env`
- Go to Products → create a product "Pro Plan" → add a price of $5/month → copy the `price_...` ID to `.env`

### 2. Set up Stripe client
`api/lib/stripe.ts`:
```typescript
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})
```

Install Stripe:
```bash
pnpm add stripe@22
```
> **Stripe v17:** Use `apiVersion: '2026-04-22.dahlia'` (latest stable).

### 3. Write billing routes
`api/routes/billing.ts`:
```typescript
import { Hono } from "hono"
import { requireAuth } from "../lib/middleware"
import { db } from "../lib/db"
import { stripe } from "../lib/stripe"
import { auth } from "../lib/auth"

export const billingRoutes = new Hono<{
  Variables: { userId: string }
}>()

// POST /api/billing/checkout — create a Stripe Checkout session
billingRoutes.post("/checkout", requireAuth, async (c) => {
  const userId = c.get("userId")

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  const userEmail = session?.user?.email!

  // Get or create Stripe customer
  let subscription = await db.subscription.findUnique({ where: { userId } })

  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: userEmail })
    customerId = customer.id

    // Upsert subscription row
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
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings?canceled=true`,
  })

  return c.json({ url: checkoutSession.url })
})

// POST /api/billing/portal — customer portal to manage/cancel subscription
billingRoutes.post("/portal", requireAuth, async (c) => {
  const userId = c.get("userId")

  const subscription = await db.subscription.findUnique({ where: { userId } })
  if (!subscription?.stripeCustomerId) {
    return c.json({ error: "No active subscription" }, 404)
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/dashboard/settings`,
  })

  return c.json({ url: portalSession.url })
})

// GET /api/billing/subscription — get current user's plan
billingRoutes.get("/subscription", requireAuth, async (c) => {
  const userId = c.get("userId")

  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  })

  return c.json(subscription ?? { plan: "free", status: "active", currentPeriodEnd: null })
})

// POST /api/billing/webhook — Stripe sends events here (no auth)
billingRoutes.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature")!
  const body = await c.req.text()

  let event: Stripe.Event

  try {
    // ⚠️ Stripe v19+: use constructEventAsync (required on Edge/Workers runtimes)
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return c.json({ error: "Invalid signature" }, 400)
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subId = session.subscription as string

      await db.subscription.update({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubId: subId,
          plan: "pro",
          status: "active",
        },
      })
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      await db.subscription.update({
        where: { stripeCustomerId: customerId },
        data: {
          plan: sub.status === "active" ? "pro" : "free",
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      await db.subscription.update({
        where: { stripeCustomerId: customerId },
        data: { plan: "free", status: "canceled", stripeSubId: null },
      })
      break
    }
  }

  return c.json({ received: true })
})
```

### 4. Mount billing routes
`api/index.ts`:
```typescript
import { billingRoutes } from "./routes/billing"

app.route("/api/billing", billingRoutes)
```

### 5. Set up Stripe webhook locally
Install Stripe CLI:
```bash
# Mac
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhooks to local server:
```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/billing/webhook
```
Copy the webhook signing secret it gives you → paste into `.env` as `STRIPE_WEBHOOK_SECRET`.

### 6. Test the full flow
1. Start both servers + Stripe CLI listener
2. Call `POST /api/billing/checkout` (with session cookie)
3. Copy the `url` from response → open in browser
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
5. After payment, check Stripe CLI terminal — should show `checkout.session.completed`
6. Check database — `subscription` row should have `plan: "pro"`

### 7. Enable customer portal in Stripe
Go to Stripe Dashboard → Settings → Billing → Customer portal → Activate.
This allows users to cancel or change their plan themselves.

---

## Definition of done
- [ ] `POST /api/billing/checkout` returns a Stripe Checkout URL
- [ ] After test payment, `subscription.plan` in DB is updated to "pro"
- [ ] `GET /api/billing/subscription` returns correct plan
- [ ] `POST /api/billing/portal` returns a Stripe portal URL
- [ ] Canceling via portal sets plan back to "free" via webhook
- [ ] Webhook returns 400 for invalid Stripe signature

---

## Common issues
- **Webhook signature fails:** Make sure you pass `c.req.text()` (raw body string) to `constructEventAsync`, not parsed JSON. Note: `constructEvent` (sync) throws on Edge/Workers runtimes — always use `constructEventAsync` with Stripe v19+
- **Customer portal 400:** You need to activate the portal in Stripe Dashboard first (Settings → Billing → Customer portal)
- **Price ID not found:** Double check the `STRIPE_PRO_PRICE_ID` — it should start with `price_` not `prod_`
