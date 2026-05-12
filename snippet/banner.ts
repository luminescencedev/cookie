// Consent banner — runs on third-party sites. No framework deps, keep bundle tiny.
const API_URL = "__VITE_API_URL__"

type ConsentChoice = {
  choice: "accepted" | "rejected" | "partial"
  necessary: true
  analytics: boolean
  marketing: boolean
  configVersion: number
}

interface BannerConfig {
  siteId: string
  configVersion: number
  title: string
  description: string
  acceptLabel: string
  rejectLabel: string
  privacyPolicyUrl: string | null
  analyticsEnabled: boolean
  marketingEnabled: boolean
  position: "bottom" | "modal"
  primaryColor: string
  backgroundColor: string
  showBranding: boolean
  language: string
}

function getStorageKey(siteId: string) {
  return `cc_consent_${siteId}`
}

function getStoredConsent(siteId: string): (ConsentChoice & { configVersion: number }) | null {
  try {
    const raw = localStorage.getItem(getStorageKey(siteId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeConsent(siteId: string, choice: ConsentChoice) {
  localStorage.setItem(getStorageKey(siteId), JSON.stringify(choice))
}

async function submitConsent(siteId: string, choice: ConsentChoice) {
  try {
    await fetch(`${API_URL}/api/consent/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ...choice }),
    })
  } catch {
    // Non-blocking — consent stored locally even if network fails
  }
}

function createBanner(config: BannerConfig) {
  const stored = getStoredConsent(config.siteId)
  if (stored && stored.configVersion === config.configVersion) return

  const banner = document.createElement("div")
  const isModal = config.position === "modal"

  banner.style.cssText = `
    position: fixed;
    ${isModal ? "inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 999999;" : "bottom: 0; left: 0; right: 0; z-index: 999999;"}
  `

  const box = document.createElement("div")
  box.style.cssText = `
    background: ${config.backgroundColor};
    color: #1a1a1a;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    padding: 20px 24px;
    max-width: ${isModal ? "480px" : "100%"};
    width: 100%;
    box-shadow: 0 -2px 12px rgba(0,0,0,0.1);
    border-radius: ${isModal ? "12px" : "0"};
  `

  let analyticsChecked = false
  let marketingChecked = false

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div>
        <strong style="font-size:15px">${config.title}</strong>
        <p style="margin:6px 0 0;color:#555;line-height:1.4">${config.description}</p>
        ${config.privacyPolicyUrl ? `<a href="${config.privacyPolicyUrl}" target="_blank" style="color:${config.primaryColor};font-size:12px;margin-top:4px;display:inline-block">Privacy Policy</a>` : ""}
      </div>
    </div>
    <div id="cc-categories" style="display:none;margin:14px 0;border-top:1px solid #eee;padding-top:14px">
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:not-allowed;opacity:.6">
        <input type="checkbox" checked disabled> Necessary (always on)
      </label>
      ${config.analyticsEnabled ? `<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer"><input type="checkbox" id="cc-analytics"> Analytics</label>` : ""}
      ${config.marketingEnabled ? `<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="cc-marketing"> Marketing</label>` : ""}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
      <button id="cc-accept" style="background:${config.primaryColor};color:#fff;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px">${config.acceptLabel}</button>
      <button id="cc-reject" style="background:transparent;border:1px solid #ccc;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:14px">${config.rejectLabel}</button>
      <button id="cc-customize" style="background:transparent;border:none;padding:8px 6px;cursor:pointer;font-size:14px;color:${config.primaryColor};text-decoration:underline">Customize</button>
    </div>
    ${config.showBranding ? `<p style="margin:10px 0 0;font-size:11px;color:#aaa">Powered by CookieConsent</p>` : ""}
  `

  banner.appendChild(box)
  document.body.appendChild(banner)

  function dismiss(choice: ConsentChoice) {
    storeConsent(config.siteId, choice)
    submitConsent(config.siteId, choice)
    banner.remove()
  }

  box.querySelector("#cc-accept")?.addEventListener("click", () => {
    dismiss({ choice: "accepted", necessary: true, analytics: config.analyticsEnabled, marketing: config.marketingEnabled, configVersion: config.configVersion })
  })

  box.querySelector("#cc-reject")?.addEventListener("click", () => {
    dismiss({ choice: "rejected", necessary: true, analytics: false, marketing: false, configVersion: config.configVersion })
  })

  box.querySelector("#cc-customize")?.addEventListener("click", () => {
    const cats = box.querySelector("#cc-categories") as HTMLElement
    cats.style.display = cats.style.display === "none" ? "block" : "none"
    const btn = box.querySelector("#cc-customize") as HTMLButtonElement
    btn.textContent = cats.style.display === "none" ? "Customize" : "Save preferences"
    if (cats.style.display === "none") {
      const analytics = (box.querySelector("#cc-analytics") as HTMLInputElement)?.checked ?? false
      const marketing = (box.querySelector("#cc-marketing") as HTMLInputElement)?.checked ?? false
      const choice = analytics || marketing ? "partial" : "rejected"
      dismiss({ choice: choice as ConsentChoice["choice"], necessary: true, analytics, marketing, configVersion: config.configVersion })
    }
  })
}

async function init() {
  const script = document.currentScript as HTMLScriptElement | null
  const siteId = script?.dataset.siteId ?? new URLSearchParams(script?.src.split("?")[1] ?? "").get("siteId")
  if (!siteId) return

  try {
    const res = await fetch(`${API_URL}/api/consent/config/${siteId}`)
    if (!res.ok) return
    const config: BannerConfig = await res.json()
    createBanner(config)
  } catch {
    // Fail silently — never break the host site
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}
