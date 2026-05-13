import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { motion } from "motion/react"
import { RiVipCrownLine, RiCheckLine, RiCircleLine, RiExternalLinkLine } from "react-icons/ri"
import { useAuth } from "../../lib/auth-context"
import { api } from "../../lib/api"
import type { Subscription, MonthlyUsage } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

export default function Settings() {
  const { data: session } = useAuth()
  const [searchParams] = useSearchParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<MonthlyUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const paymentSuccess = searchParams.get("success") === "true"
  const paymentCanceled = searchParams.get("canceled") === "true"

  useEffect(() => {
    Promise.all([
      api.get<Subscription>("/api/billing/subscription"),
      api.get<MonthlyUsage>("/api/sites/usage/current"),
    ]).then(([sub, u]) => { setSubscription(sub); setUsage(u) }).finally(() => setLoading(false))
  }, [])

  async function handleUpgrade() {
    setCheckoutLoading(true)
    try {
      const { url } = await api.post<{ url: string }>("/api/billing/checkout", {})
      window.location.href = url
    } catch { setCheckoutLoading(false) }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const { url } = await api.post<{ url: string }>("/api/billing/portal", {})
      window.location.href = url
    } catch { setPortalLoading(false) }
  }

  const isPro = subscription?.plan === "pro"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <PageHeader title="Settings" description="Manage your account and billing" />

      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            padding: "16px 20px",
            background: "var(--green-dim)",
            border: "1px solid rgba(52,211,153,0.2)",
            color: "var(--green)",
          }}
        >
          <p className="text-sm font-medium">Payment successful! Your account has been upgraded to Pro.</p>
        </motion.div>
      )}
      {paymentCanceled && (
        <div style={{
          marginBottom: "24px",
          borderRadius: "12px",
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Payment canceled. You're still on the free plan.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card title="Account">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            <InfoRow label="Name" value={session?.user?.name ?? "—"} />
            <InfoRow label="Email" value={session?.user?.email ?? "—"} />
          </div>
        </Card>

        <Card title="Plan">
          {loading ? (
            <div className="animate-pulse" style={{ height: "48px", borderRadius: "8px", background: "var(--surface-2)" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <p className="text-sm font-semibold font-display" style={{ color: "var(--text)" }}>
                    {isPro ? "Pro" : "Free"}
                  </p>
                  {isPro && (
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.75rem",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontWeight: 500,
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }}>
                      <RiVipCrownLine size={10} /> Active
                    </span>
                  )}
                </div>
                {!isPro && (
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    5 000 events/month · branding shown
                  </p>
                )}
                {isPro && subscription?.currentPeriodEnd && (
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {isPro ? (
                <Button variant="secondary" size="sm" onClick={handlePortal} loading={portalLoading}>
                  <RiExternalLinkLine size={13} /> Manage subscription
                </Button>
              ) : (
                <Button size="sm" onClick={handleUpgrade} loading={checkoutLoading}>
                  <RiVipCrownLine size={13} /> Upgrade — €5/mo
                </Button>
              )}
            </div>
          )}
        </Card>

        {!loading && usage && (
          <Card title="Monthly usage">
            <UsageMeter usage={usage} isPro={isPro} />
            {!isPro && (
              <p className="text-xs" style={{ color: "var(--muted)", marginTop: "12px" }}>
                Resets on the 1st of each month. Upgrade to Pro for unlimited events.
              </p>
            )}
          </Card>
        )}

        {!isPro && (
          <Card title="What's included in Pro">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: "32px", rowGap: "12px", marginBottom: "20px" }}>
              <Feature text="Unlimited consent events" pro />
              <Feature text='Remove "Powered by" branding' pro />
              <Feature text="Full consent log export (CSV)" pro />
              <Feature text="Priority support" pro />
              <Feature text="All 3 consent categories" />
              <Feature text="Multi-language banners" />
              <Feature text="Unlimited sites" />
              <Feature text="5 000 events/month" />
            </div>
            <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <Button onClick={handleUpgrade} loading={checkoutLoading}>
                <RiVipCrownLine size={14} /> Upgrade to Pro — €5/mo
              </Button>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: "12px",
      border: "1px solid var(--border)",
      padding: "20px",
      background: "var(--surface)",
    }}>
      <h2 className="text-sm font-semibold font-display" style={{ color: "var(--text)", marginBottom: "16px" }}>{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--muted)", marginBottom: "4px" }}>{label}</p>
      <p className="text-sm" style={{ color: "var(--text)" }}>{value}</p>
    </div>
  )
}

function Feature({ text, pro }: { text: string; pro?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {pro
        ? <RiCheckLine size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
        : <RiCircleLine size={14} style={{ color: "var(--subtle)", flexShrink: 0 }} />
      }
      <span className="text-sm" style={{ color: pro ? "var(--text)" : "var(--muted)" }}>
        {text}
        {pro && (
          <span style={{
            marginLeft: "8px",
            fontSize: "0.75rem",
            padding: "2px 6px",
            borderRadius: "9999px",
            fontWeight: 500,
            background: "var(--accent-dim)",
            color: "var(--accent)",
          }}>
            Pro
          </span>
        )}
      </span>
    </div>
  )
}

function UsageMeter({ usage, isPro }: { usage: MonthlyUsage; isPro: boolean }) {
  if (isPro) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <p className="text-sm" style={{ color: "var(--text)" }}>{usage.count.toLocaleString()} events this month</p>
          <span className="text-xs" style={{ color: "var(--accent)" }}>Unlimited</span>
        </div>
        <div style={{ height: "6px", borderRadius: "9999px", overflow: "hidden", background: "var(--surface-2)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "8%" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            style={{ height: "100%", borderRadius: "9999px", background: "var(--accent)" }}
          />
        </div>
      </div>
    )
  }

  const limit = usage.limit ?? 5000
  const pct = Math.min((usage.count / limit) * 100, 100)
  const isWarning = pct >= 80
  const isExceeded = pct >= 100
  const barColor = isExceeded ? "var(--red)" : isWarning ? "var(--amber)" : "var(--accent)"

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <p className="text-sm" style={{ color: "var(--text)" }}>
          {usage.count.toLocaleString()} / {limit.toLocaleString()} events
        </p>
        <span className="text-xs font-medium" style={{ color: isExceeded ? "var(--red)" : isWarning ? "var(--amber)" : "var(--muted)" }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div style={{ height: "6px", borderRadius: "9999px", overflow: "hidden", background: "var(--surface-2)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{ height: "100%", borderRadius: "9999px", background: barColor }}
        />
      </div>
      {isWarning && !isExceeded && (
        <p className="text-xs" style={{ color: "var(--amber)", marginTop: "8px" }}>Approaching your monthly limit.</p>
      )}
      {isExceeded && (
        <p className="text-xs" style={{ color: "var(--red)", marginTop: "8px" }}>
          Monthly limit reached. New consents aren't recorded in analytics until you upgrade.
        </p>
      )}
    </div>
  )
}
