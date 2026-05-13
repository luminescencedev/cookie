import { useEffect, useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import {
  RiGlobalLine,
  RiArrowRightLine,
  RiAddLine,
  RiBarChartLine,
  RiShieldCheckLine,
} from "react-icons/ri"
import { api } from "../../lib/api"
import type { Site } from "../../lib/types"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
}

export default function DashboardIndex() {
  const [sites, setSites]   = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Site[]>("/api/sites").then(setSites).finally(() => setLoading(false))
  }, [])

  const totalConsent = sites.reduce((sum, s) => sum + (s._count?.consentLogs ?? 0), 0)

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-sm font-medium text-neutral-800">Overview</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Your consent stats at a glance</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid grid-cols-3 gap-3">
        <StatCard icon={RiGlobalLine}     label="Total sites"    value={loading ? "—" : String(sites.length)} />
        <StatCard icon={RiBarChartLine}   label="Total consents" value={loading ? "—" : totalConsent.toLocaleString()} />
        <StatCard icon={RiShieldCheckLine} label="Plan"          value="Free" />
      </motion.div>

      {/* Sites list */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-neutral-800">Your sites</h2>
          <Link
            to="/dashboard/sites"
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-800 transition-colors underline-offset-2"
          >
            View all <RiArrowRightLine size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-px">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <Link to="/dashboard/sites" className="no-underline">
            <motion.div
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              className="border border-dashed border-neutral-200 rounded-2xl p-10 text-center cursor-pointer transition-colors"
            >
              <div className="size-9 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                <RiAddLine size={17} />
              </div>
              <p className="text-sm font-medium text-neutral-800">Add your first site</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                GDPR-compliant banner in 2 minutes
              </p>
            </motion.div>
          </Link>
        ) : (
          <motion.ul variants={stagger} className="rounded-2xl border border-neutral-200 overflow-hidden">
            {sites.slice(0, 3).map((site, i) => (
              <motion.li
                key={site.id}
                variants={fadeUp}
                className={i < Math.min(sites.length, 3) - 1 ? "border-b border-neutral-200" : ""}
              >
                <Link
                  to={`/dashboard/sites/${site.id}`}
                  className="h-14 grid grid-cols-[1fr_auto] items-center gap-4 px-4 hover:bg-black/5 transition-colors no-underline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-neutral-100 text-neutral-400 flex items-center justify-center shrink-0">
                      <RiGlobalLine size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{site.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">{site.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm text-neutral-400">
                      {(site._count?.consentLogs ?? 0).toLocaleString()} consents
                    </span>
                    <RiArrowRightLine size={13} className="text-neutral-300" />
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </motion.div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-neutral-200 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-neutral-400 shrink-0" />
        <p className="text-xs text-neutral-400">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-neutral-900 tracking-tight">{value}</p>
    </motion.div>
  )
}
