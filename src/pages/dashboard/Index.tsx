import { useEffect, useState } from "react"
import { Link } from "react-router"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"

export default function DashboardIndex() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Site[]>("/api/sites")
      .then(setSites)
      .finally(() => setLoading(false))
  }, [])

  const totalConsent = sites.reduce((sum, s) => sum + (s._count?.consentLogs ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Overview</h1>
        <p className="text-sm text-neutral-500 mt-1">Your cookie consent dashboard</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total sites" value={loading ? "—" : String(sites.length)} />
        <StatCard label="Total consents" value={loading ? "—" : String(totalConsent)} />
        <StatCard label="Plan" value="Free" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-900">Your sites</h2>
          <Link
            to="/dashboard/sites"
            className="text-xs text-neutral-500 hover:text-neutral-700 transition"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400">Loading...</p>
        ) : sites.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-sm text-neutral-500 mb-3">No sites yet</p>
            <Link
              to="/dashboard/sites"
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              Add your first site →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sites.slice(0, 3).map((site) => (
              <Link
                key={site.id}
                to={`/dashboard/sites/${site.id}`}
                className="flex items-center justify-between bg-white border border-neutral-100 rounded-xl px-5 py-4 hover:border-neutral-200 transition"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{site.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{site.domain}</p>
                </div>
                <p className="text-xs text-neutral-400">
                  {site._count?.consentLogs ?? 0} consents
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl px-5 py-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}
