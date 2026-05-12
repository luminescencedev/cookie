const noop = { limit: async (_key: string) => ({ success: true }) }

export const consentRatelimit = noop
export const configRatelimit = noop
