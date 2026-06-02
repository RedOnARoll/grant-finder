import { NextResponse } from "next/server"
import { runSync } from "@/lib/sync-grants-gov"

export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[cron] sync-grants triggered")
    const maxRows = parseInt(process.env.SYNC_GRANTS_MAX_ROWS ?? "500", 10)
    const summary = await runSync(maxRows)
    return NextResponse.json({ ok: true, summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[cron] sync-grants failed:", message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
