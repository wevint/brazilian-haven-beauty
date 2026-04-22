/**
 * T039 — Integration tests: drag-reschedule and conflict handling
 *
 * Tests `rescheduleAppointment(appointmentId, newStartAt)` from
 * `apps/web/lib/admin/appointments.ts` — which does NOT exist yet.
 *
 * These tests require a real PostgreSQL test database (DATABASE_URL env var)
 * and use Prisma directly to seed fixtures before each test.
 *
 * All tests will FAIL until the implementation module is created.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "@bhb/db";

// @ts-expect-error — module does not exist yet; tests will fail at runtime
import { rescheduleAppointment } from "@/lib/admin/appointments";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function createTestStaff() {
  return db.staff.create({
    data: {
      firstName: "Test",
      lastName: "StaffMember",
      tier: "senior",
      specialties: ["Brazilian Wax"],
      isActive: true,
      displayOrder: 99,
    },
  });
}

async function createTestService() {
  const slug = `test-service-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return db.service.create({
    data: {
      name: "Test Service",
      nameTranslations: { en: "Test Service", pt: "Serviço de Teste" },
      slug,
      description: "A test service",
      descriptionTranslations: { en: "A test service", pt: "Um serviço de teste" },
      category: "Test",
      active: true,
      allowWaitlist: false,
      displayOrder: 99,
    },
  });
}

function generateConfirmationCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `BHB-${date}-${suffix}`;
}

async function createTestAppointment(
  staffId: string,
  serviceId: string,
  startAt: Date,
  endAt: Date,
  status: "scheduled" | "cancelled" = "scheduled"
) {
  return db.appointment.create({
    data: {
      clientId: `client-${Math.random().toString(36).slice(2)}`,
      staffId,
      serviceId,
      staffTier: "senior",
      priceUsd: 7000,
      durationMinutes: 45,
      startAt,
      endAt,
      status,
      confirmationCode: generateConfirmationCode(),
    },
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("rescheduleAppointment integration", () => {
  let staffId: string;
  let serviceId: string;

  // Seeded appointment IDs, cleaned up after each test
  const createdAppointmentIds: string[] = [];
  let createdStaffId: string | null = null;
  let createdServiceId: string | null = null;

  beforeEach(async () => {
    const staff = await createTestStaff();
    const service = await createTestService();

    staffId = staff.id;
    serviceId = service.id;
    createdStaffId = staff.id;
    createdServiceId = service.id;
  });

  afterEach(async () => {
    // Clean up in reverse FK order
    if (createdAppointmentIds.length > 0) {
      await db.appointment.deleteMany({
        where: { id: { in: [...createdAppointmentIds] } },
      });
      createdAppointmentIds.length = 0;
    }
    if (createdServiceId) {
      await db.service.delete({ where: { id: createdServiceId } }).catch(() => {});
      createdServiceId = null;
    }
    if (createdStaffId) {
      await db.staff.delete({ where: { id: createdStaffId } }).catch(() => {});
      createdStaffId = null;
    }
  });

  it("successfully reschedules an appointment when the new slot has no conflict", async () => {
    const originalStart = new Date("2026-06-01T10:00:00.000Z");
    const originalEnd = new Date("2026-06-01T10:45:00.000Z");
    const appt = await createTestAppointment(staffId, serviceId, originalStart, originalEnd);
    createdAppointmentIds.push(appt.id);

    const newStart = new Date("2026-06-01T13:00:00.000Z");

    // Implementation must move the appointment to 13:00–13:45
    const result = await rescheduleAppointment(appt.id, newStart);

    expect(result).toBeDefined();
    expect(result.id).toBe(appt.id);
    expect(result.status).toBe("scheduled");

    const resultStart =
      result.startAt instanceof Date ? result.startAt : new Date(result.startAt);
    expect(resultStart.toISOString()).toBe(newStart.toISOString());

    // Verify persisted in DB
    const persisted = await db.appointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(persisted.startAt.toISOString()).toBe(newStart.toISOString());
  });

  it("throws a conflict error when the new slot overlaps an existing appointment for the same staff", async () => {
    // Appointment A occupies 14:00–14:45
    const apptA = await createTestAppointment(
      staffId,
      serviceId,
      new Date("2026-06-01T14:00:00.000Z"),
      new Date("2026-06-01T14:45:00.000Z")
    );
    createdAppointmentIds.push(apptA.id);

    // Appointment B starts at 11:00 and we try to move it into the 14:00 slot
    const apptB = await createTestAppointment(
      staffId,
      serviceId,
      new Date("2026-06-01T11:00:00.000Z"),
      new Date("2026-06-01T11:45:00.000Z")
    );
    createdAppointmentIds.push(apptB.id);

    const conflictingStart = new Date("2026-06-01T14:15:00.000Z"); // overlaps apptA

    await expect(rescheduleAppointment(apptB.id, conflictingStart)).rejects.toThrow();
  });

  it("throws an error when attempting to reschedule a CANCELLED appointment", async () => {
    const cancelledAppt = await createTestAppointment(
      staffId,
      serviceId,
      new Date("2026-06-01T09:00:00.000Z"),
      new Date("2026-06-01T09:45:00.000Z"),
      "cancelled"
    );
    createdAppointmentIds.push(cancelledAppt.id);

    const newStart = new Date("2026-06-02T10:00:00.000Z");

    await expect(rescheduleAppointment(cancelledAppt.id, newStart)).rejects.toThrow();
  });
});
