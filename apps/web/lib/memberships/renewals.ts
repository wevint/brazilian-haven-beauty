/**
 * Membership domain: renewal logic (US4 — T069)
 */

import { db } from "@bhb/db";

/**
 * Renew a membership for the next billing cycle.
 *
 * - Validates the membership is `active`.
 * - Guards against double-renewal: throws if nextRenewalAt is still in the future.
 * - Resets creditBalance to the plan's creditsPerCycle.
 * - Advances nextRenewalAt by 1 month (monthly) or 1 year (annual).
 *
 * @returns The updated Membership record.
 */
export async function renewMembership(membershipId: string) {
  const membership = await db.membership.findUniqueOrThrow({
    where: { id: membershipId },
    include: { plan: true },
  });

  if (membership.status !== "active") {
    throw new Error(
      `Cannot renew membership with status "${membership.status}"`
    );
  }

  const now = new Date();
  if (membership.nextRenewalAt > now) {
    throw new Error("Already renewed for current cycle");
  }

  const nextRenewalAt = advanceDate(
    membership.nextRenewalAt,
    membership.plan.billingCycle
  );

  return db.membership.update({
    where: { id: membershipId },
    data: {
      creditBalance: membership.plan.creditsPerCycle,
      nextRenewalAt,
    },
  });
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function advanceDate(date: Date, billingCycle: "monthly" | "annual"): Date {
  const next = new Date(date);
  if (billingCycle === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}
