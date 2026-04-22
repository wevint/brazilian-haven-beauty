/**
 * T038 — Contract tests for admin, appointments, services, and staff routers
 *
 * These tests verify the exact input/output shapes of tRPC procedures for
 * Phase 4 (US2 – Admin manages the day's operations).
 *
 * The admin router procedures, admin-specific appointments/services/staff
 * procedures do NOT exist yet. @ts-expect-error is used so the file compiles
 * but the tests fail at runtime once the missing procedures are invoked.
 *
 * Contracts drawn from:
 *   specs/contracts/api.md    — router procedure signatures
 *   specs/data-model.md       — StaffTier enum values
 *   specs/spec.md             — KPI card fields
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Output shape schemas ──────────────────────────────────────────────────────

const DashboardStatsSchema = z.object({
  todayAppointments: z.number(),
  revenue: z.number(),
  activeClients: z.number(),
});

const KpiSummarySchema = z.object({
  appointmentsToday: z.number(),
  revenueToday: z.number(),
  newClientsThisWeek: z.number(),
  upcomingAppointments: z.number(),
});

const AppointmentListItemSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  staffId: z.string(),
  serviceId: z.string(),
  startAt: z.date().or(z.string()),
  endAt: z.date().or(z.string()),
  status: z.enum(["scheduled", "checked_in", "completed", "no_show", "cancelled"]),
});

const RescheduleResultSchema = z.object({
  id: z.string(),
  startAt: z.date().or(z.string()),
  endAt: z.date().or(z.string()),
  status: z.enum(["scheduled", "checked_in", "completed", "no_show", "cancelled"]),
});

const ServiceUpdateResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().or(z.string()),
});

const PricingResultSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  staffTier: z.enum(["junior", "senior", "master"]),
  priceUsd: z.number(),
  durationMinutes: z.number(),
});

const StaffListItemSchema = z.object({
  id: z.string(),
  name: z.string().optional().or(z.string()),
  tier: z.enum(["junior", "senior", "master"]),
  specialties: z.array(z.string()),
});

// ── Schema smoke tests (always pass — verify Zod schemas are correct) ─────────

describe("admin.getDashboardStats — contract shape", () => {
  it("DashboardStats schema accepts valid shape", () => {
    const sample = { todayAppointments: 12, revenue: 85000, activeClients: 9 };
    expect(() => DashboardStatsSchema.parse(sample)).not.toThrow();
  });

  it("DashboardStats schema rejects missing revenue field", () => {
    const bad = { todayAppointments: 12, activeClients: 9 };
    expect(() => DashboardStatsSchema.parse(bad)).toThrow();
  });
});

describe("admin.getKpiSummary — contract shape", () => {
  it("KpiSummary schema accepts valid shape", () => {
    const sample = {
      appointmentsToday: 8,
      revenueToday: 42000,
      newClientsThisWeek: 3,
      upcomingAppointments: 15,
    };
    expect(() => KpiSummarySchema.parse(sample)).not.toThrow();
  });

  it("KpiSummary schema rejects missing fields", () => {
    const bad = { appointmentsToday: 8, revenueToday: 42000 };
    expect(() => KpiSummarySchema.parse(bad)).toThrow();
  });
});

describe("appointments.list — contract shape", () => {
  it("AppointmentListItem schema accepts valid shape", () => {
    const sample = {
      id: "appt-1",
      clientId: "client-1",
      staffId: "staff-1",
      serviceId: "service-1",
      startAt: new Date("2026-05-04T13:00:00.000Z"),
      endAt: new Date("2026-05-04T13:45:00.000Z"),
      status: "scheduled" as const,
    };
    expect(() => AppointmentListItemSchema.parse(sample)).not.toThrow();
  });

  it("AppointmentListItem schema rejects invalid status", () => {
    const bad = {
      id: "appt-1",
      clientId: "client-1",
      staffId: "staff-1",
      serviceId: "service-1",
      startAt: new Date(),
      endAt: new Date(),
      status: "pending", // not a valid AppointmentStatus
    };
    expect(() => AppointmentListItemSchema.parse(bad)).toThrow();
  });
});

describe("appointments.reschedule — contract shape", () => {
  it("RescheduleResult schema accepts valid shape", () => {
    const sample = {
      id: "appt-1",
      startAt: new Date("2026-05-04T15:00:00.000Z"),
      endAt: new Date("2026-05-04T15:45:00.000Z"),
      status: "scheduled" as const,
    };
    expect(() => RescheduleResultSchema.parse(sample)).not.toThrow();
  });
});

describe("services.update — contract shape", () => {
  it("ServiceUpdateResult schema accepts minimal shape", () => {
    const sample = { id: "svc-1", name: "Full Brazilian Wax", description: "Premium service" };
    expect(() => ServiceUpdateResultSchema.parse(sample)).not.toThrow();
  });
});

describe("services.updatePricing — contract shape", () => {
  it("PricingResult schema accepts valid shape", () => {
    const sample = {
      id: "pricing-1",
      serviceId: "svc-1",
      staffTier: "senior" as const,
      priceUsd: 7000,
      durationMinutes: 45,
    };
    expect(() => PricingResultSchema.parse(sample)).not.toThrow();
  });

  it("PricingResult schema rejects invalid staffTier", () => {
    const bad = {
      id: "pricing-1",
      serviceId: "svc-1",
      staffTier: "beginner", // invalid
      priceUsd: 7000,
      durationMinutes: 45,
    };
    expect(() => PricingResultSchema.parse(bad)).toThrow();
  });
});

describe("staff.list — contract shape (admin view)", () => {
  it("StaffListItem schema accepts valid shape", () => {
    const sample = {
      id: "staff-1",
      name: "Maria Costa",
      tier: "senior" as const,
      specialties: ["Brazilian Wax", "Eyebrow Shaping"],
    };
    expect(() => StaffListItemSchema.parse(sample)).not.toThrow();
  });
});

// ── Runtime procedure existence tests (will FAIL until implementation) ────────
//
// Each block calls a procedure that doesn't exist yet on appRouter. The
// @ts-expect-error directive allows the TypeScript compiler to accept the call
// even though the property is absent from the type; the test then fails at
// runtime because the procedure is undefined.

import { appRouter } from "@bhb/trpc";
import { createCallerFactory } from "@trpc/server";

const createCaller = createCallerFactory(appRouter);

const adminCtx = {
  session: { user: { id: "admin-user-1", email: "admin@bhb.com", role: "owner" } },
};

describe("admin router procedures — existence (runtime fail until implemented)", () => {
  const caller = createCaller(adminCtx);

  it("admin.getDashboardStats procedure exists and returns DashboardStats shape", async () => {
    // @ts-expect-error — admin router not implemented yet
    const result = await caller.admin.getDashboardStats();
    expect(() => DashboardStatsSchema.parse(result)).not.toThrow();
  });

  it("admin.getKpiSummary procedure exists and returns KpiSummary shape", async () => {
    // @ts-expect-error — admin router not implemented yet
    const result = await caller.admin.getKpiSummary();
    expect(() => KpiSummarySchema.parse(result)).not.toThrow();
  });
});

describe("appointments.list procedure — existence (runtime fail until implemented)", () => {
  const caller = createCaller(adminCtx);

  it("appointments.list returns array of AppointmentListItem", async () => {
    // @ts-expect-error — appointments.list (admin) not implemented yet
    const result = await caller.appointments.list();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(() => AppointmentListItemSchema.parse(result[0])).not.toThrow();
    }
  });

  it("appointments.reschedule accepts appointmentId + newStartAt and returns rescheduled shape", async () => {
    // @ts-expect-error — appointments.reschedule not implemented yet
    const result = await caller.appointments.reschedule({
      appointmentId: "appt-dummy",
      newStartAt: new Date("2026-05-10T14:00:00.000Z"),
    });
    expect(() => RescheduleResultSchema.parse(result)).not.toThrow();
  });
});

describe("services router admin procedures — existence (runtime fail until implemented)", () => {
  const caller = createCaller(adminCtx);

  it("services.update accepts id + optional name/description and returns service shape", async () => {
    // @ts-expect-error — services.update not implemented yet
    const result = await caller.services.update({
      id: "svc-dummy",
      name: "Updated Name",
    });
    expect(() => ServiceUpdateResultSchema.parse(result)).not.toThrow();
  });

  it("services.updatePricing accepts serviceId + staffTier + price + duration and returns pricing shape", async () => {
    // @ts-expect-error — services.updatePricing not implemented yet
    const result = await caller.services.updatePricing({
      serviceId: "svc-dummy",
      staffTier: "senior",
      priceUsd: 7000,
      durationMinutes: 45,
    });
    expect(() => PricingResultSchema.parse(result)).not.toThrow();
  });
});

describe("staff.list admin view — existence (runtime fail until implemented)", () => {
  const caller = createCaller(adminCtx);

  it("staff.list (admin) returns array with id, name, tier, specialties", async () => {
    // @ts-expect-error — admin staff list not yet extended with admin view fields
    const result = await caller.staff.listAdmin();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(() => StaffListItemSchema.parse(result[0])).not.toThrow();
    }
  });
});
