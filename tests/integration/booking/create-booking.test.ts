import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@bhb/db", () => ({
  prisma: {
    servicePricing: {
      findFirst: vi.fn(),
    },
    appointment: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock Redis lock
vi.mock("@/lib/booking/lock", () => ({
  acquireSlotLock: vi.fn(),
  releaseSlotLock: vi.fn(),
}));

import { createBooking, type CreateBookingInput } from "@/lib/booking/create-booking";
import { acquireSlotLock, releaseSlotLock } from "@/lib/booking/lock";
import { prisma } from "@bhb/db";

const baseInput: CreateBookingInput = {
  clientId: "client-1",
  serviceId: "service-1",
  staffId: "staff-1",
  staffTier: "senior",
  startAt: new Date("2026-05-04T14:00:00.000Z"),
  notes: "No notes",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createBooking", () => {
  it("creates a booking when slot is available", async () => {
    const mockLockToken = "lock-token-abc";
    const endAt = new Date("2026-05-04T14:40:00.000Z");

    vi.mocked(acquireSlotLock).mockResolvedValue(mockLockToken);
    vi.mocked(prisma.servicePricing.findFirst).mockResolvedValue({
      id: "sp1",
      serviceId: "service-1",
      staffTier: "senior",
      priceUsd: 7000,
      durationMinutes: 40,
      active: true,
    } as never);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.appointment.create).mockResolvedValue({
      id: "appt-1",
      confirmationCode: "BHB-20260504-AB12",
      startAt: baseInput.startAt,
      endAt,
      priceUsd: 7000,
      clientId: "client-1",
      staffId: "staff-1",
      serviceId: "service-1",
      staffTier: "senior",
      durationMinutes: 40,
      status: "scheduled",
    } as never);

    const result = await createBooking(baseInput);

    expect(result.appointmentId).toBe("appt-1");
    expect(result.confirmationCode).toMatch(/^BHB-\d{8}-[A-Z0-9]{4}$/);
    expect(result.priceUsd).toBe(7000);
    expect(releaseSlotLock).toHaveBeenCalledWith("staff-1", baseInput.startAt, mockLockToken);
  });

  it("throws SlotUnavailableError when lock cannot be acquired", async () => {
    vi.mocked(acquireSlotLock).mockResolvedValue(null);

    await expect(createBooking(baseInput)).rejects.toThrow("SlotUnavailableError");
  });

  it("releases lock even if booking creation fails", async () => {
    const mockLockToken = "lock-token-xyz";

    vi.mocked(acquireSlotLock).mockResolvedValue(mockLockToken);
    vi.mocked(prisma.servicePricing.findFirst).mockResolvedValue({
      id: "sp1",
      serviceId: "service-1",
      staffTier: "senior",
      priceUsd: 7000,
      durationMinutes: 40,
      active: true,
    } as never);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.appointment.create).mockRejectedValue(new Error("DB error"));

    await expect(createBooking(baseInput)).rejects.toThrow("DB error");
    expect(releaseSlotLock).toHaveBeenCalledWith("staff-1", baseInput.startAt, mockLockToken);
  });
});

describe("acquireSlotLock", () => {
  it("is exported from lock.ts", async () => {
    const lockModule = await import("@/lib/booking/lock");
    expect(typeof lockModule.acquireSlotLock).toBe("function");
    expect(typeof lockModule.releaseSlotLock).toBe("function");
  });
});
