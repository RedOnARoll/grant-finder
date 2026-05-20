import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"

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
    if (!subId) return NextResponse.json({ error: "No subscription found." }, { status: 400 })

    await stripe.subscriptions.update(subId, { cancel_at_period_end: false })

    await supabase.from("profiles").update({
      cancel_at_period_end: false,
      current_period_end: null,
    }).eq("user_id", user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[resume]", err)
    return NextResponse.json({ error: "Could not resume subscription." }, { status: 500 })
  }
}
