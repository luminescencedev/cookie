import { db } from "./db"

const FREE_MONTHLY_LIMIT = 5_000

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export async function incrementAndCheck(siteId: string): Promise<{ allowed: boolean }> {
  const site = await db.site.findUnique({
    where: { id: siteId },
    select: { userId: true },
  })
  if (!site) return { allowed: false }

  const { userId } = site
  const month = getCurrentMonth()

  const subscription = await db.subscription.findUnique({ where: { userId } })
  const isPro = subscription?.plan === "pro"

  if (isPro) {
    await upsertCount(userId, month)
    return { allowed: true }
  }

  const current = await db.monthlyEventCount.findUnique({
    where: { userId_month: { userId, month } },
  })

  if ((current?.count ?? 0) >= FREE_MONTHLY_LIMIT) {
    return { allowed: false }
  }

  await upsertCount(userId, month)
  return { allowed: true }
}

async function upsertCount(userId: string, month: string) {
  await db.monthlyEventCount.upsert({
    where: { userId_month: { userId, month } },
    update: { count: { increment: 1 } },
    create: { userId, month, count: 1 },
  })
}
