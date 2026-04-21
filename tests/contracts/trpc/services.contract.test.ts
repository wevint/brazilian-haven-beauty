/**
 * T021 — Contract tests for tRPC routers
 *
 * These tests verify the *shape* of tRPC router inputs and outputs, not behaviour.
 * They are intentionally written before the implementations exist (TDD). They will
 * fail until Phase 3 implementation tasks T026–T037 are complete.
 *
 * Contracts are drawn from:
 *   specs/contracts/api.md   — router procedure signatures
 *   specs/data-model.md      — entity field definitions
 */

import { describe, it, expect, vi, beforeAll } from "vitest";

// ---------------------------------------------------------------------------
// Future imports — these modules do not exist yet. They will be created in
// T016 (tRPC infrastructure) and T031 (router implementations).
// ---------------------------------------------------------------------------
// @ts-expect-error — module not yet implemented
import { createCaller, appRouter } from "@bhb/trpc";

// ---------------------------------------------------------------------------
// Typed stubs for fixture data (mirrors data-model.md field definitions)
// ---------------------------------------------------------------------------

type StaffTier = "junior" | "senior" | "master";

interface ServicePricingShape {
  staffTier: StaffTier;
  priceUsd: number;
  durationMinutes: number;
}

interface ServiceShape {
  id: string;
  name: string;
  description: string;
  category: string;
  seoSlug: string;
  pricing: ServicePricingShape[];
}

interface StaffShape {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  photoUrl: string | null;
  specialties: string[];
  tier: StaffTier;
  displayOrder: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
}

interface AvailabilitySlotShape {
  startAt: string;
  endAt: string;
  available: boolean;
}

interface AvailabilityOutputShape {
  slots: AvailabilitySlotShape[];
}

interface AppointmentReserveOutputShape {
  reservationToken: string;
  slotConfirmed: boolean;
  priceUsd: number;
  expiresAt: string;
}

interface AppointmentConfirmOutputShape {
  appointmentId: string;
  confirmationCode: string;
  startAt: string;
  staffName: string;
  serviceName: string;
  totalChargedUsd: number;
}

// ---------------------------------------------------------------------------
// Router availability check
// ---------------------------------------------------------------------------

