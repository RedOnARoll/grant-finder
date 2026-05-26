import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getUser(token: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 cancel attempts per hour per IP
    const ip = getClientIp(req)
    const rl = await rateLimit(`cancel:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.allowed) return tooManyRequests(rl.resetAt)

    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? ""
    const user = await getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = serviceClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle()

    const subId = profile?.stripe_subscription_id as string | undefined
    if (!subId) return NextResponse.json({ error: "No active subscription found." }, { status: 400 })

    const subscription = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    })

    await supabase.from("profiles").update({
      cancel_at_period_end: true,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    }).eq("user_id", user.id)

    return NextResponse.json({ ok: true, endsAt: (subscription as any).current_period_end })
  } catch (err) {
    console.error("[cancel]", err)
    return NextResponse.json({ error: "Could not cancel subscription." }, { status: 500 })
  }
}
