/**
 * tRPC router: payments (US3 — T059)
 * Payment capture without storing raw card data (PCI-SAQ-A).
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { prisma } from "@bhb/db";
import { TRPCError } from "@trpc/server";
import { createPaymentIntent } from "../../../apps/web/lib/stripe/payment-intents";
import { confirmSetupIntent } from "../../../apps/web/lib/stripe/setup-intents";
import { createRefund } from "../../../apps/web/lib/stripe/refunds";
import { createPayPalOrder } from "../../../apps/web/lib/paypal/orders";

export const paymentsRouter = router({
  /**
   * Create a payment intent or PayPal order for an appointment.
   * Verifies the appointment belongs to the current user.
   * Persists a PaymentTransaction record (no raw card data).
   */
  createIntent: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        method: z.enum(["stripe", "paypal"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify appointment belongs to this user
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: input.appointmentId,
          clientId: ctx.session.user!.id,
        },
      });

      if (!appointment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found or does not belong to you",
        });
      }

      if (input.method === "stripe") {
        const { clientSecret, paymentIntentId } = await createPaymentIntent({
          appointmentId: input.appointmentId,
          amountUsd: appointment.priceUsd,
        });

        // Persist transaction record (PCI-SAQ-A: no raw card data)
        await (prisma as unknown as {
          paymentTransaction: {
            create: (args: {
              data: {
                appointmentId: string;
                gateway: string;
                stripePaymentIntentId: string;
                amountUsd: number;
                status: string;
              };
            }) => Promise<unknown>;
          };
        }).paymentTransaction.create({
          data: {
            appointmentId: input.appointmentId,
            gateway: "stripe",
            stripePaymentIntentId: paymentIntentId,
            amountUsd: appointment.priceUsd,
            status: "pending",
          },
        });

        return { clientSecret, paymentIntentId };
      } else {
        // PayPal
        const { orderId, approveUrl } = await createPayPalOrder({
          appointmentId: input.appointmentId,
          amountUsd: appointment.priceUsd,
        });

        // Persist transaction record (PCI-SAQ-A: no raw card data)
        await (prisma as unknown as {
          paymentTransaction: {
            create: (args: {
              data: {
                appointmentId: string;
                gateway: string;
                paypalOrderId: string;
                amountUsd: number;
                status: string;
              };
            }) => Promise<unknown>;
          };
        }).paymentTransaction.create({
          data: {
            appointmentId: input.appointmentId,
            gateway: "paypal",
            paypalOrderId: orderId,
            amountUsd: appointment.priceUsd,
            status: "pending",
          },
        });

        return { orderId, paymentIntentId: orderId, approveUrl };
      }
    }),

  /**
   * Look up a payment transaction by stripePaymentIntentId and return its status.
   */
  confirmPayment: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ input }) => {
      const tx = await (prisma as unknown as {
        paymentTransaction: {
          findFirst: (args: {
            where: { stripePaymentIntentId: string };
            select: { status: boolean; appointmentId: boolean };
          }) => Promise<{ status: string; appointmentId: string } | null>;
        };
      }).paymentTransaction.findFirst({
        where: { stripePaymentIntentId: input.paymentIntentId },
        select: { status: true, appointmentId: true },
      });

      if (!tx) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment transaction not found",
        });
      }

      return { status: tx.status, appointmentId: tx.appointmentId };
    }),

  /**
   * Save a payment method after a successful SetupIntent.
   * Stores only last4 and brand — never raw card data (PCI-SAQ-A).
   */
  savePaymentMethod: protectedProcedure
    .input(z.object({ setupIntentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { paymentMethodId, last4, brand } = await confirmSetupIntent(
        input.setupIntentId
      );

      const saved = await (prisma as unknown as {
        savedPaymentMethod: {
          upsert: (args: {
            where: {
              userId_stripePaymentMethodId?: {
                userId: string;
                stripePaymentMethodId: string;
              };
              // prisma generated compound unique doesn't exist so we use create/update pattern
            };
            create: {
              userId: string;
              gateway: string;
              stripePaymentMethodId: string;
              last4: string;
              brand: string;
              isDefault: boolean;
            };
            update: { last4: string; brand: string };
          }) => Promise<{ id: string; last4: string; brand: string }>;
          create: (args: {
            data: {
              userId: string;
              gateway: string;
              stripePaymentMethodId: string;
              last4: string;
              brand: string;
              isDefault: boolean;
            };
          }) => Promise<{ id: string; last4: string; brand: string }>;
        };
      }).savedPaymentMethod.create({
        data: {
          userId: ctx.session.user!.id,
          gateway: "stripe",
          stripePaymentMethodId: paymentMethodId,
          last4,
          brand,
          isDefault: false,
        },
      });

      return { id: saved.id, last4: saved.last4, brand: saved.brand };
    }),

  /**
   * List saved payment methods for the current user.
   */
  listSavedMethods: protectedProcedure.query(async ({ ctx }) => {
    const methods = await (prisma as unknown as {
      savedPaymentMethod: {
        findMany: (args: {
          where: { userId: string };
          select: {
            id: boolean;
            last4: boolean;
            brand: boolean;
            isDefault: boolean;
          };
          orderBy: { createdAt: string };
        }) => Promise<
          Array<{ id: string; last4: string; brand: string; isDefault: boolean }>
        >;
      };
    }).savedPaymentMethod.findMany({
      where: { userId: ctx.session.user!.id },
      select: { id: true, last4: true, brand: true, isDefault: true },
      orderBy: { createdAt: "desc" },
    });

    return methods;
  }),

  /**
   * Issue a refund for an appointment (admin only).
   * Updates the PaymentTransaction with the refundId.
   */
  refund: adminProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const tx = await (prisma as unknown as {
        paymentTransaction: {
          findFirst: (args: {
            where: { appointmentId: string };
            orderBy: { createdAt: string };
          }) => Promise<{
            id: string;
            stripePaymentIntentId: string | null;
          } | null>;
        };
      }).paymentTransaction.findFirst({
        where: { appointmentId: input.appointmentId },
        orderBy: { createdAt: "desc" },
      });

      if (!tx || !tx.stripePaymentIntentId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No Stripe payment transaction found for this appointment",
        });
      }

      const validReasons = [
        "duplicate",
        "fraudulent",
        "requested_by_customer",
      ] as const;
      type RefundReason = (typeof validReasons)[number];

      const reason =
        input.reason && validReasons.includes(input.reason as RefundReason)
          ? (input.reason as RefundReason)
          : undefined;

      const refundResult = await createRefund({
        paymentIntentId: tx.stripePaymentIntentId,
        reason,
      });

      const { refundId, status } = refundResult as {
        refundId: string;
        status: string;
      };

      // Update transaction with refundId
      await (prisma as unknown as {
        paymentTransaction: {
          update: (args: {
            where: { id: string };
            data: {
              refundId: string;
              refundReason: string | undefined;
              status: string;
            };
          }) => Promise<unknown>;
        };
      }).paymentTransaction.update({
        where: { id: tx.id },
        data: {
          refundId,
          refundReason: input.reason,
          status: "refunded",
        },
      });

      return { refundId, status };
    }),
});
