/**
 * Booking domain: slot availability calculation
 * Pure functions – no DB calls.  Accepts pre-fetched schedule + appointments.
 */

import type { StaffSchedule, Appointment } from "@prisma/client";

export interface TimeSlot {
  startAt: string; // ISO string (UTC)
  endAt: string;   // ISO string (UTC)
  available: boolean;
}

const SLOT_INTERVAL_MINUTES = 15; // slots every 15 minutes

/**
 * Parse "HH:MM" in a given IANA timezone into a UTC Date on a given calendar date.
 */
function parseLocalTime(
  timeHHMM: string,
  date: Date,
  timezone: string
): Date {
  const [hours, minutes] = timeHHMM.split(":").map(Number);

  // Build an Intl.DateTimeFormat to convert local midnight to UTC offset
  const localMidnight = new Date(date);
  localMidnight.setUTCHours(0, 0, 0, 0);

  // Use the Intl API to find the UTC offset for this timezone on this date
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format localMidnight in the target timezone to find its UTC offset
  const parts = formatter.formatToParts(localMidnight);
  const tzYear = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const tzMonth = parseInt(parts.find((p) => p.type === "month")!.value, 10) - 1;
  const tzDay = parseInt(parts.find((p) => p.type === "day")!.value, 10);

  // Create a Date representing localMidnight as seen in the target timezone
  const tzMidnight = new Date(
    Date.UTC(tzYear, tzMonth, tzDay, 0, 0, 0)
  );

  // Offset = difference between what UTC midnight is in the TZ and actual UTC midnight
  const utcMidnightMs = Date.UTC(
    localMidnight.getUTCFullYear(),
    localMidnight.getUTCMonth(),
    localMidnight.getUTCDate(),
    0,
    0,
    0
  );
  const tzOffsetMs = tzMidnight.getTime() - utcMidnightMs;

  // Build the target UTC time
  const utcMs = utcMidnightMs - tzOffsetMs + (hours * 60 + minutes) * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Calculate all possible time slots for a staff member on a given date.
 *
 * @param staffSchedule   The staff's recurring schedule for the target day of week (or null if no schedule).
 * @param existingAppointments  Pre-fetched appointments for that staff on that date (non-cancelled).
 * @param date            The calendar date to compute slots for.
 * @param durationMinutes Length of the service in minutes.
 * @param timezone        IANA timezone string (default: "America/New_York").
 */
export function calculateAvailableSlots(
  staffSchedule: StaffSchedule | null,
  existingAppointments: Pick<Appointment, "startAt" | "endAt">[],
  date: Date,
  durationMinutes: number,
  timezone = "America/New_York"
): TimeSlot[] {
  if (!staffSchedule) return [];

  const tz = staffSchedule.timezone || timezone;
  const scheduleStart = parseLocalTime(staffSchedule.startTime, date, tz);
  const scheduleEnd = parseLocalTime(staffSchedule.endTime, date, tz);

  const slots: TimeSlot[] = [];
  let cursor = scheduleStart;

  while (cursor.getTime() + durationMinutes * 60_000 <= scheduleEnd.getTime()) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);
    const slotObj = { startAt: cursor, endAt: slotEnd };
    const available = !hasSlotConflict(slotObj, existingAppointments);

    slots.push({
      startAt: cursor.toISOString(),
      endAt: slotEnd.toISOString(),
      available,
    });

    cursor = new Date(cursor.getTime() + SLOT_INTERVAL_MINUTES * 60_000);
  }

  return slots;
}

/**
 * Check whether a proposed slot overlaps any existing appointment.
 * Uses half-open interval: [startAt, endAt)
 */
export function hasSlotConflict(
  newSlot: { startAt: Date; endAt: Date },
  existingAppointments: Pick<Appointment, "startAt" | "endAt">[]
): boolean {
  const newStart = newSlot.startAt.getTime();
  const newEnd = newSlot.endAt.getTime();

  return existingAppointments.some((appt) => {
    const existStart = new Date(appt.startAt).getTime();
    const existEnd = new Date(appt.endAt).getTime();
    // Overlap if they share any time in the half-open interval
    return newStart < existEnd && newEnd > existStart;
  });
}
