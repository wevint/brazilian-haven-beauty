/**
 * Membership domain: credit consumption logic (US4 — T069)
 *
 * Tier order: junior=0, senior=1, master=2
 *
 * - booking tier <= membership tier: consume one credit, no charge
 * - booking tier > membership tier: charge USD difference (no credit consumed)
 * - creditBalance === 0: throw InsufficientCreditsError
 */

import { db } from "@bhb/db";
import type { StaffTier } from "@bhb/db";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Insufficient membership credits");
    this.name = "InsufficientCreditsError";
  }
}

const TIER_ORDER: Record<StaffTier, number> = {
  junior: 0,
  senior: 1,
  master: 2,
};

/**
 * Consume a membership credit for a booking.
 *
 * @param membershipId - The membership to consume a credit from.
 * @param bookingTier  - The staff tier for the booked appointment.
 * @returns `{ creditConsumed, chargeUsd }` — chargeUsd is the extra amount
 *          owed when upgrading tiers, expressed in USD as a decimal number.
 * @throws InsufficientCreditsError when creditBalance is 0.
 */
export async function consumeCredit(
  membershipId: string,
  bookingTier: StaffTier
): Promise<{ creditConsumed: boolean; chargeUsd: number }> {
  const membership = await db.membership.findUniqueOrThrow({
    where: { id: membershipId },
    include: {
      plan: {
        include: { pricing: true },
      },
    },
  });

  if (membership.creditBalance === 0) {
    throw new InsufficientCreditsError();
  }

  const membershipTierOrder = TIER_ORDER[membership.staffTier];
  const bookingTierOrder = TIER_ORDER[bookingTier];

  if (bookingTierOrder <= membershipTierOrder) {
    // Covered by the membership — consume one credit
    await db.membership.update({
      where: { id: membershipId },
      data: { creditBalance: { decrement: 1 } },
    });
    return { creditConsumed: true, chargeUsd: 0 };
  }

  // Booking tier is higher — charge the difference in plan pricing
  const membershipTierPricing = membership.plan.pricing.find(
    (p) => p.staffTier === membership.staffTier
  );
  const bookingTierPricing = membership.plan.pricing.find(
    (p) => p.staffTier === bookingTier
  );

  if (!membershipTierPricing || !bookingTierPricing) {
    throw new Error(
      `Missing plan pricing for tiers: ${membership.staffTier} / ${bookingTier}`
    );
  }

  const delta =
    Number(bookingTierPricing.priceUsd) - Number(membershipTierPricing.priceUsd);

  return { creditConsumed: false, chargeUsd: Math.max(0, delta) };
}
