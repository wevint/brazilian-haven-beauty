/**
 * tRPC router: services
 * Contracts: specs/contracts/api.md § Router: services
 */

import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { prisma } from "@bhb/db";
import { updateServicePricing } from "../../../apps/web/lib/admin/services";

const LocaleSchema = z.enum(["en", "pt"]);

function localizeService(service: {
  nameTranslations: unknown;
  descriptionTranslations: unknown;
  [key: string]: unknown;
}, locale: "en" | "pt") {
  const nameTrans = service.nameTranslations as Record<string, string> | null;
  const descTrans = service.descriptionTranslations as Record<string, string> | null;

  return {
    ...service,
    name: nameTrans?.[locale] ?? (service.name as string),
    description: descTrans?.[locale] ?? (service.description as string),
  };
}

export const servicesRouter = router({
  /** List all active services with their pricing tiers */
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        locale: LocaleSchema.default("en"),
      })
    )
    .query(async ({ input }) => {
      const services = await prisma.service.findMany({
        where: {
          active: true,
          ...(input.category ? { category: input.category } : {}),
        },
        include: {
          pricing: {
            where: { active: true },
            orderBy: { staffTier: "asc" },
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      return services.map((s) => {
        const localized = localizeService(s, input.locale);
        return {
          id: s.id,
          name: localized.name,
          description: localized.description,
          category: s.category,
          seoSlug: s.slug,
          imageUrl: s.imageUrl,
          allowWaitlist: s.allowWaitlist,
          displayOrder: s.displayOrder,
          pricing: s.pricing.map((p) => ({
            staffTier: p.staffTier,
            priceUsd: p.priceUsd,
            durationMinutes: p.durationMinutes,
          })),
        };
      });
    }),

  /** Single service by slug */
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        locale: LocaleSchema.default("en"),
      })
    )
    .query(async ({ input }) => {
      const service = await prisma.service.findUnique({
        where: { slug: input.slug },
        include: {
          pricing: {
            where: { active: true },
            orderBy: { staffTier: "asc" },
          },
        },
      });

      if (!service || !service.active) {
        return null;
      }

      const localized = localizeService(service, input.locale);

      return {
        id: service.id,
        name: localized.name,
        description: localized.description,
        category: service.category,
        seoSlug: service.slug,
        imageUrl: service.imageUrl,
        allowWaitlist: service.allowWaitlist,
        jsonLdSchema: service.jsonLdSchema,
        displayOrder: service.displayOrder,
        pricing: service.pricing.map((p) => ({
          staffTier: p.staffTier,
          priceUsd: p.priceUsd,
          durationMinutes: p.durationMinutes,
        })),
      };
    }),

  /**
   * Update a service's metadata (admin only).
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, description, isActive } = input;
      const updated = await prisma.service.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isActive !== undefined ? { active: isActive } : {}),
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        active: updated.active,
      };
    }),

  /**
   * Update or create pricing for a service + staffTier combination (admin only).
   */
  updatePricing: adminProcedure
    .input(
      z.object({
        serviceId: z.string(),
        staffTier: z.enum(["junior", "senior", "master"]),
        priceUsd: z.number(),
        durationMinutes: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const pricing = await updateServicePricing(
        input.serviceId,
        input.staffTier,
        input.priceUsd,
        input.durationMinutes
      );
      return {
        id: pricing.id,
        serviceId: pricing.serviceId,
        staffTier: pricing.staffTier,
        priceUsd: pricing.priceUsd,
        durationMinutes: pricing.durationMinutes,
      };
    }),
});
