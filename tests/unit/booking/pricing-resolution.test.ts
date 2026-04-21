/**
 * T022 — Unit tests: pricing resolution
 *
 * Tests for `apps/web/lib/booking/pricing.ts` which does not exist yet (TDD).
 * These tests will fail until T029 creates the pricing service module.
 *
 * Contracts drawn from:
 *   specs/data-model.md   — ServicePricing entity fields
 *   specs/contracts/api.md — staffTier enum: "junior" | "senior" | "master"
 */

import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Future import — module will be created in T029
// ---------------------------------------------------------------------------
// @ts-expect-error — module not yet implemented
import { resolvePricing, formatPrice } from "@/lib/booking/pricing";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

type StaffTier = "junior" | "senior" | "master";

interface PricingEntry {
  staffTier: StaffTier;
  priceUsd: number;         // stored as cents in this fixture to match the
  durationMinutes: number;  // formatPrice(5000) → "$50.00" test requirement
  isActive: boolean;
}

/**
 * Sample pricing table for a "Brazilian Wax" service.
 * priceUsd is represented in cents here (matching the formatPrice test
 * assertions which pass cents as the raw number — 5000 → "$50.00").
 */
const FIXTURE_PRICING_TABLE: PricingEntry[] = [
  { staffTier: "junior",  priceUsd: 4500, durationMinutes: 45, isActive: true  },
  { staffTier: "senior",  priceUsd: 6000, durationMinutes: 50, isActive: true  },
  { staffTier: "master",  priceUsd: 8000, durationMinutes: 60, isActive: true  },
];

const FIXTURE_INACTIVE_TIER: PricingEntry[] = [
  { staffTier: "junior", priceUsd: 4500, durationMinutes: 45, isActive: false },
];

// ---------------------------------------------------------------------------
// resolvePricing
// ---------------------------------------------------------------------------

describe("resolvePricing(serviceId, staffTier, pricingTable)", () => {
  it("returns correct price for JUNIOR tier", () => {
    const result = resolvePricing("svc-001", "junior", FIXTURE_PRICING_TABLE);
    expect(result.priceUsd).toBe(4500);
  });

  it("returns correct price for SENIOR tier", () => {
    const result = resolvePricing("svc-001", "senior", FIXTURE_PRICING_TABLE);
    expect(result.priceUsd).toBe(6000);
  });

  it("returns correct price for MASTER tier", () => {
    const result = resolvePricing("svc-001", "master", FIXTURE_PRICING_TABLE);
    expect(result.priceUsd).toBe(8000);
  });

  it("returns correct duration for JUNIOR tier", () => {
    const result = resolvePricing("svc-001", "junior", FIXTURE_PRICING_TABLE);
    expect(result.durationMinutes).toBe(45);
  });

  it("returns correct duration for SENIOR tier", () => {
    const result = resolvePricing("svc-001", "senior", FIXTURE_PRICING_TABLE);
    expect(result.durationMinutes).toBe(50);
  });

  it("returns correct duration for MASTER tier", () => {
    const result = resolvePricing("svc-001", "master", FIXTURE_PRICING_TABLE);
    expect(result.durationMinutes).toBe(60);
  });

  it("throws if staffTier is not found in pricingTable", () => {
    const emptyTable: PricingEntry[] = [];
    expect(() =>
      resolvePricing("svc-001", "senior", emptyTable)
    ).toThrow();
  });

  it("throws with a descriptive message when tier not found", () => {
    expect(() =>
      resolvePricing("svc-001", "master", FIXTURE_INACTIVE_TIER)
    ).toThrow(/master/i);
  });

  it("throws when pricing entry exists but isActive is false", () => {
    // An inactive tier entry should not be resolvable for booking
    expect(() =>
      resolvePricing("svc-001", "junior", FIXTURE_INACTIVE_TIER)
    ).toThrow();
  });

  it("returns a result object with both priceUsd and durationMinutes properties", () => {
    const result = resolvePricing("svc-001", "senior", FIXTURE_PRICING_TABLE);
    expect(result).toHaveProperty("priceUsd");
    expect(result).toHaveProperty("durationMinutes");
  });

  it("the returned priceUsd is a number (not string or null)", () => {
    const result = resolvePricing("svc-001", "junior", FIXTURE_PRICING_TABLE);
    expect(typeof result.priceUsd).toBe("number");
  });

  it("the returned durationMinutes is a positive integer", () => {
    const result = resolvePricing("svc-001", "junior", FIXTURE_PRICING_TABLE);
    expect(typeof result.durationMinutes).toBe("number");
    expect(result.durationMinutes).toBeGreaterThan(0);
    expect(Number.isInteger(result.durationMinutes)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------

describe("formatPrice(amount: number)", () => {
  it('formats 5000 (cents) as "$50.00"', () => {
    expect(formatPrice(5000)).toBe("$50.00");
  });

  it('formats 0 as "$0.00"', () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles fractional cents correctly (rounds to nearest cent)", () => {
    // 5001 cents = $50.01
    expect(formatPrice(5001)).toBe("$50.01");
  });

  it("handles single-digit cent values with proper zero-padding", () => {
    // 501 cents = $5.01
    expect(formatPrice(501)).toBe("$5.01");
  });

  it("handles large amounts correctly", () => {
    // 100000 cents = $1000.00
    expect(formatPrice(100000)).toBe("$1,000.00");
  });

  it("always returns a string", () => {
    expect(typeof formatPrice(4500)).toBe("string");
  });

  it("always includes the dollar sign prefix", () => {
    expect(formatPrice(6000)).toMatch(/^\$/);
  });

  it("always includes two decimal places", () => {
    expect(formatPrice(6000)).toMatch(/\.\d{2}$/);
  });
});
