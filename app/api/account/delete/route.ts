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

    // Cancel active Stripe subscription if one exists
    const { data: profile } = await adminClient
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    const subId = profile?.stripe_subscription_id as string | undefined
    if (subId) {
      try {
        await stripe.subscriptions.cancel(subId)
      } catch {
        // Continue with deletion even if Stripe cancel fails
      }
    }

    // Delete the auth user (cascades to profile via DB foreign key)
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[delete-account]", err)
    return NextResponse.json({ error: "Could not delete account." }, { status: 500 })
  }
}
