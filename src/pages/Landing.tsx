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
  RiVipCrownLine,
  RiArrowRightUpLine,
  RiSparklingLine,
} from "react-icons/ri"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.6, ease, delay }}
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
    <div style={{ background: "var(--bg)", color: "var(--text)", overflowX: "hidden" }}>
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

/* ─── Navigation ─────────────────────────────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "12px 24px", display: "flex", justifyContent: "center" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1024px",
          padding: "0 20px",
          height: "52px",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: scrolled ? "rgba(14,14,22,0.9)" : "rgba(14,14,22,0.6)",
          transition: "background 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiShieldCheckLine size={14} />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>
            CookieConsent
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/login" style={{ fontSize: "0.875rem", color: "var(--muted)", textDecoration: "none" }}>
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/signup"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "0.875rem", fontWeight: 600, padding: "8px 16px",
                borderRadius: "10px", background: "var(--accent)", color: "var(--bg)",
                textDecoration: "none",
              }}
            >
              Get started free <RiArrowRightLine size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */

function Hero() {
  return (
    <section style={{ position: "relative", paddingTop: "140px", paddingBottom: "100px", paddingLeft: "24px", paddingRight: "24px", overflow: "hidden" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 50% -5%, rgba(45,212,191,0.13) 0%, transparent 65%)",
      }} />
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(238,238,242,1) 1px, transparent 1px), linear-gradient(90deg, rgba(238,238,242,1) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "var(--accent-dim)", border: "1px solid rgba(45,212,191,0.25)",
            borderRadius: "100px", padding: "6px 16px", marginBottom: "28px",
            fontSize: "0.75rem", fontWeight: 500, color: "var(--accent)",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
          GDPR compliant · Free to start · No expertise needed
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.12 }}
          style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
            fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em",
            marginBottom: "20px", color: "var(--text)",
          }}
        >
          Cookie consent,{" "}
          <span style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #60a5fa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            done right.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          style={{ fontSize: "1.125rem", lineHeight: 1.65, color: "var(--muted)", maxWidth: "520px", margin: "0 auto 36px" }}
        >
          One script tag. A beautiful, GDPR-compliant consent banner in under 2 minutes.
          65% cheaper than Cookiebot.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.28 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "60px" }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/signup"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--accent)", color: "var(--bg)",
                fontWeight: 700, fontSize: "0.9rem", padding: "13px 26px",
                borderRadius: "12px", textDecoration: "none",
              }}
            >
              Start for free <RiArrowRightLine size={15} />
            </Link>
          </motion.div>
          <a
            href="#how-it-works"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "var(--muted)", textDecoration: "none" }}
          >
            See how it works <RiArrowRightLine size={13} />
          </a>
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease, delay: 0.35 }}
        >
          <HeroBrowserMockup />
        </motion.div>
      </div>
    </section>
  )
}

