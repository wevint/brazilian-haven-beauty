import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { handleStripeWebhook } from "@/lib/stripe/webhook-handler";

/**
 * Stripe webhook handler (US3 — T060).
 *
 * Validates the Stripe-Signature header, constructs the verified event,
 * and delegates to the domain handler.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  await handleStripeWebhook(event as unknown as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
