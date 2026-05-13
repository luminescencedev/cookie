import { useEffect, useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import {
  RiGlobalLine,
  RiArrowRightLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSettings3Line,
} from "react-icons/ri"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

export default function Sites() {
  const [sites, setSites]           = useState<Site[]>([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <PageHeader
        title="Sites"
        description="Manage your websites and banner configurations"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <RiAddLine size={13} /> Add site
          </Button>
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-14 bg-neutral-50 animate-pulse ${i < 2 ? "border-b border-neutral-200" : ""}`}
            />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Empty onAdd={() => setShowCreate(true)} />
      ) : (
        <ul className="rounded-2xl border border-neutral-200 overflow-hidden">
          {sites.map((site, i) => (
            <motion.li
              key={site.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease, delay: i * 0.04 }}
              className={i < sites.length - 1 ? "border-b border-neutral-200" : ""}
            >
              <SiteRow site={site} onDelete={() => setDeleteId(site.id)} />
            </motion.li>
          ))}
        </ul>
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
        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
          This will permanently delete the site and all its consent logs. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>
            Delete site
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}

function SiteRow({ site, onDelete }: { site: Site; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="h-14 grid grid-cols-[1fr_auto] items-center gap-4 px-4 hover:bg-black/5 transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/dashboard/sites/${site.id}`}
        className="flex items-center gap-3 min-w-0 no-underline"
      >
        <div className="size-8 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
          <RiGlobalLine size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-800 truncate">{site.name}</p>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">{site.domain}</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm text-neutral-400">
          {(site._count?.consentLogs ?? 0).toLocaleString()} consents
        </span>
        <Link
          to={`/dashboard/sites/${site.id}`}
          className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-800 transition-colors no-underline"
        >
          <RiSettings3Line size={13} /> Configure
        </Link>
        <button
          onClick={onDelete}
          className={`flex items-center justify-center size-7 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <RiDeleteBinLine size={14} />
        </button>
        <RiArrowRightLine size={13} className="text-neutral-300" />
      </div>
    </div>
  )
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
      onClick={onAdd}
      className="border border-dashed border-neutral-200 rounded-2xl p-14 text-center cursor-pointer transition-colors"
    >
      <div className="size-10 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-4">
        <RiGlobalLine size={18} />
      </div>
      <p className="text-sm font-medium text-neutral-800 mb-1">No sites yet</p>
      <p className="text-sm text-neutral-500 mb-6">
        Add your first site to get your embed code
      </p>
      <Button onClick={(e) => { e.stopPropagation(); onAdd() }}>
        <RiAddLine size={13} /> Add your first site
      </Button>
    </motion.div>
  )
}

function CreateSiteForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (site: Site) => void
  onCancel: () => void
}) {
  const [name, setName]     = useState("")
  const [domain, setDomain] = useState("")
  const [error, setError]   = useState<string | null>(null)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-800">Site name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Portfolio"
          className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-800">Domain</label>
        <input
          type="text"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
        />
        <p className="text-xs text-neutral-400">Without https:// or trailing slash</p>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create site</Button>
      </div>
    </form>
  )
}
