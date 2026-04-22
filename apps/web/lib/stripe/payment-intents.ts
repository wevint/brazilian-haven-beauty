import type Stripe from "stripe";
import { stripe } from "./client";

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  /** Reservation token used to tie the PaymentIntent to a slot reservation. */
  reservationToken?: string;
  /** Appointment ID stored in metadata for webhook lookup (US3/T057). */
  appointmentId?: string;
}

export interface CreatePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Create a Stripe PaymentIntent for a booking checkout.
 * Returns the clientSecret for mounting the Stripe Payment Element.
 *
 * Supports both legacy (amountCents) and US3 (amountUsd in cents) call patterns.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResult>;
export async function createPaymentIntent(params: {
  appointmentId: string;
  amountUsd: number;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<CreatePaymentIntentResult>;
export async function createPaymentIntent(
  inputOrParams:
    | CreatePaymentIntentInput
    | {
        appointmentId: string;
        amountUsd: number;
        customerId?: string;
        metadata?: Record<string, string>;
      }
): Promise<CreatePaymentIntentResult> {
  // Normalise both call signatures to a common shape
  const isNewStyle = "amountUsd" in inputOrParams;
  const amount = isNewStyle
    ? (inputOrParams as { amountUsd: number }).amountUsd
    : (inputOrParams as CreatePaymentIntentInput).amountCents;
  const customerId = inputOrParams.customerId;
  const appointmentId = isNewStyle
    ? (inputOrParams as { appointmentId: string }).appointmentId
    : (inputOrParams as CreatePaymentIntentInput).appointmentId;
  const extraMeta = inputOrParams.metadata ?? {};
  const reservationToken = isNewStyle
    ? undefined
    : (inputOrParams as CreatePaymentIntentInput).reservationToken;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      ...extraMeta,
      ...(appointmentId ? { appointmentId } : {}),
      ...(reservationToken ? { reservationToken } : {}),
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
