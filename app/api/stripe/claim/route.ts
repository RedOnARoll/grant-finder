import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { rateLimit, getClientIp, tooManyRequests, checkPayloadSize } from "@/lib/rate-limit"

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await rateLimit(`stripe-claim:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const sizeCheck = checkPayloadSize(req, 5 * 1024)
  if (sizeCheck) return sizeCheck

  let body: { sessionId: string; email: string; password: string }
  try {
    body = await req.json()
  } catch {
    return new Response("Invalid request body", { status: 400 })
  }

  const sessionId = String(body.sessionId ?? "").trim()
  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")

  if (!sessionId.startsWith("cs_")) {
    return new Response("Invalid session", { status: 400 })
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return new Response("Invalid email", { status: 400 })
  }
  if (password.length < 8 || password.length > 128) {
    return new Response("Password must be 8–128 characters", { status: 400 })
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })
  } catch {
    return new Response("Invalid session", { status: 400 })
  }

  if (session.payment_status !== "paid") {
    return new Response("Payment not completed", { status: 400 })
  }

  if (session.metadata?.guest !== "true") {
    return new Response("Not a guest checkout", { status: 400 })
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer as Stripe.Customer | null)?.id ?? null
  if (!customerId) {
    return new Response("No customer on session", { status: 400 })
  }

  const supabase = serviceClient()

  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()

  if (existing) {
    return new Response(
      JSON.stringify({ error: "already_claimed" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    )
  }

  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    const msg = createError.message.toLowerCase()
    if (msg.includes("already") || msg.includes("exists")) {
      return new Response(
        JSON.stringify({ error: "email_taken" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      )
    }
    console.error("[stripe/claim]", createError)
    return new Response("Failed to create account", { status: 500 })
  }

  const userId = userData.user.id

  const subscriptionId =
    session.mode === "subscription"
      ? typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as Stripe.Subscription | null)?.id ?? null
      : null

  const profileData =
    session.mode === "payment"
      ? {
          subscription_tier: "grant_helper",
          one_time_credits: 3,
          is_premium: false,
          stripe_subscription_id: null,
          cancel_at_period_end: false,
          current_period_end: null,
        }
      : {
          subscription_tier: "premium",
          subscription_status: "active",
          is_premium: true,
          stripe_subscription_id: subscriptionId,
        }

  await supabase.from("profiles").upsert(
    { user_id: userId, stripe_customer_id: customerId, ...profileData },
    { onConflict: "user_id" }
  )

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  })
}