function HeroBrowserMockup() {
  const [dismissed, setDismissed] = useState(false)
  const [accepted, setAccepted] = useState(false)

  return (
    <div style={{
      borderRadius: "16px", overflow: "hidden", textAlign: "left",
      border: "1px solid var(--border-2)",
      boxShadow: "0 0 0 1px rgba(45,212,191,0.08), 0 32px 80px rgba(0,0,0,0.55)",
      maxWidth: "680px", margin: "0 auto",
    }}>
      {/* Chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "6px", height: 24, margin: "0 12px", padding: "0 10px", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>yoursite.com</span>
        </div>
      </div>
      {/* Page skeleton */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ height: 11, borderRadius: 8, background: "var(--surface-2)", width: "72%" }} />
        <div style={{ height: 11, borderRadius: 8, background: "var(--surface-2)", width: "50%" }} />
        <div style={{ height: 11, borderRadius: 8, background: "var(--surface-2)", width: "63%" }} />
      </div>
      {/* Banner */}
      {dismissed ? (
        <div style={{ padding: "18px", textAlign: "center", background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 500, color: accepted ? "var(--accent)" : "var(--muted)", marginBottom: 6 }}>
            {accepted ? "✓ Consent saved" : "✗ Rejected"}
          </p>
          <button onClick={() => { setDismissed(false); setAccepted(false) }} style={{ fontSize: "0.7rem", color: "var(--muted)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
            Reset preview
          </button>
        </div>
      ) : (
        <div style={{ padding: "18px 20px", background: "var(--surface-2)", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>We use cookies</p>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
            We use cookies to improve your experience and analyze traffic.
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setAccepted(true); setDismissed(true) }}
              style={{ padding: "8px 16px", borderRadius: 8, background: "var(--accent)", color: "var(--bg)", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
              Accept all
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setDismissed(true)}
              style={{ padding: "8px 16px", borderRadius: 8, background: "transparent", color: "var(--muted)", fontSize: "0.75rem", border: "1px solid var(--border-2)", cursor: "pointer" }}>
              Reject all
            </motion.button>
            <button style={{ padding: "8px 12px", background: "none", border: "none", fontSize: "0.75rem", color: "var(--muted)", cursor: "pointer" }}>
              Customize →
            </button>
          </div>
          <p style={{ fontSize: "0.65rem", color: "var(--subtle)", marginTop: 12 }}>Powered by CookieConsent</p>
        </div>
      )}
    </div>
  )
}

/* ─── Logo bar ───────────────────────────────────────────── */

function LogoBar() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const names = ["Stripe", "Vercel", "Supabase", "Next.js", "Shopify", "Linear", "Prisma"]

  return (
    <div ref={ref} style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "36px 24px" }}>
      <motion.p
        initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: "24px" }}
      >
        Trusted by developers building on
      </motion.p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
        {names.map((name, i) => (
          <motion.span key={name}
            initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--border-2)" }}
          >
            {name}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

/* ─── How it works ───────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    { n: "01", icon: RiGlobalLine, title: "Sign up free", desc: "Create your account in 30 seconds. No credit card, no setup fees." },
    { n: "02", icon: RiBarChartLine, title: "Add your site", desc: "Enter your domain, customize the banner — text, colors, language." },
    { n: "03", icon: RiCodeLine, title: "Paste one script", desc: "Copy the embed code into your <head>. That's it — live instantly." },
  ]

  return (
    <section id="how-it-works" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px" }}>
              Simple process
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Up and running in 2 minutes
            </h2>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {steps.map((step, i) => (
            <ScrollReveal key={step.n} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, borderColor: "rgba(45,212,191,0.3)" }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "28px",
                  position: "relative", overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, var(--accent), transparent)", opacity: 0.3 }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <step.icon size={20} />
                </div>
                <p style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--subtle)", marginBottom: "8px" }}>{step.n}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "10px" }}>{step.title}</p>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--muted)" }}>{step.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ───────────────────────────────────────────── */

function Features() {
  const features = [
    { icon: RiShieldCheckLine, title: "GDPR compliant", desc: "Granular consent categories, configVersion re-consent, full audit log." },
    { icon: RiTimeLine,        title: "2-minute setup",  desc: "Paste one script tag. No SDK, no config, no expertise required." },
    { icon: RiGlobalLine,      title: "Multi-language",  desc: "Auto-detects visitor language. EN, FR, DE, ES, IT supported." },
    { icon: RiBarChartLine,    title: "Analytics",        desc: "Track accept rates, category consent splits, daily trends." },
    { icon: RiLockLine,        title: "Privacy by design", desc: "No third-party cookies. Data stays in your own database." },
    { icon: RiVipCrownLine,    title: "Grow with Pro",   desc: "Free up to 5k events/month. Unlimited at €5/mo." },
  ]

  return (
    <section style={{ padding: "100px 24px", background: "var(--surface)" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px" }}>
              Everything included
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Not just a banner
            </h2>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -3 }}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "24px" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <f.icon size={17} />
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>{f.title}</p>
                <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "var(--muted)" }}>{f.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────────────── */

function Pricing() {
  return (
    <section id="pricing" style={{ padding: "100px 24px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "12px" }}>
              Pricing
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "12px" }}>
              Simple. Honest. Fair.
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Start free. Upgrade only when you need to.</p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "720px", margin: "0 auto" }}>
          {/* Free */}
          <ScrollReveal>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px", height: "100%" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--muted)", marginBottom: "8px" }}>Free</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "28px" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>€0</span>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>/ forever</span>
              </div>
              <ul style={{ listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {["1 website", "5 000 events / month", "30-day log history", "Basic analytics"].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--muted)" }}>
                    <RiCheckLine size={15} style={{ color: "var(--subtle)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                style={{
                  display: "block", textAlign: "center", padding: "12px",
                  borderRadius: "10px", border: "1px solid var(--border-2)",
                  fontSize: "0.875rem", fontWeight: 600, color: "var(--text)",
                  textDecoration: "none", transition: "background 0.15s",
                }}
              >
                Get started
              </Link>
            </div>
          </ScrollReveal>

          {/* Pro */}
          <ScrollReveal delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              style={{
                background: "var(--surface-2)", borderRadius: "20px",
                border: "1px solid rgba(45,212,191,0.3)", padding: "32px",
                position: "relative", overflow: "hidden", height: "100%",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(45,212,191,0.07), transparent)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", position: "relative" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text)" }}>Pro</p>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: "var(--accent-dim)", color: "var(--accent)" }}>
                  <RiSparklingLine size={11} /> Most popular
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "28px", position: "relative" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "3rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>€5</span>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>/ month</span>
              </div>
              <ul style={{ listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                {["Unlimited websites", "Unlimited events", "Remove branding", "Full CSV export", "Priority support"].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.875rem", color: "var(--text)" }}>
                    <RiCheckLine size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                style={{
                  display: "block", textAlign: "center", padding: "12px",
                  borderRadius: "10px", background: "var(--accent)",
                  fontSize: "0.875rem", fontWeight: 700, color: "var(--bg)",
                  textDecoration: "none", position: "relative",
                }}
              >
                Upgrade to Pro
              </Link>
            </motion.div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2}>
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: "20px" }}>
            65% cheaper than Cookiebot. No contracts. Cancel anytime.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─── CTA ────────────────────────────────────────────────── */

function CTA() {
  return (
    <section style={{ padding: "100px 24px", background: "var(--surface)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45,212,191,0.06), transparent)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <ScrollReveal>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <RiShieldCheckLine size={26} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Get compliant today
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.65, color: "var(--muted)", marginBottom: "36px" }}>
            Join developers who chose a simpler, cheaper way to handle cookie consent.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
            <Link
              to="/signup"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "var(--accent)", color: "var(--bg)",
                fontWeight: 700, fontSize: "0.95rem", padding: "14px 32px",
                borderRadius: "12px", textDecoration: "none",
              }}
            >
              Start for free — no card needed <RiArrowRightUpLine size={16} />
            </Link>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────── */

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 24px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RiShieldCheckLine size={12} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            © {new Date().getFullYear()} CookieConsent. GDPR compliant by design.
          </p>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {[{ to: "/login", label: "Sign in" }, { to: "/signup", label: "Sign up" }].map(({ to, label }) => (
            <Link key={to} to={to} style={{ fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
