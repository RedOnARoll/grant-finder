import { NextResponse } from "next/server"
import { runRefresh } from "@/lib/refresh-grants"

export const maxDuration = 300 // 5 minutes — Vercel Pro max for cron routes

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (or an authorized caller)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[cron] refresh-grants triggered")
    const batchSize = parseInt(process.env.REFRESH_BATCH_SIZE ?? "100", 10)
    const concurrency = parseInt(process.env.REFRESH_CONCURRENCY ?? "5", 10)
    const summary = await runRefresh(batchSize, concurrency)
    return NextResponse.json({ ok: true, summary })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[cron] refresh-grants failed:", message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
