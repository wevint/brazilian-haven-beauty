import { describe, it, expect } from "vitest";
import { resolvePricing, formatPrice } from "@/lib/booking/pricing";
import type { ServicePricing } from "@bhb/db";

const mockPricingTable: ServicePricing[] = [
  {
    id: "p1",
    serviceId: "s1",
    staffId: null,
    staffTier: "junior",
    priceUsd: 5500,
    durationMinutes: 45,
    active: true,
  } as unknown as ServicePricing,
  {
    id: "p2",
    serviceId: "s1",
    staffId: null,
    staffTier: "senior",
    priceUsd: 7000,
    durationMinutes: 40,
    active: true,
  } as unknown as ServicePricing,
  {
    id: "p3",
    serviceId: "s1",
    staffId: null,
    staffTier: "master",
    priceUsd: 9000,
    durationMinutes: 35,
    active: true,
  } as unknown as ServicePricing,
];

describe("resolvePricing", () => {
  it("returns correct price and duration for junior tier", () => {
    const result = resolvePricing("s1", "junior", mockPricingTable);
    expect(result.priceUsd).toBe(5500);
    expect(result.durationMinutes).toBe(45);
  });

  it("returns correct price and duration for senior tier", () => {
    const result = resolvePricing("s1", "senior", mockPricingTable);
    expect(result.priceUsd).toBe(7000);
    expect(result.durationMinutes).toBe(40);
  });

  it("returns correct price and duration for master tier", () => {
    const result = resolvePricing("s1", "master", mockPricingTable);
    expect(result.priceUsd).toBe(9000);
    expect(result.durationMinutes).toBe(35);
  });

  it("throws if service not found in pricing table", () => {
    expect(() => resolvePricing("not-a-service", "junior", mockPricingTable)).toThrow();
  });

  it("throws if pricing entry is inactive", () => {
    const inactiveTable = mockPricingTable.map((p) =>
      p.staffTier === "junior" ? { ...p, active: false } : p
    );
    expect(() => resolvePricing("s1", "junior", inactiveTable as unknown as ServicePricing[])).toThrow();
  });
});

describe("formatPrice", () => {
  it("formats 5000 cents as $50.00", () => {
    expect(formatPrice(5000)).toBe("$50.00");
  });

  it("formats 7500 cents as $75.00", () => {
    expect(formatPrice(7500)).toBe("$75.00");
  });

  it("formats 0 cents as $0.00", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats 9999 cents as $99.99", () => {
    expect(formatPrice(9999)).toBe("$99.99");
  });
});
