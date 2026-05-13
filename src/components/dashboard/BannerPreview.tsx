import { useState } from "react"
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri"
import type { BannerConfig } from "../../lib/types"

export default function BannerPreview({ config }: { config: BannerConfig }) {
  const [showCustomize, setShowCustomize] = useState(false)

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 transition-all duration-200"
      style={{ height: showCustomize ? 420 : 300 }}
    >
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 border-b border-neutral-200">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-neutral-300" />
          <div className="size-2.5 rounded-full bg-neutral-300" />
          <div className="size-2.5 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 bg-white rounded border border-neutral-200 h-5 mx-3 px-2.5 flex items-center">
          <span className="text-[10px] text-neutral-400">yoursite.com</span>
        </div>
      </div>

      {/* Fake page content */}
      <div className="p-4 flex flex-col gap-2">
        <div className="h-2.5 rounded bg-neutral-200 w-3/4" />
        <div className="h-2.5 rounded bg-neutral-200 w-1/2" />
        <div className="h-2.5 rounded bg-neutral-200 w-2/3" />
      </div>

      {/* Banner overlay */}
      {config.position === "modal" ? (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/20">
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
          <p className="text-xs mb-3 leading-relaxed" style={{ color: config.primaryColor, opacity: 0.7 }}>
            {config.description || "This site uses cookies."}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              className="text-xs font-medium px-3 py-1.5 rounded cursor-pointer border-0"
              style={{ background: config.primaryColor, color: config.backgroundColor }}
            >
              {config.acceptLabel || "Accept all"}
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded cursor-pointer bg-transparent"
              style={{ color: config.primaryColor, border: `1px solid ${config.primaryColor}` }}
            >
              {config.rejectLabel || "Reject all"}
            </button>
            {(config.analyticsEnabled || config.marketingEnabled) && (
              <button
                onClick={onToggleCustomize}
                className="text-xs px-2.5 py-1.5 rounded cursor-pointer bg-transparent border-0 flex items-center gap-1"
                style={{ color: config.primaryColor, opacity: 0.6 }}
              >
                Customize <RiArrowRightLine size={11} />
              </button>
            )}
          </div>
          {config.privacyPolicyUrl && (
            <p className="text-[10px] mt-2" style={{ color: config.primaryColor, opacity: 0.4 }}>
              Privacy policy
            </p>
          )}
          {config.showBranding && (
            <p className="text-[10px] mt-1" style={{ color: config.primaryColor, opacity: 0.3 }}>
              Powered by CookieConsent
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
            Customize preferences
          </p>
          <div className="flex flex-col gap-2 mb-3">
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
              className="text-xs font-medium px-3 py-1.5 rounded cursor-pointer border-0"
              style={{ background: config.primaryColor, color: config.backgroundColor }}
            >
              Save preferences
            </button>
            <button
              onClick={onToggleCustomize}
              className="text-xs px-2.5 py-1.5 rounded cursor-pointer bg-transparent border-0 flex items-center gap-1"
              style={{ color: config.primaryColor, opacity: 0.6 }}
            >
              <RiArrowLeftLine size={11} /> Back
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
