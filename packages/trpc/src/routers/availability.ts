/**
 * tRPC router: availability
 * Wraps reservations.getAvailableSlots
 */

import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getAvailableSlots } from "../../../apps/web/lib/booking/reservations";

export const availabilityRouter = router({
  getSlots: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        staffId: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        staffTier: z.enum(["junior", "senior", "master"]),
      })
    )
    .query(async ({ input }) => {
      const slots = await getAvailableSlots(
        input.staffId,
        input.serviceId,
        input.date,
        input.staffTier
      );

      return { slots };
    }),
});
