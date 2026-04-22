/**
 * T066 — Integration tests for membership renewal and credit issuance
 *
 * Tests for:
 *   renewMembership(membershipId) — apps/web/lib/memberships/renewals.ts
 *
 * The renewals module does NOT exist yet. @ts-expect-error directives allow
 * this file to compile but every test will FAIL at runtime until the module
 * is implemented.
 *
 * Business rules verified:
 *   - Renewal sets creditBalance to creditsPerCycle
 *   - nextRenewalAt advances by +1 month (monthly) or +1 year (annual)
 *   - Membership status remains 'active' after renewal
 *   - Throws when membership status is 'cancelled'
 *   - Throws when membership status is 'expired'
 *   - Idempotent: calling twice within same billing cycle does not double-grant
 *     (guard: nextRenewalAt > now means renewal already processed)
 *
 * Contracts drawn from:
 *   specs/data-model.md  — Membership model, MembershipPlan model
 *   specs/spec.md        — US4 credit replenishment rules
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock("@bhb/db", () => ({
  prisma: {
    membership: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// @ts-expect-error — renewals module not implemented yet
import { renewMembership } from "@/lib/memberships/renewals";

import { prisma } from "@bhb/db";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = new Date("2026-04-22T00:00:00.000Z");

/** Active membership on a monthly plan, renewal due today */
const mockActiveMembershipMonthly = {
  id: "mem-monthly-001",
  clientId: "client-1",
  planId: "plan-monthly",
  staffTier: "junior",
  status: "active",
  creditBalance: 0,
  billingStart: new Date("2026-03-22T00:00:00.000Z"),
  nextRenewalAt: NOW,
  stripeSubscriptionId: "sub_test_monthly",
  plan: {
    id: "plan-monthly",
    name: "Monthly Wax Club",
    billingCycle: "monthly",
    creditsPerCycle: 4,
    isActive: true,
    stripeProductId: "prod_test_monthly",
  },
};

/** Active membership on an annual plan, renewal due today */
const mockActiveMembershipAnnual = {
  id: "mem-annual-001",
  clientId: "client-2",
  planId: "plan-annual",
  staffTier: "senior",
  status: "active",
  creditBalance: 0,
  billingStart: new Date("2025-04-22T00:00:00.000Z"),
  nextRenewalAt: NOW,
  stripeSubscriptionId: "sub_test_annual",
  plan: {
    id: "plan-annual",
    name: "Annual Wax Club",
    billingCycle: "annual",
    creditsPerCycle: 48,
    isActive: true,
    stripeProductId: "prod_test_annual",
  },
};

/** Cancelled membership */
const mockCancelledMembership = {
  ...mockActiveMembershipMonthly,
  id: "mem-cancelled-001",
  status: "cancelled",
};

/** Expired membership */
const mockExpiredMembership = {
  ...mockActiveMembershipMonthly,
  id: "mem-expired-001",
  status: "expired",
};

/** Active monthly membership that already renewed (nextRenewalAt is in the future) */
const mockAlreadyRenewedMembership = {
  ...mockActiveMembershipMonthly,
  id: "mem-already-001",
  creditBalance: 4,
  nextRenewalAt: new Date("2026-05-22T00:00:00.000Z"), // one month from now
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a Date that is +1 month from the given date (simple calendar month) */
function addOneMonth(d: Date): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + 1);
  return next;
}

/** Returns a Date that is +1 year from the given date */
function addOneYear(d: Date): Date {
  const next = new Date(d);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("renewMembership — monthly plan", () => {
  it("sets creditBalance to creditsPerCycle after renewal", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockActiveMembershipMonthly as never
    );
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipMonthly,
      creditBalance: mockActiveMembershipMonthly.plan.creditsPerCycle,
      nextRenewalAt: addOneMonth(mockActiveMembershipMonthly.nextRenewalAt),
    } as never);

    const result = await renewMembership(mockActiveMembershipMonthly.id);

    expect(result.creditBalance).toBe(mockActiveMembershipMonthly.plan.creditsPerCycle);
  });

  it("advances nextRenewalAt by +1 month for monthly billing cycle", async () => {
    const expectedNextRenewal = addOneMonth(mockActiveMembershipMonthly.nextRenewalAt);

    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockActiveMembershipMonthly as never
    );
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipMonthly,
      creditBalance: mockActiveMembershipMonthly.plan.creditsPerCycle,
      nextRenewalAt: expectedNextRenewal,
    } as never);

    const result = await renewMembership(mockActiveMembershipMonthly.id);

    expect(new Date(result.nextRenewalAt).getMonth()).toBe(expectedNextRenewal.getMonth());
  });

  it("keeps membership status as 'active' after renewal", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockActiveMembershipMonthly as never
    );
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipMonthly,
      creditBalance: mockActiveMembershipMonthly.plan.creditsPerCycle,
      nextRenewalAt: addOneMonth(mockActiveMembershipMonthly.nextRenewalAt),
      status: "active",
    } as never);

    const result = await renewMembership(mockActiveMembershipMonthly.id);

    expect(result.status).toBe("active");
  });
});

