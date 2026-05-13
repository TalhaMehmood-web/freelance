import Stripe from "stripe"

declare global {
  // eslint-disable-next-line no-var
  var __stripe: Stripe | undefined
}

function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  })
}

export const stripe = globalThis.__stripe ?? createStripeClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.__stripe = stripe
}
