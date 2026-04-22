/**
 * Admin domain service: service pricing management helpers.
 * Used by the admin tRPC router and integration tests.
 */

import { TRPCError } from "@trpc/server";
import { db } from "@bhb/db";
import type { ServicePricing, StaffTier } from "@bhb/db";

/**
 * Upsert the pricing for a given service + staffTier combination.
 *
 * - Throws NOT_FOUND if the service does not exist.
 * - Throws BAD_REQUEST if priceUsd is negative or durationMinutes is <= 0.
 */
export async function updateServicePricing(
  serviceId: string,
  staffTier: StaffTier,
  priceUsd: number,
  durationMinutes: number
): Promise<ServicePricing> {
  if (priceUsd < 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "priceUsd must be non-negative",
    });
  }

  if (durationMinutes <= 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "durationMinutes must be greater than 0",
    });
  }

  const service = await db.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Service not found",
    });
  }

  const pricing = await db.servicePricing.upsert({
    where: {
      serviceId_staffTier: {
        serviceId,
        staffTier,
      },
    },
    update: {
      priceUsd,
      durationMinutes,
    },
    create: {
      serviceId,
      staffTier,
      priceUsd,
      durationMinutes,
      active: true,
    },
  });

  return pricing;
}
