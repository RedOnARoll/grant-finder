import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

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
    // Authenticate caller
    const authHeader = request.headers.get("Authorization") ?? ""
    const token = authHeader.replace("Bearer ", "").trim()
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )
    const { data: { user }, error: authError } = await verifyClient.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

    // Look up existing Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    const existingCustomerId = profile?.stripe_customer_id as string | null | undefined

    const mode = (tier as string) === "one_time" ? "payment" : "subscription"

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${BASE_URL}/account?upgrade=success${safeReturnTo ? `&next=${encodeURIComponent(safeReturnTo)}` : ""}`,
      cancel_url: `${BASE_URL}/pricing?cancelled=true`,
      metadata: { userId: user.id },
      allow_promotion_codes: true,
    }

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId
    } else {
      sessionParams.customer_email = user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Persist new customer ID immediately (before webhook arrives)
    if (!existingCustomerId && session.customer) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: session.customer as string })
        .eq("user_id", user.id)
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[checkout]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    )
  }
}
