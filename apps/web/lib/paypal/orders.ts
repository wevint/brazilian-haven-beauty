import { paypalFetch } from "./client";

export interface CreateOrderInput {
  amountUsd: string;
  /** Human-readable description shown on PayPal checkout. */
  description: string;
  metadata?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  /** Approval URL — redirect client here or use JS SDK. */
  approveUrl: string;
}

export interface CaptureOrderResult {
  orderId: string;
  status: string;
  amountUsd: string;
  captureId: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ rel: string; href: string; method: string }>;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id: string; amount: { value: string }; status: string }>;
    };
  }>;
}

/**
 * Create a PayPal Order for checkout (US3/T058).
 * appointmentId stored as custom_id for webhook lookup.
 * amountUsd is in cents — converted to dollars for PayPal API.
 */
export async function createPayPalOrder(params: {
  appointmentId: string;
  amountUsd: number; // cents
}): Promise<{ orderId: string; approveUrl: string }> {
  const dollarAmount = (params.amountUsd / 100).toFixed(2);

  const order = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: dollarAmount,
          },
          custom_id: params.appointmentId,
        },
      ],
    }),
  });

  const approveLink = order.links.find((l) => l.rel === "approve");

  return {
    orderId: order.id,
    approveUrl: approveLink?.href ?? "",
  };
}

/**
 * Capture a PayPal Order after buyer approval (US3/T058).
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<{ status: string; captureId: string }> {
  const order = await paypalFetch<PayPalOrderResponse>(
    `/v2/checkout/orders/${orderId}/capture`,
    { method: "POST" }
  );

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    status: order.status,
    captureId: capture?.id ?? "",
  };
}

/**
 * Create a PayPal Order for checkout (legacy signature).
 */
export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const order = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: input.amountUsd,
          },
          description: input.description,
          custom_id: input.metadata
            ? JSON.stringify(input.metadata)
            : undefined,
        },
      ],
    }),
  });

  const approveLink = order.links.find((l) => l.rel === "approve");

  return {
    orderId: order.id,
    approveUrl: approveLink?.href ?? "",
  };
}

/**
 * Capture a PayPal Order after buyer approval (legacy signature).
 */
export async function captureOrder(
  orderId: string
): Promise<CaptureOrderResult> {
  const order = await paypalFetch<PayPalOrderResponse>(
    `/v2/checkout/orders/${orderId}/capture`,
    { method: "POST" }
  );

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    orderId: order.id,
    status: order.status,
    amountUsd: capture?.amount.value ?? "0.00",
    captureId: capture?.id ?? "",
  };
}
