/**
 * T076 — Integration tests: package purchase and booking application
 *
 * Tests for `applyPackageSession(clientPackageId: string, appointmentId: string): Promise<void>`
 * that should live at `apps/web/lib/packages/packages.ts`.
 *
 * The function does NOT exist yet — @ts-expect-error allows this file
 * to compile but each test that invokes the function will FAIL at runtime
 * until the function is implemented.
 *
 * Scenarios under test:
 *   1. Active package with sessions remaining — calls decrementSession and links
 *      appointmentId to the ClientPackage record
 *   2. Throws when package is expired (expiresAt in past)
 *   3. Throws when sessionsRemaining === 0 (exhausted status)
 *   4. Throws when package status is already "exhausted"
 *   5. After successful apply, the linked appointment has clientPackageId set
 *
 * Contracts drawn from:
 *   specs/tasks.md — T076 domain model: ClientPackage / Appointment linking
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock("@bhb/db", () => ({
  prisma: {
    clientPackage: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    appointment: {
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@bhb/db";

// @ts-expect-error — applyPackageSession is not implemented yet
import { applyPackageSession } from "@/lib/packages/packages";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now
const PAST_DATE = new Date(Date.now() - 1000 * 60 * 60 * 24 * 1);   // 1 day ago

const activePackage = {
  id: "cpkg-active-001",
  clientId: "client-1",
  packageId: "pkg-001",
  sessionsRemaining: 5,
  purchasedAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: FUTURE_DATE,
  status: "active",
  paymentTransactionId: "txn-001",
};

const expiredPackage = {
  ...activePackage,
  id: "cpkg-expired-001",
  sessionsRemaining: 3,
  expiresAt: PAST_DATE,
  status: "expired",
};

const zeroSessionPackage = {
  ...activePackage,
  id: "cpkg-zero-001",
  sessionsRemaining: 0,
  status: "active", // status still active but sessions are 0 — guard must catch both
};

const exhaustedStatusPackage = {
  ...activePackage,
  id: "cpkg-exhausted-001",
  sessionsRemaining: 0,
  status: "exhausted",
};

const APPOINTMENT_ID = "appt-integration-pkg-001";

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("applyPackageSession — active package with sessions remaining", () => {
  it("calls prisma.clientPackage.update (decrement) and links appointmentId", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      activePackage as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...activePackage,
      sessionsRemaining: 4,
    } as never);
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      id: APPOINTMENT_ID,
      clientPackageId: activePackage.id,
    } as never);

    await applyPackageSession(activePackage.id, APPOINTMENT_ID);

    expect(prisma.clientPackage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: activePackage.id }),
        data: expect.objectContaining({ sessionsRemaining: 4 }),
      })
    );
  });

  it("links the appointmentId to the ClientPackage record after decrement", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      activePackage as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...activePackage,
      sessionsRemaining: 4,
    } as never);
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      id: APPOINTMENT_ID,
      clientPackageId: activePackage.id,
    } as never);

    await applyPackageSession(activePackage.id, APPOINTMENT_ID);

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: APPOINTMENT_ID }),
        data: expect.objectContaining({ clientPackageId: activePackage.id }),
      })
    );
  });
});

describe("applyPackageSession — expired package", () => {
  it("throws when package expiresAt is in the past", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      expiredPackage as never
    );

    await expect(
      applyPackageSession(expiredPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();
  });

  it("does not update appointment when package is expired", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      expiredPackage as never
    );

    await expect(
      applyPackageSession(expiredPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();

    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});

describe("applyPackageSession — zero sessions remaining", () => {
  it("throws when sessionsRemaining === 0 (zero-session active package)", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      zeroSessionPackage as never
    );

    await expect(
      applyPackageSession(zeroSessionPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();
  });

  it("does not call appointment.update when sessions are zero", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      zeroSessionPackage as never
    );

    await expect(
      applyPackageSession(zeroSessionPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();

    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});

describe("applyPackageSession — exhausted status package", () => {
  it("throws when package status is already 'exhausted'", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      exhaustedStatusPackage as never
    );

    await expect(
      applyPackageSession(exhaustedStatusPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();
  });

  it("does not call prisma.clientPackage.update or prisma.appointment.update on exhausted status", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      exhaustedStatusPackage as never
    );

    await expect(
      applyPackageSession(exhaustedStatusPackage.id, APPOINTMENT_ID)
    ).rejects.toThrow();

    expect(prisma.clientPackage.update).not.toHaveBeenCalled();
    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});

describe("applyPackageSession — appointment linkage after success", () => {
  it("appointment.update is called with clientPackageId set after successful apply", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      activePackage as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...activePackage,
      sessionsRemaining: 4,
    } as never);
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      id: APPOINTMENT_ID,
      clientPackageId: activePackage.id,
    } as never);

    await applyPackageSession(activePackage.id, APPOINTMENT_ID);

    const appointmentUpdateCall = vi.mocked(prisma.appointment.update).mock.calls[0];
    expect(appointmentUpdateCall).toBeDefined();
    const updateArg = (appointmentUpdateCall as unknown[])[0] as {
      data: Record<string, unknown>;
    };
    expect(updateArg.data.clientPackageId).toBe(activePackage.id);
  });
});
