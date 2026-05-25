import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize } from "@/lib/rate-limit"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grantway.org"

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    // Rate limit: 10 checkout attempts per 15 min per IP
    const ip = getClientIp(request)
    const rl = rateLimit(`checkout:${ip}`, 10, 15 * 60 * 1000)
    if (!rl.allowed) return tooManyRequests(rl.resetAt)

    // Payload size: 5 KB
    const sizeCheck = checkPayloadSize(request, 5 * 1024)
    if (sizeCheck) return sizeCheck

    // Auth is optional — no token = guest checkout
    const authHeader = request.headers.get("Authorization") ?? ""
    const token = authHeader.replace("Bearer ", "").trim()

    let userId: string | null = null
    let userEmail: string | null = null

    if (token) {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const verifyClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { autoRefreshToken: false, persistSession: false },
        }
      )
      const { data: { user } } = await verifyClient.auth.getUser()
      if (user) {
        userId = user.id
        userEmail = user.email ?? null
      }
    }

    // Validate tier → resolve to priceId server-side (price IDs stay off the client)
    type Tier = "one_time" | "monthly" | "annual"
    const TIER_MAP: Record<Tier, string> = {
      one_time: process.env.STRIPE_PRICE_ID_ONE_TIME!,
      monthly:  process.env.STRIPE_PRICE_ID_MONTHLY!,
      annual:   process.env.STRIPE_PRICE_ID_ANNUAL!,
    }
    const { tier, returnTo } = await request.json() as { tier?: string; returnTo?: string }
    if (!tier || !(tier in TIER_MAP)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }
    const priceId = TIER_MAP[tier as Tier]

    // Validate returnTo: must be a relative path, no open-redirect risk
    const safeReturnTo =
      typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : ""

    const supabase = serviceClient()
    const mode = (tier as string) === "one_time" ? "payment" : "subscription"

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      cancel_url: `${BASE_URL}/pricing?cancelled=true`,
      allow_promotion_codes: true,
    }

    if (userId) {
      // ── Authenticated user ──────────────────────────────────────────────────
      const successDestination = safeReturnTo || "/account"
      const successUrl = new URL(BASE_URL + successDestination)
      successUrl.searchParams.set("upgrade", "success")
      sessionParams.success_url = successUrl.toString()
      sessionParams.metadata = { userId }

      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle()

      const existingCustomerId = profile?.stripe_customer_id as string | null | undefined

      if (existingCustomerId) {
        sessionParams.customer = existingCustomerId
      } else if (userEmail) {
        sessionParams.customer_email = userEmail
      }

      const session = await stripe.checkout.sessions.create(sessionParams)

      // Persist new customer ID immediately (before webhook arrives)
      if (!existingCustomerId && session.customer) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: session.customer as string })
          .eq("user_id", userId)
      }

      return NextResponse.json({ url: session.url })
    } else {
      // ── Guest checkout ──────────────────────────────────────────────────────
      // Stripe Checkout will collect the email. Webhook creates the account.
      const successUrl = new URL(`${BASE_URL}/welcome`)
      successUrl.searchParams.set("setup", "1")
      if (safeReturnTo) successUrl.searchParams.set("returnTo", safeReturnTo)
      sessionParams.success_url = successUrl.toString()
      sessionParams.metadata = { guest: "true" }

      const session = await stripe.checkout.sessions.create(sessionParams)
      return NextResponse.json({ url: session.url })
    }
  } catch (err) {
    console.error("[checkout]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
