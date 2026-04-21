/**
 * Seed data for Brazilian Haven Beauty development database.
 * Run with: npx prisma db seed
 */
import { PrismaClient, StaffTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Services ──────────────────────────────────────────────────────────────

  const services = await Promise.all([
    prisma.service.upsert({
      where: { slug: "full-brazilian-wax" },
      update: {},
      create: {
        name: "Full Brazilian Wax",
        nameTranslations: { en: "Full Brazilian Wax", pt: "Depilação Brasileira Completa" },
        slug: "full-brazilian-wax",
        description: "Complete hair removal for a smooth, long-lasting result.",
        descriptionTranslations: {
          en: "Complete hair removal for a smooth, long-lasting result.",
          pt: "Remoção completa dos pelos para um resultado suave e duradouro.",
        },
        category: "Brazilian Wax",
        active: true,
        allowWaitlist: true,
        displayOrder: 1,
        seoMetaDescription: "Book a full Brazilian wax at Brazilian Haven Beauty.",
      },
    }),

    prisma.service.upsert({
      where: { slug: "bikini-wax" },
      update: {},
      create: {
        name: "Bikini Wax",
        nameTranslations: { en: "Bikini Wax", pt: "Depilação Biquíni" },
        slug: "bikini-wax",
        description: "Neat bikini line cleanup for a tidy look.",
        descriptionTranslations: {
          en: "Neat bikini line cleanup for a tidy look.",
          pt: "Limpeza da linha do biquíni para uma aparência impecável.",
        },
        category: "Brazilian Wax",
        active: true,
        allowWaitlist: true,
        displayOrder: 2,
      },
    }),

    prisma.service.upsert({
      where: { slug: "brazilian-brow-combo" },
      update: {},
      create: {
        name: "Brazilian + Brow Combo",
        nameTranslations: {
          en: "Brazilian + Brow Combo",
          pt: "Combo Brasileira + Sobrancelha",
        },
        slug: "brazilian-brow-combo",
        description: "Full Brazilian wax combined with brow shaping for a complete look.",
        descriptionTranslations: {
          en: "Full Brazilian wax combined with brow shaping for a complete look.",
          pt: "Depilação brasileira completa com design de sobrancelha.",
        },
        category: "Combo",
        active: true,
        allowWaitlist: true,
        displayOrder: 3,
      },
    }),

    prisma.service.upsert({
      where: { slug: "leg-wax" },
      update: {},
      create: {
        name: "Full Leg Wax",
        nameTranslations: { en: "Full Leg Wax", pt: "Depilação de Pernas Completa" },
        slug: "leg-wax",
        description: "Smooth, hair-free legs from ankle to thigh.",
        descriptionTranslations: {
          en: "Smooth, hair-free legs from ankle to thigh.",
          pt: "Pernas lisas e sem pelos do tornozelo à coxa.",
        },
        category: "Legs",
        active: true,
        allowWaitlist: true,
        displayOrder: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // ── Staff users (auth accounts) ───────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@brazilianhaven.com" },
    update: {},
    create: {
      email: "admin@brazilianhaven.com",
      passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2OQ7c2H76y", // "password123"
      role: "owner",
    },
  });

  const staffUserJunior = await prisma.user.upsert({
    where: { email: "junior@brazilianhaven.com" },
    update: {},
    create: {
      email: "junior@brazilianhaven.com",
      passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2OQ7c2H76y",
      role: "staff",
    },
  });

  const staffUserSenior = await prisma.user.upsert({
    where: { email: "senior@brazilianhaven.com" },
    update: {},
    create: {
      email: "senior@brazilianhaven.com",
      passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2OQ7c2H76y",
      role: "staff",
    },
  });

  const staffUserOwner = await prisma.user.upsert({
    where: { email: "owner@brazilianhaven.com" },
    update: {},
    create: {
      email: "owner@brazilianhaven.com",
      passwordHash: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2OQ7c2H76y",
      role: "owner",
    },
  });

  console.log("✅ Created staff auth users");

  // ── Staff profiles ────────────────────────────────────────────────────────

  const staffJunior = await prisma.staff.upsert({
    where: { userId: staffUserJunior.id },
    update: {},
    create: {
      userId: staffUserJunior.id,
      firstName: "Ana",
      lastName: "Silva",
      bio: "Junior wax specialist with 1 year of experience and a gentle touch.",
      tier: StaffTier.junior,
      isActive: true,
      specialties: ["Brazilian Wax", "Bikini"],
      displayOrder: 3,
    },
  });

  const staffSenior = await prisma.staff.upsert({
    where: { userId: staffUserSenior.id },
    update: {},
    create: {
      userId: staffUserSenior.id,
      firstName: "Maria",
      lastName: "Costa",
      bio: "Senior esthetician with 5 years of experience specializing in Brazilian waxing.",
      tier: StaffTier.senior,
      isActive: true,
      specialties: ["Brazilian Wax", "Combos", "Brow Shaping"],
      displayOrder: 2,
    },
  });

  const staffMaster = await prisma.staff.upsert({
    where: { userId: staffUserOwner.id },
    update: {},
    create: {
      userId: staffUserOwner.id,
      firstName: "Juliana",
      lastName: "Ferreira",
      bio: "Owner and master esthetician with 10+ years perfecting the Brazilian Haven experience.",
      tier: StaffTier.master,
      isActive: true,
      specialties: ["Brazilian Wax", "Combos", "Brow Shaping", "Leg Wax"],
      displayOrder: 1,
    },
  });

  console.log("✅ Created 3 staff profiles");

  // ── Staff schedules (Mon–Sat, 9am–7pm) ───────────────────────────────────

  const workDays = [1, 2, 3, 4, 5, 6]; // Mon–Sat
  for (const staffMember of [staffJunior, staffSenior, staffMaster]) {
    for (const day of workDays) {
      await prisma.staffSchedule.upsert({
        where: { staffId_dayOfWeek: { staffId: staffMember.id, dayOfWeek: day } },
        update: {},
        create: {
          staffId: staffMember.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "19:00",
          timezone: "America/New_York",
        },
      });
    }
  }

  console.log("✅ Created staff schedules (Mon–Sat 9am–7pm)");

  // ── Service pricing ───────────────────────────────────────────────────────

  type PricingInput = {
    serviceId: string;
    staffTier: StaffTier;
    priceUsd: number;
    durationMinutes: number;
  };

  const pricingData: PricingInput[] = [
    // Full Brazilian Wax
    { serviceId: services[0].id, staffTier: StaffTier.junior, priceUsd: 5500, durationMinutes: 45 },
    { serviceId: services[0].id, staffTier: StaffTier.senior, priceUsd: 7000, durationMinutes: 40 },
    { serviceId: services[0].id, staffTier: StaffTier.master, priceUsd: 9000, durationMinutes: 35 },
    // Bikini Wax
    { serviceId: services[1].id, staffTier: StaffTier.junior, priceUsd: 3500, durationMinutes: 30 },
    { serviceId: services[1].id, staffTier: StaffTier.senior, priceUsd: 4500, durationMinutes: 25 },
    { serviceId: services[1].id, staffTier: StaffTier.master, priceUsd: 6000, durationMinutes: 20 },
    // Brazilian + Brow Combo
    { serviceId: services[2].id, staffTier: StaffTier.junior, priceUsd: 7000, durationMinutes: 60 },
    { serviceId: services[2].id, staffTier: StaffTier.senior, priceUsd: 9000, durationMinutes: 55 },
    { serviceId: services[2].id, staffTier: StaffTier.master, priceUsd: 11500, durationMinutes: 50 },
    // Leg Wax
    { serviceId: services[3].id, staffTier: StaffTier.junior, priceUsd: 8000, durationMinutes: 60 },
    { serviceId: services[3].id, staffTier: StaffTier.senior, priceUsd: 10000, durationMinutes: 55 },
    { serviceId: services[3].id, staffTier: StaffTier.master, priceUsd: 12500, durationMinutes: 50 },
  ];

  for (const pricing of pricingData) {
    await prisma.servicePricing.upsert({
      where: {
        serviceId_staffTier: {
          serviceId: pricing.serviceId,
          staffTier: pricing.staffTier,
        },
      },
      update: {},
      create: {
        serviceId: pricing.serviceId,
        staffTier: pricing.staffTier,
        priceUsd: pricing.priceUsd,
        durationMinutes: pricing.durationMinutes,
        active: true,
      },
    });
  }

  console.log("✅ Created service pricing (3 tiers × 4 services)");

  console.log("🎉 Seed complete!");
  console.log("");
  console.log("Test accounts:");
  console.log("  Admin:  admin@brazilianhaven.com  / password123");
  console.log("  Junior: junior@brazilianhaven.com / password123");
  console.log("  Senior: senior@brazilianhaven.com / password123");
  console.log("  Owner:  owner@brazilianhaven.com  / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
