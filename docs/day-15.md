# Day 15 — Deploy to Vercel (production)

## Context
Days 1–14 done. The full product is built and polished. Today we deploy everything to production on Vercel, configure all environment variables including Upstash, and do a final end-to-end test.

## Goal
By end of today, the app is live on a real domain, the snippet is served from production, and a real user can sign up, add a site, and get a working consent banner with full category support.

---

## Tasks

### 1. Create a Vercel account and project
1. Go to vercel.com → create account
2. Connect GitHub → push your repo
3. Vercel → New Project → import repo
4. Framework: Vite
5. Build command: `pnpm build`
6. Output directory: `dist`

### 2. Tell Vercel to use pnpm
Already done in Day 1 — confirm `package.json` has:
```json
{
  "engines": { "node": ">=20", "pnpm": ">=8" },
  "packageManager": "pnpm@9.0.0"
}
```
Commit `pnpm-lock.yaml` to the repo — Vercel detects pnpm from it.

### 3. Confirm `vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4. Create Upstash Redis for production
1. Go to upstash.com → create account → New Database
2. Name: `cookieconsent-prod`
3. Region: pick closest to your Supabase region
4. Type: Regional (default)
5. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 5. Set all environment variables in Vercel
Vercel → your project → Settings → Environment Variables:

```
DATABASE_URL              [Supabase pooled URL]
DIRECT_URL                [Supabase direct URL]
BETTER_AUTH_SECRET        [same as local or generate new]
BETTER_AUTH_URL           https://yourdomain.vercel.app
STRIPE_SECRET_KEY         sk_live_... (or sk_test_ for now)
STRIPE_WEBHOOK_SECRET     [new webhook secret — see step 6]
STRIPE_PRO_PRICE_ID       price_...
FRONTEND_URL              https://yourdomain.vercel.app
VITE_API_URL              https://yourdomain.vercel.app
UPSTASH_REDIS_REST_URL    https://...upstash.io
UPSTASH_REDIS_REST_TOKEN  [token from Upstash dashboard]
```

> `VITE_API_URL` is baked into the frontend build and the snippet — it must match your real production domain.

### 6. Set up Stripe production webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourdomain.vercel.app/api/billing/webhook`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret → paste as `STRIPE_WEBHOOK_SECRET`

### 7. Rebuild snippet for production
The snippet has the API URL baked in at build time:
```bash
VITE_API_URL=https://yourdomain.vercel.app pnpm build:snippet
git add public/banner.js
git commit -m "build snippet for production"
git push
```

Or add to the Vercel build command so it rebuilds automatically:
```json
{
  "buildCommand": "VITE_API_URL=$VITE_API_URL pnpm build:snippet && tsc && vite build"
}
```

### 8. Configure Supabase for production
1. Supabase → Settings → Database → Connection pooling → confirm pooled URL
2. Supabase → Auth → URL Configuration → add your Vercel domain to allowed origins

### 9. Run Prisma migrations on production
```bash
DATABASE_URL="your-production-url" pnpm db:push
```

### 10. Deploy
```bash
git add .
git commit -m "ready for production"
git push
```
Watch the build logs in Vercel.

### 11. Production checklist

**Auth:**
- [ ] Sign up with a real email
- [ ] Sign in / sign out
- [ ] `/dashboard` without auth → redirected to `/login`

**Sites:**
- [ ] Create a site
- [ ] Update banner config → save → configVersion increments
- [ ] Privacy policy URL saves and shows in embed preview

**Snippet:**
- [ ] Copy embed code → paste into a real test page (CodePen, GitHub Pages)
- [ ] Banner appears with language matching browser
- [ ] "Customize" shows category toggles
- [ ] Accept all → ConsentLog has `analytics: true`, `marketing: true`
- [ ] Partial (analytics only) → ConsentLog has `analytics: true`, `marketing: false`
- [ ] Reload → banner does NOT appear (localStorage consent with matching version)
- [ ] Update config from dashboard → save → reload test page → banner reappears

**Analytics:**
- [ ] After several consents, analytics page shows category rates
- [ ] Chart shows accepted/partial/rejected bars

**Rate limiting:**
- [ ] 200+ rapid requests from same siteId → 429 returned
- [ ] Normal usage → never 429

**Billing:**
- [ ] Upgrade to Pro → Stripe Checkout works
- [ ] Usage meter shows "Unlimited" on Pro
- [ ] Portal opens and manage works

**GDPR compliance check:**
- [ ] Banner shows necessary/analytics/marketing categories
- [ ] Privacy policy link is visible
- [ ] Rejecting all sets analytics and marketing to false in the log
- [ ] Re-consent triggers when config changes

### 12. Set up your subdomain (optional)
If you own a domain (e.g. `carabine.studio`):
1. DNS → add `CNAME`: name=`cookie`, value=`cname.vercel-dns.com`
2. Vercel → Settings → Domains → add `cookie.carabine.studio`
3. Update all env vars to `https://cookie.carabine.studio`
4. Update Stripe webhook URL
5. Rebuild snippet and redeploy

### 13. Announce your launch

**Pitch:**
> "I built a GDPR cookie consent tool with real category granularity (necessary/analytics/marketing). Cookiebot charges €14/mo for the same. Mine is €5. One script tag, 2 minutes to add."

**Where:**
- Product Hunt (Tuesday/Wednesday 12:01am PST)
- Reddit: r/webdev, r/SaaS, r/gdpr, r/Entrepreneur
- Indie Hackers: Show IH thread
- Hacker News: "Show HN"
- X / Twitter

---

## Definition of done
- [ ] App live on vercel.app domain
- [ ] Full consent flow works end-to-end with categories
- [ ] Consent invalidation works (configVersion bump triggers re-banner)
- [ ] Upstash rate limiting active in production
- [ ] Stripe webhook registered and working
- [ ] `public/banner.js` built with production URL
- [ ] HTTPS everywhere
- [ ] No console errors in production
