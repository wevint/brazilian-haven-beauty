/**
 * tRPC router: memberships (US4 — T070)
 * Subscription plans with per-tier pricing, sign-up, cancellation, and credit balance.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@bhb/db";
import { TRPCError } from "@trpc/server";
import * as crypto from "crypto";

// Helper: advance a date by one billing period using plain JS Date arithmetic
function advanceBillingDate(
  from: Date,
  billingCycle: "monthly" | "annual"
): Date {
  const next = new Date(from);
  if (billingCycle === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export const membershipsRouter = router({
  plans: router({
    /**
     * List all active membership plans with pricing.
     * Returns name/description from the requested locale's translations.
     */
    list: publicProcedure
      .input(z.object({ locale: z.enum(["en", "pt"]) }))
      .query(async ({ input }) => {
        const plans = await db.membershipPlan.findMany({
          where: { isActive: true },
          include: { pricing: true },
          orderBy: { createdAt: "asc" },
        });

        return plans.map((plan) => {
          const nameTranslations = plan.nameTranslations as {
            en: string;
            pt: string;
          };
          const descriptionTranslations = plan.descriptionTranslations as {
            en: string;
            pt: string;
          };

          return {
            id: plan.id,
            name: nameTranslations[input.locale] ?? nameTranslations.en,
            description:
              descriptionTranslations[input.locale] ??
              descriptionTranslations.en,
            billingCycle: plan.billingCycle,
            creditsPerCycle: plan.creditsPerCycle,
            stripeProductId: plan.stripeProductId,
            pricing: plan.pricing.map((p) => ({
              id: p.id,
              staffTier: p.staffTier,
              priceUsd: Number(p.priceUsd),
              stripePriceId: p.stripePriceId,
            })),
          };
        });
      }),
  }),

  /**
   * Sign up the current user for a membership plan.
   * Creates a Membership record with status=active and full credit balance.
   * Stripe subscription creation is stubbed.
   */
  signup: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        staffTier: z.enum(["junior", "senior", "master"]),
        stripePaymentMethodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await db.membershipPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan || !plan.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership plan not found or inactive",
        });
      }

      const now = new Date();
      const nextRenewalAt = advanceBillingDate(now, plan.billingCycle);
      const stripeSubscriptionId = "stub_" + crypto.randomUUID();

      const membership = await db.membership.create({
        data: {
          clientId: ctx.session.user!.id,
          planId: input.planId,
          staffTier: input.staffTier,
          status: "active",
          creditBalance: plan.creditsPerCycle,
          billingStart: now,
          nextRenewalAt,
          stripeSubscriptionId,
        },
      });

      return {
        membershipId: membership.id,
        stripeSubscriptionId: membership.stripeSubscriptionId,
        nextRenewalAt: membership.nextRenewalAt.toISOString(),
      };
    }),

  /**
   * Cancel a membership.
   * immediate: set status=cancelled and cancelledAt=now.
   * end_of_cycle: set cancelledAt=nextRenewalAt; status stays active until renewal.
   */
  cancel: protectedProcedure
    .input(
      z.object({
        membershipId: z.string(),
        immediateOrEndOfCycle: z.enum(["immediate", "end_of_cycle"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await db.membership.findFirst({
        where: {
          id: input.membershipId,
          clientId: ctx.session.user!.id,
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership not found",
        });
      }

      if (input.immediateOrEndOfCycle === "immediate") {
        await db.membership.update({
          where: { id: input.membershipId },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        });
      } else {
        // end_of_cycle: schedule cancellation at renewal date
        await db.membership.update({
          where: { id: input.membershipId },
          data: {
            cancelledAt: membership.nextRenewalAt,
          },
        });
      }

      return { success: true as const };
    }),

  /**
   * Get the credit balance and renewal info for a membership.
   */
  creditBalance: protectedProcedure
    .input(z.object({ membershipId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await db.membership.findFirst({
        where: {
          id: input.membershipId,
          clientId: ctx.session.user!.id,
        },
        include: { plan: true },
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membership not found",
        });
      }

      const nameTranslations = membership.plan.nameTranslations as {
        en: string;
        pt: string;
      };

      return {
        creditsRemaining: membership.creditBalance,
        nextRenewalAt: membership.nextRenewalAt.toISOString(),
        planName: nameTranslations.en,
      };
    }),
});
