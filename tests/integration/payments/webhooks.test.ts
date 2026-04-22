/**
 * T054 — Integration tests: Stripe and PayPal webhook handling
 *
 * Tests for:
 *   handleStripeWebhook(event) — apps/web/lib/stripe/webhook-handler.ts
 *   handlePayPalWebhook(event) — apps/web/lib/paypal/webhook-handler.ts
 *
 * Both handler modules do NOT exist yet. @ts-expect-error directives allow
 * this file to compile but every test will FAIL at runtime until the handlers
 * are implemented.
 *
 * These tests verify DB state changes using a mocked Prisma client.
 * The handlers are expected to:
 *   - payment_intent.succeeded  → Appointment.status = 'completed',
 *                                  Appointment.paymentStatus = 'paid'
 *   - payment_intent.payment_failed → Appointment.status = 'cancelled',
 *                                      Appointment.paymentStatus = 'failed'
 *   - unknown event type        → no-op, no error thrown
 *   - PAYMENT.CAPTURE.COMPLETED → Appointment.status = 'completed'
 *   - PAYMENT.CAPTURE.DENIED    → Appointment.status = 'cancelled'
 *
 * Contracts drawn from:
 *   specs/spec.md      — US3 Payment capture without storing raw card data
 *   schema.prisma      — Appointment model fields (status, paymentIntentId)
 *   apps/web/app/api/webhooks/stripe/route.ts — existing event type routing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock("@bhb/db", () => ({
  prisma: {
    appointment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@bhb/db";

// @ts-expect-error — handleStripeWebhook not implemented yet
import { handleStripeWebhook } from "@/lib/stripe/webhook-handler";

// @ts-expect-error — handlePayPalWebhook not implemented yet
import { handlePayPalWebhook } from "@/lib/paypal/webhook-handler";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const APPOINTMENT_ID = "appt-integration-001";
const PAYMENT_INTENT_ID = "pi_test_integration_001";
const PAYPAL_ORDER_ID = "PAYPAL-ORDER-INT-001";

const mockAppointment = {
  id: APPOINTMENT_ID,
  clientId: "client-1",
  staffId: "staff-1",
  serviceId: "service-1",
  staffTier: "senior",
  priceUsd: 7000,
  durationMinutes: 40,
  startAt: new Date("2026-05-10T14:00:00.000Z"),
  endAt: new Date("2026-05-10T14:40:00.000Z"),
  status: "scheduled",
  confirmationCode: "BHB-20260510-AB12",
  paymentIntentId: PAYMENT_INTENT_ID,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Stripe webhook handler ─────────────────────────────────────────────────────

describe("handleStripeWebhook — payment_intent.succeeded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates Appointment status to 'completed' and paymentStatus to 'paid'", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "completed",
    } as never);

    const stripeEvent = {
      id: "evt_test_001",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: PAYMENT_INTENT_ID,
          status: "succeeded",
          metadata: { appointmentId: APPOINTMENT_ID },
        },
      },
    };

    await expect(handleStripeWebhook(stripeEvent)).resolves.not.toThrow();

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: expect.any(String),
        }),
        data: expect.objectContaining({
          status: "completed",
        }),
      })
    );
  });

  it("sets paymentStatus to 'paid' on the updated appointment", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "completed",
    } as never);

    const stripeEvent = {
      id: "evt_test_002",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: PAYMENT_INTENT_ID,
          status: "succeeded",
          metadata: { appointmentId: APPOINTMENT_ID },
        },
      },
    };

    await handleStripeWebhook(stripeEvent);

    const updateCall = vi.mocked(prisma.appointment.update).mock.calls[0];
    expect(updateCall).toBeDefined();
    const updateData = (updateCall as unknown[])[0] as {
      data: Record<string, unknown>;
    };
    // paymentStatus should be set to 'paid' in the update payload
    expect(updateData.data).toMatchObject({ paymentStatus: "paid" });
  });
});

describe("handleStripeWebhook — payment_intent.payment_failed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates Appointment status to 'cancelled' on payment failure", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "cancelled",
    } as never);

    const stripeEvent = {
      id: "evt_test_003",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: PAYMENT_INTENT_ID,
          status: "requires_payment_method",
          last_payment_error: { message: "Your card was declined." },
          metadata: { appointmentId: APPOINTMENT_ID },
        },
      },
    };

    await expect(handleStripeWebhook(stripeEvent)).resolves.not.toThrow();

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "cancelled",
        }),
      })
    );
  });

  it("sets paymentStatus to 'failed' on payment failure", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "cancelled",
    } as never);

    const stripeEvent = {
      id: "evt_test_004",
      type: "payment_intent.payment_failed",
      data: {
        object: {
          id: PAYMENT_INTENT_ID,
          status: "requires_payment_method",
          metadata: { appointmentId: APPOINTMENT_ID },
        },
      },
    };

    await handleStripeWebhook(stripeEvent);

    const updateCall = vi.mocked(prisma.appointment.update).mock.calls[0];
    expect(updateCall).toBeDefined();
    const updateData = (updateCall as unknown[])[0] as {
      data: Record<string, unknown>;
    };
    expect(updateData.data).toMatchObject({ paymentStatus: "failed" });
  });
});

describe("handleStripeWebhook — unknown event type", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for an unknown event type", async () => {
    const unknownEvent = {
      id: "evt_test_005",
      type: "customer.created",
      data: { object: { id: "cus_test" } },
    };

    await expect(handleStripeWebhook(unknownEvent)).resolves.not.toThrow();
  });

  it("does not call prisma.appointment.update for an unknown event type", async () => {
    const unknownEvent = {
      id: "evt_test_006",
      type: "invoice.paid",
      data: { object: { id: "in_test" } },
    };

    await handleStripeWebhook(unknownEvent);

    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});

// ── PayPal webhook handler ────────────────────────────────────────────────────

describe("handlePayPalWebhook — PAYMENT.CAPTURE.COMPLETED", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks appointment as 'completed' on capture success", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "completed",
    } as never);

    const paypalEvent = {
      id: "WH-TEST-001",
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAPTURE-ID-001",
        status: "COMPLETED",
        custom_id: APPOINTMENT_ID,
        supplementary_data: {
          related_ids: { order_id: PAYPAL_ORDER_ID },
        },
      },
    };

    await expect(handlePayPalWebhook(paypalEvent)).resolves.not.toThrow();

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "completed",
        }),
      })
    );
  });
});

describe("handlePayPalWebhook — PAYMENT.CAPTURE.DENIED", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks appointment as 'cancelled' on capture denied", async () => {
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(
      mockAppointment as never
    );
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...mockAppointment,
      status: "cancelled",
    } as never);

    const paypalEvent = {
      id: "WH-TEST-002",
      event_type: "PAYMENT.CAPTURE.DENIED",
      resource: {
        id: "CAPTURE-ID-002",
        status: "DENIED",
        custom_id: APPOINTMENT_ID,
        supplementary_data: {
          related_ids: { order_id: PAYPAL_ORDER_ID },
        },
      },
    };

    await expect(handlePayPalWebhook(paypalEvent)).resolves.not.toThrow();

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "cancelled",
        }),
      })
    );
  });
});

describe("handlePayPalWebhook — unknown event type", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not throw for an unknown PayPal event type", async () => {
    const unknownEvent = {
      id: "WH-TEST-003",
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: { id: "ORDER-ID-003" },
    };

    await expect(handlePayPalWebhook(unknownEvent)).resolves.not.toThrow();
  });

  it("does not call prisma.appointment.update for an unknown PayPal event", async () => {
    const unknownEvent = {
      id: "WH-TEST-004",
      event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
      resource: { id: "SUB-ID-001" },
    };

    await handlePayPalWebhook(unknownEvent);

    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});
