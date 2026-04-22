/**
 * Package domain: package operations
 * Handles purchase, active package listing, and session application.
 */

import { db } from "@bhb/db";
import type { ServicePackage, ClientPackage } from "@prisma/client";
import { decrementSession } from "./balance";

/**
 * Apply a package session to an appointment.
 * Decrements the session counter and links the appointment to the package.
 * Propagates ExhaustedPackageError and ExpiredPackageError from decrementSession.
 */
export async function applyPackageSession(
  clientPackageId: string,
  appointmentId: string
): Promise<void> {
  await decrementSession(clientPackageId);

  await db.appointment.update({
    where: { id: appointmentId },
    data: { clientPackageId },
  });
}

/**
 * Return all active ServicePackage records.
 */
export async function getActivePackages(): Promise<ServicePackage[]> {
  return db.servicePackage.findMany({
    where: { isActive: true },
  });
}

/**
 * Purchase a package for a client.
 * Fetches the ServicePackage (must be active), calculates expiry, and creates
 * a ClientPackage with the full session count.
 */
export async function purchasePackage(
  clientId: string,
  packageId: string
): Promise<ClientPackage> {
  const pkg = await db.servicePackage.findFirstOrThrow({
    where: { id: packageId, isActive: true },
  });

  const expiresAt = new Date(Date.now() + pkg.validityDays * 86400000);

  return db.clientPackage.create({
    data: {
      clientId,
      packageId,
      sessionsRemaining: pkg.sessionCount,
      expiresAt,
      status: "active",
    },
  });
}
