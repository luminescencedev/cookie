# Day 7 — Dashboard layout (sidebar + header)

## Context
Days 1–6 done. Auth pages work. Users can sign up, log in, and are redirected to /dashboard. Today we build the persistent dashboard shell: sidebar navigation, header, and the layout that wraps all dashboard pages.

## Goal
By end of today, the dashboard has a clean sidebar with navigation links, a header with user info and logout, and the Outlet renders child pages correctly.

---

## Tasks

### 1. Build the sidebar component
`src/components/dashboard/Sidebar.tsx`:
```tsx
import { NavLink, useNavigate } from "react-router"
import { signOut } from "../../lib/auth-client"
import { useAuth } from "../../lib/auth-context"

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/sites", label: "Sites" },
  { to: "/dashboard/settings", label: "Settings" },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { data: session } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate("/login")
  }

  return (
    <aside className="w-56 h-screen fixed left-0 top-0 border-r border-neutral-100 bg-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-100">
        <span className="font-semibold text-neutral-900 text-sm tracking-tight">
          CookieConsent
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-neutral-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-neutral-400 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-neutral-400 hover:text-neutral-600 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

### 2. Build the dashboard layout
`src/components/dashboard/Layout.tsx`:
```tsx
import { Outlet } from "react-router"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

### 3. Build the Overview page with real data
`src/pages/dashboard/Index.tsx`:
```tsx
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"

export default function DashboardIndex() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Site[]>("/api/sites")
      .then(setSites)
      .finally(() => setLoading(false))
  }, [])

  const totalConsent = sites.reduce((sum, s) => sum + (s._count?.consentLogs ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Overview</h1>
        <p className="text-sm text-neutral-500 mt-1">Your cookie consent dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total sites" value={loading ? "—" : String(sites.length)} />
        <StatCard label="Total consents" value={loading ? "—" : String(totalConsent)} />
        <StatCard label="Plan" value="Free" />
      </div>

      {/* Recent sites */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-900">Your sites</h2>
          <Link
            to="/dashboard/sites"
            className="text-xs text-neutral-500 hover:text-neutral-700 transition"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400">Loading...</p>
        ) : sites.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-sm text-neutral-500 mb-3">No sites yet</p>
            <Link
              to="/dashboard/sites"
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              Add your first site →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sites.slice(0, 3).map((site) => (
              <Link
                key={site.id}
                to={`/dashboard/sites/${site.id}`}
                className="flex items-center justify-between bg-white border border-neutral-100 rounded-xl px-5 py-4 hover:border-neutral-200 transition"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{site.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{site.domain}</p>
                </div>
                <p className="text-xs text-neutral-400">
                  {site._count?.consentLogs ?? 0} consents
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl px-5 py-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}
```

### 4. Create a reusable page header component
`src/components/ui/PageHeader.tsx`:
```tsx
interface Props {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {description && (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

### 5. Create a reusable Button component
`src/components/ui/Button.tsx`:
```tsx
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md"
  loading?: boolean
}

const variants = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-300",
  secondary: "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50",
  ghost: "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
}

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`font-medium transition inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  )
}
```

---

## Definition of done
- [ ] Sidebar renders on all /dashboard/* routes
- [ ] Active NavLink is visually highlighted
- [ ] Overview page shows site count, consent count, and plan
- [ ] Sign out button works and redirects to /login
- [ ] Layout is responsive: sidebar fixed left, content in main area
- [ ] No TypeScript errors

---

## Common issues
- **Sidebar overlaps content:** Make sure main has `ml-56` (same width as the sidebar)
- **NavLink not highlighting:** Pass `end={true}` to the Overview link so it only matches exactly `/dashboard`, not all `/dashboard/*`
