# Project context — read this before every day

## What we're building
A SaaS cookie consent banner tool. Users sign up, add their website, customize a banner with **granular consent categories**, get a `<script>` tag to paste into their site. The banner auto-detects existing cookies, shows a GDPR-compliant consent prompt with **necessary / analytics / marketing** categories, and logs choices. Dashboard shows consent analytics with category breakdown.

## Full stack
| Layer | Choice |
|---|---|
| Frontend | Vite 8 + React 19 + TypeScript 5 + Tailwind CSS v4 |
| Auth | Better Auth |
| Backend API | Hono v4 (Vercel Edge Functions) |
| ORM | Prisma v7 + @prisma/adapter-pg |
| Database | Supabase Postgres |
| Payments | Stripe |
| Rate limiting | Upstash Redis |
| Hosting | Vercel |

## Folder structure
```
cookieconsent/
├── src/
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── dashboard/
│   │       ├── Index.tsx
│   │       ├── Sites.tsx
│   │       ├── SiteDetail.tsx
│   │       └── Settings.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── auth-client.ts
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/
│   ├── index.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── stripe.ts
│   │   └── ratelimit.ts        ← NEW
│   └── routes/
│       ├── auth.ts
│       ├── sites.ts
│       ├── consent.ts
│       ├── analytics.ts
│       └── billing.ts
├── prisma/
│   └── schema.prisma
├── snippet/
│   └── banner.ts
├── public/
│   └── banner.js
├── .env.example
├── vercel.json
└── package.json
```

## Prisma schema (reference)
> **Prisma v7:** Generator is `prisma-client`, output goes to `../generated/client`. URL config is in `prisma.config.ts`, not schema.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/client"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  sessions          Session[]
  accounts          Account[]
  sites             Site[]
  subscription      Subscription?
  monthlyEventCount MonthlyEventCount[]
}

model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model Site {
  id        String   @id @default(cuid())
  userId    String
  domain    String
  name      String
  createdAt DateTime @default(now())
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  config      BannerConfig?
  consentLogs ConsentLog[]
}

model BannerConfig {
  id            String  @id @default(cuid())
  siteId        String  @unique
  configVersion Int     @default(1)   // incremented on every save → forces re-consent

  // Language
  language      String  @default("auto") // "auto" | "en" | "fr" | "de" | "es" | "it"

  // Content
  title           String  @default("We use cookies")
  description     String  @default("This site uses cookies to improve your experience.")
  acceptLabel     String  @default("Accept all")
  rejectLabel     String  @default("Reject all")
  privacyPolicyUrl String? // shown as a link in the banner

  // Categories
  analyticsEnabled Boolean @default(true)  // show analytics toggle
  marketingEnabled Boolean @default(true)  // show marketing toggle

  // Appearance
  position        String  @default("bottom") // "bottom" | "modal"
  primaryColor    String  @default("#000000")
  backgroundColor String  @default("#ffffff")
  showBranding    Boolean @default(true)

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
}

model ConsentLog {
  id            String   @id @default(cuid())
  siteId        String
  choice        String   // "accepted" | "rejected" | "partial"
  necessary     Boolean  @default(true)
  analytics     Boolean  @default(false)
  marketing     Boolean  @default(false)
  configVersion Int      @default(1)   // which config version was shown
  userAgent     String?
  country       String?
  createdAt     DateTime @default(now())
  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@index([siteId, createdAt])
}

// Tracks monthly consent events per user for free plan enforcement
model MonthlyEventCount {
  id     String @id @default(cuid())
  userId String
  month  String // "YYYY-MM"
  count  Int    @default(0)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, month])
}

model Subscription {
  id               String    @id @default(cuid())
  userId           String    @unique
  stripeCustomerId String?   @unique
  stripeSubId      String?   @unique
  plan             String    @default("free")
  status           String    @default("active")
  currentPeriodEnd DateTime?
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Plans
- **Free:** unlimited sites, **5 000 consent events/month**, branding shown, 30-day log history
- **Pro (€5/mo):** **unlimited events**, remove branding, full consent log export (CSV), priority support

> Free plan is now event-based (not site-based), which is much harder to game and aligns with how competitors monetize.

## Environment variables
```
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

## GDPR design decisions
- **Consent categories**: necessary (always on), analytics (opt-in), marketing (opt-in)
- **Consent invalidation**: `configVersion` is incremented on every config save. The snippet stores the version with the consent — if they don't match, the banner re-appears
- **Cookie scanning**: The snippet scans `document.cookie` on load and highlights which categories of cookies it detects, using a known-cookie pattern database
- **Multi-language**: Banner language follows `navigator.language` by default ("auto"), or can be forced per site. Supported: en, fr, de, es, it
- **Privacy policy link**: Required field shown in the banner footer
- **Rate limiting**: Upstash Redis sliding window — survives Vercel cold starts
