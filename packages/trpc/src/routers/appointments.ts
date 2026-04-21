/**
 * tRPC router: appointments
 * Contracts: specs/contracts/api.md § Router: appointments
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { prisma } from "@bhb/db";
import { createBooking } from "../../../apps/web/lib/booking/create-booking";
import { SlotUnavailableError } from "../../../apps/web/lib/booking/create-booking";
import { TRPCError } from "@trpc/server";

export const appointmentsRouter = router({
  /**
   * Create a booking (protected – must be authenticated).
   */
  reserve: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        staffId: z.string(),
        staffTier: z.enum(["junior", "senior", "master"]),
        startAt: z.string().datetime(),
        notes: z.string().optional(),
        paymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await createBooking({
          clientId: ctx.session.user.id,
          serviceId: input.serviceId,
          staffId: input.staffId,
          staffTier: input.staffTier,
          startAt: new Date(input.startAt),
          notes: input.notes,
          paymentIntentId: input.paymentIntentId,
        });

        return result;
      } catch (err) {
        if (err instanceof SlotUnavailableError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "SLOT_UNAVAILABLE",
          });
        }
        throw err;
      }
    }),

  /**
   * Get upcoming appointments for the current user (protected).
   */
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: ctx.session.user.id,
        startAt: { gte: now },
        status: { in: ["scheduled", "checked_in"] },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            nameTranslations: true,
            slug: true,
            category: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            tier: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    return appointments.map((appt) => ({
      id: appt.id,
      confirmationCode: appt.confirmationCode,
      startAt: appt.startAt,
      endAt: appt.endAt,
      status: appt.status,
      priceUsd: appt.priceUsd,
      service: {
        id: appt.service.id,
        name: appt.service.name,
        slug: appt.service.slug,
        category: appt.service.category,
      },
      staff: {
        id: appt.staff.id,
        firstName: appt.staff.firstName,
        lastName: appt.staff.lastName,
        tier: appt.staff.tier,
        photoUrl: appt.staff.photoUrl,
      },
    }));
  }),
});
