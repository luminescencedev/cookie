# Day 13 — Landing page

## Context
Days 1–12 done. Full product is working. Today we build the public landing page that convinces visitors to sign up.

## Goal
By end of today, the landing page communicates the value prop clearly, shows a live banner preview, lists pricing, and has a clear CTA to sign up.

---

## Tasks

### 1. Build the landing page
`src/pages/Landing.tsx`:
```tsx
import { Link } from "react-router"
import { useState } from "react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <header className="border-b border-neutral-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-semibold text-neutral-900 text-sm">CookieConsent</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-neutral-900 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-neutral-700 transition font-medium"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
      <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs px-3 py-1.5 rounded-full mb-6">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        GDPR compliant · Free to start
      </div>

      <h1 className="text-5xl font-semibold text-neutral-900 leading-tight mb-4 tracking-tight">
        Cookie consent
        <br />
        <span className="text-neutral-400">without the headache</span>
      </h1>

      <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10">
        Add one script tag. Get a beautiful, GDPR-compliant consent banner on your site in under 2 minutes. No cookie law expertise required.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          to="/signup"
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-700 transition"
        >
          Start for free
        </Link>
        <a
          href="#how-it-works"
          className="text-sm text-neutral-500 hover:text-neutral-700 transition"
        >
          How it works →
        </a>
      </div>

      {/* Live preview */}
      <div className="mt-16 max-w-2xl mx-auto">
        <p className="text-xs text-neutral-400 uppercase tracking-wide mb-4">Live preview</p>
        <LivePreview />
      </div>
    </section>
  )
}

function LivePreview() {
  const [accepted, setAccepted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return (
      <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50 h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-900 mb-1">
            {accepted ? "✓ Consent accepted" : "✗ Consent rejected"}
          </p>
          <p className="text-xs text-neutral-400 mb-4">Banner dismissed — won't show again</p>
          <button
            onClick={() => { setDismissed(false); setAccepted(false) }}
            className="text-xs text-neutral-500 underline"
          >
            Reset preview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-neutral-100 rounded-2xl overflow-hidden">
      {/* Fake browser */}
      <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 bg-white rounded h-5 border border-neutral-200 mx-2 px-2 flex items-center">
          <span className="text-xs text-neutral-400">yoursite.com</span>
        </div>
      </div>

      {/* Page content */}
      <div className="bg-white p-6 space-y-3 min-h-32">
        <div className="h-3 bg-neutral-100 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>

      {/* Banner */}
      <div className="bg-neutral-900 text-white px-6 py-5">
        <p className="font-semibold text-sm mb-1">We use cookies</p>
        <p className="text-xs opacity-70 mb-4">
          We use cookies to improve your browsing experience and analyze our traffic.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => { setAccepted(true); setDismissed(true) }}
            className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-xs font-medium hover:bg-neutral-100 transition"
          >
            Accept all
          </button>
          <button
            onClick={() => { setAccepted(false); setDismissed(true) }}
            className="border border-white/30 text-white px-4 py-2 rounded-lg text-xs hover:bg-white/10 transition"
          >
            Reject all
          </button>
        </div>
        <p className="text-xs opacity-30 mt-3">Powered by CookieConsent</p>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign up free",
      description: "Create your account in seconds. No credit card required.",
    },
    {
      number: "02",
      title: "Add your site",
      description: "Enter your domain and customize your banner — text, colors, position.",
    },
    {
      number: "03",
      title: "Paste one line",
      description: "Copy the script tag and paste it into your website's <head>. Done.",
    },
  ]

  return (
    <section id="how-it-works" className="bg-neutral-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-12">
          Up and running in 2 minutes
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="bg-white rounded-2xl border border-neutral-100 p-6">
              <p className="text-xs font-mono text-neutral-300 mb-3">{step.number}</p>
              <p className="text-sm font-semibold text-neutral-900 mb-2">{step.title}</p>
              <p className="text-sm text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-semibold text-neutral-900 text-center mb-2">
          Simple pricing
        </h2>
        <p className="text-neutral-400 text-center mb-12">
          Start free. Upgrade when you need more.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <PricingCard
            plan="Free"
            price="€0"
            period="forever"
            features={[
              "1 website",
              "Unlimited consent events",
              "30-day log history",
              "Basic analytics",
            ]}
            cta="Get started"
            ctaLink="/signup"
            muted
          />
          <PricingCard
            plan="Pro"
            price="€5"
            period="per month"
            features={[
              "Unlimited websites",
              "Remove branding",
              "Full consent log export",
              "Priority support",
            ]}
            cta="Upgrade to Pro"
            ctaLink="/signup"
          />
        </div>
      </div>
    </section>
  )
}

function PricingCard({
  plan,
  price,
  period,
  features,
  cta,
  ctaLink,
  muted,
}: {
  plan: string
  price: string
  period: string
  features: string[]
  cta: string
  ctaLink: string
  muted?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-7 ${
        muted ? "border-neutral-100 bg-neutral-50" : "border-neutral-900 bg-white"
      }`}
    >
      <p className="text-sm font-medium text-neutral-900 mb-1">{plan}</p>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-semibold text-neutral-900">{price}</span>
        <span className="text-sm text-neutral-400">{period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="text-neutral-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        to={ctaLink}
        className={`block text-center text-sm font-medium px-4 py-2.5 rounded-xl transition ${
          muted
            ? "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            : "bg-neutral-900 text-white hover:bg-neutral-700"
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-neutral-100 py-8">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} CookieConsent. GDPR compliant by design.
        </p>
        <div className="flex gap-4">
          <Link to="/login" className="text-xs text-neutral-400 hover:text-neutral-600">
            Sign in
          </Link>
          <Link to="/signup" className="text-xs text-neutral-400 hover:text-neutral-600">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  )
}
```

---

## Definition of done
- [ ] Landing page renders at `/`
- [ ] Hero has clear headline, subheadline, and CTA buttons
- [ ] Live preview banner is interactive (accept/reject works)
- [ ] "How it works" section shows 3 steps
- [ ] Pricing section shows Free vs Pro cards
- [ ] All links navigate correctly (sign in, sign up)
- [ ] Page looks good on standard desktop width
- [ ] No TypeScript errors

---

## Notes
- Keep it simple — this is v1, the goal is launched not perfect
- The interactive banner preview in the hero is a strong conversion element — it shows the product before signing up
- You can iterate on design after launch. Ship first.
