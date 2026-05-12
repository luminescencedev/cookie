import "dotenv/config"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { serve } from "@hono/node-server"
import authRoutes from "./routes/auth"
import { sitesRoutes } from "./routes/sites"
import consentRoutes from "./routes/consent"
import analyticsRoutes from "./routes/analytics"
import billingRoutes from "./routes/billing"

const app = new Hono()

app.use(
  "/api/consent/*",
  cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] })
)

app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)

app.get("/health", (c) => c.json({ ok: true }))

app.route("/api/auth", authRoutes)
app.route("/api/sites", sitesRoutes)
app.route("/api/consent", consentRoutes)
app.route("/api/analytics", analyticsRoutes)
app.route("/api/billing", billingRoutes)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("API running on http://localhost:3000")
})

export default app
