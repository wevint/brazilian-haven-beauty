/**
 * T075 — Unit tests: package balance decrement and expiry rules
 *
 * Tests for `decrementSession(clientPackageId: string): Promise<ClientPackage>`
 * that should live at `apps/web/lib/packages/balance.ts`.
 *
 * The function does NOT exist yet — @ts-expect-error allows this file
 * to compile but each test that invokes the function will FAIL at runtime
 * until the function is implemented.
 *
 * Rules under test:
 *   1. Decrements sessionsRemaining by 1 and calls prisma.clientPackage.update
 *   2. Returns the updated ClientPackage with sessionsRemaining - 1
 *   3. Throws ExhaustedPackageError when sessionsRemaining === 0
 *   4. Throws ExpiredPackageError when expiresAt < now
 *   5. Sets status to "exhausted" when sessionsRemaining becomes 0 after decrement
 *   6. Does NOT update DB when package is exhausted (no extra DB call on error path)
 *
 * Contracts drawn from:
 *   specs/tasks.md — T075 domain model: ClientPackage expiry rule
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Prisma ───────────────────────────────────────────────────────────────

vi.mock("@bhb/db", () => ({
  prisma: {
    clientPackage: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@bhb/db";

// @ts-expect-error — decrementSession is not implemented yet
import { decrementSession } from "@/lib/packages/balance";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const FUTURE_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now
const PAST_DATE = new Date(Date.now() - 1000 * 60 * 60 * 24 * 1);   // 1 day ago

const activePackageWith3Sessions = {
  id: "cpkg-001",
  clientId: "client-1",
  packageId: "pkg-001",
  sessionsRemaining: 3,
  purchasedAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: FUTURE_DATE,
  status: "active",
  paymentTransactionId: "txn-001",
};

const packageWith1Session = {
  ...activePackageWith3Sessions,
  id: "cpkg-002",
  sessionsRemaining: 1,
};

const exhaustedPackage = {
  ...activePackageWith3Sessions,
  id: "cpkg-003",
  sessionsRemaining: 0,
  status: "exhausted",
};

const expiredPackage = {
  ...activePackageWith3Sessions,
  id: "cpkg-004",
  sessionsRemaining: 5,
  expiresAt: PAST_DATE,
  status: "expired",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe("decrementSession — happy path", () => {
  it("calls prisma.clientPackage.update with sessionsRemaining decremented by 1", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      activePackageWith3Sessions as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...activePackageWith3Sessions,
      sessionsRemaining: 2,
    } as never);

    await decrementSession("cpkg-001");

    expect(prisma.clientPackage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "cpkg-001" }),
        data: expect.objectContaining({ sessionsRemaining: 2 }),
      })
    );
  });

  it("returns the updated ClientPackage with sessionsRemaining reduced by 1", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      activePackageWith3Sessions as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...activePackageWith3Sessions,
      sessionsRemaining: 2,
    } as never);

    const result = await decrementSession("cpkg-001");

    expect(result.sessionsRemaining).toBe(2);
  });
});

describe("decrementSession — exhausted package guard", () => {
  it("throws ExhaustedPackageError when sessionsRemaining === 0", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      exhaustedPackage as never
    );

    await expect(decrementSession("cpkg-003")).rejects.toThrow(
      "ExhaustedPackageError"
    );
  });

  it("does NOT call prisma.clientPackage.update when package is exhausted", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      exhaustedPackage as never
    );

    await expect(decrementSession("cpkg-003")).rejects.toThrow();

    expect(prisma.clientPackage.update).not.toHaveBeenCalled();
  });
});

describe("decrementSession — expired package guard", () => {
  it("throws ExpiredPackageError when expiresAt is in the past", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      expiredPackage as never
    );

    await expect(decrementSession("cpkg-004")).rejects.toThrow(
      "ExpiredPackageError"
    );
  });

  it("does NOT call prisma.clientPackage.update when package is expired", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      expiredPackage as never
    );

    await expect(decrementSession("cpkg-004")).rejects.toThrow();

    expect(prisma.clientPackage.update).not.toHaveBeenCalled();
  });
});

describe("decrementSession — status transition to exhausted", () => {
  it("sets status to 'exhausted' when sessionsRemaining becomes 0 after decrement", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      packageWith1Session as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...packageWith1Session,
      sessionsRemaining: 0,
      status: "exhausted",
    } as never);

    await decrementSession("cpkg-002");

    expect(prisma.clientPackage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sessionsRemaining: 0,
          status: "exhausted",
        }),
      })
    );
  });

  it("returns status 'exhausted' when last session is consumed", async () => {
    vi.mocked(prisma.clientPackage.findUniqueOrThrow).mockResolvedValue(
      packageWith1Session as never
    );
    vi.mocked(prisma.clientPackage.update).mockResolvedValue({
      ...packageWith1Session,
      sessionsRemaining: 0,
      status: "exhausted",
    } as never);

    const result = await decrementSession("cpkg-002");

    expect(result.status).toBe("exhausted");
    expect(result.sessionsRemaining).toBe(0);
  });
});
