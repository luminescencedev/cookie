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

const LANGUAGES = [
  { value: "auto", label: "Auto-detect (browser language)" },
  { value: "en",   label: "English" },
  { value: "fr",   label: "Français" },
  { value: "de",   label: "Deutsch" },
  { value: "es",   label: "Español" },
  { value: "it",   label: "Italiano" },
]

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "0.875rem",
  boxSizing: "border-box",
}

export default function SiteDetail() {
  const { id } = useParams<{ id: string }>()
  const [site, setSite] = useState<Site | null>(null)
  const [config, setConfig] = useState<BannerConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
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

  if (loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
  if (!site || !config) return <p className="text-sm" style={{ color: "var(--red)" }}>Site not found</p>

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      <PageHeader
        title={site.name}
        description={site.domain}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 500, color: "var(--accent)" }}
              >
                <RiCheckLine size={13} /> Saved — visitors will be re-asked
              </motion.span>
            )}
            <Button onClick={handleSave} loading={saving}>
              <RiSaveLine size={14} /> Save changes
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "4px",
        borderRadius: "12px",
        padding: "4px",
        width: "fit-content",
        marginBottom: "24px",
        background: "var(--surface)",
      }}>
        {(["configure", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-sm font-medium"
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              background: tab === t ? "var(--surface-2)" : "transparent",
              color: tab === t ? "var(--text)" : "var(--muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}
          >
            {t === "configure" ? "Configure" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "analytics" && <Analytics siteId={site.id} />}

      {tab === "configure" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Section title="Language">
              <Field label="Banner language">
                <select
                  value={config.language}
                  onChange={(e) => updateConfig("language", e.target.value as BannerConfig["language"])}
                  style={inputStyle}
                >
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                "Auto-detect" uses the visitor's browser language, falls back to English.
              </p>
            </Section>

            <Section title="Content">
              <Field label="Title">
                <input type="text" value={config.title} onChange={(e) => updateConfig("title", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Description">
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Accept button">
                  <input type="text" value={config.acceptLabel} onChange={(e) => updateConfig("acceptLabel", e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Reject button">
                  <input type="text" value={config.rejectLabel} onChange={(e) => updateConfig("rejectLabel", e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Privacy policy URL">
                <input
                  type="url"
                  value={config.privacyPolicyUrl ?? ""}
                  onChange={(e) => updateConfig("privacyPolicyUrl", e.target.value || null)}
                  placeholder="https://yoursite.com/privacy"
                  style={inputStyle}
                />
                <p className="text-xs" style={{ color: "var(--muted)", marginTop: "4px" }}>
                  Strongly recommended for GDPR compliance.
                </p>
              </Field>
            </Section>

            <Section title="Consent categories">
              <p className="text-xs" style={{ color: "var(--muted)", marginBottom: "12px" }}>
                Necessary cookies are always active. Enable others to show granular toggles.
              </p>
              <CategoryRow label="Necessary" description="Required for the site to function." enabled alwaysOn onChange={() => {}} />
              <CategoryRow label="Analytics" description="e.g. Google Analytics, Plausible." enabled={config.analyticsEnabled} alwaysOn={false} onChange={(v) => updateConfig("analyticsEnabled", v)} />
              <CategoryRow label="Marketing" description="e.g. Facebook Pixel, Google Ads." enabled={config.marketingEnabled} alwaysOn={false} onChange={(v) => updateConfig("marketingEnabled", v)} />
            </Section>

            <Section title="Appearance">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Primary color">
                  <ColorField value={config.primaryColor} onChange={(v) => updateConfig("primaryColor", v)} />
                </Field>
                <Field label="Background color">
                  <ColorField value={config.backgroundColor} onChange={(v) => updateConfig("backgroundColor", v)} />
                </Field>
              </div>
              <Field label="Position">
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["bottom", "modal"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateConfig("position", pos)}
                      className="text-sm"
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: `1px solid ${config.position === pos ? "var(--accent)" : "var(--border-2)"}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background: config.position === pos ? "var(--accent-dim)" : "transparent",
                        color: config.position === pos ? "var(--accent)" : "var(--muted)",
                      }}
                    >
                      {pos === "bottom" ? "Bottom bar" : "Modal"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Branding">
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <Toggle checked={config.showBranding} onChange={(v) => updateConfig("showBranding", v)} />
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    Show "Powered by CookieConsent"
                  </span>
                  {!config.showBranding && (
                    <span className="text-xs font-medium" style={{ padding: "2px 6px", borderRadius: "9999px", background: "var(--accent-dim)", color: "var(--accent)" }}>
                      Pro
                    </span>
                  )}
                </label>
              </Field>
            </Section>

            <Section title="Embed code">
              <EmbedCode siteId={site.id} configVersion={config.configVersion} />
            </Section>
          </div>

          <div style={{ position: "sticky", top: "32px" }}>
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)", marginBottom: "12px" }}>
              Live preview
            </p>
            <BannerPreview config={config} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: "12px",
      border: "1px solid var(--border)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      background: "var(--surface)",
    }}>
      <h3 className="text-sm font-semibold font-display" style={{ color: "var(--text)" }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</label>
      {children}
    </div>
  )
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        style={{ height: "40px", width: "40px", borderRadius: "8px", cursor: "pointer", border: "1px solid var(--border-2)", padding: "2px", background: "var(--surface-2)", boxSizing: "border-box" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, flex: 1 }}
        placeholder="#000000"
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: "36px",
        height: "20px",
        borderRadius: "9999px",
        border: "1px solid var(--border-2)",
        cursor: "pointer",
        flexShrink: 0,
        background: checked ? "var(--accent)" : "var(--surface-2)",
        transition: "background 0.2s",
      }}
    >
      <motion.div
        animate={{ x: checked ? 16 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute",
          top: "2px",
          width: "14px",
          height: "14px",
          borderRadius: "9999px",
          background: checked ? "var(--bg)" : "var(--muted)",
        }}
      />
    </button>
  )
}

function CategoryRow({ label, description, enabled, alwaysOn, onChange }: {
  label: string; description: string; enabled: boolean; alwaysOn: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1, paddingRight: "16px" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</p>
        <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>{description}</p>
      </div>
      {alwaysOn ? (
        <span className="text-xs" style={{ padding: "4px 8px", borderRadius: "9999px", background: "var(--surface-2)", color: "var(--muted)" }}>
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
    <div>
      <div style={{
        borderRadius: "8px",
        padding: "12px",
        fontFamily: "monospace",
        fontSize: "0.75rem",
        wordBreak: "break-all",
        lineHeight: 1.6,
        marginBottom: "12px",
        background: "var(--surface-2)",
        border: "1px solid var(--border-2)",
        color: "var(--muted)",
      }}>
        {code}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? <><RiCheckLine size={13} /> Copied!</> : <><RiCodeLine size={13} /> Copy embed code</>}
        </Button>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Config version: <strong style={{ color: "var(--text)" }}>{configVersion}</strong>
        </p>
      </div>
    </div>
  )
}
