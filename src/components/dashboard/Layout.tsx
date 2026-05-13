import { Outlet } from "react-router"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: "240px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "32px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
