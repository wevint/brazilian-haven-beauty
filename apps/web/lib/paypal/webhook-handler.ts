import { prisma } from "@bhb/db";

interface PayPalResource {
  id?: string;
  status?: string;
  custom_id?: string;
  supplementary_data?: {
    related_ids?: { order_id?: string };
  };
}

/**
 * Handle a PayPal webhook event.
 *
 * PAYMENT.CAPTURE.COMPLETED → Appointment status = 'completed', paymentStatus = 'paid'
 * PAYMENT.CAPTURE.DENIED    → Appointment status = 'cancelled', paymentStatus = 'failed'
 * All other event types are silently ignored (no-op).
 *
 * The appointmentId is sourced from resource.custom_id which is set during
 * order creation (via createPayPalOrder → custom_id field).
 * Falls back to looking up the PaymentTransaction by paypalOrderId.
 */
export async function handlePayPalWebhook(event: {
  event_type: string;
  resource: unknown;
}): Promise<void> {
  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED": {
      const resource = event.resource as PayPalResource;
      const appointmentId = await resolveAppointmentId(resource);
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

    case "PAYMENT.CAPTURE.DENIED": {
      const resource = event.resource as PayPalResource;
      const appointmentId = await resolveAppointmentId(resource);
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

/**
 * Resolve the appointmentId from a PayPal capture resource.
 * Checks resource.custom_id first, then falls back to a PaymentTransaction lookup
 * via the related order_id.
 */
async function resolveAppointmentId(
  resource: PayPalResource
): Promise<string | null> {
  // Direct lookup via custom_id set during order creation
  if (resource.custom_id) {
    return resource.custom_id;
  }

  // Fallback: look up PaymentTransaction by paypalOrderId
  const orderId =
    resource.id ?? resource.supplementary_data?.related_ids?.order_id;
  if (!orderId) return null;

  const tx = await (prisma as unknown as {
    paymentTransaction: {
      findFirst: (args: {
        where: { paypalOrderId: string };
        select: { appointmentId: boolean };
      }) => Promise<{ appointmentId: string } | null>;
    };
  }).paymentTransaction.findFirst({
    where: { paypalOrderId: orderId },
    select: { appointmentId: true },
  });

  return tx?.appointmentId ?? null;
}
