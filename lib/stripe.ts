import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
})

export const PRICE_ONE_TIME = process.env.STRIPE_PRICE_ID_ONE_TIME!
export const PRICE_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY!
export const PRICE_ANNUAL = process.env.STRIPE_PRICE_ID_ANNUAL!

export const ALLOWED_PRICES = new Set(
  [PRICE_ONE_TIME, PRICE_MONTHLY, PRICE_ANNUAL].filter(Boolean) as string[]
)
