import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "motion/react"
import { RiShieldCheckLine } from "react-icons/ri"
import { signIn } from "../lib/auth-client"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="min-h-screen flex bg-white">
      {/* Left branding panel */}
      <div className="hidden sm:flex w-2/5 bg-neutral-50 border-r border-neutral-200 p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <RiShieldCheckLine size={13} />
          </div>
          <span className="text-sm font-medium text-neutral-800">CookieConsent</span>
        </div>
        <blockquote className="max-w-xs space-y-3">
          <p className="text-sm leading-relaxed text-neutral-800">
            "Set up in 2 minutes, saves hours of GDPR headaches."
          </p>
          <cite className="text-sm text-neutral-400 not-italic">— A happy developer</cite>
        </blockquote>
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} CookieConsent
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="w-full max-w-sm"
        >
          {/* Mobile-only logo */}
          <div className="flex items-center gap-2.5 mb-10 sm:hidden">
            <div className="size-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <RiShieldCheckLine size={13} />
            </div>
            <span className="text-sm font-medium text-neutral-800">CookieConsent</span>
          </div>

          <div className="mb-8">
            <h1 className="text-sm font-medium text-neutral-800 mb-1">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-800">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-800">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              />
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              type="submit"
              disabled={loading}
              className="mt-1 w-full h-10 flex items-center justify-center gap-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 transition-colors"
            >
              {loading && (
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <p className="mt-6 text-sm text-neutral-500 text-center">
            No account?{" "}
            <Link
              to="/signup"
              className="font-medium text-neutral-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-sm"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
