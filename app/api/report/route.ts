import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize } from "@/lib/rate-limit"

/*
  Required Supabase table (run once in the SQL editor):

  create table data_reports (
    id uuid primary key default gen_random_uuid(),
    program_slug text not null,
    program_type text not null,
    issue text not null,
    note text,
    user_id uuid,
    created_at timestamptz not null default now()
  );
*/

const VALID_ISSUES = ["wrong_deadline", "wrong_amount", "program_closed", "broken_link", "other"] as const
type Issue = (typeof VALID_ISSUES)[number]

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await rateLimit(`${ip}:report`, 5, 60_000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const sizeError = checkPayloadSize(req, 2048)
  if (sizeError) return sizeError

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { program_slug, program_type, issue, note, user_id } = body as Record<string, unknown>

  if (typeof program_slug !== "string" || !program_slug.trim()) {
    return NextResponse.json({ error: "program_slug required" }, { status: 400 })
  }
  if (program_type !== "grant" && program_type !== "benefit") {
    return NextResponse.json({ error: "program_type must be grant or benefit" }, { status: 400 })
  }
  if (!VALID_ISSUES.includes(issue as Issue)) {
    return NextResponse.json({ error: "invalid issue" }, { status: 400 })
  }
  const safeNote = typeof note === "string" ? note.slice(0, 500) : null
  const safeUserId = typeof user_id === "string" ? user_id : null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { error } = await supabase.from("data_reports").insert({
    program_slug: program_slug.trim(),
    program_type,
    issue,
    note: safeNote,
    user_id: safeUserId,
  })

  if (error) {
    console.error("[report] insert error:", error.message)
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
