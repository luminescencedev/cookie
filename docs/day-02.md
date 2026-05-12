# Day 2 — Better Auth setup (server + client)

## Context
Day 1 is done. Project is scaffolded, Prisma schema is pushed to Supabase, Hono server runs on port 3000, Vite runs on port 5173.

## Goal
By end of today, Better Auth is fully configured on both server and client. Users can sign up and log in via the API. Sessions are stored in the database.

---

## Tasks

### 1. Install Better Auth
```bash
pnpm add better-auth
```

### 2. Set up Better Auth server
`api/lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: [
    process.env.FRONTEND_URL ?? "http://localhost:5173",
  ],
})

export type Session = typeof auth.$Infer.Session
```

### 3. Create auth route (Hono passthrough)
`api/routes/auth.ts`:
```typescript
import { Hono } from "hono"
import { auth } from "../lib/auth"

export const authRoutes = new Hono()

authRoutes.on(["GET", "POST"], "/**", (c) => {
  return auth.handler(c.req.raw)
})
```

### 4. Create auth middleware (reusable)
`api/lib/middleware.ts`:
```typescript
import { createMiddleware } from "hono/factory"
import { auth } from "./auth"

export const requireAuth = createMiddleware<{
  Variables: { userId: string }
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  c.set("userId", session.user.id)
  await next()
})
```

### 5. Mount auth routes in Hono entry
`api/index.ts`:
```typescript
import { Hono } from "hono"
import { cors } from "hono/cors"
import { authRoutes } from "./routes/auth"

const app = new Hono()

app.use("*", cors({
  origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
  credentials: true,
}))

app.get("/health", (c) => c.json({ ok: true }))
app.route("/api/auth", authRoutes)

export default app
```

### 6. Set up Better Auth client (frontend)
`src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient
```

### 7. Create typed API wrapper
`src/lib/api.ts`:
```typescript
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error ?? "Request failed")
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
}
```

### 8. Create a basic auth context
`src/lib/auth-context.tsx`:
```tsx
import { createContext, useContext } from "react"
import { useSession } from "./auth-client"

const AuthContext = createContext<ReturnType<typeof useSession> | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSession()
  return (
    <AuthContext.Provider value={session}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
```

### 9. Wrap app with AuthProvider
`src/main.tsx`:
```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { AuthProvider } from "./lib/auth-context"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)
```

### 10. Test auth via the API directly
With both servers running, test these with curl or any HTTP client:

**Sign up:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'
```
Expected: `{ "user": { "id": "...", "email": "test@test.com" }, "session": {...} }`

**Sign in:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```
Expected: session token in response + Set-Cookie header

**Get session:**
```bash
curl http://localhost:3000/api/auth/get-session \
  -H "Cookie: [cookie from sign-in response]"
```
Expected: user + session object

### 11. Verify in Prisma Studio
```bash
pnpm db:studio
```
Check that User, Session, and Account tables have rows after signing up.

---

## Definition of done
- [ ] `POST /api/auth/sign-up/email` creates a user in the database
- [ ] `POST /api/auth/sign-in/email` returns a session with a cookie
- [ ] `GET /api/auth/get-session` returns the user when cookie is provided
- [ ] `requireAuth` middleware correctly returns 401 when no session is provided
- [ ] No TypeScript errors in `api/lib/auth.ts` or `api/lib/middleware.ts`

---

## Common issues
- **Better Auth not finding tables:** Make sure you ran `prisma db push` on Day 1 and the Session/Account/Verification models exist
- **CORS error on cookie:** Make sure `credentials: true` is set in both the Hono CORS config and fetch calls
- **`auth.handler` type error:** Check Better Auth version — import path may differ slightly between versions, check their docs
