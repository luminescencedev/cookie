import { db } from "./db"

const FREE_LIMIT = 5_000

export async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; count: number }> {
  const month = new Date().toISOString().slice(0, 7) // "YYYY-MM"

  const record = await db.monthlyEventCount.upsert({
    where: { userId_month: { userId, month } },
    create: { userId, month, count: 0 },
    update: {},
  })

  const subscription = await db.subscription.findUnique({ where: { userId } })
  const isPro = subscription?.plan === "pro" && subscription?.status === "active"

  if (!isPro && record.count >= FREE_LIMIT) {
    return { allowed: false, count: record.count }
  }

  await db.monthlyEventCount.update({
    where: { userId_month: { userId, month } },
    data: { count: { increment: 1 } },
  })

  return { allowed: true, count: record.count + 1 }
}
