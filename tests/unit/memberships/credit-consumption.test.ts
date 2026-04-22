/**
 * T065 — Unit tests for membership credit consumption and tier-difference charging
 *
 * Tests for:
 *   consumeCredit(membership, booking) — apps/web/lib/memberships/credits.ts
 *
 * The credits module does NOT exist yet. @ts-expect-error directives allow
 * this file to compile but every test will FAIL at runtime until the module
 * is implemented.
 *
 * Business rules verified:
 *   - Same-tier booking consumes 1 credit from creditBalance
 *   - Zero creditBalance → throws InsufficientCreditsError
 *   - Tier upgrade (membership junior, booking senior) → no credit consumed,
 *     returns chargeUsd equal to the tier price delta
 *   - Successful same-tier consumption → { creditConsumed: true, chargeUsd: 0 }
 *
 * Contracts drawn from:
 *   specs/data-model.md  — Membership model fields, StaffTier enum
 *   specs/spec.md        — US4 credit consumption and tier-difference rules
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock("@bhb/db", () => ({
  prisma: {
    membership: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    membershipPlan: {
      findUnique: vi.fn(),
    },
  },
}));

// @ts-expect-error — credits module not implemented yet
import { consumeCredit, InsufficientCreditsError } from "@/lib/memberships/credits";

import { prisma } from "@bhb/db";

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Membership with junior tier and 3 credits remaining */
const mockMembershipJunior = {
  id: "mem-001",
  clientId: "client-1",
  planId: "plan-1",
  staffTier: "junior" as const,
  status: "active" as const,
  creditBalance: 3,
  billingStart: new Date("2026-04-01T00:00:00.000Z"),
  nextRenewalAt: new Date("2026-05-01T00:00:00.000Z"),
  stripeSubscriptionId: "sub_test_001",
};

/** Membership with junior tier and 0 credits remaining */
const mockMembershipNoCredits = {
  ...mockMembershipJunior,
  id: "mem-002",
  creditBalance: 0,
};

/** Plan pricing by tier (cents USD) */
const tierPricing = {
  junior: 4999,
  senior: 6999,
  master: 9999,
};

/** Booking at same tier (junior) */
const bookingJunior = {
  id: "booking-1",
  staffTier: "junior" as const,
  serviceId: "service-1",
};

/** Booking at senior tier (upgrade from junior membership) */
const bookingUpgradeToSenior = {
  id: "booking-2",
  staffTier: "senior" as const,
  serviceId: "service-1",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("consumeCredit — same-tier booking", () => {
  it("reduces creditBalance by 1 when booking tier matches membership tier", async () => {
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockMembershipJunior,
      creditBalance: 2,
    } as never);

    const result = await consumeCredit(mockMembershipJunior, bookingJunior, tierPricing);

    expect(result.creditConsumed).toBe(true);
    expect(result.chargeUsd).toBe(0);
  });

  it("calls prisma.membership.update to decrement creditBalance by 1", async () => {
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockMembershipJunior,
      creditBalance: 2,
    } as never);

    await consumeCredit(mockMembershipJunior, bookingJunior, tierPricing);

    expect(prisma.membership.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockMembershipJunior.id },
        data: expect.objectContaining({
          creditBalance: { decrement: 1 },
        }),
      })
    );
  });

  it("returns { creditConsumed: true, chargeUsd: 0 } on successful credit consumption", async () => {
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockMembershipJunior,
      creditBalance: 2,
    } as never);

    const result = await consumeCredit(mockMembershipJunior, bookingJunior, tierPricing);

    expect(result).toEqual({ creditConsumed: true, chargeUsd: 0 });
  });
});

describe("consumeCredit — zero credits", () => {
  it("throws InsufficientCreditsError when creditBalance is 0", async () => {
    await expect(
      consumeCredit(mockMembershipNoCredits, bookingJunior, tierPricing)
    ).rejects.toThrow(InsufficientCreditsError);
  });

  it("throws InsufficientCreditsError with a descriptive message", async () => {
    await expect(
      consumeCredit(mockMembershipNoCredits, bookingJunior, tierPricing)
    ).rejects.toThrow(/insufficient credits/i);
  });

  it("does NOT call prisma.membership.update when credits are exhausted", async () => {
    await consumeCredit(mockMembershipNoCredits, bookingJunior, tierPricing).catch(() => {
      // expected to throw
    });

    expect(prisma.membership.update).not.toHaveBeenCalled();
  });
});

describe("consumeCredit — tier upgrade", () => {
  it("does not consume a credit when booking tier is higher than membership tier", async () => {
    const result = await consumeCredit(
      mockMembershipJunior,
      bookingUpgradeToSenior,
      tierPricing
    );

    expect(result.creditConsumed).toBe(false);
  });

  it("returns the USD price delta when upgrading from junior to senior tier", async () => {
    const expectedDelta = tierPricing.senior - tierPricing.junior; // 6999 - 4999 = 2000

    const result = await consumeCredit(
      mockMembershipJunior,
      bookingUpgradeToSenior,
      tierPricing
    );

    expect(result.chargeUsd).toBe(expectedDelta);
  });

  it("does not call prisma.membership.update for tier upgrade (no credit deducted)", async () => {
    await consumeCredit(mockMembershipJunior, bookingUpgradeToSenior, tierPricing);

    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("returns { creditConsumed: false, chargeUsd: <delta> } shape for tier upgrade", async () => {
    const expectedDelta = tierPricing.senior - tierPricing.junior;

    const result = await consumeCredit(
      mockMembershipJunior,
      bookingUpgradeToSenior,
      tierPricing
    );

    expect(result).toEqual({ creditConsumed: false, chargeUsd: expectedDelta });
  });
});
