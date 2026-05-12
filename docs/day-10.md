# Day 10 — Analytics page

## Context
Days 1–9 done. Today we build the analytics view with the updated data model: total consents, accept rate, **analytics consent rate**, **marketing consent rate**, a 30-day chart, and a recent logs table showing category choices.

## Goal
By end of today, each site shows a live analytics section with full category breakdown.

---

## Tasks

### 1. Install chart library
```bash
pnpm add recharts@3
```

### 2. Create the Analytics component
`src/components/dashboard/Analytics.tsx`:
```tsx
import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
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
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AnalyticsData>(`/api/analytics/${siteId}`)
      .then(setData)
      .finally(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-xl p-12 text-center">
        <p className="text-sm text-neutral-400">
          No consent events yet. Add the embed code to your site to start collecting data.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total consents" value={data.total} />
        <StatCard
          label="Full accept rate"
          value={`${data.acceptRate}%`}
          color={data.acceptRate >= 60 ? "text-green-600" : "text-neutral-900"}
          sub="accepted all"
        />
        <StatCard
          label="Analytics consent"
          value={`${data.analyticsRate}%`}
          color={data.analyticsRate >= 60 ? "text-blue-600" : "text-neutral-900"}
          sub={`${data.analyticsConsented} visitors`}
        />
        <StatCard
          label="Marketing consent"
          value={`${data.marketingRate}%`}
          color={data.marketingRate >= 60 ? "text-purple-600" : "text-neutral-500"}
          sub={`${data.marketingConsented} visitors`}
        />
      </div>

      {/* Choice breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Accepted all" value={data.accepted} color="bg-green-100 text-green-700" />
        <MiniStat label="Partial (customized)" value={data.partial} color="bg-blue-100 text-blue-700" />
        <MiniStat label="Rejected all" value={data.rejected} color="bg-neutral-100 text-neutral-500" />
      </div>

      {/* Chart */}
      {data.dailyData.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-xl p-5">
          <p className="text-sm font-medium text-neutral-900 mb-4">Last 30 days</p>
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
                contentStyle={{ border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "#f5f5f5" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="accepted" fill="#16a34a" radius={[3, 3, 0, 0]} name="Accepted" />
              <Bar dataKey="partial"  fill="#3b82f6" radius={[3, 3, 0, 0]} name="Partial" />
              <Bar dataKey="rejected" fill="#e5e5e5" radius={[3, 3, 0, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent logs */}
      {data.recentLogs.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">Recent events</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400">Choice</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400">Categories</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400">Config v.</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-400">Browser</th>
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-5 py-3">
                    <ChoiceBadge choice={log.choice} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <CategoryDot label="N" active={log.necessary} color="bg-neutral-400" />
                      <CategoryDot label="A" active={log.analytics} color="bg-blue-400" />
                      <CategoryDot label="M" active={log.marketing} color="bg-purple-400" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-400">v{log.configVersion}</td>
                  <td className="px-5 py-3 text-xs text-neutral-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-400 truncate max-w-32">
                    {log.userAgent ? parseUA(log.userAgent) : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-neutral-50">
            <p className="text-xs text-neutral-400">
              N = Necessary · A = Analytics · M = Marketing
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color = "text-neutral-900", sub }: {
  label: string
  value: string | number
  color?: string
  sub?: string
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl px-5 py-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${color}`}>
      <p className="text-xs font-medium mb-0.5">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

function ChoiceBadge({ choice }: { choice: string }) {
  const styles: Record<string, string> = {
    accepted: "bg-green-50 text-green-700",
    rejected: "bg-neutral-100 text-neutral-500",
    partial:  "bg-blue-50 text-blue-700",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[choice] ?? "bg-neutral-100 text-neutral-500"}`}>
      {choice}
    </span>
  )
}

function CategoryDot({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <span
      title={label}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold ${active ? color : "bg-neutral-100 text-neutral-300"}`}
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
```

---

## Definition of done
- [ ] 4 stat cards: total, accept rate, analytics rate, marketing rate
- [ ] Mini breakdown: accepted / partial / rejected counts
- [ ] Chart shows accepted + partial + rejected bars per day
- [ ] Recent logs table shows N/A/M category dots
- [ ] Empty state when no events
- [ ] Loading skeleton while fetching
- [ ] No TypeScript errors with recharts

---

## Common issues
- **"partial" bar not showing:** Make sure the API returns `partial` in `dailyData` — see updated `day-04.md`
- **Category dots all grey:** If old logs don't have `analytics`/`marketing` fields, they'll default to `false`. That's expected for pre-migration data
