/**
 * T040 — Integration tests: service pricing updates
 *
 * Tests `updateServicePricing(serviceId, staffTier, priceUsd, durationMinutes)`
 * from `apps/web/lib/admin/services.ts` — which does NOT exist yet.
 *
 * These tests require a real PostgreSQL test database (DATABASE_URL env var)
 * and use Prisma directly to seed fixtures before each test.
 *
 * All tests will FAIL until the implementation module is created.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@bhb/db";
import type { StaffTier } from "@bhb/db";

// @ts-expect-error — module does not exist yet; tests will fail at runtime
import { updateServicePricing } from "@/lib/admin/services";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestService() {
  const slug = `pricing-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return db.service.create({
    data: {
      name: "Pricing Test Service",
      nameTranslations: { en: "Pricing Test Service", pt: "Serviço de Teste de Preço" },
      slug,
      description: "Used for pricing integration tests",
      descriptionTranslations: {
        en: "Used for pricing integration tests",
        pt: "Usado em testes de preço",
      },
      category: "Test",
      active: true,
      allowWaitlist: false,
      displayOrder: 99,
    },
  });
}

async function createTestPricing(serviceId: string, staffTier: StaffTier) {
  return db.servicePricing.create({
    data: {
      serviceId,
      staffTier,
      priceUsd: 5500,
      durationMinutes: 45,
      active: true,
    },
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("updateServicePricing integration", () => {
  let serviceId: string;
  let pricingId: string;

  const createdPricingIds: string[] = [];
  let createdServiceId: string | null = null;

  beforeEach(async () => {
    const service = await createTestService();
    serviceId = service.id;
    createdServiceId = service.id;

    const pricing = await createTestPricing(serviceId, "senior");
    pricingId = pricing.id;
    createdPricingIds.push(pricingId);
  });

  afterEach(async () => {
    if (createdPricingIds.length > 0) {
      await db.servicePricing
        .deleteMany({ where: { id: { in: [...createdPricingIds] } } })
        .catch(() => {});
      createdPricingIds.length = 0;
    }
    if (createdServiceId) {
      await db.service.delete({ where: { id: createdServiceId } }).catch(() => {});
      createdServiceId = null;
    }
  });

  it("successfully updates pricing for an existing service + staffTier combination", async () => {
    const newPrice = 8000;
    const newDuration = 60;

    const result = await updateServicePricing(serviceId, "senior", newPrice, newDuration);

    expect(result).toBeDefined();
    expect(result.serviceId).toBe(serviceId);
    expect(result.staffTier).toBe("senior");
    expect(result.priceUsd).toBe(newPrice);
    expect(result.durationMinutes).toBe(newDuration);

    // Verify persisted in DB
    const persisted = await db.servicePricing.findUniqueOrThrow({ where: { id: result.id } });
    expect(persisted.priceUsd).toBe(newPrice);
    expect(persisted.durationMinutes).toBe(newDuration);
  });

  it("throws NOT_FOUND when the service does not exist", async () => {
    const nonExistentServiceId = "00000000-0000-0000-0000-000000000000";

    await expect(
      updateServicePricing(nonExistentServiceId, "senior", 8000, 60)
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws BAD_REQUEST when priceUsd is negative", async () => {
    await expect(
      updateServicePricing(serviceId, "senior", -100, 45)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST when durationMinutes is zero or negative", async () => {
    await expect(
      updateServicePricing(serviceId, "senior", 5000, 0)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
