import type Stripe from "stripe";
import { stripe } from "./client";

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  /** Reservation token used to tie the PaymentIntent to a slot reservation. */
  reservationToken?: string;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a Stripe PaymentIntent for a booking checkout.
 * Returns the clientSecret for mounting the Stripe Payment Element.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResult> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: input.amountCents,
    currency: input.currency ?? "usd",
    customer: input.customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      ...input.metadata,
      ...(input.reservationToken
        ? { reservationToken: input.reservationToken }
        : {}),
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe PaymentIntent created without a client_secret");
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Confirm a PaymentIntent on the server side (for non-client-side flows).
 * In most cases the client handles confirmation via the Payment Element.
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.confirm(paymentIntentId);
}

/**
 * Retrieve a PaymentIntent by ID.
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}
