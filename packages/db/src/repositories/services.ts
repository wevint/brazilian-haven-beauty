import type { Service, ServicePricing, StaffTier } from "@prisma/client";
import { db } from "../client";

/**
 * Return all active services, optionally filtered by category.
 * Includes ServicePricing for each service.
 */
export async function findAllServices(
  category?: string
): Promise<Array<Service & { pricings: ServicePricing[] }>> {
  return db.service.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    include: { pricings: { where: { isActive: true } } },
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Find a single Service by primary key, including its pricings.
 * Returns null if not found.
 */
export async function findServiceById(
  id: string
): Promise<(Service & { pricings: ServicePricing[] }) | null> {
  return db.service.findUnique({
    where: { id },
    include: { pricings: { where: { isActive: true } } },
  });
}

/**
 * Find a single Service by its SEO slug, including its pricings.
 * Returns null if not found.
 */
export async function findServiceBySlug(
  slug: string
): Promise<(Service & { pricings: ServicePricing[] }) | null> {
  return db.service.findUnique({
    where: { seoSlug: slug },
    include: { pricings: { where: { isActive: true } } },
  });
}

/**
 * Find all ServicePricing rows for a given service filtered by staff tier.
 */
export async function findServicePricingByStaffTier(
  serviceId: string,
  tier: StaffTier
): Promise<ServicePricing | null> {
  return db.servicePricing.findUnique({
    where: { serviceId_staffTier: { serviceId, staffTier: tier } },
  });
}
