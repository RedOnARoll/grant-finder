#!/usr/bin/env node
/**
 * Manual grant refresh runner.
 *
 * Usage:
 *   npx tsx scripts/refresh-grants.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY
 */

// Simple .env.local loader (no dotenv dependency needed)
import { readFileSync } from "fs"
import { resolve } from "path"

try {
  const envPath = resolve(process.cwd(), ".env.local")
  const lines = readFileSync(envPath, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (key && !process.env[key]) process.env[key] = value
  }
} catch {
  // .env.local not found — assume env vars are already set
}

import { runRefresh } from "../lib/refresh-grants.js"

void (async () => {
  const summary = await runRefresh()
  process.exit(summary.failed > summary.total * 0.5 ? 1 : 0)
})()
