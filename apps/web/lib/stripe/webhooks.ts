import type Stripe from "stripe";
import { stripe } from "./client";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Construct and verify a Stripe webhook event from a raw request.
 * Throws if the signature is invalid.
 *
 * @param rawBody  The raw request body as a string or Buffer.
 * @param signature  The value of the `Stripe-Signature` header.
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string
): Stripe.Event {
  if (!webhookSecret) {
    throw new Error("Missing environment variable: STRIPE_WEBHOOK_SECRET");
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/** Supported Stripe event types processed by this platform. */
export type StripeEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "customer.subscription.renewed"
  | "customer.subscription.deleted"
  | "customer.subscription.past_due"
  | "charge.refunded";
