import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
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

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return NextResponse.json({ error: "No Stripe account found for this email." }, { status: 404 })

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 1,
    })
    const sub = subscriptions.data[0]

    const updates: Record<string, unknown> = {
      stripe_customer_id: customer.id,
    }

    if (sub) {
      const isActive = sub.status === "active"
      updates.stripe_subscription_id = sub.id
      updates.subscription_status = sub.status
      updates.cancel_at_period_end = sub.cancel_at_period_end
      updates.current_period_end = new Date((sub as any).current_period_end * 1000).toISOString()
      if (isActive) {
        updates.is_premium = true
        updates.subscription_tier = "premium"
      }
    }

    await adminClient.from("profiles").update(updates).eq("user_id", user.id)

    return NextResponse.json({
      ok: true,
      customerId: customer.id,
      subscriptionId: sub?.id ?? null,
      status: sub?.status ?? null,
      isPremium: sub?.status === "active",
    })
  } catch (err) {
    console.error("[sync]", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
