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
