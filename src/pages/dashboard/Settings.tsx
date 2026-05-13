import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import { useAuth } from "../../lib/auth-context"
import { api } from "../../lib/api"
import type { Subscription, MonthlyUsage } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"

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
    ]).then(([sub, u]) => {
      setSubscription(sub)
      setUsage(u)
    }).finally(() => setLoading(false))
  }, [])

  async function handleUpgrade() {
    setCheckoutLoading(true)
    try {
      const { url } = await api.post<{ url: string }>("/api/billing/checkout", {})
      window.location.href = url
    } catch {
      setCheckoutLoading(false)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const { url } = await api.post<{ url: string }>("/api/billing/portal", {})
      window.location.href = url
    } catch {
      setPortalLoading(false)
    }
  }

  const isPro = subscription?.plan === "pro"

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and billing" />

      {paymentSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <p className="text-sm font-medium text-green-800">
            Payment successful! Your account has been upgraded to Pro.
          </p>
        </div>
      )}
      {paymentCanceled && (
        <div className="mb-6 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4">
          <p className="text-sm text-neutral-600">Payment canceled. You're still on the free plan.</p>
        </div>
      )}

      <div className="space-y-4">
        <Section title="Account">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Name" value={session?.user?.name ?? "—"} />
            <InfoRow label="Email" value={session?.user?.email ?? "—"} />
          </div>
        </Section>

        <Section title="Plan">
          {loading ? (
            <div className="h-12 bg-neutral-100 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-neutral-900">{isPro ? "Pro" : "Free"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isPro ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {subscription?.status ?? "active"}
                  </span>
                </div>
                {isPro && subscription?.currentPeriodEnd && (
                  <p className="text-xs text-neutral-400">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {!isPro && (
                  <p className="text-xs text-neutral-400">
                    Unlimited sites · 5 000 events/month · branding shown
                  </p>
                )}
              </div>
              {isPro ? (
                <Button variant="secondary" size="sm" onClick={handlePortal} loading={portalLoading}>
                  Manage subscription
                </Button>
              ) : (
                <Button size="sm" onClick={handleUpgrade} loading={checkoutLoading}>
                  Upgrade to Pro — €5/mo
                </Button>
              )}
            </div>
          )}
        </Section>

        {!loading && usage && (
          <Section title="Monthly usage">
            <UsageMeter usage={usage} isPro={isPro} />
            {!isPro && (
              <p className="text-xs text-neutral-400 mt-2">
                Resets on the 1st of each month. Upgrade to Pro for unlimited events.
              </p>
            )}
          </Section>
        )}

        {!isPro && (
          <Section title="What's included in Pro">
            <div className="grid grid-cols-2 gap-3">
              <Feature text="Unlimited consent events" pro />
              <Feature text='Remove "Powered by" branding' pro />
              <Feature text="Full consent log export (CSV)" pro />
              <Feature text="Priority support" pro />
              <Feature text="Unlimited sites" free />
              <Feature text="All 3 consent categories" free />
              <Feature text="Multi-language banners" free />
              <Feature text="5 000 events/month" free />
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Button onClick={handleUpgrade} loading={checkoutLoading}>
                Upgrade to Pro — €5/mo
              </Button>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function UsageMeter({ usage, isPro }: { usage: MonthlyUsage; isPro: boolean }) {
  if (isPro) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-neutral-700">{usage.count.toLocaleString()} events this month</p>
          <span className="text-xs text-neutral-400">Unlimited</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: "8%" }} />
        </div>
      </div>
    )
  }

  const limit = usage.limit ?? 5000
  const pct = Math.min((usage.count / limit) * 100, 100)
  const isWarning = pct >= 80
  const isExceeded = pct >= 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm text-neutral-700">
          {usage.count.toLocaleString()} / {limit.toLocaleString()} events
        </p>
        <span className={`text-xs font-medium ${isExceeded ? "text-red-600" : isWarning ? "text-amber-600" : "text-neutral-400"}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isExceeded ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-neutral-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isWarning && !isExceeded && (
        <p className="text-xs text-amber-600 mt-1.5">You're approaching your monthly limit.</p>
      )}
      {isExceeded && (
        <p className="text-xs text-red-600 mt-1.5">
          Monthly limit reached. New consents are stored for visitors but not recorded in your analytics until you upgrade.
        </p>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-5">
      <h2 className="text-sm font-medium text-neutral-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-900">{value}</p>
    </div>
  )
}

function Feature({ text, pro }: { text: string; pro?: boolean; free?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs ${pro ? "text-green-600" : "text-neutral-400"}`}>
        {pro ? "✓" : "·"}
      </span>
      <span className={`text-sm ${pro ? "text-neutral-700" : "text-neutral-400"}`}>
        {text}
        {pro && (
          <span className="ml-1.5 text-xs bg-neutral-900 text-white px-1.5 py-0.5 rounded-full">Pro</span>
        )}
      </span>
    </div>
  )
}
