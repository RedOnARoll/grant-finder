import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user } } = await verifyClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_premium, is_admin, subscription_tier, subscription_status, one_time_credits, stripe_customer_id, stripe_subscription_id, cancel_at_period_end, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()

    let customerId = profile?.stripe_customer_id as string | undefined

    // No customer ID saved — try to find by email in Stripe and backfill
    if (!customerId && user.email) {
      try {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 })
        const customer = customers.data[0]
        if (customer) {
          customerId = customer.id
          await adminClient.from("profiles").update({ stripe_customer_id: customer.id }).eq("user_id", user.id)
        }
      } catch {
        // Stripe unavailable — fall through to profile-only response
      }
    }

    // No Stripe account found — return profile as-is
    if (!customerId) {
      return NextResponse.json({
        tier: profile?.subscription_tier ?? "free",
        isPremium: Boolean(profile?.is_premium),
        isAdmin: Boolean(profile?.is_admin),
        credits: Number(profile?.one_time_credits ?? 0),
        hasSubscription: false,
        cancelAtPeriodEnd: false,
        periodEnd: null,
        subscriptionId: null,
        status: null,
      })
    }

    // Build profile-based response (used as fallback if Stripe is unavailable)
    function profileResponse(overrides: Record<string, unknown> = {}) {
      return NextResponse.json({
        tier: profile?.subscription_tier ?? "free",
        isPremium: Boolean(profile?.is_premium),
        isAdmin: Boolean(profile?.is_admin),
        credits: Number(profile?.one_time_credits ?? 0),
        hasSubscription: Boolean(profile?.stripe_subscription_id),
        cancelAtPeriodEnd: Boolean(profile?.cancel_at_period_end),
        periodEnd: profile?.current_period_end
          ? new Date(profile.current_period_end as string).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : null,
        subscriptionId: profile?.stripe_subscription_id ?? null,
        status: profile?.subscription_status ?? null,
        ...overrides,
      })
    }

    // Fetch live subscription from Stripe — fall back to profile on any error
    let sub: import("stripe").Stripe.Subscription | undefined
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 1,
      })
      sub = subscriptions.data[0]
    } catch {
      // Stripe unavailable (missing env vars, network error, etc.) — use profile data
      return profileResponse()
    }

    // Sync profile if webhook hasn't fired yet
    if (sub && sub.status === "active") {
      const updates: Record<string, unknown> = {
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
      }
      if (!profile?.is_premium) {
        updates.is_premium = true
        updates.subscription_tier = "premium"
      }
      await adminClient.from("profiles").update(updates).eq("user_id", user.id)
    }

    return NextResponse.json({
      tier: sub?.status === "active" ? "premium" : (profile?.subscription_tier ?? "free"),
      isPremium: Boolean(profile?.is_premium) || sub?.status === "active",
      isAdmin: Boolean(profile?.is_admin),
      credits: Number(profile?.one_time_credits ?? 0),
      hasSubscription: !!sub && sub.status === "active",
      cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
      periodEnd: sub ? new Date((sub as any).current_period_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null,
      subscriptionId: sub?.id ?? null,
      status: sub?.status ?? null,
    })
  } catch (err) {
    console.error("[subscription]", err)
    return NextResponse.json({ error: "Could not load subscription." }, { status: 500 })
  }
}
