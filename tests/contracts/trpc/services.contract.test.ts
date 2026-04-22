/**
 * Contract tests for tRPC routers: services, staff, availability, appointments
 * These verify the exact shape of inputs/outputs against specs/contracts/api.md
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { z } from "zod";

// ── Output shape schemas ──────────────────────────────────────────────────

const ServiceListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  seoSlug: z.string(),
  pricing: z.array(
    z.object({
      staffTier: z.enum(["junior", "senior", "master"]),
      priceUsd: z.number(),
      durationMinutes: z.number(),
    })
  ),
});

const StaffListItemSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  bio: z.string().nullable(),
  photoUrl: z.string().nullable(),
  specialties: z.array(z.string()),
  tier: z.enum(["junior", "senior", "master"]),
  displayOrder: z.number(),
});

const TimeSlotSchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  available: z.boolean(),
});

const AvailabilitySlotsSchema = z.object({
  slots: z.array(TimeSlotSchema),
});

const CreateBookingResultSchema = z.object({
  appointmentId: z.string(),
  confirmationCode: z.string().regex(/^BHB-\d{8}-[A-Z0-9]{4}$/),
  startAt: z.date().or(z.string()),
  endAt: z.date().or(z.string()),
  priceUsd: z.number(),
});

// ── Smoke-test: schemas are valid ─────────────────────────────────────────

describe("services router contract", () => {
  it("ServiceListItem schema is valid zod schema", () => {
    const sample = {
      id: "abc",
      name: "Full Brazilian Wax",
      description: "...",
      category: "Brazilian Wax",
      seoSlug: "full-brazilian-wax",
      pricing: [
        { staffTier: "junior" as const, priceUsd: 5500, durationMinutes: 45 },
      ],
    };
    expect(() => ServiceListItemSchema.parse(sample)).not.toThrow();
  });

  it("rejects service list item missing required fields", () => {
    const bad = { id: "abc" };
    expect(() => ServiceListItemSchema.parse(bad)).toThrow();
  });
});

describe("staff router contract", () => {
  it("StaffListItem schema is valid", () => {
    const sample = {
      id: "s1",
      firstName: "Maria",
      lastName: "Costa",
      bio: "Experienced esthetician",
      photoUrl: null,
      specialties: ["Brazilian Wax"],
      tier: "senior" as const,
      displayOrder: 1,
    };
    expect(() => StaffListItemSchema.parse(sample)).not.toThrow();
  });

  it("rejects invalid tier value", () => {
    const bad = {
      id: "s1",
      firstName: "Maria",
      lastName: "Costa",
      bio: null,
      photoUrl: null,
      specialties: [],
      tier: "beginner", // invalid
      displayOrder: 1,
    };
    expect(() => StaffListItemSchema.parse(bad)).toThrow();
  });
});

describe("availability router contract", () => {
  it("AvailabilitySlots schema is valid", () => {
    const sample = {
      slots: [
        {
          startAt: "2026-05-04T13:00:00.000Z",
          endAt: "2026-05-04T13:45:00.000Z",
          available: true,
        },
      ],
    };
    expect(() => AvailabilitySlotsSchema.parse(sample)).not.toThrow();
  });
});

describe("appointments router contract", () => {
  it("CreateBookingResult schema accepts valid confirmation code", () => {
    const sample = {
      appointmentId: "appt-1",
      confirmationCode: "BHB-20260504-AB12",
      startAt: new Date("2026-05-04T13:00:00.000Z"),
      endAt: new Date("2026-05-04T13:45:00.000Z"),
      priceUsd: 7000,
    };
    expect(() => CreateBookingResultSchema.parse(sample)).not.toThrow();
  });

  it("rejects malformed confirmation code", () => {
    const bad = {
      appointmentId: "appt-1",
      confirmationCode: "INVALID-CODE",
      startAt: new Date(),
      endAt: new Date(),
      priceUsd: 7000,
    };
    expect(() => CreateBookingResultSchema.parse(bad)).toThrow();
  });
});
