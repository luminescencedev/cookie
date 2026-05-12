# Day 14 — Error handling, loading states, polish

## Context
Days 1–13 done. All features are built. Today is about making the product feel solid: handle errors gracefully, add loading states everywhere, clean up edge cases. Rate limiting is already handled via Upstash Redis (Day 4) — no in-memory maps needed here.

## Goal
By end of today, no page crashes or shows blank screens. Every async operation has a loading state. Every API error is communicated to the user. The app feels production-ready.

---

## Tasks

### 1. Create a global error boundary
`src/components/ErrorBoundary.tsx`:
```tsx
import { Component, type ReactNode } from "react"
import { Link } from "react-router"

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium text-neutral-900 mb-2">Something went wrong</p>
            <p className="text-xs text-neutral-400 mb-6 font-mono">
              {this.state.error?.message}
            </p>
            <Link to="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
              Back to dashboard
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap the app in `src/main.tsx`:
```tsx
import ErrorBoundary from "./components/ErrorBoundary"

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 2. Create a toast notification system
`src/components/ui/Toast.tsx`:
```tsx
import { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-white border-neutral-200 text-neutral-700"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be inside ToastProvider")
  return ctx.toast
}
```

Add `ToastProvider` to `src/main.tsx`.

### 3. Add a 404 page
`src/pages/NotFound.tsx`:
```tsx
import { Link } from "react-router"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-semibold text-neutral-200 mb-4">404</p>
        <p className="text-sm font-medium text-neutral-900 mb-1">Page not found</p>
        <p className="text-sm text-neutral-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-900 underline">
          Go home
        </Link>
      </div>
    </div>
  )
}
```

Add as `<Route path="*" element={<NotFound />} />` in `App.tsx`.

### 4. Add a loading spinner
`src/components/ui/Spinner.tsx`:
```tsx
export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }
  return (
    <div className={`${sizes[size]} border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin`} />
  )
}
```

Use in `ProtectedRoute` in `App.tsx`:
```tsx
if (isPending) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )
}
```

### 5. Walk through every page and verify these states

**Login/Signup:**
- [ ] Wrong password → error message
- [ ] Double-click submit → button disabled while loading

**Sites list:**
- [ ] Skeleton while fetching
- [ ] Empty state when no sites
- [ ] Delete confirmation modal

**Site detail:**
- [ ] Loading state while fetching
- [ ] Save button disabled while saving
- [ ] Saved message disappears after 2s with re-consent notice
- [ ] Color inputs handle empty string gracefully

**Analytics:**
- [ ] Skeleton while loading
- [ ] Empty state when no data
- [ ] All three choice types (accepted/partial/rejected) appear correctly

**Settings:**
- [ ] Skeleton on subscription + usage fetch
- [ ] Usage bar renders with correct color at different thresholds
- [ ] Success/canceled banners from URL params

### 6. Verify CORS is correct
In `api/index.ts`, confirm the ordering:
```typescript
// 1. Public CORS for snippet — must come first, before the credentialed middleware
app.use("/api/consent/*", cors({ origin: "*" }))

// 2. Credentialed CORS for dashboard routes
app.use("*", cors({
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
  credentials: true,
}))
```

The `/api/consent/*` wildcard must be registered before the global `*` middleware, otherwise Hono applies the credentialed CORS to snippet requests, which breaks external domains.

### 7. Verify Upstash rate limiter fails open
In `api/routes/consent.ts`, both rate limit calls are already wrapped in `try/catch` with a fail-open pattern:
```typescript
try {
  const { success } = await consentRatelimit.limit(siteId)
  if (!success) return c.json({ error: "Too many requests" }, 429)
} catch {
  // Upstash unreachable → let the request through
}
```
This means if Upstash is down (e.g. cold start, network issue), the banner still works. Rate limiting is best-effort, not a blocker.

### 8. TypeScript check
```bash
pnpm tsc --noEmit
```
Fix all errors before calling Day 14 done.

---

## Definition of done
- [ ] No page crashes for any error state
- [ ] All async operations have loading states
- [ ] 404 page works for unknown routes
- [ ] Error boundary catches unexpected React errors
- [ ] CORS middleware order is correct (consent/* before *)
- [ ] Rate limiter fails open (no silent banner breakage)
- [ ] `tsc --noEmit` passes with 0 errors

---

## Notes on rate limiting
The Upstash-based rate limiter from Day 4 is the correct, production-safe approach. It uses a sliding window stored in Redis so state persists across Vercel function instances and cold starts. There is no in-memory fallback — if Upstash is unreachable, we fail open to keep the banner working. For most consent scenarios this is the right tradeoff.
