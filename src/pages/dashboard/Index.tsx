import { useEffect, useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { RiGlobalLine, RiArrowRightLine, RiAddLine, RiBarChartLine, RiShieldCheckLine } from "react-icons/ri"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export default function DashboardIndex() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Site[]>("/api/sites").then(setSites).finally(() => setLoading(false))
  }, [])

  const totalConsent = sites.reduce((sum, s) => sum + (s._count?.consentLogs ?? 0), 0)

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <motion.div variants={fadeUp}>
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--accent)", marginBottom: "4px" }}>
          Dashboard
        </p>
        <h1 className="text-2xl font-bold font-display" style={{ color: "var(--text)" }}>Overview</h1>
        <p className="text-sm" style={{ color: "var(--muted)", marginTop: "4px" }}>Your cookie consent at a glance</p>
      </motion.div>

      <motion.div variants={stagger} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <StatCard icon={RiGlobalLine} label="Total sites" value={loading ? "—" : String(sites.length)} />
        <StatCard icon={RiBarChartLine} label="Total consents" value={loading ? "—" : totalConsent.toLocaleString()} />
        <StatCard icon={RiShieldCheckLine} label="Plan" value="Free" accent />
      </motion.div>

      <motion.div variants={fadeUp}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <p className="text-sm font-semibold font-display" style={{ color: "var(--text)" }}>Your sites</p>
          <Link
            to="/dashboard/sites"
            style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}
          >
            View all <RiArrowRightLine size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse" style={{ height: "68px", borderRadius: "12px", background: "var(--surface)" }} />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <Link to="/dashboard/sites" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ borderColor: "var(--accent)", scale: 1.005 }}
              style={{
                border: "1px dashed var(--border-2)",
                borderRadius: "12px",
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                background: "var(--accent-dim)",
                color: "var(--accent)",
              }}>
                <RiAddLine size={20} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Add your first site</p>
              <p className="text-xs" style={{ color: "var(--muted)", marginTop: "4px" }}>
                Get a GDPR-compliant consent banner in 2 minutes
              </p>
            </motion.div>
          </Link>
        ) : (
          <motion.div variants={stagger} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sites.slice(0, 3).map((site) => (
              <motion.div key={site.id} variants={fadeUp}>
                <Link to={`/dashboard/sites/${site.id}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        background: "var(--surface-2)",
                        color: "var(--muted)",
                      }}>
                        <RiGlobalLine size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{site.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>{site.domain}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {(site._count?.consentLogs ?? 0).toLocaleString()} consents
                      </span>
                      <RiArrowRightLine size={14} style={{ color: "var(--subtle)" }} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        borderRadius: "12px",
        border: "1px solid var(--border)",
        padding: "16px 20px",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent ? "var(--accent-dim)" : "var(--surface-2)",
          color: accent ? "var(--accent)" : "var(--muted)",
        }}>
          <Icon size={14} />
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
      </div>
      <p className="text-2xl font-bold font-display" style={{ color: "var(--text)" }}>{value}</p>
    </motion.div>
  )
}
