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
