import { useEffect, useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { RiGlobalLine, RiArrowRightLine, RiAddLine, RiDeleteBinLine, RiSettings3Line } from "react-icons/ri"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import Modal from "../../components/ui/Modal"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      <PageHeader
        title="Sites"
        description="Manage your websites and banner configurations"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <RiAddLine size={14} /> Add site
          </Button>
        }
      />

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse" style={{ height: "68px", borderRadius: "12px", background: "var(--surface)" }} />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <Empty onAdd={() => setShowCreate(true)} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sites.map((site, i) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease, delay: i * 0.05 }}
            >
              <SiteRow site={site} onDelete={() => setDeleteId(site.id)} />
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add a new site">
        <CreateSiteForm
          onSuccess={(site) => { setSites((s) => [site, ...s]); setShowCreate(false) }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete site?">
        <p className="text-sm" style={{ color: "var(--muted)", marginBottom: "20px" }}>
          This will permanently delete the site and all its consent logs. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>Delete site</Button>
        </div>
      </Modal>
    </motion.div>
  )
}

function SiteRow({ site, onDelete }: { site: Site; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <Link to={`/dashboard/sites/${site.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0, textDecoration: "none" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "var(--surface-2)",
          color: "var(--muted)",
        }}>
          <RiGlobalLine size={16} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{site.name}</p>
          <p className="text-xs truncate" style={{ color: "var(--muted)", marginTop: "2px" }}>{site.domain}</p>
        </div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "16px", flexShrink: 0 }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {(site._count?.consentLogs ?? 0).toLocaleString()} consents
        </span>
        <Link
          to={`/dashboard/sites/${site.id}`}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--muted)", textDecoration: "none" }}
        >
          <RiSettings3Line size={13} /> Configure
        </Link>
        <button
          onClick={onDelete}
          style={{
            padding: "6px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--muted)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--red-dim)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <RiDeleteBinLine size={14} />
        </button>
        <RiArrowRightLine size={14} style={{ color: "var(--subtle)" }} />
      </div>
    </motion.div>
  )
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      whileHover={{ borderColor: "var(--accent)" }}
      onClick={onAdd}
      style={{
        border: "1px dashed var(--border-2)",
        borderRadius: "12px",
        padding: "56px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        background: "var(--accent-dim)",
        color: "var(--accent)",
      }}>
        <RiGlobalLine size={22} />
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--text)", marginBottom: "4px" }}>No sites yet</p>
      <p className="text-sm" style={{ color: "var(--muted)", marginBottom: "20px" }}>
        Add your first site to get your embed code
      </p>
      <Button onClick={(e) => { e.stopPropagation(); onAdd() }}>
        <RiAddLine size={14} /> Add your first site
      </Button>
    </motion.div>
  )
}

function CreateSiteForm({ onSuccess, onCancel }: {
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div className="text-sm" style={{ borderRadius: "8px", padding: "12px 16px", background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.2)" }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Site name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Portfolio"
          className="text-sm"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", boxSizing: "border-box" }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Domain</label>
        <input
          type="text"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="text-sm"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", boxSizing: "border-box" }}
        />
        <p className="text-xs" style={{ color: "var(--muted)" }}>Without https:// or trailing slash</p>
      </div>
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", paddingTop: "4px" }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>Create site</Button>
      </div>
    </form>
  )
}
