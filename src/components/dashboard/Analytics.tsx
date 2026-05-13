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
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AnalyticsData>(`/api/analytics/${siteId}`).then(setData).finally(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: "80px", borderRadius: "12px", background: "var(--surface)" }} />
          ))}
        </div>
        <div className="animate-pulse" style={{ height: "192px", borderRadius: "12px", background: "var(--surface)" }} />
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div style={{
        borderRadius: "12px",
        border: "1px solid var(--border)",
        padding: "56px",
        textAlign: "center",
        background: "var(--surface)",
      }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No consent events yet. Add the embed code to your site to start collecting data.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard label="Total consents" value={data.total} />
        <StatCard label="Accept rate" value={`${data.acceptRate}%`} good={data.acceptRate >= 60} sub="accepted all" />
        <StatCard label="Analytics consent" value={`${data.analyticsRate}%`} good={data.analyticsRate >= 60} sub={`${data.analyticsConsented} visitors`} />
        <StatCard label="Marketing consent" value={`${data.marketingRate}%`} good={data.marketingRate >= 60} sub={`${data.marketingConsented} visitors`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <MiniStat label="Accepted all" value={data.accepted} color="accent" />
        <MiniStat label="Partial" value={data.partial} color="blue" />
        <MiniStat label="Rejected all" value={data.rejected} color="default" />
      </div>

      {data.dailyData.length > 0 && (
        <div style={{
          borderRadius: "12px",
          border: "1px solid var(--border)",
          padding: "20px",
          background: "var(--surface)",
        }}>
          <p className="text-sm font-semibold font-display" style={{ color: "var(--text)", marginBottom: "16px" }}>Last 30 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.dailyData} barSize={6} barGap={1}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickFormatter={(val) => val.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--text)",
                }}
                cursor={{ fill: "var(--surface-2)" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: "var(--muted)" }} />
              <Bar dataKey="accepted" fill="#34d399" radius={[3, 3, 0, 0]} name="Accepted" />
              <Bar dataKey="partial"  fill="#60a5fa" radius={[3, 3, 0, 0]} name="Partial" />
              <Bar dataKey="rejected" fill="#2c2c40"  radius={[3, 3, 0, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.recentLogs.length > 0 && (
        <div style={{
          borderRadius: "12px",
          border: "1px solid var(--border)",
          overflow: "hidden",
          background: "var(--surface)",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold font-display" style={{ color: "var(--text)" }}>Recent events</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Choice", "Categories", "Config v.", "Date", "Browser"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium" style={{ padding: "12px 20px", color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentLogs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: i < data.recentLogs.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "12px 20px" }}><ChoiceBadge choice={log.choice} /></td>
                  <td style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <CategoryDot label="N" active={log.necessary} color="#2dd4bf" />
                      <CategoryDot label="A" active={log.analytics} color="#60a5fa" />
                      <CategoryDot label="M" active={log.marketing} color="#a78bfa" />
                    </div>
                  </td>
                  <td className="text-xs" style={{ padding: "12px 20px", color: "var(--muted)" }}>v{log.configVersion}</td>
                  <td className="text-xs" style={{ padding: "12px 20px", color: "var(--muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="text-xs truncate" style={{ padding: "12px 20px", maxWidth: "128px", color: "var(--muted)" }}>
                    {log.userAgent ? parseUA(log.userAgent) : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--subtle)" }}>N = Necessary · A = Analytics · M = Marketing</p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, good, sub }: { label: string; value: string | number; good?: boolean; sub?: string }) {
  return (
    <div style={{
      borderRadius: "12px",
      border: "1px solid var(--border)",
      padding: "16px 20px",
      background: "var(--surface)",
    }}>
      <p className="text-xs" style={{ color: "var(--muted)", marginBottom: "4px" }}>{label}</p>
      <p className="text-2xl font-bold font-display" style={{ color: good ? "var(--accent)" : "var(--text)" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>{sub}</p>}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: "accent" | "blue" | "default" }) {
  const styles: Record<string, React.CSSProperties> = {
    accent: { background: "var(--accent-dim)", color: "var(--accent)" },
    blue: { background: "rgba(96,165,250,0.1)", color: "#60a5fa" },
    default: { background: "var(--surface-2)", color: "var(--muted)" },
  }
  return (
    <div style={{ borderRadius: "12px", padding: "12px 16px", ...styles[color] }}>
      <p className="text-xs font-medium" style={{ marginBottom: "2px" }}>{label}</p>
      <p className="text-xl font-bold font-display">{value}</p>
    </div>
  )
}

function ChoiceBadge({ choice }: { choice: string }) {
  const styles: Record<string, React.CSSProperties> = {
    accepted: { background: "var(--green-dim)", color: "var(--green)" },
    rejected: { background: "var(--surface-2)", color: "var(--muted)" },
    partial:  { background: "rgba(96,165,250,0.1)", color: "#60a5fa" },
  }
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 500,
      ...(styles[choice] ?? styles.rejected),
    }}>
      {choice}
    </span>
  )
}

function CategoryDot({ label, active, color }: { label: string; active: boolean; color: string }) {
  return (
    <span
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
        height: "20px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        ...(active
          ? { background: `${color}20`, color }
          : { background: "var(--surface-2)", color: "var(--subtle)" }
        ),
      }}
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
