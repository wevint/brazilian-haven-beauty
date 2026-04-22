import type Stripe from "stripe";
import { stripe } from "./client";

export interface CreateRefundInput {
  paymentIntentId: string;
  /** Amount in cents. If omitted, the full amount is refunded. */
  amountCents?: number;
  reason?: Stripe.RefundCreateParams.Reason;
  metadata?: Record<string, string>;
}

export interface CreateRefundResult {
  refundId: string;
  status: string;
  amountRefundedCents: number;
}

/**
 * Create a Stripe refund for a PaymentIntent.
 * Supports full and partial refunds.
 *
 * Accepts both the legacy `CreateRefundInput` shape and the T057 params shape:
 *   { paymentIntentId, reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' }
 */
export async function createRefund(
  input: CreateRefundInput
): Promise<CreateRefundResult>;
export async function createRefund(params: {
  paymentIntentId: string;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}): Promise<{ refundId: string; status: string }>;
export async function createRefund(
  inputOrParams:
    | CreateRefundInput
    | {
        paymentIntentId: string;
        reason?: "duplicate" | "fraudulent" | "requested_by_customer";
      }
): Promise<CreateRefundResult | { refundId: string; status: string }> {
  const input = inputOrParams as CreateRefundInput;

  const refund = await stripe.refunds.create({
    payment_intent: input.paymentIntentId,
    ...(input.amountCents !== undefined
      ? { amount: input.amountCents }
      : {}),
    reason: input.reason as Stripe.RefundCreateParams.Reason | undefined,
    metadata: input.metadata,
  });

  return {
    refundId: refund.id,
    status: refund.status ?? "unknown",
    amountRefundedCents: refund.amount,
  };
}
