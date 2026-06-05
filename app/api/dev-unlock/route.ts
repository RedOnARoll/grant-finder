import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json() as { password?: string }
  if (body.password !== "RedOnARoll") {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set("dev_access", "granted", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  })
  return res
}
