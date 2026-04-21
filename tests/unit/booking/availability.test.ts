/**
 * T023 — Unit tests: availability calculation
 *
 * Tests for `apps/web/lib/booking/availability.ts` which does not exist yet (TDD).
 * These tests will fail until T029 creates the availability service module.
 *
 * Contracts drawn from:
 *   specs/data-model.md   — StaffSchedule entity, Appointment entity
 *   specs/contracts/api.md — staff.availability procedure
 *   specs/quickstart.md   — SALON_TIMEZONE = America/New_York
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Future import — module will be created in T029
// ---------------------------------------------------------------------------
// @ts-expect-error — module not yet implemented
import {
  calculateAvailableSlots,
  hasSlotConflict,
} from "@/lib/booking/availability";

// ---------------------------------------------------------------------------
// Fixture types — mirror specs/data-model.md
// ---------------------------------------------------------------------------

type ScheduleType = "recurring" | "exception";

interface StaffScheduleEntry {
  id: string;
  staffId: string;
  type: ScheduleType;
  dayOfWeek?: number;   // 0–6 (Sun–Sat); only for recurring
  startTime: string;    // "HH:MM" local salon time
  endTime: string;      // "HH:MM" local salon time
  date?: string;        // "YYYY-MM-DD"; only for exception
  isAvailable: boolean;
}

interface AppointmentSlot {
  startAt: string;      // ISO 8601 UTC
  endAt: string;        // ISO 8601 UTC
}

interface AvailableSlot {
  startAt: string;      // ISO 8601 UTC
  endAt: string;        // ISO 8601 UTC
  available: boolean;
}

// ---------------------------------------------------------------------------
// Fixture data
//
// All dates use America/New_York (UTC-4 in EDT summer, UTC-5 in EST winter).
// "2026-05-01" is a Friday in EDT (UTC-4).
// Schedule hours: 09:00–17:00 local → 13:00–21:00 UTC on 2026-05-01.
// ---------------------------------------------------------------------------

const FRIDAY_DATE = "2026-05-01";
const SATURDAY_DATE = "2026-05-02";
const SUNDAY_DATE = "2026-05-03";

// Staff works Mon–Fri 09:00–17:00 salon time
const WEEKDAY_SCHEDULE: StaffScheduleEntry[] = [
  {
    id: "sch-mon",
    staffId: "staff-001",
    type: "recurring",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    id: "sch-tue",
    staffId: "staff-001",
    type: "recurring",
    dayOfWeek: 2, // Tuesday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    id: "sch-wed",
    staffId: "staff-001",
    type: "recurring",
    dayOfWeek: 3, // Wednesday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    id: "sch-thu",
    staffId: "staff-001",
    type: "recurring",
    dayOfWeek: 4, // Thursday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
  {
    id: "sch-fri",
    staffId: "staff-001",
    type: "recurring",
    dayOfWeek: 5, // Friday
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
  },
];

// Existing appointments for Friday 2026-05-01
// 09:00–09:50 EDT (13:00–13:50 UTC) and 10:00–10:50 EDT (14:00–14:50 UTC)
const EXISTING_APPOINTMENTS: AppointmentSlot[] = [
  { startAt: "2026-05-01T13:00:00Z", endAt: "2026-05-01T13:50:00Z" }, // 09:00–09:50 EDT
  { startAt: "2026-05-01T14:00:00Z", endAt: "2026-05-01T14:50:00Z" }, // 10:00–10:50 EDT
];

const DURATION_50_MIN = 50;
const DURATION_45_MIN = 45;

// ---------------------------------------------------------------------------
// calculateAvailableSlots
// ---------------------------------------------------------------------------

describe("calculateAvailableSlots(staffSchedule, existingAppointments, date, duration)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fix "now" to 2026-04-20T12:00:00Z so future dates are ahead of "now"
    vi.setSystemTime(new Date("2026-04-20T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns slots within schedule hours", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      FRIDAY_DATE,
      DURATION_50_MIN
    );

    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBeGreaterThan(0);

    // All returned slots should fall within 09:00–17:00 EDT on 2026-05-01
    // Schedule window start: 2026-05-01T13:00:00Z (09:00 EDT)
    // Schedule window end:   2026-05-01T21:00:00Z (17:00 EDT)
    slots.forEach((slot) => {
      const start = new Date(slot.startAt).getTime();
      const end = new Date(slot.endAt).getTime();
      const windowStart = new Date("2026-05-01T13:00:00Z").getTime();
      const windowEnd = new Date("2026-05-01T21:00:00Z").getTime();

      expect(start).toBeGreaterThanOrEqual(windowStart);
      expect(end).toBeLessThanOrEqual(windowEnd);
    });
  });

  it("excludes slots that overlap with existing appointments", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      EXISTING_APPOINTMENTS,
      FRIDAY_DATE,
      DURATION_50_MIN
    );

    // 09:00–09:50 EDT (13:00Z–13:50Z) is taken — no slot should start at 13:00Z
    const conflictingStart = slots.find(
      (s) => s.startAt === "2026-05-01T13:00:00Z"
    );
    expect(conflictingStart).toBeUndefined();

    // Slot at 09:05 would overlap with 09:00–09:50 appointment — should not appear
    const overlappingSlot = slots.find(
      (s) => new Date(s.startAt) > new Date("2026-05-01T13:00:00Z") &&
             new Date(s.startAt) < new Date("2026-05-01T13:50:00Z")
    );
    expect(overlappingSlot).toBeUndefined();
  });

  it("excludes slots where remaining time before schedule end is less than duration", () => {
    // If schedule ends at 17:00 EDT (21:00Z) and duration is 50 min,
    // no slot should start after 16:10 EDT (20:10Z)
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      FRIDAY_DATE,
      DURATION_50_MIN
    );

    const latestAllowedStart = new Date("2026-05-01T20:10:00Z").getTime(); // 16:10 EDT

    slots.forEach((slot) => {
      const slotStart = new Date(slot.startAt).getTime();
      expect(slotStart).toBeLessThanOrEqual(latestAllowedStart);
    });
  });

  it("returns empty array when staff has no schedule for that day (Sunday)", () => {
    // Staff schedule only covers Mon–Fri; Sunday has no entry
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      SUNDAY_DATE,   // Sunday — no schedule
      DURATION_50_MIN
    );

    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBe(0);
  });

  it("returns empty array when staff has no schedule for Saturday", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      SATURDAY_DATE, // Saturday — no schedule
      DURATION_50_MIN
    );
    expect(slots.length).toBe(0);
  });

  it("handles timezone correctly (America/New_York) — slot times are UTC strings", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      FRIDAY_DATE,
      DURATION_45_MIN
    );

    expect(slots.length).toBeGreaterThan(0);
    // Slots must be ISO 8601 UTC strings (ending in Z or +00:00)
    slots.forEach((slot) => {
      expect(slot.startAt).toMatch(/Z$|[+-]\d{2}:\d{2}$/);
      expect(slot.endAt).toMatch(/Z$|[+-]\d{2}:\d{2}$/);
    });
  });

  it("slot endAt = startAt + durationMinutes", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      FRIDAY_DATE,
      DURATION_50_MIN
    );

    expect(slots.length).toBeGreaterThan(0);
    slots.forEach((slot) => {
      const diffMs = new Date(slot.endAt).getTime() - new Date(slot.startAt).getTime();
      const diffMin = diffMs / 60000;
      expect(diffMin).toBe(DURATION_50_MIN);
    });
  });

  it("returned slot objects have available property set to true", () => {
    const slots: AvailableSlot[] = calculateAvailableSlots(
      WEEKDAY_SCHEDULE,
      [],
      FRIDAY_DATE,
      DURATION_45_MIN
    );

    slots.forEach((slot) => {
      expect(slot.available).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// hasSlotConflict
// ---------------------------------------------------------------------------

describe("hasSlotConflict(newSlot, existingAppointments)", () => {
  it("returns true when new slot fully overlaps an existing appointment", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T13:00:00Z",
      endAt: "2026-05-01T13:50:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(true);
  });

  it("returns true when new slot partially overlaps (starts during existing appointment)", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T13:20:00Z", // starts during 13:00–13:50 appointment
      endAt: "2026-05-01T14:10:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(true);
  });

  it("returns true when new slot partially overlaps (ends during existing appointment)", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T12:30:00Z",
      endAt: "2026-05-01T13:30:00Z", // ends during 13:00–13:50 appointment
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(true);
  });

  it("returns true when new slot completely contains an existing appointment", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T12:00:00Z",
      endAt: "2026-05-01T15:00:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(true);
  });

  it("returns false when new slot is adjacent — end of new slot === start of existing", () => {
    // New slot ends exactly when existing appointment starts (no overlap)
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T12:10:00Z",
      endAt: "2026-05-01T13:00:00Z", // endAt === EXISTING_APPOINTMENTS[0].startAt
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(false);
  });

  it("returns false when new slot is adjacent — start of new slot === end of existing", () => {
    // New slot starts exactly when existing appointment ends (no overlap)
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T13:50:00Z", // startAt === EXISTING_APPOINTMENTS[0].endAt
      endAt: "2026-05-01T14:40:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(false);
  });

  it("returns false when new slot is completely before all existing appointments", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T10:00:00Z",
      endAt: "2026-05-01T10:50:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(false);
  });

  it("returns false when new slot is completely after all existing appointments", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T16:00:00Z",
      endAt: "2026-05-01T16:50:00Z",
    };

    expect(hasSlotConflict(newSlot, EXISTING_APPOINTMENTS)).toBe(false);
  });

  it("returns false when existingAppointments is empty", () => {
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T13:00:00Z",
      endAt: "2026-05-01T13:50:00Z",
    };

    expect(hasSlotConflict(newSlot, [])).toBe(false);
  });

  it("handles back-to-back appointments without falsely flagging conflict", () => {
    // 09:00–09:50 then 09:50–10:40 — these are back-to-back, not overlapping
    const backToBackAppointments: AppointmentSlot[] = [
      { startAt: "2026-05-01T13:00:00Z", endAt: "2026-05-01T13:50:00Z" },
      { startAt: "2026-05-01T13:50:00Z", endAt: "2026-05-01T14:40:00Z" },
    ];

    // A new slot at 14:40 should not conflict
    const newSlot: AppointmentSlot = {
      startAt: "2026-05-01T14:40:00Z",
      endAt: "2026-05-01T15:30:00Z",
    };

    expect(hasSlotConflict(newSlot, backToBackAppointments)).toBe(false);
  });
});
