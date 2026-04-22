/**
 * tRPC router: staff
 * Contracts: specs/contracts/api.md § Router: staff
 */

import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { prisma } from "@bhb/db";

export const staffRouter = router({
  /** List all active staff members */
  list: publicProcedure
    .input(z.object({ locale: z.enum(["en", "pt"]).default("en") }))
    .query(async () => {
      const staffMembers = await prisma.staff.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      return staffMembers.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        bio: s.bio ?? null,
        photoUrl: s.photoUrl ?? null,
        specialties: s.specialties,
        tier: s.tier,
        displayOrder: s.displayOrder,
        isActive: s.isActive,
        // Reviews deferred from MVP v1
        averageRating: null,
        reviewCount: 0,
      }));
    }),

  /** Single staff with pricing for a given service */
  getById: publicProcedure
    .input(
      z.object({
        staffId: z.string(),
        serviceId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const staffMember = await prisma.staff.findUnique({
        where: { id: input.staffId },
        include: {
          pricing: input.serviceId
            ? { where: { serviceId: input.serviceId, active: true } }
            : false,
        },
      });

      if (!staffMember || !staffMember.isActive) return null;

      return {
        id: staffMember.id,
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        bio: staffMember.bio ?? null,
        photoUrl: staffMember.photoUrl ?? null,
        specialties: staffMember.specialties,
        tier: staffMember.tier,
        displayOrder: staffMember.displayOrder,
        isActive: staffMember.isActive,
        pricing: Array.isArray((staffMember as { pricing?: unknown }).pricing)
          ? (staffMember as { pricing: Array<{ staffTier: string; priceUsd: number; durationMinutes: number }> }).pricing.map((p) => ({
              staffTier: p.staffTier,
              priceUsd: p.priceUsd,
              durationMinutes: p.durationMinutes,
            }))
          : [],
      };
    }),

  /**
   * List all staff members including inactive ones (admin only).
   */
  listAdmin: adminProcedure.query(async () => {
    const staffMembers = await prisma.staff.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { displayOrder: "asc" },
    });

    return staffMembers.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      firstName: s.firstName,
      lastName: s.lastName,
      tier: s.tier,
      specialties: s.specialties,
      isActive: s.isActive,
      bio: s.bio ?? null,
      photoUrl: s.photoUrl ?? null,
      email: s.user?.email ?? null,
      phone: null as string | null,
    }));
  }),
});
