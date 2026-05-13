import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { api } from "../../lib/api"
import type { Site, BannerConfig } from "../../lib/types"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import BannerPreview from "../../components/dashboard/BannerPreview"
import Analytics from "../../components/dashboard/Analytics"

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
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading...</p>
  if (!site || !config) return <p className="text-sm text-red-500">Site not found</p>

  return (
    <div>
      <PageHeader
        title={site.name}
        description={site.domain}
        action={
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Saved — visitors will be asked to re-consent
              </span>
            )}
            <Button onClick={handleSave} loading={saving}>Save changes</Button>
          </div>
        }
      />

      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit mb-6">
        {(["configure", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md transition ${
              tab === t
                ? "bg-white shadow-sm font-medium text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t === "configure" ? "Configure" : "Analytics"}
          </button>
        ))}
      </div>

      {tab === "analytics" && <Analytics siteId={site.id} />}

      {tab === "configure" && (
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">

            <Section title="Language">
              <Field label="Banner language">
                <select
                  value={config.language}
                  onChange={(e) => updateConfig("language", e.target.value as BannerConfig["language"])}
                  className={selectClass}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </Field>
              <p className="text-xs text-neutral-400">
                "Auto-detect" uses the visitor's browser language. Falls back to English if unsupported.
              </p>
            </Section>

            <Section title="Content">
              <Field label="Title">
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Accept button">
                  <input
                    type="text"
                    value={config.acceptLabel}
                    onChange={(e) => updateConfig("acceptLabel", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Reject button">
                  <input
                    type="text"
                    value={config.rejectLabel}
                    onChange={(e) => updateConfig("rejectLabel", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Privacy policy URL">
                <input
                  type="url"
                  value={config.privacyPolicyUrl ?? ""}
                  onChange={(e) => updateConfig("privacyPolicyUrl", e.target.value || null)}
                  placeholder="https://yoursite.com/privacy"
                  className={inputClass}
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Shown as a link in the banner footer. Strongly recommended for GDPR compliance.
                </p>
              </Field>
            </Section>

            <Section title="Consent categories">
              <p className="text-xs text-neutral-500 mb-3">
                Necessary cookies are always active and cannot be disabled. Enable the other categories to show granular opt-in toggles to visitors.
              </p>
              <CategoryRow
                label="Necessary"
                description="Required for the site to function. Always active."
                enabled={true}
                alwaysOn={true}
                onChange={() => {}}
              />
              <CategoryRow
                label="Analytics"
                description="Help you understand how visitors use your site (e.g. Google Analytics)."
                enabled={config.analyticsEnabled}
                alwaysOn={false}
                onChange={(v) => updateConfig("analyticsEnabled", v)}
              />
              <CategoryRow
                label="Marketing"
                description="Used to deliver personalized advertisements (e.g. Facebook Pixel)."
                enabled={config.marketingEnabled}
                alwaysOn={false}
                onChange={(v) => updateConfig("marketingEnabled", v)}
              />
            </Section>

            <Section title="Appearance">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary color">
                  <ColorField
                    value={config.primaryColor}
                    onChange={(v) => updateConfig("primaryColor", v)}
                  />
                </Field>
                <Field label="Background color">
                  <ColorField
                    value={config.backgroundColor}
                    onChange={(v) => updateConfig("backgroundColor", v)}
                  />
                </Field>
              </div>
              <Field label="Position">
                <div className="flex gap-2">
                  {(["bottom", "modal"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateConfig("position", pos)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition ${
                        config.position === pos
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {pos === "bottom" ? "Bottom bar" : "Modal"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Branding">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBranding}
                    onChange={(e) => updateConfig("showBranding", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-700">
                    Show "Powered by CookieConsent"
                  </span>
                  {!config.showBranding && (
                    <span className="text-xs bg-neutral-900 text-white px-1.5 py-0.5 rounded-full">
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

          <div className="sticky top-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
              Live preview
            </p>
            <BannerPreview config={config} />
          </div>
        </div>
      )}
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 transition"

const selectClass =
  "w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-400 bg-white transition"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
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
        className="h-10 w-10 rounded cursor-pointer border border-neutral-200"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + " flex-1"}
        placeholder="#000000"
      />
    </div>
  )
}

function CategoryRow({
  label,
  description,
  enabled,
  alwaysOn,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  alwaysOn: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-neutral-50 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      {alwaysOn ? (
        <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full whitespace-nowrap">
          Always active
        </span>
      ) : (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-neutral-200 rounded-full peer-checked:bg-neutral-900 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
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
      <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-3 font-mono text-xs text-neutral-600 break-all mb-2">
        {code}
      </div>
      <Button size="sm" variant="secondary" onClick={copy}>
        {copied ? "Copied!" : "Copy embed code"}
      </Button>
      <p className="text-xs text-neutral-400 mt-2">
        Paste this in the &lt;head&gt; of your website. Current config version: <strong>{configVersion}</strong>
      </p>
    </div>
  )
}
