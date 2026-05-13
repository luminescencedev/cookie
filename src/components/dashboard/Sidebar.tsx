import { useEffect, useState } from "react"
import { NavLink, useNavigate } from "react-router"
import {
  RiDashboardLine,
  RiGlobalLine,
  RiSettings3Line,
  RiLogoutCircleLine,
  RiShieldCheckLine,
  RiAlertLine,
} from "react-icons/ri"
import { signOut } from "../../lib/auth-client"
import { useAuth } from "../../lib/auth-context"
import { api } from "../../lib/api"
import type { Subscription, MonthlyUsage } from "../../lib/types"

const links = [
  { to: "/dashboard",          label: "Overview", icon: RiDashboardLine, end: true },
  { to: "/dashboard/sites",    label: "Sites",    icon: RiGlobalLine },
  { to: "/dashboard/settings", label: "Settings", icon: RiSettings3Line },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { data: session } = useAuth()
  const [sub, setSub]     = useState<Subscription | null>(null)
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

  const isPro       = sub?.plan === "pro"
  const isExceeded  = !isPro && usage?.limit != null && usage.count >= usage.limit
  const isWarning   = !isPro && usage?.limit != null && usage.count >= usage.limit * 0.8

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <aside className="w-55 fixed top-0 left-0 h-screen flex flex-col bg-white border-r border-neutral-200">
      {/* Logo */}
      <div className="h-15 flex items-center gap-2.5 px-5 border-b border-neutral-200 shrink-0">
        <div className="size-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
          <RiShieldCheckLine size={12} />
        </div>
        <span className="text-sm font-medium text-neutral-800">CookieConsent</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-px">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="no-underline">
            {({ isActive }) => (
              <div
                className={`h-9 grid grid-cols-[20px_1fr] items-center gap-2.5 px-2 rounded-xl text-sm cursor-pointer transition-colors ${
                  isActive
                    ? "bg-black/5 font-medium text-neutral-800"
                    : "font-normal text-neutral-500 hover:bg-black/5 hover:text-neutral-800"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usage warning */}
      {(isExceeded || isWarning) && !isPro && (
        <div
          className={`mx-3 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium border ${
            isExceeded
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-amber-50 text-amber-600 border-amber-100"
          }`}
        >
          <RiAlertLine size={13} className="shrink-0" />
          {isExceeded ? "Monthly limit reached" : "80% of limit used"}
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-neutral-200 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="size-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-800 text-xs font-medium">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-800 truncate">{session?.user?.name}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{isPro ? "Pro" : "Free"}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full h-9 grid grid-cols-[20px_1fr] items-center gap-2.5 px-2 rounded-xl text-sm text-neutral-500 hover:bg-black/5 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <RiLogoutCircleLine size={14} className="shrink-0" />
          <span className="text-left">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
