import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/webhooks";
import { logger } from "@/lib/observability/logger";

/**
 * Stripe webhook handler.
 *
 * Validates the Stripe-Signature header and routes events to the
 * appropriate handlers. Full event handling is implemented in US3 (T060).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logger.warn("Stripe webhook received without signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error("Stripe webhook signature verification failed", { message });
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  logger.info("Stripe webhook received", { type: event.type, id: event.id });

  // Event routing — implemented in US3 (T060)
  switch (event.type) {
    case "payment_intent.succeeded":
      // TODO (T060): Call appointments.confirm internally
      break;
    case "payment_intent.payment_failed":
      // TODO (T060): Release slot reservation; notify client
      break;
    case "customer.subscription.renewed":
      // TODO (T060): Issue membership credits for next cycle
      break;
    case "customer.subscription.deleted":
      // TODO (T060): Set Membership status to cancelled
      break;
    case "customer.subscription.past_due":
      // TODO (T060): Set Membership status to expired after dunning
      break;
    case "charge.refunded":
      // TODO (T060): Update PaymentTransaction status
      break;
    default:
      logger.debug("Unhandled Stripe event type", { type: event.type });
  }

  return NextResponse.json({ received: true });
}
