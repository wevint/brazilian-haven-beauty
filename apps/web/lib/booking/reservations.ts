/**
 * Booking domain: reservation helpers
 * Fetches schedule + existing appointments from DB and calls calculateAvailableSlots.
 */

import { prisma } from "@bhb/db";
import type { StaffTier } from "@prisma/client";
import { calculateAvailableSlots, type TimeSlot } from "./availability";
import { resolvePricing } from "./pricing";

/**
 * Get available time slots for a given staff member + service on a specific date.
 *
 * @param staffId    UUID of the staff member
 * @param serviceId  UUID of the service
 * @param date       Calendar date in "YYYY-MM-DD" format
 * @param staffTier  Staff tier used to look up service duration
 */
export async function getAvailableSlots(
  staffId: string,
  serviceId: string,
  date: string,
  staffTier: StaffTier
): Promise<TimeSlot[]> {
  // Parse the requested date
  const [year, month, day] = date.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0=Sun … 6=Sat

  // Fetch schedule for the matching day of week
  const schedule = await prisma.staffSchedule.findFirst({
    where: { staffId, dayOfWeek },
  });

  if (!schedule) return [];

  // Fetch service duration for this tier
  const pricingEntry = await prisma.servicePricing.findFirst({
    where: { serviceId, staffTier, active: true },
  });

  if (!pricingEntry) return [];

  // Fetch existing appointments for this staff on this date (non-cancelled)
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      staffId,
      startAt: { gte: startOfDay, lte: endOfDay },
      status: { not: "cancelled" },
    },
    select: { startAt: true, endAt: true },
  });

  return calculateAvailableSlots(
    schedule,
    existingAppointments,
    targetDate,
    pricingEntry.durationMinutes,
    schedule.timezone
  );
}
