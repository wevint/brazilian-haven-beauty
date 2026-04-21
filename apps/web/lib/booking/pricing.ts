/**
 * Booking domain: pricing resolution
 * Resolves price and duration for a (serviceId, staffTier) combination from
 * a pre-fetched pricing table.  No business logic lives in page components.
 */

import type { ServicePricing, StaffTier } from "@prisma/client";

export type { StaffTier };

/**
 * Resolve price and duration for a given service + tier from a pricing table.
 *
 * @throws Error if no active pricing entry is found for the combination.
 */
export function resolvePricing(
  serviceId: string,
  staffTier: StaffTier,
  pricingTable: ServicePricing[]
): { priceUsd: number; durationMinutes: number } {
  const entry = pricingTable.find(
    (p) => p.serviceId === serviceId && p.staffTier === staffTier && p.active
  );

  if (!entry) {
    throw new Error(
      `No active pricing found for serviceId="${serviceId}" tier="${staffTier}"`
    );
  }

  return {
    priceUsd: entry.priceUsd,
    durationMinutes: entry.durationMinutes,
  };
}

/**
 * Format a price from integer cents to a human-readable USD string.
 * e.g.  5000 → "$50.00"
 */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}
