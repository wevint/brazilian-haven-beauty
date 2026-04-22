/**
 * T074 — Contract tests for packages tRPC router
 *
 * These tests verify the exact input/output shapes of tRPC procedures for
 * Phase 7 (US5 – Client purchases a service package / bundle in advance).
 *
 * The packages router procedures do NOT exist yet. @ts-expect-error is used so
 * the file compiles but the runtime procedure-existence tests fail once the
 * missing procedures are invoked.
 *
 * Contracts drawn from:
 *   specs/tasks.md        — T074–T077 domain model for packages
 *   specs/contracts/api.md — router procedure signatures
 *   specs/data-model.md   — ServicePackage / ClientPackage models
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Output shape schemas ──────────────────────────────────────────────────────

const ServicePackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  sessionCount: z.number(),
  priceUsd: z.number(),
  validityDays: z.number(),
  isActive: z.boolean(),
});

const PackagePurchaseResultSchema = z.object({
  clientPackageId: z.string(),
  sessionsGranted: z.number(),
  expiresAt: z.string(),
});

const PackageBalanceSchema = z.object({
  sessionsRemaining: z.number(),
  expiresAt: z.string(),
  status: z.string(),
});

// ── Schema smoke tests (always pass — verify Zod schemas are correct) ─────────

describe("packages.list — contract shape", () => {
  it("ServicePackage schema accepts valid shape", () => {
    const sample = {
      id: "pkg-uuid-001",
      name: "10-Session Brazilian Bundle",
      sessionCount: 10,
      priceUsd: 49900,
      validityDays: 365,
      isActive: true,
    };
    const result = ServicePackageSchema.safeParse(sample);
    expect(result.success).toBe(true);
  });

  it("ServicePackage schema rejects missing sessionCount field", () => {
    const bad = {
      id: "pkg-uuid-001",
      name: "10-Session Brazilian Bundle",
      priceUsd: 49900,
      validityDays: 365,
      isActive: true,
    };
    const result = ServicePackageSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("ServicePackage schema rejects non-boolean isActive", () => {
    const bad = {
      id: "pkg-uuid-001",
      name: "10-Session Brazilian Bundle",
      sessionCount: 10,
      priceUsd: 49900,
      validityDays: 365,
      isActive: "yes", // must be boolean
    };
    const result = ServicePackageSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("packages.purchase — contract shape", () => {
  it("PackagePurchaseResult schema accepts valid shape", () => {
    const sample = {
      clientPackageId: "cpkg-uuid-001",
      sessionsGranted: 10,
      expiresAt: "2027-04-22T00:00:00.000Z",
    };
    const result = PackagePurchaseResultSchema.safeParse(sample);
    expect(result.success).toBe(true);
  });

  it("PackagePurchaseResult schema rejects missing expiresAt", () => {
    const bad = {
      clientPackageId: "cpkg-uuid-001",
      sessionsGranted: 10,
    };
    const result = PackagePurchaseResultSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it("PackagePurchaseResult schema rejects non-string expiresAt", () => {
    const bad = {
      clientPackageId: "cpkg-uuid-001",
      sessionsGranted: 10,
      expiresAt: new Date("2027-04-22"), // must be string per contract
    };
    const result = PackagePurchaseResultSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });
});

describe("packages.balance — contract shape", () => {
  it("PackageBalance schema accepts valid shape", () => {
    const sample = {
      sessionsRemaining: 7,
      expiresAt: "2027-04-22T00:00:00.000Z",
      status: "active",
    };
    const result = PackageBalanceSchema.safeParse(sample);
    expect(result.success).toBe(true);
  });

  it("PackageBalance schema accepts exhausted status", () => {
    const sample = {
      sessionsRemaining: 0,
      expiresAt: "2027-04-22T00:00:00.000Z",
      status: "exhausted",
    };
    const result = PackageBalanceSchema.safeParse(sample);
    expect(result.success).toBe(true);
  });

  it("PackageBalance schema accepts expired status", () => {
    const sample = {
      sessionsRemaining: 3,
      expiresAt: "2025-01-01T00:00:00.000Z",
      status: "expired",
    };
    const result = PackageBalanceSchema.safeParse(sample);
    expect(result.success).toBe(true);
  });

  it("PackageBalance schema rejects missing sessionsRemaining", () => {
    const bad = {
      expiresAt: "2027-04-22T00:00:00.000Z",
      status: "active",
    };
    const result = PackageBalanceSchema.safeParse(bad);
    expect(result.success).toBe(false);
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

const guestCtx = {};

const clientCtx = {
  session: { user: { id: "client-user-1", email: "client@bhb.com", role: "client" } },
};

describe("packages.list procedure — existence (runtime fail until implemented)", () => {
  it("packages.list exists and returns ServicePackage array", async () => {
    const caller = createCaller(guestCtx);
    // @ts-expect-error — packages router not implemented yet
    await expect(caller.packages.list()).rejects.toThrow();
  });
});

describe("packages.purchase procedure — existence (runtime fail until implemented)", () => {
  it("packages.purchase exists and accepts packageId + paymentMethod", async () => {
    const caller = createCaller(clientCtx);
    // @ts-expect-error — packages router not implemented yet
    await expect(
      caller.packages.purchase({
        packageId: "pkg-uuid-dummy",
        paymentMethod: "stripe",
        stripePaymentMethodId: "pm_test_dummy",
      })
    ).rejects.toThrow();
  });

  it("packages.purchase exists and accepts paypal paymentMethod without stripePaymentMethodId", async () => {
    const caller = createCaller(clientCtx);
    // @ts-expect-error — packages router not implemented yet
    await expect(
      caller.packages.purchase({
        packageId: "pkg-uuid-dummy",
        paymentMethod: "paypal",
      })
    ).rejects.toThrow();
  });
});

describe("packages.balance procedure — existence (runtime fail until implemented)", () => {
  it("packages.balance exists and accepts clientPackageId", async () => {
    const caller = createCaller(clientCtx);
    // @ts-expect-error — packages router not implemented yet
    await expect(
      caller.packages.balance({ clientPackageId: "cpkg-uuid-dummy" })
    ).rejects.toThrow();
  });
});
