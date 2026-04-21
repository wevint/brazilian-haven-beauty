import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/observability/logger";

/**
 * PayPal webhook handler.
 *
 * Validates the PayPal webhook signature and routes events to the
 * appropriate handlers. Full event handling is implemented in US3 (T060).
 *
 * PayPal webhook signature verification requires:
 * - PAYPAL-TRANSMISSION-ID header
 * - PAYPAL-TRANSMISSION-TIME header
 * - PAYPAL-CERT-URL header
 * - PAYPAL-AUTH-ALGO header
 * - PAYPAL-TRANSMISSION-SIG header
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = body as { event_type?: string; id?: string };

  logger.info("PayPal webhook received", {
    type: event.event_type,
    id: event.id,
  });

  // TODO (T060): Implement PayPal webhook signature verification using
  // the PayPal SDK verifyWebhookSignature endpoint before processing events.

  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      // TODO (T060): Call appointments.confirm internally
      break;
    case "PAYMENT.CAPTURE.DENIED":
      // TODO (T060): Release slot reservation
      break;
    default:
      logger.debug("Unhandled PayPal event type", { type: event.event_type });
  }

  return NextResponse.json({ received: true });
}
