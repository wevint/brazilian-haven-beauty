/**
 * tRPC router: appointments
 * Contracts: specs/contracts/api.md § Router: appointments
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@bhb/db";
import { createBooking } from "../../../apps/web/lib/booking/create-booking";
import { SlotUnavailableError } from "../../../apps/web/lib/booking/create-booking";
import { rescheduleAppointment } from "../../../apps/web/lib/admin/appointments";
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

  /**
   * List appointments with optional filters (admin only).
   */
  list: adminProcedure
    .input(
      z
        .object({
          date: z.date().optional(),
          staffId: z.string().optional(),
          status: z
            .enum([
              "scheduled",
              "checked_in",
              "completed",
              "no_show",
              "cancelled",
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const filters = input ?? {};
      const where: Record<string, unknown> = {};

      if (filters.date) {
        const d = filters.date;
        const start = new Date(d);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setUTCHours(23, 59, 59, 999);
        where.startAt = { gte: start, lte: end };
      }

      if (filters.staffId) {
        where.staffId = filters.staffId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          service: { select: { id: true, name: true } },
          staff: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startAt: "asc" },
      });

      return appointments.map((appt) => ({
        id: appt.id,
        clientId: appt.clientId,
        staffId: appt.staffId,
        serviceId: appt.serviceId,
        startAt: appt.startAt,
        endAt: appt.endAt,
        status: appt.status,
        client: { name: appt.clientId, email: "" },
        staff: {
          name: `${appt.staff.firstName} ${appt.staff.lastName}`,
        },
        service: { name: appt.service.name },
      }));
    }),

  /**
   * Reschedule an appointment to a new start time (admin only).
   */
  reschedule: adminProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        newStartAt: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const updated = await rescheduleAppointment(
        input.appointmentId,
        input.newStartAt
      );
      return {
        id: updated.id,
        startAt: updated.startAt,
        endAt: updated.endAt,
        status: updated.status,
      };
    }),
});
