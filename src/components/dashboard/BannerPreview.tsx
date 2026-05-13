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

      {config.position === "modal" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 px-4">
          <BannerBox
            config={config}
            showCustomize={showCustomize}
            onToggleCustomize={() => setShowCustomize(!showCustomize)}
          />
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0">
          <BannerBox
            config={config}
            showCustomize={showCustomize}
            onToggleCustomize={() => setShowCustomize(!showCustomize)}
          />
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
            <button
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: config.primaryColor, color: config.backgroundColor }}
            >
              {config.acceptLabel || "Accept all"}
            </button>
            <button
              className="px-3 py-1.5 rounded text-xs"
              style={{ color: config.primaryColor, border: `1px solid ${config.primaryColor}` }}
            >
              {config.rejectLabel || "Reject all"}
            </button>
            {(config.analyticsEnabled || config.marketingEnabled) && (
              <button
                onClick={onToggleCustomize}
                className="px-3 py-1.5 rounded text-xs"
                style={{ color: config.primaryColor, opacity: 0.6 }}
              >
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
            <CategoryPreviewRow label="Necessary" alwaysOn color={config.primaryColor} />
            {config.analyticsEnabled && (
              <CategoryPreviewRow label="Analytics" color={config.primaryColor} />
            )}
            {config.marketingEnabled && (
              <CategoryPreviewRow label="Marketing" color={config.primaryColor} />
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ background: config.primaryColor, color: config.backgroundColor }}
            >
              Save preferences
            </button>
            <button
              onClick={onToggleCustomize}
              className="px-3 py-1.5 rounded text-xs"
              style={{ color: config.primaryColor, opacity: 0.6 }}
            >
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CategoryPreviewRow({ label, alwaysOn, color }: { label: string; alwaysOn?: boolean; color: string }) {
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
