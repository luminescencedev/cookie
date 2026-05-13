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
      <div className="h-16 flex items-center px-6 border-b border-neutral-100">
        <span className="font-semibold text-neutral-900 text-sm tracking-tight">
          CookieConsent
        </span>
      </div>

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
