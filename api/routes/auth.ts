import { Hono } from "hono"
import { auth } from "../lib/auth"

const app = new Hono()

app.on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw))

export default app
