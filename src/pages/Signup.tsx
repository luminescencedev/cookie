import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "motion/react"
import { RiShieldCheckLine, RiMailLine, RiLockLine, RiUserLine } from "react-icons/ri"
import { signUp } from "../lib/auth-client"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 16px",
      position: "relative",
      background: "var(--bg)",
    }}>
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-glow), transparent 70%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ width: "100%", maxWidth: "384px", position: "relative", zIndex: 10 }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--accent-dim)",
            color: "var(--accent)",
          }}>
            <RiShieldCheckLine size={22} />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="text-2xl font-bold font-display" style={{ color: "var(--text)" }}>Create your account</h1>
          <p className="text-sm" style={{ color: "var(--muted)", marginTop: "8px" }}>Free forever for 1 site</p>
        </div>

        <div style={{
          borderRadius: "16px",
          border: "1px solid var(--border)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "var(--surface)",
        }}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm"
              style={{
                borderRadius: "8px",
                padding: "12px 16px",
                background: "var(--red-dim)",
                color: "var(--red)",
                border: "1px solid rgba(248,113,113,0.2)",
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Name</label>
              <div style={{ position: "relative" }}>
                <RiUserLine
                  size={15}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-sm"
                  style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Email</label>
              <div style={{ position: "relative" }}>
                <RiMailLine
                  size={15}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="text-sm"
                  style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <RiLockLine
                  size={15}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }}
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="text-sm"
                  style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "10px", paddingBottom: "10px", borderRadius: "8px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="text-sm font-semibold"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                background: "var(--accent)",
                color: "var(--bg)",
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </form>
        </div>

        <p className="text-sm" style={{ marginTop: "20px", textAlign: "center", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium" style={{ color: "var(--text)" }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
