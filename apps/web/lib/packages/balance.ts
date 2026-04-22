/**
 * Package domain: session balance management
 * Handles decrementing sessions and enforcing expiry/exhaustion rules.
 */

import { db } from "@bhb/db";
import type { ClientPackage } from "@prisma/client";

export class ExhaustedPackageError extends Error {
  constructor() {
    super("Package has no sessions remaining");
  }
}

export class ExpiredPackageError extends Error {
  constructor() {
    super("Package has expired");
  }
}

/**
 * Decrement one session from the given ClientPackage.
 * Throws ExhaustedPackageError if sessionsRemaining === 0.
 * Throws ExpiredPackageError if expiresAt is in the past.
 * Returns the updated ClientPackage record.
 */
export async function decrementSession(
  clientPackageId: string
): Promise<ClientPackage> {
  const clientPackage = await db.clientPackage.findUniqueOrThrow({
    where: { id: clientPackageId },
  });

  if (clientPackage.expiresAt < new Date()) {
    throw new ExpiredPackageError();
  }

  if (clientPackage.sessionsRemaining === 0) {
    throw new ExhaustedPackageError();
  }

  const newRemaining = clientPackage.sessionsRemaining - 1;
  const newStatus = newRemaining === 0 ? "exhausted" : "active";

  const updated = await db.clientPackage.update({
    where: { id: clientPackageId },
    data: {
      sessionsRemaining: newRemaining,
      status: newStatus,
    },
  });

  return updated;
}