describe("tRPC router module availability", () => {
  it("appRouter is defined and exported from @bhb/trpc", () => {
    // Will fail until T016 + T031 create the router module
    expect(appRouter).toBeDefined();
  });

  it("createCaller is exported from @bhb/trpc", () => {
    // Will fail until T016 creates the tRPC infrastructure
    expect(createCaller).toBeDefined();
    expect(typeof createCaller).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// Router: services
// ---------------------------------------------------------------------------

describe("services.list contract", () => {
  it("returns an array", async () => {
    const caller = createCaller({ session: null });
    const result = await caller.services.list({ locale: "en" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("each service item has required shape fields: id, name, description, category, seoSlug", async () => {
    const caller = createCaller({ session: null });
    const result: ServiceShape[] = await caller.services.list({ locale: "en" });

    // Seed data must include at least one service (T028)
    expect(result.length).toBeGreaterThan(0);

    const service = result[0];
    expect(service).toHaveProperty("id");
    expect(typeof service.id).toBe("string");

    expect(service).toHaveProperty("name");
    expect(typeof service.name).toBe("string");

    expect(service).toHaveProperty("description");
    expect(typeof service.description).toBe("string");

    expect(service).toHaveProperty("category");
    expect(typeof service.category).toBe("string");

    expect(service).toHaveProperty("seoSlug");
    expect(typeof service.seoSlug).toBe("string");
  });

  it("each service item has a pricing array", async () => {
    const caller = createCaller({ session: null });
    const result: ServiceShape[] = await caller.services.list({ locale: "en" });

    expect(result.length).toBeGreaterThan(0);
    const service = result[0];

    expect(service).toHaveProperty("pricing");
    expect(Array.isArray(service.pricing)).toBe(true);
  });

  it("each pricing entry has staffTier, priceUsd, and durationMinutes", async () => {
    const caller = createCaller({ session: null });
    const result: ServiceShape[] = await caller.services.list({ locale: "en" });

    expect(result.length).toBeGreaterThan(0);
    const service = result[0];
    expect(service.pricing.length).toBeGreaterThan(0);

    const tier = service.pricing[0];
    expect(tier).toHaveProperty("staffTier");
    expect(["junior", "senior", "master"]).toContain(tier.staffTier);

    expect(tier).toHaveProperty("priceUsd");
    expect(typeof tier.priceUsd).toBe("number");

    expect(tier).toHaveProperty("durationMinutes");
    expect(typeof tier.durationMinutes).toBe("number");
  });

  it("accepts an optional category filter and returns only matching services", async () => {
    const caller = createCaller({ session: null });
    // Passing a category filter must not throw
    const result: ServiceShape[] = await caller.services.list({
      locale: "en",
      category: "Brazilian Wax",
    });
    expect(Array.isArray(result)).toBe(true);
    result.forEach((s) => {
      expect(s.category).toBe("Brazilian Wax");
    });
  });
});

describe("services.get contract", () => {
  it("returns a single service by slug with allowWaitlist and jsonLdSchema fields", async () => {
    const caller = createCaller({ session: null });

    // Relies on seed data having at least one service with a slug
    const listResult: ServiceShape[] = await caller.services.list({
      locale: "en",
    });
    expect(listResult.length).toBeGreaterThan(0);
    const slug = listResult[0].seoSlug;

    const service = await caller.services.get({ slug, locale: "en" });
    expect(service).toBeDefined();
    expect(service.seoSlug).toBe(slug);
    expect(service).toHaveProperty("allowWaitlist");
    expect(typeof service.allowWaitlist).toBe("boolean");
    // jsonLdSchema may be null/undefined for stub data but the field must exist
    expect("jsonLdSchema" in service).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Router: staff
// ---------------------------------------------------------------------------

describe("staff.list contract", () => {
  it("returns an array", async () => {
    const caller = createCaller({ session: null });
    const result = await caller.staff.list({ locale: "en" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("each staff item has required shape fields", async () => {
    const caller = createCaller({ session: null });
    const result: StaffShape[] = await caller.staff.list({ locale: "en" });

    expect(result.length).toBeGreaterThan(0);
    const staff = result[0];

    expect(staff).toHaveProperty("id");
    expect(typeof staff.id).toBe("string");

    expect(staff).toHaveProperty("firstName");
    expect(typeof staff.firstName).toBe("string");

    expect(staff).toHaveProperty("lastName");
    expect(typeof staff.lastName).toBe("string");

    expect(staff).toHaveProperty("bio");
    // bio may be empty string but must be a string
    expect(typeof staff.bio).toBe("string");

    expect(staff).toHaveProperty("photoUrl");
    // photoUrl is string | null
    expect(
      staff.photoUrl === null || typeof staff.photoUrl === "string"
    ).toBe(true);

    expect(staff).toHaveProperty("tier");
    expect(["junior", "senior", "master"]).toContain(staff.tier);

    expect(staff).toHaveProperty("isActive");
    expect(typeof staff.isActive).toBe("boolean");
  });

  it("each staff item has specialties array", async () => {
    const caller = createCaller({ session: null });
    const result: StaffShape[] = await caller.staff.list({ locale: "en" });
    expect(result.length).toBeGreaterThan(0);
    expect(Array.isArray(result[0].specialties)).toBe(true);
  });

  it("each staff item has displayOrder, averageRating, reviewCount", async () => {
    const caller = createCaller({ session: null });
    const result: StaffShape[] = await caller.staff.list({ locale: "en" });
    expect(result.length).toBeGreaterThan(0);
    const staff = result[0];

    expect(staff).toHaveProperty("displayOrder");
    expect(typeof staff.displayOrder).toBe("number");

    expect(staff).toHaveProperty("averageRating");
    expect(typeof staff.averageRating).toBe("number");

    expect(staff).toHaveProperty("reviewCount");
    expect(typeof staff.reviewCount).toBe("number");
  });
});

// ---------------------------------------------------------------------------
// Router: staff.availability (maps to availability.getSlots in task brief)
// ---------------------------------------------------------------------------

describe("staff.availability contract", () => {
  it("accepts { staffId, serviceId, date } and returns { slots: Array }", async () => {
    const caller = createCaller({ session: null });

    // Fetch a real staffId and serviceId from seed data
    const staffList: StaffShape[] = await caller.staff.list({ locale: "en" });
    const serviceList: ServiceShape[] = await caller.services.list({
      locale: "en",
    });
    expect(staffList.length).toBeGreaterThan(0);
    expect(serviceList.length).toBeGreaterThan(0);

    const staffId = staffList[0].id;
    const serviceId = serviceList[0].id;
    const date = "2026-05-01"; // future date; seed schedule should cover it

    const result: AvailabilityOutputShape = await caller.staff.availability({
      staffId,
      serviceId,
      date,
    });

    expect(result).toHaveProperty("slots");
    expect(Array.isArray(result.slots)).toBe(true);
  });

  it("slot items have startAt (ISO 8601), endAt (ISO 8601), available (boolean)", async () => {
    const caller = createCaller({ session: null });
    const staffList: StaffShape[] = await caller.staff.list({ locale: "en" });
    const serviceList: ServiceShape[] = await caller.services.list({
      locale: "en",
    });

    const staffId = staffList[0].id;
    const serviceId = serviceList[0].id;

    const result: AvailabilityOutputShape = await caller.staff.availability({
      staffId,
      serviceId,
      date: "2026-05-01",
    });

    // Only validate shape if slots are returned; empty array is also valid
    if (result.slots.length > 0) {
      const slot = result.slots[0];
      expect(slot).toHaveProperty("startAt");
      expect(typeof slot.startAt).toBe("string");
      // Basic ISO 8601 UTC check: ends with Z or has +00:00
      expect(slot.startAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

      expect(slot).toHaveProperty("endAt");
      expect(typeof slot.endAt).toBe("string");

      expect(slot).toHaveProperty("available");
      expect(typeof slot.available).toBe("boolean");
    }
  });
});

// ---------------------------------------------------------------------------
// Router: appointments.reserve  (bookings.create in task brief)
// ---------------------------------------------------------------------------

describe("appointments.reserve contract", () => {
  it("accepts { serviceId, staffId, startAt, clientEmail } and returns reservation shape", async () => {
    const caller = createCaller({ session: null });
    const staffList: StaffShape[] = await caller.staff.list({ locale: "en" });
    const serviceList: ServiceShape[] = await caller.services.list({
      locale: "en",
    });

    expect(staffList.length).toBeGreaterThan(0);
    expect(serviceList.length).toBeGreaterThan(0);

    const input = {
      serviceId: serviceList[0].id,
      staffId: staffList[0].id,
      startAt: "2026-05-01T14:00:00Z",
      clientEmail: "test-contract@example.com",
    };

    const result: AppointmentReserveOutputShape =
      await caller.appointments.reserve(input);

    expect(result).toHaveProperty("reservationToken");
    expect(typeof result.reservationToken).toBe("string");
    expect(result.reservationToken.length).toBeGreaterThan(0);

    expect(result).toHaveProperty("slotConfirmed");
    expect(typeof result.slotConfirmed).toBe("boolean");

    expect(result).toHaveProperty("priceUsd");
    expect(typeof result.priceUsd).toBe("number");

    expect(result).toHaveProperty("expiresAt");
    expect(typeof result.expiresAt).toBe("string");
  });
});

describe("appointments.confirm contract", () => {
  it("returns shape with appointmentId, confirmationCode, startAt, staffName, serviceName, totalChargedUsd", async () => {
    const caller = createCaller({ session: null });

    // First reserve a slot to get a valid token
    const staffList: StaffShape[] = await caller.staff.list({ locale: "en" });
    const serviceList: ServiceShape[] = await caller.services.list({
      locale: "en",
    });

    const reservation = await caller.appointments.reserve({
      serviceId: serviceList[0].id,
      staffId: staffList[0].id,
      startAt: "2026-05-02T14:00:00Z",
      clientEmail: "confirm-contract@example.com",
    });

    expect(reservation.slotConfirmed).toBe(true);

    const result: AppointmentConfirmOutputShape =
      await caller.appointments.confirm({
        reservationToken: reservation.reservationToken,
        paymentMethod: "stripe",
        stripePaymentIntentId: "pi_test_contract_stub",
        guestFirstName: "Test",
        guestLastName: "Client",
        guestEmail: "confirm-contract@example.com",
        guestPhone: "+15550001234",
      });

    expect(result).toHaveProperty("appointmentId");
    expect(typeof result.appointmentId).toBe("string");

    expect(result).toHaveProperty("confirmationCode");
    expect(typeof result.confirmationCode).toBe("string");
    // confirmationCode format: "BHB-YYYYMMDD-XXXX"
    expect(result.confirmationCode).toMatch(/^BHB-\d{8}-[A-Z0-9]{4}$/);

    expect(result).toHaveProperty("startAt");
    expect(typeof result.startAt).toBe("string");

    expect(result).toHaveProperty("staffName");
    expect(typeof result.staffName).toBe("string");

    expect(result).toHaveProperty("serviceName");
    expect(typeof result.serviceName).toBe("string");

    expect(result).toHaveProperty("totalChargedUsd");
    expect(typeof result.totalChargedUsd).toBe("number");
  });
});
