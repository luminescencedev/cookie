import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "motion/react"
import { RiShieldCheckLine } from "react-icons/ri"
import { signUp } from "../lib/auth-client"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="min-h-screen flex bg-white">
      {/* Left branding panel */}
      <div className="hidden sm:flex w-2/5 bg-neutral-50 border-r border-neutral-200 p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <RiShieldCheckLine size={13} />
          </div>
          <span className="text-sm font-medium text-neutral-800">CookieConsent</span>
        </div>
        <div className="space-y-4">
          <p className="text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
            GDPR compliance<br />in under 2 minutes.
          </p>
          <ul className="space-y-2.5">
            {[
              "Free forever for 1 site",
              "5 000 consent events/month",
              "No credit card required",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-neutral-500">
                <span className="size-1.5 rounded-full bg-neutral-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
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
            <h1 className="text-sm font-medium text-neutral-800 mb-1">Create your account</h1>
            <p className="text-sm text-neutral-500">Free forever · no card needed</p>
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
              <label className="text-sm font-medium text-neutral-800">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
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
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </form>

          <p className="mt-6 text-sm text-neutral-500 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-neutral-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-sm"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
