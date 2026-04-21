/**
 * Booking creation with distributed lock.
 * 1. Acquire slot lock (Redis NX)
 * 2. Double-check no conflict in DB
 * 3. Create Appointment row (status=PENDING)
 * 4. Release lock in finally block
 */

import { prisma } from "@bhb/db";
import type { StaffTier } from "@prisma/client";
import { acquireSlotLock, releaseSlotLock } from "./lock";
import { hasSlotConflict } from "./availability";
import { randomBytes } from "crypto";
import { format } from "date-fns";

export class SlotUnavailableError extends Error {
  constructor(message = "SlotUnavailableError") {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

export interface CreateBookingInput {
  clientId: string;
  serviceId: string;
  staffId: string;
  staffTier: StaffTier;
  startAt: Date;
  notes?: string;
  paymentIntentId?: string;
}

export interface CreateBookingResult {
  appointmentId: string;
  confirmationCode: string; // "BHB-YYYYMMDD-XXXX"
  startAt: Date;
  endAt: Date;
  priceUsd: number;
}

function generateConfirmationCode(date: Date): string {
  const datePart = format(date, "yyyyMMdd");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `BHB-${datePart}-${suffix}`;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const { clientId, serviceId, staffId, staffTier, startAt, notes, paymentIntentId } =
    input;

  // ── 1. Acquire slot lock ────────────────────────────────────────────────
  const lockToken = await acquireSlotLock(staffId, startAt);

  if (!lockToken) {
    throw new SlotUnavailableError(
      `SlotUnavailableError: slot ${startAt.toISOString()} for staff ${staffId} is already locked`
    );
  }

  try {
    // ── 2. Fetch pricing (needed for price snapshot + duration) ─────────────
    const pricing = await prisma.servicePricing.findFirst({
      where: { serviceId, staffTier, active: true },
    });

    if (!pricing) {
      throw new Error(`No active pricing for serviceId="${serviceId}" tier="${staffTier}"`);
    }

    const endAt = new Date(startAt.getTime() + pricing.durationMinutes * 60_000);

    // ── 3. Double-check for overlap in DB ───────────────────────────────────
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId,
        status: { not: "cancelled" },
        startAt: {
          gte: new Date(startAt.getTime() - pricing.durationMinutes * 60_000 * 2),
          lte: endAt,
        },
      },
      select: { startAt: true, endAt: true },
    });

    if (hasSlotConflict({ startAt, endAt }, existingAppointments)) {
      throw new SlotUnavailableError(
        `SlotUnavailableError: conflicting appointment exists for staff ${staffId}`
      );
    }

    // ── 4. Create appointment ──────────────────────────────────────────────
    const confirmationCode = generateConfirmationCode(startAt);

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        staffId,
        staffTier,
        priceUsd: pricing.priceUsd,
        durationMinutes: pricing.durationMinutes,
        startAt,
        endAt,
        status: "scheduled",
        confirmationCode,
        notes,
        paymentIntentId,
      },
    });

    return {
      appointmentId: appointment.id,
      confirmationCode: appointment.confirmationCode,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      priceUsd: appointment.priceUsd,
    };
  } finally {
    // ── 5. Always release the lock ─────────────────────────────────────────
    await releaseSlotLock(staffId, startAt, lockToken);
  }
}
