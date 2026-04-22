import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * Uses the global object in development to prevent creating a new
 * PrismaClient instance on every hot-module reload (Next.js dev mode).
 *
 * In production a fresh instance is created once per process.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
