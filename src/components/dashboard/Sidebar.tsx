import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router"
import { motion } from "motion/react"
import {
  RiDashboardLine,
  RiGlobalLine,
  RiSettings3Line,
  RiLogoutCircleLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiVipCrownLine,
} from "react-icons/ri"
import { signOut } from "../../lib/auth-client"
import { useAuth } from "../../lib/auth-context"
import { api } from "../../lib/api"
import type { Subscription, MonthlyUsage } from "../../lib/types"

const links = [
  { to: "/dashboard", label: "Overview", icon: RiDashboardLine, end: true },
  { to: "/dashboard/sites", label: "Sites", icon: RiGlobalLine },
  { to: "/dashboard/settings", label: "Settings", icon: RiSettings3Line },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { data: session } = useAuth()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<MonthlyUsage | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Subscription>("/api/billing/subscription").catch(() => null),
      api.get<MonthlyUsage>("/api/sites/usage/current").catch(() => null),
    ]).then(([s, u]) => { setSub(s); setUsage(u) })
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate("/login")
  }

  const isPro = sub?.plan === "pro"
  const isExceeded = !isPro && usage?.limit && usage.count >= usage.limit
  const isWarning = !isPro && usage?.limit && usage.count >= usage.limit * 0.8

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <aside style={{
      width: "240px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
    }}>
      {/* Logo */}
      <div style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "var(--accent-dim)",
          color: "var(--accent)",
        }}>
          <RiShieldCheckLine size={16} />
        </div>
        <span className="font-semibold text-sm font-display" style={{ color: "var(--text)" }}>
          CookieConsent
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--muted)",
                }}
              >
                <Icon size={16} />
                <span style={{ fontWeight: isActive ? 500 : 400 }}>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      borderRadius: "9999px",
                      background: "var(--accent)",
                    }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usage warning */}
      {(isExceeded || isWarning) && !isPro && (
        <div style={{
          margin: "0 12px 8px",
          padding: "10px 12px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: isExceeded ? "var(--red-dim)" : "var(--amber-dim)",
          color: isExceeded ? "var(--red)" : "var(--amber)",
        }}>
          <RiAlertLine size={14} style={{ flexShrink: 0 }} />
          <span className="text-xs font-medium">
            {isExceeded ? "Limit reached" : "80% used"}
          </span>
        </div>
      )}

      {/* User */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", marginBottom: "4px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "var(--accent-dim)",
            color: "var(--accent)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-xs font-medium truncate" style={{ color: "var(--text)" }}>
              {session?.user?.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              {isPro ? (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--accent)" }}>
                  <RiVipCrownLine size={11} /> Pro
                </span>
              ) : (
                <span className="text-xs" style={{ color: "var(--muted)" }}>Free</span>
              )}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 2, backgroundColor: "var(--surface-2)" }}
          onClick={handleSignOut}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            color: "var(--muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <RiLogoutCircleLine size={14} />
          Sign out
        </motion.button>
      </div>
    </aside>
  )
}
