/**
 * tRPC router: packages (US5 — T080)
 * Package listing, purchase, and balance queries.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "@bhb/db";
import {
  getActivePackages,
  purchasePackage,
} from "../../../apps/web/lib/packages/packages";

export const packagesRouter = router({
  /**
   * Return all active ServicePackage records.
   */
  list: publicProcedure.query(async () => {
    return getActivePackages();
  }),

  /**
   * Purchase a package for the current authenticated user.
   */
  purchase: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
        paymentMethod: z.enum(["stripe", "paypal"]),
        stripePaymentMethodId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clientPkg = await purchasePackage(
        ctx.session.user!.id,
        input.packageId
      );
      return {
        clientPackageId: clientPkg.id,
        sessionsGranted: clientPkg.sessionsRemaining,
        expiresAt: clientPkg.expiresAt.toISOString(),
      };
    }),

  /**
   * Get the balance for a specific ClientPackage owned by the current user.
   */
  balance: protectedProcedure
    .input(z.object({ clientPackageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const pkg = await db.clientPackage.findUniqueOrThrow({
        where: {
          id: input.clientPackageId,
          clientId: ctx.session.user!.id,
        },
      });
      return {
        sessionsRemaining: pkg.sessionsRemaining,
        expiresAt: pkg.expiresAt.toISOString(),
        status: pkg.status,
      };
    }),
});
