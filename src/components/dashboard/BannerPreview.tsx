import { useState } from "react"
import type { BannerConfig } from "../../lib/types"

export default function BannerPreview({ config }: { config: BannerConfig }) {
  const [showCustomize, setShowCustomize] = useState(false)

  return (
    <div style={{
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid #e5e5e5",
      height: showCustomize ? 420 : 300,
      background: "#f8f8f8",
      transition: "height 0.2s",
    }}>
      {/* Fake browser chrome */}
      <div style={{
        background: "#f0f0f0",
        borderBottom: "1px solid #e5e5e5",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "9999px", background: "#d1d5db" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "9999px", background: "#d1d5db" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "9999px", background: "#d1d5db" }} />
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: "6px", height: "20px", margin: "0 8px", border: "1px solid #e5e5e5" }} />
      </div>

      {/* Fake page content */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "75%" }} />
        <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "50%" }} />
        <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "66%" }} />
      </div>

      {config.position === "modal" ? (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          background: "rgba(0,0,0,0.2)",
        }}>
          <BannerBox config={config} showCustomize={showCustomize} onToggleCustomize={() => setShowCustomize(!showCustomize)} />
        </div>
      ) : (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
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
    <div style={{
      width: "100%",
      padding: "16px",
      borderRadius: config.position === "modal" ? "12px" : undefined,
      background: config.backgroundColor,
    }}>
      {!showCustomize ? (
        <>
          <p className="text-xs font-semibold" style={{ color: config.primaryColor, marginBottom: "2px" }}>
            {config.title || "We use cookies"}
          </p>
          <p className="text-xs" style={{ color: config.primaryColor, opacity: 0.7, marginBottom: "12px" }}>
            {config.description || "This site uses cookies."}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="text-xs font-medium"
              style={{ padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", background: config.primaryColor, color: config.backgroundColor }}
            >
              {config.acceptLabel || "Accept all"}
            </button>
            <button
              className="text-xs"
              style={{ padding: "6px 12px", borderRadius: "4px", cursor: "pointer", background: "transparent", color: config.primaryColor, border: `1px solid ${config.primaryColor}` }}
            >
              {config.rejectLabel || "Reject all"}
            </button>
            {(config.analyticsEnabled || config.marketingEnabled) && (
              <button
                onClick={onToggleCustomize}
                className="text-xs"
                style={{ padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", background: "transparent", color: config.primaryColor, opacity: 0.6 }}
              >
                Customize →
              </button>
            )}
          </div>
          {config.privacyPolicyUrl && (
            <p className="text-xs" style={{ color: config.primaryColor, opacity: 0.4, marginTop: "8px" }}>
              Privacy policy
            </p>
          )}
          {config.showBranding && (
            <p className="text-xs" style={{ color: config.primaryColor, opacity: 0.3, marginTop: "4px" }}>
              Powered by CookieConsent
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-semibold" style={{ color: config.primaryColor, marginBottom: "12px" }}>
            Customize preferences
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            <CategoryPreviewRow label="Necessary" alwaysOn color={config.primaryColor} />
            {config.analyticsEnabled && (
              <CategoryPreviewRow label="Analytics" color={config.primaryColor} />
            )}
            {config.marketingEnabled && (
              <CategoryPreviewRow label="Marketing" color={config.primaryColor} />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="text-xs font-medium"
              style={{ padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", background: config.primaryColor, color: config.backgroundColor }}
            >
              Save preferences
            </button>
            <button
              onClick={onToggleCustomize}
              className="text-xs"
              style={{ padding: "6px 12px", borderRadius: "4px", border: "none", cursor: "pointer", background: "transparent", color: config.primaryColor, opacity: 0.6 }}
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span className="text-xs" style={{ color, opacity: 0.8 }}>{label}</span>
      {alwaysOn ? (
        <span className="text-xs" style={{ color, opacity: 0.4 }}>Always active</span>
      ) : (
        <div style={{ width: "28px", height: "16px", borderRadius: "9999px", background: color, opacity: 0.3 }} />
      )}
    </div>
  )
}
