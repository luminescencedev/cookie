declare const __API_BASE__: string

;(async () => {
  const script = document.currentScript as HTMLScriptElement | null
  if (!script) return

  const siteId = script.dataset.siteId
  if (!siteId) {
    console.warn("[CookieConsent] Missing data-site-id attribute")
    return
  }

  const STORAGE_KEY = `cc_${siteId}`
  const API_BASE: string = __API_BASE__

  // ─── Types ──────────────────────────────────────────────────────────────────

  interface Config {
    configVersion: number
    language: string
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
  }

  interface StoredConsent {
    version: number
    choice: "accepted" | "rejected" | "partial"
    necessary: boolean
    analytics: boolean
    marketing: boolean
    timestamp: number
  }

  // ─── i18n ───────────────────────────────────────────────────────────────────

  const TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
      customize: "Customize",
      savePreferences: "Save preferences",
      back: "← Back",
      alwaysActive: "Always active",
      necessary: "Necessary",
      necessaryDesc: "Required for the site to function properly.",
      analytics: "Analytics",
      analyticsDesc: "Help us understand how visitors use this site.",
      marketing: "Marketing",
      marketingDesc: "Used to show you relevant advertisements.",
      privacyPolicy: "Privacy policy",
      poweredBy: "Powered by CookieConsent",
    },
    fr: {
      customize: "Personnaliser",
      savePreferences: "Enregistrer mes préférences",
      back: "← Retour",
      alwaysActive: "Toujours actif",
      necessary: "Nécessaires",
      necessaryDesc: "Indispensables au bon fonctionnement du site.",
      analytics: "Analytiques",
      analyticsDesc: "Nous aident à comprendre comment les visiteurs utilisent ce site.",
      marketing: "Marketing",
      marketingDesc: "Utilisés pour vous montrer des publicités pertinentes.",
      privacyPolicy: "Politique de confidentialité",
      poweredBy: "Propulsé par CookieConsent",
    },
    de: {
      customize: "Anpassen",
      savePreferences: "Einstellungen speichern",
      back: "← Zurück",
      alwaysActive: "Immer aktiv",
      necessary: "Notwendig",
      necessaryDesc: "Für die einwandfreie Funktion der Website erforderlich.",
      analytics: "Analyse",
      analyticsDesc: "Helfen uns zu verstehen, wie Besucher die Website nutzen.",
      marketing: "Marketing",
      marketingDesc: "Werden verwendet, um Ihnen relevante Werbung zu zeigen.",
      privacyPolicy: "Datenschutzerklärung",
      poweredBy: "Unterstützt von CookieConsent",
    },
    es: {
      customize: "Personalizar",
      savePreferences: "Guardar preferencias",
      back: "← Volver",
      alwaysActive: "Siempre activo",
      necessary: "Necesarias",
      necessaryDesc: "Imprescindibles para el correcto funcionamiento del sitio.",
      analytics: "Analíticas",
      analyticsDesc: "Nos ayudan a entender cómo los visitantes usan este sitio.",
      marketing: "Marketing",
      marketingDesc: "Se utilizan para mostrarle anuncios relevantes.",
      privacyPolicy: "Política de privacidad",
      poweredBy: "Desarrollado por CookieConsent",
    },
    it: {
      customize: "Personalizza",
      savePreferences: "Salva preferenze",
      back: "← Indietro",
      alwaysActive: "Sempre attivo",
      necessary: "Necessari",
      necessaryDesc: "Indispensabili per il corretto funzionamento del sito.",
      analytics: "Analitici",
      analyticsDesc: "Ci aiutano a capire come i visitatori usano questo sito.",
      marketing: "Marketing",
      marketingDesc: "Utilizzati per mostrare annunci pertinenti.",
      privacyPolicy: "Informativa sulla privacy",
      poweredBy: "Offerto da CookieConsent",
    },
  }

  function getTranslations(configLang: string): Record<string, string> {
    if (configLang !== "auto") {
      return TRANSLATIONS[configLang] ?? TRANSLATIONS["en"]
    }
    const browserLang = navigator.language.split("-")[0].toLowerCase()
    return TRANSLATIONS[browserLang] ?? TRANSLATIONS["en"]
  }

  // ─── Cookie scanner ──────────────────────────────────────────────────────────

  const ANALYTICS_PATTERNS = [/_ga$/, /_gid$/, /_gat/, /^amplitude/, /^mp_/, /^_hjid/, /^hjActiveViewportIds/]
  const MARKETING_PATTERNS = [/_fbp$/, /_fbc$/, /^fr$/, /^ads/, /ide/i, /^_tt_/, /^li_fat_id/]

  function scanExistingCookies(): { analytics: boolean; marketing: boolean } {
    const cookieNames = document.cookie.split(";").map((c) => c.trim().split("=")[0].trim())
    const detected = { analytics: false, marketing: false }
    for (const name of cookieNames) {
      if (ANALYTICS_PATTERNS.some((p) => p.test(name))) detected.analytics = true
      if (MARKETING_PATTERNS.some((p) => p.test(name))) detected.marketing = true
    }
    return detected
  }

  // ─── Stored consent ──────────────────────────────────────────────────────────

  function getStoredConsent(): StoredConsent | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function storeConsent(consent: StoredConsent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    } catch {}
  }

  // ─── Config fetch ────────────────────────────────────────────────────────────

  let config: Config
  try {
    const res = await fetch(`${API_BASE}/api/consent/config/${siteId}`)
    if (!res.ok) return
    config = await res.json()
  } catch {
    return
  }

  const stored = getStoredConsent()
  if (stored && stored.version === config.configVersion) {
    exposeGlobal(stored)
    return
  }

  const t = getTranslations(config.language)
  const detected = scanExistingCookies()

  // ─── Banner render ───────────────────────────────────────────────────────────

  const wrapper = document.createElement("div")
  wrapper.id = "__cc_wrapper__"
  document.body.appendChild(wrapper)

  const isModal = config.position === "modal"
  const c = config

  function render(showCustomize: boolean, analyticsChecked: boolean, marketingChecked: boolean) {
    const wrapStyle = isModal
      ? "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.4);z-index:2147483647;"
      : "position:fixed;bottom:0;left:0;right:0;z-index:2147483647;"

    const boxStyle = `
      background:${c.backgroundColor};
      color:${c.primaryColor};
      padding:20px 24px;
      max-width:${isModal ? "480px" : "100%"};
      width:100%;
      border-radius:${isModal ? "16px" : "16px 16px 0 0"};
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-shadow:0 -4px 24px rgba(0,0,0,0.08);
    `

    const hasCategories = c.analyticsEnabled || c.marketingEnabled
    const hasScan = detected.analytics || detected.marketing

    wrapper.innerHTML = `
      <div style="${wrapStyle}">
        <div style="${boxStyle}">
          ${!showCustomize ? mainPanel(hasScan, hasCategories) : customizePanel(analyticsChecked, marketingChecked)}
        </div>
      </div>
    `

    document.getElementById("__cc_accept__")?.addEventListener("click", () => respond("accepted", true, true))
    document.getElementById("__cc_reject__")?.addEventListener("click", () => respond("rejected", false, false))
    document.getElementById("__cc_customize__")?.addEventListener("click", () =>
      render(true, c.analyticsEnabled, c.marketingEnabled)
    )
    document.getElementById("__cc_back__")?.addEventListener("click", () =>
      render(false, analyticsChecked, marketingChecked)
    )
    document.getElementById("__cc_save__")?.addEventListener("click", () => {
      const aCheck = document.getElementById("__cc_analytics_toggle__") as HTMLInputElement | null
      const mCheck = document.getElementById("__cc_marketing_toggle__") as HTMLInputElement | null
      const a = aCheck?.checked ?? false
      const m = mCheck?.checked ?? false
      const choice = a && m ? "accepted" : !a && !m ? "rejected" : "partial"
      respond(choice, a, m)
    })
  }

  function mainPanel(hasScan: boolean, hasCategories: boolean) {
    return `
      <p style="margin:0 0 4px;font-weight:600;font-size:15px;">${esc(c.title)}</p>
      <p style="margin:0 0 14px;font-size:13px;opacity:.7;">${esc(c.description)}</p>
      ${hasScan ? `<p style="margin:0 0 12px;font-size:11px;opacity:.5;">🔍 We detected cookies on this page: ${[detected.analytics && "analytics", detected.marketing && "marketing"].filter(Boolean).join(", ")}.</p>` : ""}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button id="__cc_accept__" style="${btnStyle("filled")}">${esc(c.acceptLabel)}</button>
        <button id="__cc_reject__" style="${btnStyle("outline")}">${esc(c.rejectLabel)}</button>
        ${hasCategories ? `<button id="__cc_customize__" style="${btnStyle("ghost")}">${t.customize}</button>` : ""}
      </div>
      ${footer()}
    `
  }

  function customizePanel(analyticsChecked: boolean, marketingChecked: boolean) {
    return `
      <p style="margin:0 0 14px;font-weight:600;font-size:14px;">${t.customize}</p>
      <div style="border:1px solid ${c.primaryColor}22;border-radius:10px;overflow:hidden;margin-bottom:14px;">
        ${categoryRow("necessary", t.necessary, t.necessaryDesc, true, true)}
        ${c.analyticsEnabled ? categoryRow("analytics", t.analytics, t.analyticsDesc, false, analyticsChecked) : ""}
        ${c.marketingEnabled ? categoryRow("marketing", t.marketing, t.marketingDesc, false, marketingChecked) : ""}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <button id="__cc_save__" style="${btnStyle("filled")}">${t.savePreferences}</button>
        <button id="__cc_back__" style="${btnStyle("ghost")}">${t.back}</button>
      </div>
      ${footer()}
    `
  }

  function categoryRow(id: string, label: string, desc: string, alwaysOn: boolean, checked: boolean) {
    return `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:12px 14px;border-bottom:1px solid ${c.primaryColor}11;">
        <div style="flex:1;padding-right:12px;">
          <p style="margin:0 0 2px;font-size:13px;font-weight:500;color:${c.primaryColor};">${label}</p>
          <p style="margin:0;font-size:11px;color:${c.primaryColor};opacity:.5;">${desc}</p>
        </div>
        ${alwaysOn
          ? `<span style="font-size:11px;color:${c.primaryColor};opacity:.4;white-space:nowrap;padding-top:2px;">${t.alwaysActive}</span>`
          : `<label style="position:relative;display:inline-flex;align-items:center;cursor:pointer;flex-shrink:0;">
              <input id="__cc_${id}_toggle__" type="checkbox" ${checked ? "checked" : ""} style="opacity:0;width:0;height:0;position:absolute;" />
              <span style="display:block;width:36px;height:20px;border-radius:10px;background:${checked ? c.primaryColor : c.primaryColor + "33"};transition:background .2s;cursor:pointer;position:relative;" onclick="(function(){var inp=document.getElementById('__cc_${id}_toggle__');inp.checked=!inp.checked;this.style.background=inp.checked?'${c.primaryColor}':'${c.primaryColor}33';var thumb=this.querySelector('span');thumb.style.transform=inp.checked?'translateX(14px)':'translateX(0)';}).call(this)">
                <span style="display:block;width:16px;height:16px;border-radius:50%;background:white;margin:2px;transition:transform .2s;transform:${checked ? "translateX(14px)" : "translateX(0)"}"></span>
              </span>
            </label>`
        }
      </div>
    `
  }

  function footer() {
    const parts: string[] = []
    if (c.privacyPolicyUrl) {
      parts.push(`<a href="${esc(c.privacyPolicyUrl)}" target="_blank" style="color:${c.primaryColor};opacity:.4;font-size:11px;text-decoration:none;">${t.privacyPolicy}</a>`)
    }
    if (c.showBranding) {
      parts.push(`<span style="color:${c.primaryColor};opacity:.25;font-size:11px;">${t.poweredBy}</span>`)
    }
    return parts.length
      ? `<div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;">${parts.join("")}</div>`
      : ""
  }

  function btnStyle(variant: "filled" | "outline" | "ghost") {
    const base = `border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:opacity .15s;`
    if (variant === "filled") return `${base}background:${c.primaryColor};color:${c.backgroundColor};`
    if (variant === "outline") return `${base}background:transparent;color:${c.primaryColor};border:1.5px solid ${c.primaryColor};`
    return `${base}background:transparent;color:${c.primaryColor};opacity:.6;`
  }

  render(false, config.analyticsEnabled, config.marketingEnabled)

  // ─── Respond ─────────────────────────────────────────────────────────────────

  async function respond(
    choice: "accepted" | "rejected" | "partial",
    analytics: boolean,
    marketing: boolean
  ) {
    const consent: StoredConsent = {
      version: config.configVersion,
      choice,
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
    }

    storeConsent(consent)
    wrapper.remove()
    exposeGlobal(consent)

    try {
      await fetch(`${API_BASE}/api/consent/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          choice,
          necessary: true,
          analytics,
          marketing,
          configVersion: config.configVersion,
        }),
      })
    } catch {
      // Fail silently — consent stored locally regardless
    }
  }

  // ─── Global API ──────────────────────────────────────────────────────────────

  function exposeGlobal(consent: StoredConsent) {
    ;(window as any).cookieConsent = {
      choice: consent.choice,
      necessary: consent.necessary,
      analytics: consent.analytics,
      marketing: consent.marketing,
      hasAnalytics: () => consent.analytics,
      hasMarketing: () => consent.marketing,
      hasConsent: () => consent.choice === "accepted",
    }
    window.dispatchEvent(new CustomEvent("cc:consent", { detail: consent }))
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function esc(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }
})()
