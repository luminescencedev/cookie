# Day 6 — Auth pages (Login + Signup UI)

## Context
Days 1–5 done. Full backend is complete. Today we start the frontend. React Router is set up, and we build the login and signup pages using Tailwind v4 and the Better Auth client.

## Goal
By end of today, users can sign up and log in through the actual UI. After login they are redirected to /dashboard. Unauthenticated users hitting /dashboard are redirected to /login.

---

## Tasks

### 1. Install React Router v7
```bash
pnpm add react-router@7
```
> **React Router v7:** Package is now `react-router` only — `react-router-dom` is merged in. All imports come from `react-router`. The library mode API (BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams) is identical to v6.

### 2. Set up routing in App.tsx
`src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { useAuth } from "./lib/auth-context"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Landing from "./pages/Landing"
import DashboardIndex from "./pages/dashboard/Index"
import Sites from "./pages/dashboard/Sites"
import SiteDetail from "./pages/dashboard/SiteDetail"
import Settings from "./pages/dashboard/Settings"
import DashboardLayout from "./components/dashboard/Layout"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useAuth()
  if (isPending) return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useAuth()
  if (isPending) return null
  if (session) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<DashboardIndex />} />
          <Route path="sites" element={<Sites />} />
          <Route path="sites/:id" element={<SiteDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### 3. Build the Login page
`src/pages/Login.tsx`:
```tsx
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { signIn } from "../lib/auth-client"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn.email({ email, password })

    if (result.error) {
      setError(result.error.message ?? "Invalid credentials")
      setLoading(false)
      return
    }

    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          No account?{" "}
          <Link to="/signup" className="text-neutral-900 font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 4. Build the Signup page
`src/pages/Signup.tsx`:
```tsx
import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { signUp } from "../lib/auth-client"

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signUp.email({ name, email, password })

    if (result.error) {
      setError(result.error.message ?? "Something went wrong")
      setLoading(false)
      return
    }

    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-500">Free forever for 1 site</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-300 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link to="/login" className="text-neutral-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 5. Create stub pages to avoid import errors
Create these minimal stubs so App.tsx doesn't crash:

`src/pages/Landing.tsx`:
```tsx
export default function Landing() {
  return <div className="p-8">Landing page — coming on day 13</div>
}
```

`src/pages/dashboard/Index.tsx`:
```tsx
export default function DashboardIndex() {
  return <div className="p-8">Dashboard — coming on day 7</div>
}
```

`src/pages/dashboard/Sites.tsx`:
```tsx
export default function Sites() {
  return <div className="p-8">Sites — coming on day 8</div>
}
```

`src/pages/dashboard/SiteDetail.tsx`:
```tsx
export default function SiteDetail() {
  return <div className="p-8">Site detail — coming on day 9</div>
}
```

`src/pages/dashboard/Settings.tsx`:
```tsx
export default function Settings() {
  return <div className="p-8">Settings — coming on day 12</div>
}
```

`src/components/dashboard/Layout.tsx`:
```tsx
import { Outlet } from "react-router"
export default function DashboardLayout() {
  return <div><Outlet /></div>
}
```

### 6. Test manually
1. Go to `http://localhost:5173/signup` → create an account → should redirect to `/dashboard`
2. Go to `http://localhost:5173/login` → sign in → should redirect to `/dashboard`
3. Go directly to `http://localhost:5173/dashboard` without being logged in → should redirect to `/login`
4. After login, go to `/login` again → should redirect to `/dashboard` (GuestRoute)

---

## Definition of done
- [ ] `/signup` creates a new user and redirects to `/dashboard`
- [ ] `/login` signs in and redirects to `/dashboard`
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] `/login` and `/signup` redirect to `/dashboard` when already authenticated
- [ ] Error messages display correctly for wrong password
- [ ] No TypeScript errors

---

## Common issues
- **`signIn.email` is not a function:** Check Better Auth client version — the API might be `signIn({ email, password })` depending on version. Check their docs.
- **Redirect loop:** Make sure `isPending` is handled — without it, the GuestRoute might redirect before the session loads
- **CORS error:** Make sure `credentials: "include"` is in `api.ts` and the Hono CORS config has `credentials: true`
