import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { api } from "../../lib/api"

interface AnalyticsData {
  total: number
  accepted: number
  rejected: number
  partial: number
  acceptRate: number
  analyticsConsented: number
  marketingConsented: number
  analyticsRate: number
  marketingRate: number
  dailyData: { date: string; accepted: number; rejected: number; partial: number }[]
  recentLogs: {
    id: string
    choice: string
    necessary: boolean
    analytics: boolean
    marketing: boolean
    configVersion: number
    createdAt: string
    userAgent: string | null
  }[]
}

export default function Analytics({ siteId }: { siteId: string }) {
  const [data, setData]     = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AnalyticsData>(`/api/analytics/${siteId}`).then(setData).finally(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-neutral-100 animate-pulse" />
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 p-12 text-center">
        <p className="text-sm text-neutral-400">
          No consent events yet. Add the embed code to your site to start collecting data.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total consents"     value={data.total} />
        <StatCard label="Accept rate"        value={`${data.acceptRate}%`}    good={data.acceptRate >= 60}    sub="accepted all" />
        <StatCard label="Analytics consent"  value={`${data.analyticsRate}%`} good={data.analyticsRate >= 60} sub={`${data.analyticsConsented} visitors`} />
        <StatCard label="Marketing consent"  value={`${data.marketingRate}%`} good={data.marketingRate >= 60} sub={`${data.marketingConsented} visitors`} />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 rounded-2xl overflow-hidden border border-neutral-200">
        <MiniStat label="Accepted all" value={data.accepted} variant="green" />
        <MiniStat label="Partial"      value={data.partial}  variant="blue" />
        <MiniStat label="Rejected all" value={data.rejected} variant="default" />
      </div>

      {/* Chart */}
      {data.dailyData.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium text-neutral-800 mb-4">Last 30 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.dailyData} barSize={6} barGap={1}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#a3a3a3" }}
                tickFormatter={(val) => val.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#a3a3a3" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#171717",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
                cursor={{ fill: "#f5f5f5" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "#a3a3a3" }} />
              <Bar dataKey="accepted" fill="#16a34a" radius={[3, 3, 0, 0]} name="Accepted" />
              <Bar dataKey="partial"  fill="#2563eb" radius={[3, 3, 0, 0]} name="Partial" />
              <Bar dataKey="rejected" fill="#d4d4d4" radius={[3, 3, 0, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent logs */}
      {data.recentLogs.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="text-sm font-medium text-neutral-800">Recent events</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                {["Choice", "Categories", "Config v.", "Date", "Browser"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.map((log, i) => (
                <tr key={log.id} className={i < data.recentLogs.length - 1 ? "border-b border-neutral-200" : ""}>
                  <td className="px-4 py-2.5"><ChoiceBadge choice={log.choice} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <CategoryDot label="N" active={log.necessary} color="#16a34a" />
                      <CategoryDot label="A" active={log.analytics} color="#2563eb" />
                      <CategoryDot label="M" active={log.marketing} color="#7c3aed" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-400">v{log.configVersion}</td>
                  <td className="px-4 py-2.5 text-xs text-neutral-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-neutral-400 max-w-32 truncate">
                    {log.userAgent ? parseUA(log.userAgent) : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-neutral-200 bg-neutral-50">
            <p className="text-xs text-neutral-400">N = Necessary · A = Analytics · M = Marketing</p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, good, sub }: { label: string; value: string | number; good?: boolean; sub?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold tracking-tight ${good ? "text-green-600" : "text-neutral-900"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniStat({ label, value, variant }: { label: string; value: number; variant: "green" | "blue" | "default" }) {
  const cls = {
    green:   "bg-green-50 text-green-700",
    blue:    "bg-blue-50 text-blue-700",
    default: "bg-neutral-50 text-neutral-500",
  }[variant]

  return (
    <div className={`px-4 py-3.5 ${cls} border-r border-neutral-200 last:border-0`}>
      <p className="text-xs font-medium mb-0.5">{label}</p>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function ChoiceBadge({ choice }: { choice: string }) {
  const cls: Record<string, string> = {
    accepted: "bg-green-50 text-green-700 border border-green-100",
    rejected: "bg-neutral-100 text-neutral-500 border border-neutral-200",
    partial:  "bg-blue-50 text-blue-700 border border-blue-100",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls[choice] ?? cls.rejected}`}>
      {choice}
    </span>
  )
}

function CategoryDot({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <span
      title={label}
      className={`inline-flex items-center justify-center size-5 rounded-full text-[11px] font-semibold ${
        active ? "" : "bg-neutral-100 text-neutral-400 border border-neutral-200"
      }`}
      style={active ? { background: `${color}18`, color } : undefined}
    >
      {label}
    </span>
  )
}

function parseUA(ua: string): string {
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome"
  if (ua.includes("Firefox")) return "Firefox"
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari"
  if (ua.includes("Edg")) return "Edge"
  return ua.slice(0, 30)
}
