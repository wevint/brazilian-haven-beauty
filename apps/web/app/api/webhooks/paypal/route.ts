import { handlePayPalWebhook } from "@/lib/paypal/webhook-handler";

/**
 * PayPal webhook handler (US3 — T060).
 *
 * Parses the JSON body and delegates to the domain handler.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await handlePayPalWebhook(
    body as { event_type: string; resource: unknown }
  );

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
