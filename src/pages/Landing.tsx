import { Link } from "react-router"
import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"
import LocomotiveScroll from "locomotive-scroll"
import {
  RiShieldCheckLine,
  RiCheckLine,
  RiArrowRightLine,
  RiCodeLine,
  RiBarChartLine,
  RiGlobalLine,
  RiTimeLine,
  RiLockLine,
  RiArrowRightUpLine,
} from "react-icons/ri"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

function ScrollReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  useEffect(() => {
    const scroll = new LocomotiveScroll()
    return () => scroll.destroy()
  }, [])

  return (
    <div className="bg-white text-neutral-900 overflow-x-hidden">
      <Nav />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

/* ─── Navigation ──────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-250 ${
        scrolled
          ? "border-b border-neutral-200 bg-white/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between max-w-5xl mx-auto h-14">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <RiShieldCheckLine size={13} />
          </div>
          <span className="text-sm font-semibold text-neutral-800 tracking-tight">CookieConsent</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors px-3.5 py-1.5 rounded-lg no-underline"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-black transition-colors no-underline"
          >
            Get started <RiArrowRightLine size={13} />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

/* ─── Hero ────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.05 }}
            className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-full px-3.5 py-1 mb-7"
          >
            <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-xs font-medium text-neutral-500">GDPR · ePrivacy · Free to start</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] mb-5 text-neutral-900"
          >
            Cookie consent,<br />done right.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.18 }}
            className="text-base leading-[1.7] text-neutral-500 mb-9 max-w-lg"
          >
            One script tag. A beautiful, legally-sound consent banner live in under 2 minutes.
            65% cheaper than Cookiebot — free to start, no card required.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.25 }}
            className="flex items-center gap-4 mb-16"
          >
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 bg-neutral-900 text-white font-medium text-[0.9375rem] px-5 py-2.5 rounded-xl hover:bg-black transition-colors no-underline"
            >
              Start for free <RiArrowRightLine size={14} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-800 transition-colors no-underline"
            >
              See how it works <RiArrowRightLine size={13} />
            </a>
          </motion.div>
        </div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
        >
          <HeroBrowserMockup />
        </motion.div>
      </div>
    </section>
  )
}

function HeroBrowserMockup() {
  const [dismissed, setDismissed] = useState(false)
  const [accepted, setAccepted]   = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 max-w-2xl shadow-[0_4px_40px_rgba(0,0,0,0.07)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-neutral-300" />
          <div className="size-2.5 rounded-full bg-neutral-300" />
          <div className="size-2.5 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 bg-white border border-neutral-200 rounded h-5 mx-3 px-2.5 flex items-center">
          <span className="text-[11px] text-neutral-400">yoursite.com</span>
        </div>
      </div>

      {/* Page skeleton */}
      <div className="p-5 flex flex-col gap-2 bg-white">
        <div className="h-2.5 rounded-md bg-neutral-100 w-[68%]" />
        <div className="h-2.5 rounded-md bg-neutral-100 w-[47%]" />
        <div className="h-2.5 rounded-md bg-neutral-100 w-[58%]" />
      </div>

      {/* Banner */}
      {dismissed ? (
        <div className="p-4 text-center bg-neutral-50 border-t border-neutral-200">
          <p className={`text-sm font-medium mb-1.5 ${accepted ? "text-green-600" : "text-neutral-400"}`}>
            {accepted ? "✓ Consent saved" : "Rejected"}
          </p>
          <button
            onClick={() => { setDismissed(false); setAccepted(false) }}
            className="text-xs text-neutral-400 underline bg-transparent border-0 cursor-pointer"
          >
            Reset preview
          </button>
        </div>
      ) : (
        <div className="px-5 py-4 bg-white border-t border-neutral-200">
          <p className="text-sm font-semibold text-neutral-900 mb-1">We use cookies</p>
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            We use cookies to improve your experience and analyze traffic.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setAccepted(true); setDismissed(true) }}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium border-0 cursor-pointer hover:bg-black transition-colors"
            >
              Accept all
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3.5 py-1.5 rounded-lg bg-transparent text-neutral-500 text-xs border border-neutral-200 cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              Reject all
            </button>
            <button className="px-2.5 py-1.5 bg-transparent border-0 text-xs text-neutral-400 cursor-pointer flex items-center gap-1">
              Customize <RiArrowRightLine size={11} />
            </button>
          </div>
          <p className="text-[10px] text-neutral-300 mt-2.5">Powered by CookieConsent</p>
        </div>
      )}
    </div>
  )
}

/* ─── Logo bar ────────────────────────────────────────────── */

