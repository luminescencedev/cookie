import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
})

export type Session = typeof auth.$Infer.Session
