/**
 * Booking notifications: sends confirmation email + SMS after a booking is created.
 *
 * MVP note: The User model does not yet have a phone number or notification-preference
 * field (those arrive in a later user story). For now we always attempt email and
 * skip SMS unless TWILIO_ACCOUNT_SID is configured and the user has a phone on record.
 */

import { createElement } from "react";
import { db } from "@bhb/db";
import { sendEmail } from "@/lib/email/send";
import { sendSms } from "@/lib/sms/send";
import { BookingConfirmationEmail } from "@/lib/email/templates/booking-confirmation";
import { bookingConfirmationSms } from "@/lib/sms/templates/booking-confirmation";
import { logger } from "@/lib/observability/logger";

const SALON_ADDRESS = "Brazilian Haven Beauty, New York, NY";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brazilianhaven.com";

export async function sendBookingConfirmation(
  appointmentId: string
): Promise<void> {
  // ── 1. Fetch appointment + relations ───────────────────────────────────
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: { select: { name: true, nameTranslations: true } },
      staff: { select: { firstName: true, lastName: true } },
    },
  });

  if (!appointment) {
    logger.warn("sendBookingConfirmation: appointment not found", {
      appointmentId,
    });
    return;
  }

  // ── 2. Fetch client (User) ──────────────────────────────────────────────
  const client = await db.user.findUnique({
    where: { id: appointment.clientId },
    select: {
      id: true,
      email: true,
    },
  });

  if (!client) {
    logger.warn("sendBookingConfirmation: client not found", {
      clientId: appointment.clientId,
    });
    return;
  }

  // Determine locale — default to "en" for MVP (no locale field on User yet)
  const locale: "en" | "pt" = "en";

  const clientName = client.email; // MVP fallback: no name field on User yet
  const serviceName = appointment.service.name;
  const staffName = `${appointment.staff.firstName} ${appointment.staff.lastName}`;
  const cancelUrl = `${BASE_URL}/${locale}/account`;
  const confirmationCode = appointment.confirmationCode;

  // ── 3. Send email ───────────────────────────────────────────────────────
  try {
    await sendEmail({
      to: client.email,
      subject:
        locale === "pt"
          ? `Confirmação de Agendamento — ${confirmationCode}`
          : `Booking Confirmed — ${confirmationCode}`,
      template: createElement(BookingConfirmationEmail, {
        locale,
        clientName,
        serviceName,
        staffName,
        startAt: appointment.startAt,
        locationAddress: SALON_ADDRESS,
        confirmationCode,
        cancelUrl,
      }),
      tags: [{ name: "type", value: "booking-confirmation" }],
    });
  } catch (err) {
    logger.error("sendBookingConfirmation: email failed", {
      appointmentId,
      error: err instanceof Error ? err.message : String(err),
    });
    // Do not re-throw — SMS attempt should still proceed
  }

  // ── 4. Send SMS (optional — requires Twilio config) ─────────────────────
  // MVP: User model has no phone field. Skip SMS gracefully.
  // When a phone field is added, replace the `null` check below.
  const phoneNumber: string | null = null;

  if (phoneNumber && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const message = bookingConfirmationSms(
        {
          clientName,
          serviceName,
          startAt: appointment.startAt,
          confirmationCode,
        },
        locale
      );

      await sendSms({ to: phoneNumber, message });
    } catch (err) {
      logger.error("sendBookingConfirmation: SMS failed", {
        appointmentId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
