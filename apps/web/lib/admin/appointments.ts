/**
 * Admin domain service: appointment management helpers.
 * Used by the admin tRPC router and integration tests.
 */

import { TRPCError } from "@trpc/server";
import { db } from "@bhb/db";
import type { Appointment } from "@bhb/db";
import { hasSlotConflict } from "@/lib/booking/availability";

/**
 * Reschedule an appointment to a new start time.
 *
 * - Throws FORBIDDEN if the appointment is CANCELLED or COMPLETED.
 * - Calculates new endAt based on the appointment's durationMinutes.
 * - Throws CONFLICT if the new slot overlaps an existing appointment for
 *   the same staff member (excluding the appointment being rescheduled).
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartAt: Date
): Promise<Appointment> {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Appointment not found",
    });
  }

  if (appointment.status === "cancelled" || appointment.status === "completed") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Cannot reschedule a ${appointment.status} appointment`,
    });
  }

  const newEndAt = new Date(
    newStartAt.getTime() + appointment.durationMinutes * 60_000
  );

  // Fetch all active appointments for the same staff (excluding this one)
  const existingAppointments = await db.appointment.findMany({
    where: {
      staffId: appointment.staffId,
      id: { not: appointmentId },
      status: { notIn: ["cancelled"] },
    },
    select: { startAt: true, endAt: true },
  });

  const conflict = hasSlotConflict(
    { startAt: newStartAt, endAt: newEndAt },
    existingAppointments
  );

  if (conflict) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "The requested time slot is not available",
    });
  }

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      startAt: newStartAt,
      endAt: newEndAt,
    },
  });

  return updated;
}
