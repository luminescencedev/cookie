import * as esbuild from "esbuild"
import { writeFileSync } from "fs"
import { config } from "dotenv"

config()

const API_BASE = process.env.VITE_API_URL ?? "http://localhost:3000"

const result = await esbuild.build({
  entryPoints: ["snippet/banner.ts"],
  bundle: true,
  minify: true,
  write: false,
  target: ["es2018"],
  format: "iife",
  define: {
    "__API_BASE__": JSON.stringify(API_BASE),
  },
})

const code = new TextDecoder().decode(result.outputFiles[0].contents)
writeFileSync("public/banner.js", code)
console.log(`✓ Built public/banner.js (${(code.length / 1024).toFixed(1)}kb)`)
