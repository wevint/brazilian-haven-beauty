import type { Session } from "next-auth";

/** Extended user type that includes the role from the JWT callback. */
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  staffId?: string;
}

/** Roles that grant access to the admin dashboard. */
export const ADMIN_ROLES = ["owner", "manager", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Returns true if the session belongs to any admin role.
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) return false;
  const user = session.user as SessionUser;
  return ADMIN_ROLES.includes((user.role ?? "") as AdminRole);
}

/**
 * Returns true if the session user is an owner.
 */
export function isOwner(session: Session | null): boolean {
  if (!session?.user) return false;
  const user = session.user as SessionUser;
  return user.role === "owner";
}

/**
 * Returns true if the session user is a staff member (any admin sub-role).
 */
export function isStaff(session: Session | null): boolean {
  return isAdmin(session);
}

/**
 * Throws if the session does not satisfy the required role.
 * Use in tRPC procedures and server actions.
 */
export function requireRole(
  session: Session | null,
  role: AdminRole | "any"
): asserts session is Session {
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  if (role === "any") return;
  const user = session.user as SessionUser;
  if (role === "owner" && user.role !== "owner") {
    throw new Error("FORBIDDEN");
  }
  if (!ADMIN_ROLES.includes((user.role ?? "") as AdminRole)) {
    throw new Error("FORBIDDEN");
  }
}
