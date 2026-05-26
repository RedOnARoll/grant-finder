import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize, sanitizeString } from "@/lib/rate-limit"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grantway.org"

function siteOrigin() {
  return new URL(SITE_URL).origin
}

function confirmationRedirectUrl() {
  const url = new URL("/auth/callback", siteOrigin())
  url.searchParams.set("next", "/")
  url.searchParams.set("confirmed", "1")
  return url.toString()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export async function POST(request: Request) {
  // Rate limit: 5 attempts per 15 min per IP
  const ip = getClientIp(request)
  const rl = await rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  // Payload size limit: 10 KB
  const sizeCheck = checkPayloadSize(request, 10 * 1024)
  if (sizeCheck) return sizeCheck

  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!resendKey || !fromEmail || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Signup email is not configured yet." },
      { status: 500 }
    )
  }

  if (fromEmail.includes("@resend.dev")) {
    return NextResponse.json(
      { error: "Signup email must use a verified sender domain." },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null) as {
    email?: unknown
    password?: unknown
    fullName?: unknown
  } | null

  const email = typeof body?.email === "string" ? sanitizeString(body.email).toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  const fullName = typeof body?.fullName === "string" ? sanitizeString(body.fullName) : ""

  if (!isValidEmail(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
  }

  if (password.length > 128) {
    return NextResponse.json({ error: "Password must be 128 characters or fewer." }, { status: 400 })
  }

  if (fullName.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or fewer." }, { status: 400 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { full_name: fullName },
      redirectTo: confirmationRedirectUrl(),
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const actionLink = data.properties?.action_link
  if (!actionLink) {
    return NextResponse.json({ error: "Could not create confirmation link." }, { status: 500 })
  }

  const escapedName = escapeHtml(fullName || "there")
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: "Confirm your GrantWay account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">Confirm your GrantWay account</h1>
          <p>Hi ${escapedName},</p>
          <p>Click the button below to confirm your email and finish creating your GrantWay account.</p>
          <p style="margin: 28px 0;">
            <a href="${actionLink}" style="background: #2563eb; color: white; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Confirm account
            </a>
          </p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #475569;">${actionLink}</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 28px;">
            If you did not create a GrantWay account, you can ignore this email.
          </p>
        </div>
      `,
    }),
  })

  if (!resendResponse.ok) {
    const resendError = await resendResponse.json().catch(() => null) as { message?: string } | null
    return NextResponse.json(
      { error: resendError?.message ?? "Could not send confirmation email." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
