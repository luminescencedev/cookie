import { Outlet } from "react-router"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 ml-55 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
