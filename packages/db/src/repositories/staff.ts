import type { Staff, StaffTier } from "@prisma/client";
import { db } from "../client";

/**
 * Return all active staff members ordered by displayOrder.
 */
export async function findAllStaff(): Promise<Staff[]> {
  return db.staff.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Find a Staff member by their primary key. Returns null if not found.
 */
export async function findStaffById(id: string): Promise<Staff | null> {
  return db.staff.findUnique({ where: { id } });
}

/**
 * Find all active Staff members belonging to a specific tier.
 */
export async function findStaffByTier(tier: StaffTier): Promise<Staff[]> {
  return db.staff.findMany({
    where: { tier, isActive: true },
    orderBy: { displayOrder: "asc" },
  });
}
