import { build } from "esbuild"
import { config } from "dotenv"

config()

const apiUrl = process.env.VITE_API_URL ?? "http://localhost:3000"

await build({
  entryPoints: ["snippet/banner.ts"],
  bundle: true,
  minify: true,
  outfile: "public/banner.js",
  format: "iife",
  define: {
    "__VITE_API_URL__": JSON.stringify(apiUrl),
  },
  target: "es2017",
})

console.log(`Snippet built → public/banner.js (API: ${apiUrl})`)
