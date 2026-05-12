export interface BannerConfig {
  id: string
  siteId: string
  configVersion: number
  language: "auto" | "en" | "fr" | "de" | "es" | "it"
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

export interface Site {
  id: string
  userId: string
  domain: string
  name: string
  createdAt: string
  config: BannerConfig | null
  _count?: { consentLogs: number }
}

export interface Subscription {
  plan: "free" | "pro"
  status: string
  currentPeriodEnd: string | null
}

export interface MonthlyUsage {
  count: number
  limit: number
  month: string
}
