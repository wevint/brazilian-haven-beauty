import type Stripe from "stripe";
import { prisma } from "@bhb/db";

/**
 * Handle a verified Stripe webhook event.
 *
 * payment_intent.succeeded  → Appointment status = 'completed', paymentStatus = 'paid'
 * payment_intent.payment_failed → Appointment status = 'cancelled', paymentStatus = 'failed'
 * All other event types are silently ignored (no-op).
 */
export async function handleStripeWebhook(event: {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as {
        id: string;
        metadata?: { appointmentId?: string };
      };
      const appointmentId = pi.metadata?.appointmentId;
      if (!appointmentId) return;

      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId },
      });
      if (!appointment) return;

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: "completed", paymentStatus: "paid" },
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as {
        id: string;
        metadata?: { appointmentId?: string };
      };
      const appointmentId = pi.metadata?.appointmentId;
      if (!appointmentId) return;

      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId },
      });
      if (!appointment) return;

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: "cancelled", paymentStatus: "failed" },
      });
      break;
    }

    default:
      // No-op for all other event types
      break;
  }
}
