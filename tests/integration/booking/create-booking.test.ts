/**
 * T024 — Integration tests: booking creation
 *
 * Tests the full booking creation flow end-to-end through the service layer
 * against a real test database (DATABASE_URL env var must point to a test DB).
 *
 * These tests will fail until T026–T031 implement:
 *   - Prisma schema (T026, T027)
 *   - Seed data (T028)
 *   - create-booking service + Redis lock (T029, T030)
 *   - tRPC routers (T031)
 *
 * Contracts drawn from:
 *   specs/data-model.md   — Appointment entity, AppointmentStatus enum
 *   specs/contracts/api.md — appointments.reserve + appointments.confirm
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Future imports — modules will be created in T029, T030, T014
// ---------------------------------------------------------------------------
// @ts-expect-error — module not yet implemented
import { createBooking, SlotUnavailableError } from "@/lib/booking/create-booking";
// @ts-expect-error — module not yet implemented
import { db } from "@bhb/db";
// @ts-expect-error — module not yet implemented
import { acquireSlotLock, releaseSlotLock } from "@/lib/booking/lock";

// ---------------------------------------------------------------------------
// Types (mirror specs/data-model.md)
// ---------------------------------------------------------------------------

type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "completed"
  | "no_show"
  | "cancelled";

type PaymentMethod =
  | "membership_credit"
  | "package"
  | "coupon"
  | "stripe"
  | "paypal";

interface BookingInput {
  serviceId: string;
  staffId: string;
  clientId: string;
  startAt: string;          // ISO 8601 UTC
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
}

interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  status: AppointmentStatus;
}

interface AppointmentRecord {
  id: string;
  serviceId: string;
  staffId: string;
  clientId: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  priceSnapshotUsd: number;
  paymentMethod: PaymentMethod;
  confirmationCode: string;
}

// ---------------------------------------------------------------------------
// Test fixture IDs — these will be created by beforeEach seed
// ---------------------------------------------------------------------------

let testServiceId: string;
let testStaffId: string;
let testClientId: string;

// ---------------------------------------------------------------------------
// Database seed helpers
// ---------------------------------------------------------------------------

async function seedTestData() {
  // Create a minimal staff member with a junior tier
  const staff = await db.staff.create({
    data: {
      firstName: "Test",
      lastName: "Therapist",
      tier: "junior",
      isActive: true,
      displayOrder: 1,
    },
  });
  testStaffId = staff.id;

  // Create a service with junior pricing
  const service = await db.service.create({
    data: {
      name: "Test Brazilian Wax",
      nameTranslations: { en: "Test Brazilian Wax", pt: "Cera Brasileira Test" },
      description: "Test service",
      descriptionTranslations: { en: "Test service", pt: "Serviço de teste" },
      category: "Brazilian Wax",
      seoSlug: `test-brazilian-wax-${Date.now()}`,
      isActive: true,
      allowWaitlist: true,
      displayOrder: 1,
      durationMinutes: 50,
      pricing: {
        create: {
          staffTier: "junior",
          priceUsd: 45.0,
          durationMinutes: 50,
          isActive: true,
        },
      },
    },
  });
  testServiceId = service.id;

  // Create a test client
  const client = await db.client.create({
    data: {
      email: `test-integration-${Date.now()}@example.com`,
      firstName: "Integration",
      lastName: "TestClient",
      preferredLocale: "en",
      isFirstTimeClient: true,
    },
  });
  testClientId = client.id;

  // Create a recurring schedule for the staff member on Friday (dayOfWeek=5)
  await db.staffSchedule.create({
    data: {
      staffId: testStaffId,
      type: "recurring",
      dayOfWeek: 5,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
  });
}

async function cleanupTestData() {
  if (!testClientId && !testStaffId && !testServiceId) return;

  // Delete appointments first (FK dependencies)
  if (testClientId) {
    await db.appointment.deleteMany({
      where: { clientId: testClientId },
    });
    await db.client.deleteMany({
      where: { id: testClientId },
    });
  }

  if (testStaffId) {
    await db.staffSchedule.deleteMany({
      where: { staffId: testStaffId },
    });
    await db.appointment.deleteMany({
      where: { staffId: testStaffId },
    });
  }

  if (testServiceId) {
    await db.servicePricing.deleteMany({
      where: { serviceId: testServiceId },
    });
    await db.service.deleteMany({
      where: { id: testServiceId },
    });
  }

  if (testStaffId) {
    await db.staff.deleteMany({
      where: { id: testStaffId },
    });
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Booking creation", () => {
  beforeEach(async () => {
    await seedTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it("creates appointment with PENDING/scheduled status after creation", async () => {
    const result: BookingResult = await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T14:00:00Z", // 10:00 EDT Friday
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_create_001",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("scheduled");
  });

  it("stores correct serviceId, staffId, clientId, startTime, endTime", async () => {
    const startAt = "2026-05-01T14:00:00Z"; // 10:00 EDT

    const result: BookingResult = await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt,
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_create_002",
    });

    const stored: AppointmentRecord = await db.appointment.findUniqueOrThrow({
      where: { id: result.bookingId },
    });

    expect(stored.serviceId).toBe(testServiceId);
    expect(stored.staffId).toBe(testStaffId);
    expect(stored.clientId).toBe(testClientId);
    expect(stored.startAt.toISOString()).toBe(startAt);
    // endAt should be startAt + 50 minutes (junior tier duration)
    const expectedEndAt = new Date("2026-05-01T14:50:00Z").toISOString();
    expect(stored.endAt.toISOString()).toBe(expectedEndAt);
  });

  it("applies correct price from ServicePricing table", async () => {
    const result: BookingResult = await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T15:00:00Z", // 11:00 EDT
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_create_003",
    });

    const stored: AppointmentRecord = await db.appointment.findUniqueOrThrow({
      where: { id: result.bookingId },
    });

    // junior tier price from seed = 45.00
    expect(Number(stored.priceSnapshotUsd)).toBe(45.0);
  });

  it("prevents double-booking: second booking for same slot throws SlotUnavailableError", async () => {
    const startAt = "2026-05-01T16:00:00Z"; // 12:00 EDT

    // First booking should succeed
    await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt,
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_double_001",
    });

    // Second booking for the same slot must throw SlotUnavailableError
    await expect(
      createBooking({
        serviceId: testServiceId,
        staffId: testStaffId,
        clientId: testClientId,
        startAt,
        paymentMethod: "stripe",
        stripePaymentIntentId: "pi_test_double_002",
      })
    ).rejects.toThrow(SlotUnavailableError);
  });

  it("prevents double-booking: overlapping slots also throw SlotUnavailableError", async () => {
    // First booking: 13:00–13:50 UTC
    await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T17:00:00Z",
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_overlap_001",
    });

    // Overlapping booking: 13:20–14:10 UTC (starts mid-first-appointment)
    await expect(
      createBooking({
        serviceId: testServiceId,
        staffId: testStaffId,
        clientId: testClientId,
        startAt: "2026-05-01T17:20:00Z",
        paymentMethod: "stripe",
        stripePaymentIntentId: "pi_test_overlap_002",
      })
    ).rejects.toThrow(SlotUnavailableError);
  });

  it("concurrent requests: only one of two simultaneous requests for same slot succeeds", async () => {
    const startAt = "2026-05-01T18:00:00Z"; // 14:00 EDT

    const booking1 = createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt,
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_concurrent_001",
    });

    const booking2 = createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt,
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_concurrent_002",
    });

    const results = await Promise.allSettled([booking1, booking2]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // The rejection must be a SlotUnavailableError
    const rejection = rejected[0] as PromiseRejectedResult;
    expect(rejection.reason).toBeInstanceOf(SlotUnavailableError);
  });

  it("returns confirmationCode that is a non-empty string", async () => {
    const result: BookingResult = await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T19:00:00Z", // 15:00 EDT
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_code_001",
    });

    expect(result.confirmationCode).toBeDefined();
    expect(typeof result.confirmationCode).toBe("string");
    expect(result.confirmationCode.length).toBeGreaterThan(0);
  });

  it("confirmationCode matches BHB-YYYYMMDD-XXXX format", async () => {
    const result: BookingResult = await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T19:30:00Z",
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_code_002",
    });

    // Format from api.md: "BHB-20260417-A4B9"
    expect(result.confirmationCode).toMatch(/^BHB-\d{8}-[A-Z0-9]{4}$/);
  });
});

// ---------------------------------------------------------------------------
// Slot reservation (Redis lock)
// ---------------------------------------------------------------------------

describe("Slot reservation — Redis lock behaviour", () => {
  beforeEach(async () => {
    await seedTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
    vi.restoreAllMocks();
  });

  it("acquires lock before writing appointment", async () => {
    const acquireSpy = vi.spyOn({ acquireSlotLock }, "acquireSlotLock");

    await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T20:00:00Z",
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_lock_001",
    });

    expect(acquireSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: testStaffId,
        startAt: "2026-05-01T20:00:00Z",
      })
    );
  });

  it("releases lock after successful write", async () => {
    const releaseSpy = vi.spyOn({ releaseSlotLock }, "releaseSlotLock");

    await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T20:30:00Z",
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_lock_002",
    });

    expect(releaseSpy).toHaveBeenCalled();
  });

  it("releases lock after failed write (ensures no lock leak)", async () => {
    // Force a DB failure on the second call to test cleanup behaviour
    const releaseSpy = vi.spyOn({ releaseSlotLock }, "releaseSlotLock");

    // Pre-book the slot to force a failure
    await createBooking({
      serviceId: testServiceId,
      staffId: testStaffId,
      clientId: testClientId,
      startAt: "2026-05-01T21:00:00Z",
      paymentMethod: "stripe",
      stripePaymentIntentId: "pi_test_lock_fail_001",
    });

    try {
      await createBooking({
        serviceId: testServiceId,
        staffId: testStaffId,
        clientId: testClientId,
        startAt: "2026-05-01T21:00:00Z", // same slot — will fail
        paymentMethod: "stripe",
        stripePaymentIntentId: "pi_test_lock_fail_002",
      });
    } catch {
      // Expected to throw; lock must still be released
    }

    // releaseSlotLock should have been called for both the success and the failure
    expect(releaseSpy).toHaveBeenCalled();
  });
});
