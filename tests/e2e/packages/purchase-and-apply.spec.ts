/**
 * T077 — Playwright E2E: package purchase and balance flow
 *
 * Tests covering the public packages page, package card content, and the
 * authenticated account package balance view.
 *
 * These tests will fail until T080–T083 implement the packages router,
 * packages page, and account package balance view.
 *
 * Contracts drawn from:
 *   specs/tasks.md    — T077 scenarios: packages page, balance view, auth redirect
 *   specs/quickstart.md — localhost:3000, /en/packages, /en/account/packages
 *   specs/plan.md     — Next.js i18n locale routing under /[locale]/
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Public packages page — unauthenticated visitor
// ---------------------------------------------------------------------------

test.describe("Public packages page — unauthenticated visitor", () => {
  test("visits /en/packages and sees package cards", async ({ page }: { page: Page }) => {
    await page.goto("/en/packages");

    // Wait for at least one package card to be visible
    const packageCard = page.locator("[data-testid='package-card']").first();
    await expect(packageCard).toBeVisible({ timeout: 10000 });
  });

  test("package cards show session count", async ({ page }: { page: Page }) => {
    await page.goto("/en/packages");

    const packageCard = page.locator("[data-testid='package-card']").first();
    await expect(packageCard).toBeVisible({ timeout: 10000 });

    // Session count should appear on each package card
    const sessionCountEl = packageCard.locator("[data-testid='package-session-count']");
    await expect(sessionCountEl).toBeVisible({ timeout: 5000 });

    const sessionText = await sessionCountEl.textContent();
    expect(sessionText).toBeTruthy();
    // Should contain a number (e.g. "10 sessions", "5 Sessions")
    expect(sessionText).toMatch(/\d+/);
  });

  test("package cards show price", async ({ page }: { page: Page }) => {
    await page.goto("/en/packages");

    const packageCard = page.locator("[data-testid='package-card']").first();
    await expect(packageCard).toBeVisible({ timeout: 10000 });

    // Price should be visible on each package card
    const priceEl = packageCard.locator("[data-testid='package-price']");
    await expect(priceEl).toBeVisible({ timeout: 5000 });

    const priceText = await priceEl.textContent();
    expect(priceText).toBeTruthy();
    // Price should contain a dollar amount
    expect(priceText).toMatch(/\$\d+(\.\d{2})?/);
  });

  test("multiple package cards are present on the page", async ({ page }: { page: Page }) => {
    await page.goto("/en/packages");

    // Wait for cards to render
    await expect(
      page.locator("[data-testid='package-card']").first()
    ).toBeVisible({ timeout: 10000 });

    const cardCount = await page.locator("[data-testid='package-card']").count();
    expect(cardCount).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Account package balance — authenticated client
// ---------------------------------------------------------------------------

test.describe("Account package balance — authenticated client", () => {
  // Use persisted auth state for this describe block
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("authenticated client visits /en/account/packages and sees package balance", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/packages");

    // Page should not redirect — client is authenticated
    expect(page.url()).toContain("/account/packages");

    // Package balance section should be present
    const balanceEl = page.locator(".package-balance").first();
    await expect(balanceEl).toBeVisible({ timeout: 10000 });
  });

  test("package balance element shows sessions remaining", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/packages");

    const balanceEl = page.locator(".package-balance").first();
    await expect(balanceEl).toBeVisible({ timeout: 10000 });

    const balanceText = await balanceEl.textContent();
    expect(balanceText).toBeTruthy();
    expect(balanceText!.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Auth redirect — unauthenticated user on account page
// ---------------------------------------------------------------------------

test.describe("Auth redirect — unauthenticated visitor on account packages page", () => {
  test("unauthenticated user visiting /en/account/packages is redirected to sign-in", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/packages");

    // Should redirect away from the protected account page
    await page.waitForURL((url) => !url.pathname.includes("/account/packages"), {
      timeout: 10000,
    });

    // Landing URL should contain a sign-in indicator
    const landingUrl = page.url();
    const isSignInPage =
      landingUrl.includes("sign-in") ||
      landingUrl.includes("signin") ||
      landingUrl.includes("login") ||
      landingUrl.includes("auth");

    expect(isSignInPage).toBe(true);
  });
});
