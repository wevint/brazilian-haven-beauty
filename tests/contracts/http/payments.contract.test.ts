/**
 * T052 — Contract tests for payment tRPC procedures and webhook endpoints
 *
 * Verifies the input/output shape contracts for the payments router (US3)
 * and the Stripe/PayPal webhook HTTP endpoints.
 *
 * The `payments` router does NOT exist yet — @ts-expect-error directives
 * allow this file to compile, but the tests will FAIL at runtime until
 * the procedures are implemented.
 *
 * Contracts drawn from:
 *   specs/contracts/api.md — Router: payments
 *   specs/spec.md          — US3 Payment capture without storing raw card data
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Output shape schemas ──────────────────────────────────────────────────────

/**
 * payments.createIntent → { clientSecret?, orderId?, paymentIntentId }
 */
const CreateIntentResultSchema = z.object({
  paymentIntentId: z.string(),
  clientSecret: z.string().optional(),
  orderId: z.string().optional(),
});

/**
 * payments.confirmPayment → { status, appointmentId }
 */
const ConfirmPaymentResultSchema = z.object({
  status: z.string(),
  appointmentId: z.string(),
});

/**
 * payments.savePaymentMethod → { id, last4, brand }
 */
const SavePaymentMethodResultSchema = z.object({
  id: z.string(),
  last4: z.string(),
  brand: z.string(),
});

/**
 * payments.listSavedMethods → { id, last4, brand, isDefault }[]
 */
const SavedMethodItemSchema = z.object({
  id: z.string(),
  last4: z.string(),
  brand: z.string(),
  isDefault: z.boolean(),
});

/**
 * payments.refund (adminProcedure) → { refundId, status }
 */
const RefundResultSchema = z.object({
  refundId: z.string(),
  status: z.string(),
});

/**
 * Stripe webhook response → { received: true } on 200
 * or { error: string } on 400
 */
const WebhookOkSchema = z.object({ received: z.literal(true) });
const WebhookErrorSchema = z.object({ error: z.string() });

// ── Schema smoke tests (always pass — verify Zod schemas are correct) ─────────