function LogoBar() {
  const ref     = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const names   = ["Stripe", "Vercel", "Supabase", "Next.js", "Shopify", "Linear", "Prisma"]

  return (
    <div ref={ref} className="border-t border-b border-neutral-200 py-8 px-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
        className="text-center text-xs tracking-widest uppercase text-neutral-300 mb-5"
      >
        Trusted by developers building on
      </motion.p>
      <div className="flex items-center justify-center gap-9 flex-wrap">
        {names.map((name, i) => (
          <motion.span
            key={name}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="font-medium text-sm text-neutral-300"
          >
            {name}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/* ─── How it works ────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { n: "01", icon: RiGlobalLine,    title: "Sign up in seconds",    desc: "Create your account for free. No credit card, no setup fees." },
    { n: "02", icon: RiBarChartLine,  title: "Configure your banner", desc: "Set language, customize copy, colors, consent categories." },
    { n: "03", icon: RiCodeLine,      title: "Paste & go live",        desc: "One line of HTML in your <head>. Your site is compliant instantly." },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2.5">
              Simple process
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-neutral-900 tracking-tight">
              Up and running in 2 minutes
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-3">
          {steps.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 0.08} className="h-full">
              <div className="rounded-2xl border border-neutral-200 bg-white p-7 h-full">
                <p className="text-xs font-mono text-neutral-300 mb-5">{step.n}</p>
                <div className="size-9 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-4">
                  <step.icon size={17} />
                </div>
                <p className="text-[0.9375rem] font-semibold text-neutral-900 mb-2 tracking-tight">{step.title}</p>
                <p className="text-sm leading-relaxed text-neutral-500">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ────────────────────────────────────────────── */

function Features() {
  const features = [
    { icon: RiShieldCheckLine, title: "Legally solid",       desc: "Granular consent categories, version-based re-consent, full audit log — built for GDPR and ePrivacy." },
    { icon: RiTimeLine,        title: "2-minute setup",      desc: "No SDK. No config file. One script tag and you're done." },
    { icon: RiGlobalLine,      title: "Multi-language",      desc: "Auto-detects the visitor's browser language. EN, FR, DE, ES, IT out of the box." },
    { icon: RiBarChartLine,    title: "Consent analytics",   desc: "Track accept rates, category consent splits, and daily trends — all from the dashboard." },
    { icon: RiLockLine,        title: "Privacy by design",   desc: "No third-party cookies. Consent data stays in your own database." },
    { icon: RiCodeLine,        title: "Fair pricing",        desc: "Free forever for small sites. Unlimited at €5/mo — 65% less than Cookiebot." },
  ]

  return (
    <section className="py-24 px-6 bg-neutral-50 border-t border-b border-neutral-200">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2.5">
              Everything included
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-neutral-900 tracking-tight">
              Not just a banner
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-3">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.05} className="h-full">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 h-full">
                <div className="size-8 rounded-lg bg-white border border-neutral-200 text-neutral-400 flex items-center justify-center mb-3.5">
                  <f.icon size={15} />
                </div>
                <p className="text-[0.9375rem] font-semibold text-neutral-900 mb-1.5 tracking-tight">{f.title}</p>
                <p className="text-sm leading-relaxed text-neutral-500">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─────────────────────────────────────────────── */

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="mb-12">
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2.5">
              Pricing
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-neutral-900 tracking-tight mb-2">
              No gimmicks. No lock-in.
            </h2>
            <p className="text-[0.9375rem] text-neutral-500">Start free. Upgrade only when you need to.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 max-w-2xl rounded-2xl overflow-hidden border border-neutral-200">
          {/* Free */}
          <ScrollReveal className="h-full">
            <div className="bg-white p-8 h-full border-r border-neutral-200">
              <p className="text-sm font-medium text-neutral-400 mb-2">Free</p>
              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-semibold text-neutral-900 leading-none tracking-tight">€0</span>
                <span className="text-sm text-neutral-400">/ forever</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {["1 website", "5 000 events / month", "30-day log history", "Basic analytics"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-500">
                    <span className="size-1.5 rounded-full bg-neutral-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block text-center py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors no-underline"
              >
                Get started
              </Link>
            </div>
          </ScrollReveal>

          {/* Pro */}
          <ScrollReveal delay={0.06} className="h-full">
            <div className="bg-neutral-900 p-8 h-full">
              <p className="text-sm font-medium text-white/60 mb-2">Pro</p>
              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-semibold text-white leading-none tracking-tight">€5</span>
                <span className="text-sm text-white/50">/ month</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {["Unlimited websites", "Unlimited events", "Remove branding", "Full CSV export", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                    <RiCheckLine size={13} className="text-white shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block text-center py-2 rounded-xl bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-100 transition-colors no-underline"
              >
                Upgrade to Pro
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1}>
          <p className="text-xs text-neutral-400 mt-4">
            65% cheaper than Cookiebot. No contracts. Cancel anytime.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─── CTA ─────────────────────────────────────────────────── */

function CTA() {
  return (
    <section className="py-24 px-6 border-t border-b border-neutral-200 bg-neutral-50">
      <div className="max-w-lg mx-auto">
        <ScrollReveal>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-neutral-900 tracking-tight mb-3">
            Your site, compliant in minutes.
          </h2>
          <p className="text-[0.9375rem] leading-[1.7] text-neutral-500 mb-8">
            No credit card. No vendor lock-in. Just a consent banner that earns trust and satisfies regulators.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white font-medium text-[0.9375rem] px-5 py-2.5 rounded-xl hover:bg-black transition-colors no-underline"
          >
            Start for free <RiArrowRightUpLine size={14} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="px-6 py-6 bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-5 rounded-md bg-neutral-900 text-white flex items-center justify-center">
            <RiShieldCheckLine size={11} />
          </div>
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} CookieConsent
          </p>
        </div>
        <div className="flex gap-5">
          {[{ to: "/login", label: "Sign in" }, { to: "/signup", label: "Sign up" }].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
