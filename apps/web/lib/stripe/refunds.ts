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
 */
export async function createRefund(
  input: CreateRefundInput
): Promise<CreateRefundResult> {
  const refund = await stripe.refunds.create({
    payment_intent: input.paymentIntentId,
    ...(input.amountCents !== undefined
      ? { amount: input.amountCents }
      : {}),
    reason: input.reason,
    metadata: input.metadata,
  });

  return {
    refundId: refund.id,
    status: refund.status ?? "unknown",
    amountRefundedCents: refund.amount,
  };
}
