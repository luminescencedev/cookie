# Day 9 — Site detail: banner configurator + embed code

## Context
Days 1–8 done. Sites list works. Today is the core product page: the banner configurator. It now includes **consent category toggles**, a **privacy policy URL field**, a **language selector**, and a live preview that updates in real time.

## Goal
By end of today, users can configure all banner properties including categories and language, see a live preview, and copy the embed code.

---

## Tasks

### 1. Build the SiteDetail page
`src/pages/dashboard/SiteDetail.tsx`:
```tsx
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
    setConfig(updated) // reflect new configVersion from server
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

      {/* Tab navigation */}
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
          {/* Left: config form */}
          <div className="space-y-4">

            {/* Language */}
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

            {/* Content */}
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

            {/* Categories */}
            <Section title="Consent categories">
              <p className="text-xs text-neutral-500 mb-3">
                Necessary cookies are always active and cannot be disabled. Enable the other categories to show granular opt-in toggles to visitors.
              </p>

              {/* Necessary — always on, not configurable */}
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

            {/* Appearance */}
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

            {/* Embed code */}
            <Section title="Embed code">
              <EmbedCode siteId={site.id} configVersion={config.configVersion} />
            </Section>
          </div>

          {/* Right: live preview */}
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

// ─── Sub-components ────────────────────────────────────────────────

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
```

### 2. Update the BannerPreview to show categories
`src/components/dashboard/BannerPreview.tsx`:
```tsx
import { useState } from "react"
import type { BannerConfig } from "../../lib/types"

export default function BannerPreview({ config }: { config: BannerConfig }) {
  const [showCustomize, setShowCustomize] = useState(false)

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-neutral-200"
      style={{ height: showCustomize ? 420 : 300, background: "#f8f8f8", transition: "height 0.2s" }}
    >
      {/* Fake browser chrome */}
      <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
          <div className="w-3 h-3 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 bg-white rounded-md h-5 mx-2 border border-neutral-200" />
      </div>

      {/* Fake page content */}
      <div className="p-4 space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-2/3" />
      </div>

      {/* Banner */}
      {config.position === "modal" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 px-4">
          <BannerBox config={config} showCustomize={showCustomize} onToggleCustomize={() => setShowCustomize(!showCustomize)} />
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0">
          <BannerBox config={config} showCustomize={showCustomize} onToggleCustomize={() => setShowCustomize(!showCustomize)} />
        </div>
      )}
    </div>
  )
}

function BannerBox({
  config,
  showCustomize,
  onToggleCustomize,
}: {
  config: BannerConfig
  showCustomize: boolean
  onToggleCustomize: () => void
}) {
  return (
    <div
      className={`w-full p-4 ${config.position === "modal" ? "rounded-xl" : ""}`}
      style={{ background: config.backgroundColor }}
    >
      {!showCustomize ? (
        <>
          <p className="text-xs font-semibold mb-0.5" style={{ color: config.primaryColor }}>
            {config.title || "We use cookies"}
          </p>
          <p className="text-xs mb-3" style={{ color: config.primaryColor, opacity: 0.7 }}>
            {config.description || "This site uses cookies."}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: config.primaryColor, color: config.backgroundColor }}>
              {config.acceptLabel || "Accept all"}
            </button>
            <button className="px-3 py-1.5 rounded text-xs" style={{ color: config.primaryColor, border: `1px solid ${config.primaryColor}` }}>
              {config.rejectLabel || "Reject all"}
            </button>
            {(config.analyticsEnabled || config.marketingEnabled) && (
              <button onClick={onToggleCustomize} className="px-3 py-1.5 rounded text-xs" style={{ color: config.primaryColor, opacity: 0.6 }}>
                Customize →
              </button>
            )}
          </div>
          {config.privacyPolicyUrl && (
            <p className="text-xs mt-2" style={{ color: config.primaryColor, opacity: 0.4 }}>
              Privacy policy
            </p>
          )}
          {config.showBranding && (
            <p className="text-xs mt-1 opacity-30" style={{ color: config.primaryColor }}>
              Powered by CookieConsent
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
            Customize preferences
          </p>
          <div className="space-y-2 mb-3">
            <CategoryPreviewRow label="Necessary" alwaysOn color={config.primaryColor} bg={config.backgroundColor} />
            {config.analyticsEnabled && (
              <CategoryPreviewRow label="Analytics" color={config.primaryColor} bg={config.backgroundColor} />
            )}
            {config.marketingEnabled && (
              <CategoryPreviewRow label="Marketing" color={config.primaryColor} bg={config.backgroundColor} />
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded text-xs font-medium" style={{ background: config.primaryColor, color: config.backgroundColor }}>
              Save preferences
            </button>
            <button onClick={onToggleCustomize} className="px-3 py-1.5 rounded text-xs" style={{ color: config.primaryColor, opacity: 0.6 }}>
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CategoryPreviewRow({ label, alwaysOn, color, bg }: { label: string; alwaysOn?: boolean; color: string; bg: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color, opacity: 0.8 }}>{label}</span>
      {alwaysOn ? (
        <span className="text-xs" style={{ color, opacity: 0.4 }}>Always active</span>
      ) : (
        <div className="w-7 h-4 rounded-full" style={{ background: color, opacity: 0.3 }} />
      )}
    </div>
  )
}
```

---

## Definition of done
- [ ] Language selector with all 5 languages + auto-detect
- [ ] Privacy policy URL field saves and shows in preview
- [ ] Category toggles (analytics, marketing) update in real time in the preview
- [ ] Customize panel visible in preview when categories are enabled
- [ ] "Save changes" returns updated `configVersion` from server and shows re-consent notice
- [ ] Color pickers work
- [ ] Embed code shows current `configVersion` as info text
- [ ] No TypeScript errors

---

## Common issues
- **`configVersion` not updating in UI after save:** Make sure you call `setConfig(updated)` with the server response (which has the new version), not just the local state
- **Toggle CSS not working:** The custom toggle uses Tailwind `after:` pseudo-element utilities — make sure Tailwind v4 is processing the file
- **`privacyPolicyUrl` null vs empty string:** The input uses `e.target.value || null` to convert empty string back to null before saving
