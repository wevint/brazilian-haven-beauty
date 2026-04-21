/**
 * tRPC router: services
 * Contracts: specs/contracts/api.md § Router: services
 */

import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { prisma } from "@bhb/db";

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
});
