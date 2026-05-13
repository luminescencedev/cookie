import { useEffect, useState } from "react"
import { api } from "../../lib/api"

interface AnalyticsData {
  total: number
  accepted: number
  rejected: number
  partial: number
  acceptRate: number
  analyticsRate: number
  marketingRate: number
  dailyData: { date: string; total: number; accepted: number }[]
  recentLogs: { id: string; choice: string; createdAt: string }[]
}

export default function Analytics({ siteId }: { siteId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<AnalyticsData>(`/api/analytics/${siteId}`)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [siteId])

  if (loading) return <p className="text-sm text-neutral-400">Loading analytics...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total consents" value={data.total} />
        <StatCard label="Accepted all" value={data.accepted} sub={`${data.acceptRate}%`} />
        <StatCard label="Rejected" value={data.rejected} />
        <StatCard label="Partial" value={data.partial} />
      </div>

      {/* Category rates */}
      {(data.analyticsRate > 0 || data.marketingRate > 0) && (
        <div className="bg-white border border-neutral-100 rounded-xl p-5">
          <h3 className="text-sm font-medium text-neutral-900 mb-4">Category acceptance</h3>
          <div className="space-y-3">
            <RateBar label="Analytics" rate={data.analyticsRate} />
            <RateBar label="Marketing" rate={data.marketingRate} />
          </div>
        </div>
      )}

      {/* Recent logs */}
      <div className="bg-white border border-neutral-100 rounded-xl p-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-4">Recent consents</h3>
        {data.recentLogs.length === 0 ? (
          <p className="text-sm text-neutral-400">No consent logs yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  log.choice === "all" ? "bg-green-50 text-green-700" :
                  log.choice === "none" ? "bg-red-50 text-red-700" :
                  "bg-yellow-50 text-yellow-700"
                }`}>
                  {log.choice === "all" ? "Accepted" : log.choice === "none" ? "Rejected" : "Partial"}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl px-5 py-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub} rate</p>}
    </div>
  )
}

function RateBar({ label, rate }: { label: string; rate: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400">{rate}%</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full">
        <div
          className="h-full bg-neutral-900 rounded-full transition-all"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  )
}