describe("payments.createIntent — contract shape", () => {
  it("accepts Stripe response shape (with clientSecret)", () => {
    const sample = {
      paymentIntentId: "pi_test_123",
      clientSecret: "pi_test_123_secret_abc",
    };
    expect(() => CreateIntentResultSchema.parse(sample)).not.toThrow();
  });

  it("accepts PayPal response shape (with orderId)", () => {
    const sample = {
      paymentIntentId: "paypal-order-xyz",
      orderId: "paypal-order-xyz",
    };
    expect(() => CreateIntentResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects response missing paymentIntentId", () => {
    const bad = { clientSecret: "secret_abc" };
    expect(() => CreateIntentResultSchema.parse(bad)).toThrow();
  });
});

describe("payments.confirmPayment — contract shape", () => {
  it("accepts valid response shape", () => {
    const sample = { status: "succeeded", appointmentId: "appt-1" };
    expect(() => ConfirmPaymentResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects response missing appointmentId", () => {
    const bad = { status: "succeeded" };
    expect(() => ConfirmPaymentResultSchema.parse(bad)).toThrow();
  });
});

describe("payments.savePaymentMethod — contract shape", () => {
  it("accepts valid saved method shape", () => {
    const sample = { id: "pm_test_abc", last4: "4242", brand: "visa" };
    expect(() => SavePaymentMethodResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects response missing brand", () => {
    const bad = { id: "pm_test_abc", last4: "4242" };
    expect(() => SavePaymentMethodResultSchema.parse(bad)).toThrow();
  });
});

describe("payments.listSavedMethods — contract shape", () => {
  it("accepts empty array", () => {
    expect(() => z.array(SavedMethodItemSchema).parse([])).not.toThrow();
  });

  it("accepts array with one saved method", () => {
    const sample = [
      { id: "pm_1", last4: "4242", brand: "visa", isDefault: true },
    ];
    expect(() => z.array(SavedMethodItemSchema).parse(sample)).not.toThrow();
  });

  it("rejects item missing isDefault flag", () => {
    const bad = [{ id: "pm_1", last4: "4242", brand: "visa" }];
    expect(() => z.array(SavedMethodItemSchema).parse(bad)).toThrow();
  });
});

describe("payments.refund — contract shape", () => {
  it("accepts valid refund response", () => {
    const sample = { refundId: "re_test_abc", status: "succeeded" };
    expect(() => RefundResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects response missing refundId", () => {
    const bad = { status: "succeeded" };
    expect(() => RefundResultSchema.parse(bad)).toThrow();
  });
});

describe("Stripe webhook endpoint — contract shape", () => {
  it("200 response body matches { received: true }", () => {
    const sample = { received: true as const };
    expect(() => WebhookOkSchema.parse(sample)).not.toThrow();
  });

  it("400 response body contains an error string", () => {
    const sample = { error: "Missing stripe-signature header" };
    expect(() => WebhookErrorSchema.parse(sample)).not.toThrow();
  });

  it("400 response rejects body without error string", () => {
    const bad = { message: "oops" };
    expect(() => WebhookErrorSchema.parse(bad)).toThrow();
  });
});

describe("PayPal webhook endpoint — contract shape", () => {
  it("200 response body matches { received: true }", () => {
    const sample = { received: true as const };
    expect(() => WebhookOkSchema.parse(sample)).not.toThrow();
  });

  it("400 response body contains an error string on invalid JSON", () => {
    const sample = { error: "Invalid JSON body" };
    expect(() => WebhookErrorSchema.parse(sample)).not.toThrow();
  });
});

// ── Runtime procedure existence tests (will FAIL until implementation) ────────
//
// The `payments` router does not exist yet on appRouter. Each call below uses
// @ts-expect-error so the TypeScript compiler accepts the missing property, but
// the test fails at runtime with "caller.payments is undefined" (or similar).

import { appRouter } from "@bhb/trpc";
import { createCallerFactory } from "@trpc/server";

const createCaller = createCallerFactory(appRouter);

const userCtx = {
  session: { user: { id: "user-test-1", email: "user@bhb.com" } },
};

const adminCtx = {
  session: { user: { id: "admin-test-1", email: "admin@bhb.com", role: "owner" } },
};

describe("payments.createIntent procedure — existence (runtime fail until implemented)", () => {
  const caller = createCaller(userCtx);

  it("createIntent accepts { appointmentId, method: 'stripe' } and returns CreateIntentResult shape", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.createIntent({
      appointmentId: "appt-dummy-001",
      method: "stripe",
    });
    expect(() => CreateIntentResultSchema.parse(result)).not.toThrow();
    expect(result.paymentIntentId).toBeTruthy();
  });

  it("createIntent accepts { appointmentId, method: 'paypal' } and returns CreateIntentResult shape", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.createIntent({
      appointmentId: "appt-dummy-001",
      method: "paypal",
    });
    expect(() => CreateIntentResultSchema.parse(result)).not.toThrow();
    expect(result.paymentIntentId).toBeTruthy();
  });
});

describe("payments.confirmPayment procedure — existence (runtime fail until implemented)", () => {
  const caller = createCaller(userCtx);

  it("confirmPayment accepts { paymentIntentId } and returns ConfirmPaymentResult shape", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.confirmPayment({
      paymentIntentId: "pi_test_dummy",
    });
    expect(() => ConfirmPaymentResultSchema.parse(result)).not.toThrow();
  });
});

describe("payments.savePaymentMethod procedure — existence (runtime fail until implemented)", () => {
  const caller = createCaller(userCtx);

  it("savePaymentMethod accepts { setupIntentId } and returns SavedMethod shape", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.savePaymentMethod({
      setupIntentId: "seti_test_dummy",
    });
    expect(() => SavePaymentMethodResultSchema.parse(result)).not.toThrow();
  });
});

describe("payments.listSavedMethods procedure — existence (runtime fail until implemented)", () => {
  const caller = createCaller(userCtx);

  it("listSavedMethods returns an array of SavedMethodItem", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.listSavedMethods();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(() => SavedMethodItemSchema.parse(result[0])).not.toThrow();
    }
  });
});

describe("payments.refund procedure (adminProcedure) — existence (runtime fail until implemented)", () => {
  const caller = createCaller(adminCtx);

  it("refund accepts { appointmentId } and returns RefundResult shape", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.refund({
      appointmentId: "appt-dummy-001",
    });
    expect(() => RefundResultSchema.parse(result)).not.toThrow();
  });

  it("refund accepts optional reason field alongside appointmentId", async () => {
    // @ts-expect-error — payments router not implemented yet
    const result = await caller.payments.refund({
      appointmentId: "appt-dummy-002",
      reason: "Client requested refund",
    });
    expect(() => RefundResultSchema.parse(result)).not.toThrow();
  });
});
