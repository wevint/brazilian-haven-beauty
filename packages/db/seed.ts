import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Database seed entry point.
 * Populate with real seed data in US1 (T028).
 */
async function main(): Promise<void> {
  console.log("Starting database seed…");

  // TODO (T028): Add seed data for services, staff, tiers, and availability.
  // This stub exists to confirm the seed infrastructure is wired correctly.

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
