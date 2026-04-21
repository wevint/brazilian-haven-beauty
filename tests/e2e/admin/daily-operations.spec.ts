/**
 * T041 — Playwright E2E: admin dashboard and calendar operations
 *
 * Four navigation/structure tests for the admin panel introduced in
 * Phase 4 (US2 – Admin manages the day's operations).
 *
 * These tests will FAIL until the admin pages at /en/admin, /en/admin/appointments,
 * and /en/admin/services are implemented.
 *
 * Test approach:
 *   - No drag-and-drop tested here (requires a fully running server with data)
 *   - Tests verify navigation, redirects, and static structural elements
 *
 * Contracts drawn from:
 *   specs/quickstart.md    — baseURL is http://localhost:3000
 *   specs/spec.md          — admin routes: /en/admin, /en/admin/appointments, /en/admin/services
 *   specs/plan.md          — Next.js i18n locale routing under /[locale]/
 */

import { test, expect, type Page } from "@playwright/test";

// ── Test 1: Unauthenticated redirect ─────────────────────────────────────────

test.describe("Admin access control", () => {
  test("unauthenticated access to /en/admin redirects to sign-in", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/admin");

    // The app must redirect to the sign-in page; accept either /sign-in or /login paths
    await expect(page).toHaveURL(/\/(sign-in|login|auth\/sign-in|auth\/login)/);
  });
});

// ── Tests 2–4: Authenticated admin ───────────────────────────────────────────
//
// These tests use a persisted admin auth state. If the file is absent (first
// run or CI bootstrap), the tests will fail with a storage-state error —
// which is the correct "failing" behavior for TDD.

test.describe("Admin dashboard — authenticated", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" });

  test("admin can sign in and see the dashboard with KPI cards", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/admin");

    // Must stay on the admin page (not redirected)
    await expect(page).toHaveURL(/\/en\/admin/);

    // Dashboard heading must be visible
    const heading = page.locator("h1");
    await expect(heading).toBeVisible({ timeout: 10000 });

    // At least one KPI card must be visible
    const kpiCard = page.locator(".kpi-card").first();
    await expect(kpiCard).toBeVisible({ timeout: 10000 });
  });

  test("admin can navigate to /en/admin/appointments and see calendar or table view", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/admin/appointments");

    // Must arrive at the appointments admin page
    await expect(page).toHaveURL(/\/en\/admin\/appointments/);

    // Either a calendar container or a table must be visible
    const calendar = page.locator("[data-testid='admin-calendar'], .fc, [class*='calendar']");
    const table = page.locator("table, [data-testid='appointments-table']");

    const hasCalendar = await calendar.first().isVisible({ timeout: 10000 }).catch(() => false);
    const hasTable = await table.first().isVisible({ timeout: 10000 }).catch(() => false);

    expect(hasCalendar || hasTable).toBe(true);
  });

  test("admin can navigate to /en/admin/services and see a services table", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/admin/services");

    // Must arrive at the services admin page
    await expect(page).toHaveURL(/\/en\/admin\/services/);

    // A services table or list must be visible
    const servicesTable = page.locator(
      "table, [data-testid='services-table'], [data-testid='services-list']"
    );
    await expect(servicesTable.first()).toBeVisible({ timeout: 10000 });
  });
});
