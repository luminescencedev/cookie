import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { motion } from "motion/react"
import { RiCheckLine, RiCircleLine, RiExternalLinkLine, RiArrowRightUpLine } from "react-icons/ri"
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

  const paymentSuccess  = searchParams.get("success") === "true"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <PageHeader title="Settings" description="Manage your account and billing" />

      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 px-3 py-2.5 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 font-medium"
        >
          Payment successful — your account has been upgraded to Pro.
        </motion.div>
      )}
      {paymentCanceled && (
        <div className="mb-5 px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-500">
          Payment canceled. You're still on the free plan.
        </div>
      )}

      <div className="flex flex-col">
        <Section title="Account">
          <div className="grid grid-cols-2 gap-5">
            <InfoRow label="Name"  value={session?.user?.name  ?? "—"} />
            <InfoRow label="Email" value={session?.user?.email ?? "—"} />
          </div>
        </Section>

        <Section title="Plan">
          {loading ? (
            <div className="h-11 rounded-xl bg-neutral-100 animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-neutral-900">
                    {isPro ? "Pro" : "Free"}
                  </p>
                  {isPro && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
                      Active
                    </span>
                  )}
                </div>
                {!isPro && (
                  <p className="text-xs text-neutral-400">5 000 events/month · branding shown</p>
                )}
                {isPro && subscription?.currentPeriodEnd && (
                  <p className="text-xs text-neutral-400">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {isPro ? (
                <Button variant="secondary" size="sm" onClick={handlePortal} loading={portalLoading}>
                  <RiExternalLinkLine size={12} /> Manage subscription
                </Button>
              ) : (
                <Button size="sm" onClick={handleUpgrade} loading={checkoutLoading}>
                  Upgrade — €5/mo <RiArrowRightUpLine size={12} />
                </Button>
              )}
            </div>
          )}
        </Section>

        {!loading && usage && (
          <Section title="Monthly usage">
            <UsageMeter usage={usage} isPro={isPro} />
            {!isPro && (
              <p className="text-xs text-neutral-400 mt-2.5">
                Resets on the 1st of each month. Upgrade to Pro for unlimited events.
              </p>
            )}
          </Section>
        )}

        {!isPro && (
          <Section title="What's included in Pro">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-5">
              <Feature text="Unlimited consent events"        pro />
              <Feature text='Remove "Powered by" branding'   pro />
              <Feature text="Full consent log export (CSV)"  pro />
              <Feature text="Priority support"               pro />
              <Feature text="All 3 consent categories" />
              <Feature text="Multi-language banners" />
              <Feature text="Unlimited sites" />
              <Feature text="5 000 events/month" />
            </div>
            <div className="pt-4 border-t border-neutral-200">
              <Button onClick={handleUpgrade} loading={checkoutLoading}>
                Upgrade to Pro — €5/mo <RiArrowRightUpLine size={13} />
              </Button>
            </div>
          </Section>
        )}
      </div>
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-6 border-b border-neutral-200">
      <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  )
}

function Feature({ text, pro }: { text: string; pro?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {pro
        ? <RiCheckLine size={13} className="text-neutral-800 shrink-0" />
        : <RiCircleLine size={13} className="text-neutral-300 shrink-0" />
      }
      <span className={`text-sm ${pro ? "text-neutral-800" : "text-neutral-400"}`}>
        {text}
        {pro && (
          <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded font-medium bg-neutral-100 text-neutral-400 border border-neutral-200">
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-neutral-800">{usage.count.toLocaleString()} events this month</p>
          <span className="text-xs text-neutral-400">Unlimited</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden bg-neutral-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "8%" }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-neutral-900"
          />
        </div>
      </div>
    )
  }

  const limit      = usage.limit ?? 5000
  const pct        = Math.min((usage.count / limit) * 100, 100)
  const isWarning  = pct >= 80
  const isExceeded = pct >= 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-neutral-800">
          {usage.count.toLocaleString()} / {limit.toLocaleString()} events
        </p>
        <span className={`text-xs font-medium ${
          isExceeded ? "text-red-500" : isWarning ? "text-amber-500" : "text-neutral-400"
        }`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-neutral-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full ${
            isExceeded ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-neutral-900"
          }`}
        />
      </div>
      {isWarning && !isExceeded && (
        <p className="text-xs text-amber-500 mt-1.5">Approaching your monthly limit.</p>
      )}
      {isExceeded && (
        <p className="text-xs text-red-500 mt-1.5">
          Monthly limit reached. New consents aren't recorded until you upgrade.
        </p>
      )}
    </div>
  )
}