describe("renewMembership — annual plan", () => {
  it("advances nextRenewalAt by +1 year for annual billing cycle", async () => {
    const expectedNextRenewal = addOneYear(mockActiveMembershipAnnual.nextRenewalAt);

    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockActiveMembershipAnnual as never
    );
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipAnnual,
      creditBalance: mockActiveMembershipAnnual.plan.creditsPerCycle,
      nextRenewalAt: expectedNextRenewal,
    } as never);

    const result = await renewMembership(mockActiveMembershipAnnual.id);

    expect(new Date(result.nextRenewalAt).getFullYear()).toBe(
      expectedNextRenewal.getFullYear()
    );
  });

  it("grants creditsPerCycle (48) credits for annual plan", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockActiveMembershipAnnual as never
    );
    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipAnnual,
      creditBalance: mockActiveMembershipAnnual.plan.creditsPerCycle,
      nextRenewalAt: addOneYear(mockActiveMembershipAnnual.nextRenewalAt),
    } as never);

    const result = await renewMembership(mockActiveMembershipAnnual.id);

    expect(result.creditBalance).toBe(48);
  });
});

describe("renewMembership — invalid status guards", () => {
  it("throws when membership status is 'cancelled'", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockCancelledMembership as never
    );

    await expect(renewMembership(mockCancelledMembership.id)).rejects.toThrow();
  });

  it("throws with a message referencing 'cancelled' status", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockCancelledMembership as never
    );

    await expect(renewMembership(mockCancelledMembership.id)).rejects.toThrow(
      /cancelled/i
    );
  });

  it("throws when membership status is 'expired'", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockExpiredMembership as never
    );

    await expect(renewMembership(mockExpiredMembership.id)).rejects.toThrow();
  });

  it("throws with a message referencing 'expired' status", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockExpiredMembership as never
    );

    await expect(renewMembership(mockExpiredMembership.id)).rejects.toThrow(
      /expired/i
    );
  });

  it("does NOT call prisma.membership.update for a cancelled membership", async () => {
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockCancelledMembership as never
    );

    await renewMembership(mockCancelledMembership.id).catch(() => {
      // expected to throw
    });

    expect(prisma.membership.update).not.toHaveBeenCalled();
  });
});

describe("renewMembership — idempotency guard", () => {
  it("does not double-grant credits when called within the same billing cycle", async () => {
    // nextRenewalAt is already in the future — renewal already processed
    vi.mocked(prisma.membership.findUnique).mockResolvedValue(
      mockAlreadyRenewedMembership as never
    );

    // renewMembership should return early without calling update
    await renewMembership(mockAlreadyRenewedMembership.id).catch(() => {
      // may throw or return early — either is acceptable as long as update is not called
    });

    expect(prisma.membership.update).not.toHaveBeenCalled();
  });

  it("calling renewMembership twice in the same cycle results in only one update call", async () => {
    // First call: renewal due (nextRenewalAt === now)
    vi.mocked(prisma.membership.findUnique)
      .mockResolvedValueOnce(mockActiveMembershipMonthly as never)
      // Second call: already renewed (nextRenewalAt > now)
      .mockResolvedValueOnce(mockAlreadyRenewedMembership as never);

    vi.mocked(prisma.membership.update).mockResolvedValue({
      ...mockActiveMembershipMonthly,
      creditBalance: 4,
      nextRenewalAt: addOneMonth(mockActiveMembershipMonthly.nextRenewalAt),
    } as never);

    await renewMembership(mockActiveMembershipMonthly.id);
    await renewMembership(mockActiveMembershipMonthly.id).catch(() => {
      // second call may throw or no-op
    });

    // Update should have been called exactly once
    expect(prisma.membership.update).toHaveBeenCalledTimes(1);
  });
});
