/**
 * Membership domain: plan queries (US4 — T069)
 */

import { db } from "@bhb/db";

export type PlanWithPricing = Awaited<ReturnType<typeof getActivePlans>>[number];

/**
 * Fetch all active membership plans, including their per-tier pricing.
 */
export async function getActivePlans() {
  return db.membershipPlan.findMany({
    where: { isActive: true },
    include: {
      pricing: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Fetch a single membership plan by ID, including pricing.
 * Returns null if not found.
 */
export async function getPlanById(planId: string) {
  return db.membershipPlan.findUnique({
    where: { id: planId },
    include: {
      pricing: true,
    },
  });
}
