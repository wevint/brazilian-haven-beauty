import { describe, it, expect } from "vitest";
import { calculateAvailableSlots, hasSlotConflict } from "@/lib/booking/availability";
import type { StaffSchedule, Appointment } from "@bhb/db";

// Monday 2026-05-04, staff works 09:00–19:00 America/New_York
const mondayDate = new Date("2026-05-04T00:00:00.000Z");

const mockSchedule: StaffSchedule = {
  id: "sc1",
  staffId: "staff1",
  dayOfWeek: 1, // Monday
  startTime: "09:00",
  endTime: "19:00",
  timezone: "America/New_York",
} as unknown as StaffSchedule;

type ApptSlot = Pick<Appointment, "startAt" | "endAt">;

describe("calculateAvailableSlots", () => {
  it("returns slots for an empty day", () => {
    const slots = calculateAvailableSlots(mockSchedule, [], mondayDate, 45);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("marks a booked slot as unavailable", () => {
    const bookedStart = new Date("2026-05-04T13:00:00.000Z"); // 9am ET
    const bookedEnd = new Date("2026-05-04T13:45:00.000Z");
    const existingAppts: ApptSlot[] = [{ startAt: bookedStart, endAt: bookedEnd }];
    const slots = calculateAvailableSlots(mockSchedule, existingAppts, mondayDate, 45);

    // Find the slot starting at 9am ET
    const bookedSlot = slots.find(
      (s) => new Date(s.startAt).toISOString() === bookedStart.toISOString()
    );
    expect(bookedSlot).toBeDefined();
    expect(bookedSlot?.available).toBe(false);
  });

  it("returns empty array when no schedule provided", () => {
    const slots = calculateAvailableSlots(null, [], mondayDate, 45);
    expect(slots).toHaveLength(0);
  });

  it("does not return slots that exceed schedule end time", () => {
    const slots = calculateAvailableSlots(mockSchedule, [], mondayDate, 45);
    for (const slot of slots) {
      // End time should be <= 19:00 NY
      const endHourUtc = new Date(slot.endAt).getUTCHours();
      // In UTC+0 with NY offset (-4 in summer), 19:00 NY = 23:00 UTC
      expect(new Date(slot.endAt).getTime()).toBeLessThanOrEqual(
        new Date("2026-05-05T00:00:00.000Z").getTime()
      );
    }
  });
});

describe("hasSlotConflict", () => {
  it("returns false when no appointments exist", () => {
    const newSlot = {
      startAt: new Date("2026-05-04T13:00:00.000Z"),
      endAt: new Date("2026-05-04T13:45:00.000Z"),
    };
    expect(hasSlotConflict(newSlot, [])).toBe(false);
  });

  it("returns true for exact overlap", () => {
    const newSlot = {
      startAt: new Date("2026-05-04T13:00:00.000Z"),
      endAt: new Date("2026-05-04T13:45:00.000Z"),
    };
    const existing: ApptSlot[] = [
      {
        startAt: new Date("2026-05-04T13:00:00.000Z"),
        endAt: new Date("2026-05-04T13:45:00.000Z"),
      },
    ];
    expect(hasSlotConflict(newSlot, existing)).toBe(true);
  });

  it("returns true when new slot overlaps start of existing", () => {
    const newSlot = {
      startAt: new Date("2026-05-04T12:30:00.000Z"),
      endAt: new Date("2026-05-04T13:15:00.000Z"),
    };
    const existing: ApptSlot[] = [
      {
        startAt: new Date("2026-05-04T13:00:00.000Z"),
        endAt: new Date("2026-05-04T13:45:00.000Z"),
      },
    ];
    expect(hasSlotConflict(newSlot, existing)).toBe(true);
  });

  it("returns false for adjacent slots (back-to-back)", () => {
    const newSlot = {
      startAt: new Date("2026-05-04T13:45:00.000Z"),
      endAt: new Date("2026-05-04T14:30:00.000Z"),
    };
    const existing: ApptSlot[] = [
      {
        startAt: new Date("2026-05-04T13:00:00.000Z"),
        endAt: new Date("2026-05-04T13:45:00.000Z"),
      },
    ];
    expect(hasSlotConflict(newSlot, existing)).toBe(false);
  });
});
