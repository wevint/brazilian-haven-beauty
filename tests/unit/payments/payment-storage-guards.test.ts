/**
 * T053 — Unit tests: payment metadata storage constraints
 *
 * Tests for `assertNoRawCardData(data: Record<string, unknown>): void`
 * that should live at `apps/web/lib/payments/storage-guards.ts`.
 *
 * The function does NOT exist yet — @ts-expect-error allows this file
 * to compile but each test that invokes the function will FAIL at runtime
 * until the function is implemented.
 *
 * Rules under test:
 *   1. Throws if data contains any forbidden key: cardNumber, card_number,
 *      cvv, cvc, pan, fullCardNumber
 *   2. Throws if any value looks like a 13-19 digit card number string
 *      (regex: /^\d{13,19}$/)
 *   3. Does NOT throw for safe keys: last4, brand, stripePaymentIntentId,
 *      paypalOrderId, setupIntentId
 *   4. Does NOT throw for last4 values like "4242" (only 4 digits)
 *
 * Contracts drawn from:
 *   specs/spec.md — US3 Payment capture without storing raw card data
 */

import { describe, it, expect } from "vitest";

// @ts-expect-error — assertNoRawCardData is not implemented yet
import { assertNoRawCardData } from "@/lib/payments/storage-guards";

// ── Rule 1: Forbidden key names ───────────────────────────────────────────────

describe("assertNoRawCardData — forbidden key names", () => {
  const forbiddenKeys = [
    "cardNumber",
    "card_number",
    "cvv",
    "cvc",
    "pan",
    "fullCardNumber",
  ] as const;

  for (const key of forbiddenKeys) {
    it(`throws when data contains key "${key}"`, () => {
      const data: Record<string, unknown> = { [key]: "some-value" };
      expect(() => assertNoRawCardData(data)).toThrow();
    });
  }

  it("throws when data contains cardNumber alongside safe fields", () => {
    const data = {
      stripePaymentIntentId: "pi_test_abc",
      cardNumber: "4111111111111111",
      brand: "visa",
    };
    expect(() => assertNoRawCardData(data)).toThrow();
  });

  it("throws when data contains cvv alongside last4", () => {
    const data = { last4: "4242", cvv: "123" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });
});

// ── Rule 2: Values that look like full card numbers ───────────────────────────

describe("assertNoRawCardData — forbidden card-number-like values", () => {
  it("throws for a 16-digit string value (classic Visa format)", () => {
    const data = { someField: "4111111111111111" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });

  it("throws for a 13-digit string value (minimum card number length)", () => {
    const data = { someField: "4000000000000" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });

  it("throws for a 19-digit string value (maximum card number length)", () => {
    const data = { someField: "4111111111111111000" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });

  it("throws for a card number stored under an innocuous key", () => {
    const data = { tokenId: "4242424242424242" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });

  it("throws for an Amex-style 15-digit number", () => {
    const data = { reference: "378282246310005" };
    expect(() => assertNoRawCardData(data)).toThrow();
  });
});

// ── Rule 3: Safe fields must NOT throw ────────────────────────────────────────

describe("assertNoRawCardData — safe fields do not throw", () => {
  it("does not throw for { last4, brand, stripePaymentIntentId }", () => {
    const data = {
      last4: "4242",
      brand: "visa",
      stripePaymentIntentId: "pi_test_abc123",
    };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for { paypalOrderId }", () => {
    const data = { paypalOrderId: "PAYPAL-ORDER-XYZ-789" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for { setupIntentId }", () => {
    const data = { setupIntentId: "seti_test_def456" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for a full safe metadata object", () => {
    const data = {
      stripePaymentIntentId: "pi_test_abc123",
      last4: "4242",
      brand: "mastercard",
      setupIntentId: "seti_test_def456",
      paypalOrderId: undefined,
    };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for an empty object", () => {
    expect(() => assertNoRawCardData({})).not.toThrow();
  });
});

// ── Rule 4: last4 values like "4242" (4 digits) must NOT throw ────────────────

describe("assertNoRawCardData — last4 short digit strings are allowed", () => {
  it("does not throw for last4 = '4242' (4-digit string, not a card number)", () => {
    const data = { last4: "4242" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for last4 = '0000'", () => {
    const data = { last4: "0000" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for last4 = '9999'", () => {
    const data = { last4: "9999" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for a 12-digit string (below minimum card number length)", () => {
    // 12 digits is shorter than the minimum 13-digit card number length
    const data = { someField: "123456789012" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for a 20-digit string (above maximum card number length)", () => {
    // 20 digits exceeds the maximum 19-digit card number length
    const data = { someField: "12345678901234567890" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("assertNoRawCardData — edge cases", () => {
  it("does not throw for non-string values (numbers, booleans, objects)", () => {
    const data = {
      amount: 5000,
      isDefault: true,
      metadata: { appointmentId: "appt-1" },
    };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for null values", () => {
    const data = { paypalOrderId: null };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });

  it("does not throw for string values that are not digit-only (have dashes)", () => {
    // A formatted card string with dashes should not match the raw digit regex
    const data = { someField: "4111-1111-1111-1111" };
    expect(() => assertNoRawCardData(data)).not.toThrow();
  });
});
