import { createContext, useContext } from "react"
import { useSession } from "./auth-client"

const AuthContext = createContext<ReturnType<typeof useSession> | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useSession()
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
