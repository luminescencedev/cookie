import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { motion } from "motion/react"
import { RiSaveLine, RiCheckLine, RiCodeLine } from "react-icons/ri"
import { api } from "../../lib/api"
import type { Site, BannerConfig } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import BannerPreview from "../../components/dashboard/BannerPreview"
import Analytics from "../../components/dashboard/Analytics"

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98]

const INPUT_CLS = "w-full px-3 py-2 text-sm text-neutral-800 bg-white border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"

const LANGUAGES = [
  { value: "auto", label: "Auto-detect (browser language)" },
  { value: "en",   label: "English" },
  { value: "fr",   label: "Français" },
  { value: "de",   label: "Deutsch" },
  { value: "es",   label: "Español" },
  { value: "it",   label: "Italiano" },
]

export default function SiteDetail() {
  const { id } = useParams<{ id: string }>()
  const [site, setSite]     = useState<Site | null>(null)
  const [config, setConfig] = useState<BannerConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"configure" | "analytics">("configure")

  useEffect(() => {
    api.get<Site>(`/api/sites/${id}`).then((data) => {
      setSite(data)
      setConfig(data.config)
      setLoading(false)
    })
  }, [id])

  function updateConfig<K extends keyof BannerConfig>(field: K, value: BannerConfig[K]) {
    setConfig((c) => (c ? { ...c, [field]: value } : c))
    setSaved(false)
  }

  async function handleSave() {
    if (!config || !id) return
    setSaving(true)
    const { id: _id, siteId: _siteId, configVersion: _cv, ...updates } = config
    const updated = await api.patch<BannerConfig>(`/api/sites/${id}/config`, updates)
    setConfig(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>
  if (!site || !config) return <p className="text-sm text-red-500">Site not found</p>

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
      <PageHeader
        title={site.name}
        description={site.domain}
        action={
          <div className="flex items-center gap-3">
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-xs font-medium text-green-600"
              >
                <RiCheckLine size={13} /> Saved
              </motion.span>
            )}
            <Button onClick={handleSave} loading={saving}>
              <RiSaveLine size={13} /> Save changes
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0 border-b border-neutral-200 mb-7">
        {(["configure", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 cursor-pointer transition-colors ${
              tab === t
                ? "border-neutral-900 font-medium text-neutral-800"
                : "border-transparent font-normal text-neutral-400 hover:text-neutral-800"
            }`}
          >
            {t === "configure" ? "Configure" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "analytics" && <Analytics siteId={site.id} />}

      {tab === "configure" && (
        <div className="grid grid-cols-2 gap-7">
          <div className="flex flex-col gap-3">
            <ConfigSection title="Language">
              <Field label="Banner language">
                <select
                  value={config.language}
                  onChange={(e) => updateConfig("language", e.target.value as BannerConfig["language"])}
                  className={INPUT_CLS}
                >
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <p className="text-xs text-neutral-400">
                "Auto-detect" uses the visitor's browser language, falls back to English.
              </p>
            </ConfigSection>

            <ConfigSection title="Content">
              <Field label="Title">
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  className={INPUT_CLS}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  rows={3}
                  className={`${INPUT_CLS} resize-none`}
                />
              </Field>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Accept button">
                  <input
                    type="text"
                    value={config.acceptLabel}
                    onChange={(e) => updateConfig("acceptLabel", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label="Reject button">
                  <input
                    type="text"
                    value={config.rejectLabel}
                    onChange={(e) => updateConfig("rejectLabel", e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
              <Field label="Privacy policy URL">
                <input
                  type="url"
                  value={config.privacyPolicyUrl ?? ""}
                  onChange={(e) => updateConfig("privacyPolicyUrl", e.target.value || null)}
                  placeholder="https://yoursite.com/privacy"
                  className={INPUT_CLS}
                />
                <p className="text-xs text-neutral-400 mt-1">Strongly recommended for GDPR compliance.</p>
              </Field>
            </ConfigSection>

            <ConfigSection title="Consent categories">
              <p className="text-xs text-neutral-400">
                Necessary cookies are always active. Enable others to show granular toggles.
              </p>
              <CategoryRow label="Necessary"  description="Required for the site to function."      enabled alwaysOn onChange={() => {}} />
              <CategoryRow label="Analytics"  description="e.g. Google Analytics, Plausible."       enabled={config.analyticsEnabled} alwaysOn={false} onChange={(v) => updateConfig("analyticsEnabled", v)} />
              <CategoryRow label="Marketing"  description="e.g. Facebook Pixel, Google Ads."        enabled={config.marketingEnabled} alwaysOn={false} onChange={(v) => updateConfig("marketingEnabled", v)} />
            </ConfigSection>

            <ConfigSection title="Appearance">
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Primary color">
                  <ColorField value={config.primaryColor}    onChange={(v) => updateConfig("primaryColor", v)} />
                </Field>
                <Field label="Background color">
                  <ColorField value={config.backgroundColor} onChange={(v) => updateConfig("backgroundColor", v)} />
                </Field>
              </div>
              <Field label="Position">
                <div className="flex gap-2">
                  {(["bottom", "modal"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateConfig("position", pos)}
                      className={`flex-1 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                        config.position === pos
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      {pos === "bottom" ? "Bottom bar" : "Modal"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Branding">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Toggle checked={config.showBranding} onChange={(v) => updateConfig("showBranding", v)} />
                  <span className="text-sm text-neutral-800">Show "Powered by CookieConsent"</span>
                  {!config.showBranding && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 border border-neutral-200">
                      Pro
                    </span>
                  )}
                </label>
              </Field>
            </ConfigSection>

            <ConfigSection title="Embed code">
              <EmbedCode siteId={site.id} configVersion={config.configVersion} />
            </ConfigSection>
          </div>

          <div className="sticky top-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">
              Live preview
            </p>
            <BannerPreview config={config} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-3.5">
      <h3 className="text-sm font-medium text-neutral-800">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-neutral-400">{label}</label>
      {children}
    </div>
  )
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 rounded-lg cursor-pointer border border-neutral-200 p-0.5 bg-white shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className={INPUT_CLS}
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full border shrink-0 transition-colors cursor-pointer ${
        checked ? "bg-neutral-900 border-neutral-900" : "bg-neutral-100 border-neutral-200"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 16 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 size-4 rounded-full"
        style={{ background: checked ? "#fff" : "#a3a3a3" }}
      />
    </button>
  )
}

function CategoryRow({ label, description, enabled, alwaysOn, onChange }: {
  label: string; description: string; enabled: boolean; alwaysOn: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      {alwaysOn ? (
        <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-400">
          Always active
        </span>
      ) : (
        <Toggle checked={enabled} onChange={onChange} />
      )}
    </div>
  )
}

function EmbedCode({ siteId, configVersion }: { siteId: string; configVersion: number }) {
  const [copied, setCopied] = useState(false)
  const code = `<script src="${import.meta.env.VITE_API_URL}/banner.js" data-site-id="${siteId}" async></script>`

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 font-mono text-xs text-neutral-500 break-all leading-relaxed">
        {code}
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied
            ? <><RiCheckLine size={12} /> Copied!</>
            : <><RiCodeLine size={12} /> Copy embed code</>
          }
        </Button>
        <p className="text-xs text-neutral-400">
          Config v<span className="font-medium text-neutral-800">{configVersion}</span>
        </p>
      </div>
    </div>
  )
}
