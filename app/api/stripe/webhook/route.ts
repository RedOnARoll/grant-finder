import { NextResponse } from "next/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"

// App Router: no bodyParser config needed — use request.text() for raw body

type AppSupabaseClient = SupabaseClient
type SubscriptionWithPeriod = Stripe.Subscription & { current_period_end?: number | null }

function serviceClient(): AppSupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as SubscriptionWithPeriod).current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

async function findUserByCustomerId(supabase: AppSupabaseClient, customerId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()
  return data?.user_id as string | undefined
}

async function logEvent(
  supabase: AppSupabaseClient,
  eventId: string,
  eventType: string,
  status: "processed" | "error" | "skipped",
  payload?: unknown,
  errorMessage?: string
) {
  await supabase.from("webhook_logs").upsert(
    { event_id: eventId, event_type: eventType, status, payload, error_message: errorMessage },
    { onConflict: "event_id" }
  )
}

async function handleCheckoutCompleted(
  supabase: AppSupabaseClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId
  if (!userId) throw new Error("No userId in session metadata")

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id
  if (customerId) {
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", userId)
  }

  if (session.mode === "payment") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("one_time_credits")
      .eq("user_id", userId)
      .maybeSingle()
    const credits = Number(profile?.one_time_credits ?? 0)

    // One-time Grant Helper purchase
    await supabase.from("profiles").update({
      subscription_tier: "grant_helper",
      subscription_status: null,
      one_time_credits: credits + 3,
      is_premium: false,
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      current_period_end: null,
    }).eq("user_id", userId)
  } else {
    // Subscription (monthly or annual)
    await supabase.from("profiles").update({
      subscription_tier: "premium",
      subscription_status: "active",
      is_premium: true,
    }).eq("user_id", userId)
  }
}

function subFields(subscription: Stripe.Subscription) {
  return {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    current_period_end: currentPeriodEnd(subscription),
  }
}

async function handleSubscriptionCreated(
  supabase: AppSupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id
  const userId = await findUserByCustomerId(supabase, customerId)
  if (!userId) return

  await supabase.from("profiles").update({
    ...subFields(subscription),
    is_premium: true,
    subscription_tier: "premium",
  }).eq("user_id", userId)
}

async function handleSubscriptionUpdated(
  supabase: AppSupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id
  const userId = await findUserByCustomerId(supabase, customerId)
  if (!userId) return

  const isActive = subscription.status === "active"
  const isCanceled = subscription.status === "canceled" || subscription.status === "unpaid"

  await supabase.from("profiles").update({
    ...subFields(subscription),
    ...(isActive ? { is_premium: true, subscription_tier: "premium" } : {}),
    ...(isCanceled ? { is_premium: false, subscription_tier: "free" } : {}),
  }).eq("user_id", userId)
}

async function handleSubscriptionDeleted(
  supabase: AppSupabaseClient,
  subscription: Stripe.Subscription
) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id
  const userId = await findUserByCustomerId(supabase, customerId)
  if (!userId) return

  await supabase.from("profiles").update({
    ...subFields(subscription),
    is_premium: false,
    subscription_tier: "free",
    stripe_subscription_id: null,
    cancel_at_period_end: false,
    current_period_end: null,
  }).eq("user_id", userId)
}

async function handleInvoicePaymentSucceeded(
  supabase: AppSupabaseClient,
  invoice: Stripe.Invoice
) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : (invoice.customer as Stripe.Customer | null)?.id
  if (!customerId) return
  const userId = await findUserByCustomerId(supabase, customerId)
  if (!userId) return

  await supabase.from("profiles").update({
    is_premium: true,
    subscription_tier: "premium",
    subscription_status: "active",
  }).eq("user_id", userId)
}

async function handleInvoicePaymentFailed(
  supabase: AppSupabaseClient,
  invoice: Stripe.Invoice
) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : (invoice.customer as Stripe.Customer | null)?.id
  if (!customerId) return
  const userId = await findUserByCustomerId(supabase, customerId)
  if (!userId) return

  // Grace period — don't remove premium access yet
  await supabase.from("profiles").update({
    subscription_status: "past_due",
  }).eq("user_id", userId)
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature") ?? ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("[webhook] signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = serviceClient()

  // Idempotency check
  const { data: existing } = await supabase
    .from("webhook_logs")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true })
  }

  // Process event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session)
        break
      case "customer.subscription.created":
        await handleSubscriptionCreated(supabase, event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(supabase, event.data.object as Stripe.Invoice)
        break
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break
      default:
        // Unhandled event type — log and move on
        await logEvent(supabase, event.id, event.type, "skipped")
        return NextResponse.json({ received: true })
    }

    await logEvent(supabase, event.id, event.type, "processed", event.data.object)
  } catch (err) {
    console.error(`[webhook] error handling ${event.type}:`, err)
    await logEvent(
      supabase,
      event.id,
      event.type,
      "error",
      event.data.object,
      err instanceof Error ? err.message : String(err)
    )
  }

  return NextResponse.json({ received: true })
}
