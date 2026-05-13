import { useEffect, useState } from "react"
import { Link } from "react-router"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function loadSites() {
    const data = await api.get<Site[]>("/api/sites")
    setSites(data)
    setLoading(false)
  }

  useEffect(() => { loadSites() }, [])

  async function handleDelete(id: string) {
    await api.delete(`/api/sites/${id}`)
    setSites((s) => s.filter((site) => site.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      <PageHeader
        title="Sites"
        description="Manage your websites and banner configurations"
        action={
          <Button onClick={() => setShowCreate(true)}>Add site</Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Empty onAdd={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-2">
          {sites.map((site) => (
            <SiteRow
              key={site.id}
              site={site}
              onDelete={() => setDeleteId(site.id)}
            />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add a new site">
        <CreateSiteForm
          onSuccess={(site) => {
            setSites((s) => [site, ...s])
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete site?">
        <p className="text-sm text-neutral-500 mb-5">
          This will permanently delete the site and all its consent logs. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

function SiteRow({ site, onDelete }: { site: Site; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between bg-white border border-neutral-100 rounded-xl px-5 py-4 hover:border-neutral-200 transition group">
      <Link to={`/dashboard/sites/${site.id}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 group-hover:underline truncate">
          {site.name}
        </p>
        <p className="text-xs text-neutral-400 mt-0.5 truncate">{site.domain}</p>
      </Link>
      <div className="flex items-center gap-4 ml-4">
        <p className="text-xs text-neutral-400">
          {site._count?.consentLogs ?? 0} consents
        </p>
        <Link
          to={`/dashboard/sites/${site.id}`}
          className="text-xs text-neutral-500 hover:text-neutral-900 transition"
        >
          Configure →
        </Link>
        <button
          onClick={onDelete}
          className="text-xs text-neutral-400 hover:text-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-neutral-200 rounded-xl p-12 text-center">
      <p className="text-sm font-medium text-neutral-900 mb-1">No sites yet</p>
      <p className="text-sm text-neutral-400 mb-5">
        Add your first site to get your embed code
      </p>
      <Button onClick={onAdd}>Add your first site</Button>
    </div>
  )
}

function CreateSiteForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (site: Site) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const site = await api.post<Site>("/api/sites", { name, domain })
      onSuccess(site)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Site name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Portfolio"
          className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-neutral-700">Domain</label>
        <input
          type="text"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"
        />
        <p className="text-xs text-neutral-400">Without https:// or trailing slash</p>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create site</Button>
      </div>
    </form>
  )
}
