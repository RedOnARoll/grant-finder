import { NextResponse } from "next/server"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type Stripe from "stripe"
import { stripe, ALLOWED_PRICES } from "@/lib/stripe"

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

async function sendGuestWelcomeEmail(
  email: string,
  actionLink: string,
  tierLabel: string
) {
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!resendKey || !fromEmail || fromEmail.includes("@resend.dev")) return

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: `Your GrantWay ${tierLabel} account is ready`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">Welcome to GrantWay ${tierLabel}!</h1>
          <p>Your payment was successful. Click the button below to sign in and access your account:</p>
          <p style="margin: 28px 0;">
            <a href="${actionLink}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Access My Account &rarr;
            </a>
          </p>
          <p style="font-size: 13px; color: #475569;">
            This link expires in 1 hour. After signing in you can set a password from your account settings.
          </p>
          <p style="font-size: 12px; color: #64748b; margin-top: 28px;">
            If you didn't purchase GrantWay, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  })
}

async function handleGuestCheckoutCompleted(
  supabase: AppSupabaseClient,
  session: Stripe.Checkout.Session
) {
  const email = session.customer_details?.email
  if (!email) throw new Error("Guest checkout: no email in session")

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id

  // Create the Supabase user (email already verified by Stripe)
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  })

  // Generate a magic link — also returns user data if user already exists
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grantway.org"
  const { data: magicData } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${siteUrl}/auth/callback?next=/account` },
  })

  const targetUserId = createData?.user?.id ?? magicData?.user?.id
  if (!targetUserId) throw new Error("Guest checkout: could not resolve user ID")

  if (createError && !createError.message.toLowerCase().includes("already")) {
    throw createError
  }

  // Upsert profile — safe for both new and pre-existing users
  const profileUpdate =
    session.mode === "payment"
      ? { subscription_tier: "grant_helper", one_time_credits: 3, is_premium: false,
          stripe_subscription_id: null, cancel_at_period_end: false, current_period_end: null }
      : { subscription_tier: "premium", subscription_status: "active", is_premium: true }

  await supabase.from("profiles").upsert(
    { user_id: targetUserId, stripe_customer_id: customerId ?? null, ...profileUpdate },
    { onConflict: "user_id" }
  )

  // Send welcome email with magic sign-in link
  const actionLink = magicData?.properties?.action_link
  if (actionLink) {
    const tierLabel = session.mode === "payment" ? "Grant Helper" : "Premium"
    await sendGuestWelcomeEmail(email, actionLink, tierLabel)
  }
}

async function handleCheckoutCompleted(
  supabase: AppSupabaseClient,
  session: Stripe.Checkout.Session
) {
  // Validate that the price paid is one we recognise (only when price ID env vars are configured)
  if (ALLOWED_PRICES.size > 0) {
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    })
    const purchasedPriceId = fullSession.line_items?.data[0]?.price?.id
    if (!purchasedPriceId || !ALLOWED_PRICES.has(purchasedPriceId)) {
      throw new Error(`Checkout completed with unexpected price: ${purchasedPriceId}`)
    }
  }

  const userId = session.metadata?.userId

  // Guest checkout — no userId in metadata
  if (!userId) {
    await handleGuestCheckoutCompleted(supabase, session)
    return
  }

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

    await supabase.from("profiles").upsert({
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      subscription_tier: "grant_helper",
      subscription_status: null,
      one_time_credits: credits + 3,
      is_premium: false,
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      current_period_end: null,
    }, { onConflict: "user_id" })
  } else {
    await supabase.from("profiles").upsert({
      user_id: userId,
      stripe_customer_id: customerId ?? null,
      subscription_tier: "premium",
      subscription_status: "active",
      is_premium: true,
    }, { onConflict: "user_id" })
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
    return NextResponse.json({ received: true })
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
    // Return 500 so Stripe retries the event on processing failures
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
