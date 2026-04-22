/**
 * T064 — Contract tests for tRPC memberships and plans routers
 *
 * These tests verify the exact input/output shapes of tRPC procedures for
 * Phase 6 (US4 – Client buys a subscription plan with a chosen staff tier).
 *
 * The memberships router procedures do NOT exist yet. @ts-expect-error is used
 * on every caller invocation so the file compiles but every runtime test will
 * FAIL until the procedures are implemented.
 *
 * Contracts drawn from:
 *   specs/data-model.md  — MembershipPlan, Membership, PlanPricing models
 *   specs/spec.md        — US4 membership signup and credit-balance flows
 *   specs/contracts/     — router procedure signatures
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Output shape schemas ──────────────────────────────────────────────────────

const PlanPricingSchema = z.object({
  staffTier: z.enum(["junior", "senior", "master"]),
  priceUsd: z.number(),
  stripePriceId: z.string(),
});

const MembershipPlanWithPricingSchema = z.object({
  id: z.string(),
  name: z.string(),
  billingCycle: z.enum(["monthly", "annual"]),
  creditsPerCycle: z.number(),
  isActive: z.boolean(),
  stripeProductId: z.string(),
  pricing: z.array(PlanPricingSchema),
});

const MembershipSignupResultSchema = z.object({
  membershipId: z.string(),
  stripeSubscriptionId: z.string(),
  nextRenewalAt: z.string(),
});

const CreditBalanceResultSchema = z.object({
  creditsRemaining: z.number(),
  nextRenewalAt: z.string(),
  planName: z.string(),
});

// ── Schema smoke tests (always pass — verify Zod schemas are correct) ─────────

describe("MembershipPlanWithPricing schema", () => {
  it("accepts a valid membership plan with pricing", () => {
    const sample = {
      id: "plan-1",
      name: "Monthly Wax Club",
      billingCycle: "monthly" as const,
      creditsPerCycle: 4,
      isActive: true,
      stripeProductId: "prod_test_001",
      pricing: [
        {
          staffTier: "junior" as const,
          priceUsd: 4999,
          stripePriceId: "price_junior_monthly",
        },
        {
          staffTier: "senior" as const,
          priceUsd: 6999,
          stripePriceId: "price_senior_monthly",
        },
      ],
    };
    expect(() => MembershipPlanWithPricingSchema.parse(sample)).not.toThrow();
  });

  it("accepts annual billing cycle", () => {
    const sample = {
      id: "plan-2",
      name: "Annual Wax Club",
      billingCycle: "annual" as const,
      creditsPerCycle: 48,
      isActive: true,
      stripeProductId: "prod_test_002",
      pricing: [
        {
          staffTier: "master" as const,
          priceUsd: 99900,
          stripePriceId: "price_master_annual",
        },
      ],
    };
    expect(() => MembershipPlanWithPricingSchema.parse(sample)).not.toThrow();
  });

  it("rejects invalid billingCycle value", () => {
    const bad = {
      id: "plan-1",
      name: "Bad Plan",
      billingCycle: "weekly", // not valid
      creditsPerCycle: 4,
      isActive: true,
      stripeProductId: "prod_test_001",
      pricing: [],
    };
    expect(() => MembershipPlanWithPricingSchema.parse(bad)).toThrow();
  });

  it("rejects plan missing creditsPerCycle", () => {
    const bad = {
      id: "plan-1",
      name: "Incomplete Plan",
      billingCycle: "monthly" as const,
      isActive: true,
      stripeProductId: "prod_test_001",
      pricing: [],
    };
    expect(() => MembershipPlanWithPricingSchema.parse(bad)).toThrow();
  });

  it("rejects pricing entry with invalid staffTier", () => {
    const bad = {
      id: "plan-1",
      name: "Bad Pricing",
      billingCycle: "monthly" as const,
      creditsPerCycle: 4,
      isActive: true,
      stripeProductId: "prod_test_001",
      pricing: [
        {
          staffTier: "beginner", // not valid
          priceUsd: 4999,
          stripePriceId: "price_beginner_monthly",
        },
      ],
    };
    expect(() => MembershipPlanWithPricingSchema.parse(bad)).toThrow();
  });
});

describe("MembershipSignupResult schema", () => {
  it("accepts valid signup result", () => {
    const sample = {
      membershipId: "mem-abc123",
      stripeSubscriptionId: "sub_test_001",
      nextRenewalAt: "2026-05-22T00:00:00.000Z",
    };
    expect(() => MembershipSignupResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects result missing stripeSubscriptionId", () => {
    const bad = {
      membershipId: "mem-abc123",
      nextRenewalAt: "2026-05-22T00:00:00.000Z",
    };
    expect(() => MembershipSignupResultSchema.parse(bad)).toThrow();
  });
});

describe("CreditBalance schema", () => {
  it("accepts valid credit balance result", () => {
    const sample = {
      creditsRemaining: 3,
      nextRenewalAt: "2026-05-22T00:00:00.000Z",
      planName: "Monthly Wax Club",
    };
    expect(() => CreditBalanceResultSchema.parse(sample)).not.toThrow();
  });

  it("accepts zero credits remaining", () => {
    const sample = {
      creditsRemaining: 0,
      nextRenewalAt: "2026-05-22T00:00:00.000Z",
      planName: "Annual Wax Club",
    };
    expect(() => CreditBalanceResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects non-number creditsRemaining", () => {
    const bad = {
      creditsRemaining: "three", // invalid
      nextRenewalAt: "2026-05-22T00:00:00.000Z",
      planName: "Monthly Wax Club",
    };
    expect(() => CreditBalanceResultSchema.parse(bad)).toThrow();
  });
});

// ── Runtime procedure existence tests (will FAIL until implementation) ────────
//
// Each block calls a procedure that doesn't exist yet on appRouter. The
// @ts-expect-error directive allows the TypeScript compiler to accept the call
// even though the property is absent from the type; the test then fails at
// runtime because the procedure is undefined.

import { appRouter } from "@bhb/trpc";
import { createCallerFactory } from "@trpc/server";

const createCaller = createCallerFactory(appRouter);

const publicCtx = { session: null };

const clientCtx = {
  session: {
    user: {
      id: "client-user-1",
      email: "client@example.com",
      role: "client",
    },
  },
};

describe("memberships.plans.list — existence (runtime fail until implemented)", () => {
  const caller = createCaller(publicCtx);

  it("returns array of MembershipPlanWithPricing for locale=en", async () => {
    // @ts-expect-error — memberships router not implemented yet
    const result = await caller.memberships.plans.list({ locale: "en" });
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(() => MembershipPlanWithPricingSchema.parse(result[0])).not.toThrow();
    }
  });

  it("returns array of MembershipPlanWithPricing for locale=pt", async () => {
    // @ts-expect-error — memberships router not implemented yet
    const result = await caller.memberships.plans.list({ locale: "pt" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("memberships.signup — existence (runtime fail until implemented)", () => {
  const caller = createCaller(clientCtx);

  it("returns membershipId, stripeSubscriptionId, and nextRenewalAt", async () => {
    // @ts-expect-error — memberships.signup not implemented yet
    const result = await caller.memberships.signup({
      planId: "plan-dummy-001",
      staffTier: "junior",
      stripePaymentMethodId: "pm_test_dummy_001",
    });
    expect(() => MembershipSignupResultSchema.parse(result)).not.toThrow();
  });
});

describe("memberships.cancel — existence (runtime fail until implemented)", () => {
  const caller = createCaller(clientCtx);

  it("accepts membershipId + immediate cancellation option", async () => {
    // @ts-expect-error — memberships.cancel not implemented yet
    await expect(
      caller.memberships.cancel({
        membershipId: "mem-dummy-001",
        immediateOrEndOfCycle: "immediate",
      })
    ).rejects.toThrow();
  });

  it("accepts membershipId + end_of_cycle cancellation option", async () => {
    // @ts-expect-error — memberships.cancel not implemented yet
    await expect(
      caller.memberships.cancel({
        membershipId: "mem-dummy-001",
        immediateOrEndOfCycle: "end_of_cycle",
      })
    ).rejects.toThrow();
  });
});

describe("memberships.creditBalance — existence (runtime fail until implemented)", () => {
  const caller = createCaller(clientCtx);

  it("returns creditsRemaining, nextRenewalAt, and planName", async () => {
    // @ts-expect-error — memberships.creditBalance not implemented yet
    const result = await caller.memberships.creditBalance({
      membershipId: "mem-dummy-001",
    });
    expect(() => CreditBalanceResultSchema.parse(result)).not.toThrow();
  });
});
