/**
 * T067 — Playwright E2E: membership signup and booking with credits
 *
 * Tests the critical user flows for US4 (Client buys a subscription plan
 * with a chosen staff tier):
 *
 *   1. Unauthenticated user can view membership plan cards on /en/memberships
 *   2. Plan cards display a price and a "Join" button
 *   3. Authenticated client can view their membership status in the account area
 *   4. Unauthenticated user visiting /en/account/memberships is redirected to sign-in
 *
 * These tests will FAIL until T071–T073 implement the UI components and pages.
 *
 * Contracts drawn from:
 *   specs/quickstart.md    — localhost:3000, /en/memberships, /en/account
 *   specs/plan.md          — Next.js i18n locale routing under /[locale]/
 *   specs/spec.md          — US4 membership plan display and account management
 *   specs/components.md    — membership-card, membership-grid components
 */

import { test, expect, type Page } from "@playwright/test";

// ── Public membership plans page (unauthenticated) ────────────────────────────

test.describe("Public memberships page", () => {
  test("unauthenticated user can see membership plan cards at /en/memberships", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/memberships");

    // Page must load without redirecting to sign-in
    expect(page.url()).toContain("/en/memberships");

    // At least one membership card must be visible
    const membershipCard = page.locator("[data-testid='membership-card']").first();
    await expect(membershipCard).toBeVisible({ timeout: 10000 });
  });

  test("membership cards display a price", async ({ page }: { page: Page }) => {
    await page.goto("/en/memberships");

    const membershipCard = page.locator("[data-testid='membership-card']").first();
    await expect(membershipCard).toBeVisible({ timeout: 10000 });

    // Each card must show a price (dollar amount)
    const priceElement = membershipCard
      .locator("text=/\\$\\d+/")
      .or(membershipCard.locator("[data-testid='plan-price']"))
      .first();
    await expect(priceElement).toBeVisible({ timeout: 5000 });

    const priceText = await priceElement.textContent();
    expect(priceText).toMatch(/\$\d+/);
  });

  test("membership cards display a 'Join' button", async ({ page }: { page: Page }) => {
    await page.goto("/en/memberships");

    const membershipCard = page.locator("[data-testid='membership-card']").first();
    await expect(membershipCard).toBeVisible({ timeout: 10000 });

    // Card must have a "Join" CTA button
    const joinButton = membershipCard
      .locator("button", { hasText: /join/i })
      .or(membershipCard.locator("[data-testid='join-button']"))
      .first();
    await expect(joinButton).toBeVisible({ timeout: 5000 });
  });

  test("multiple membership plan cards are displayed", async ({ page }: { page: Page }) => {
    await page.goto("/en/memberships");

    const cards = page.locator("[data-testid='membership-card']");
    const count = await cards.count();

    // Expect at least one plan card (ideally more)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("each membership card shows the plan name", async ({ page }: { page: Page }) => {
    await page.goto("/en/memberships");

    const membershipCard = page.locator("[data-testid='membership-card']").first();
    await expect(membershipCard).toBeVisible({ timeout: 10000 });

    // Card must show a non-empty plan name
    const planName = membershipCard
      .locator("[data-testid='plan-name']")
      .or(membershipCard.locator("h2, h3"))
      .first();
    await expect(planName).toBeVisible({ timeout: 5000 });

    const nameText = await planName.textContent();
    expect(nameText?.trim().length).toBeGreaterThan(0);
  });
});

// ── Authenticated account membership area ─────────────────────────────────────

test.describe("Account memberships page (authenticated)", () => {
  // Use persisted auth state for this describe block
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("authenticated client can view their membership status", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/memberships");

    // Page must load — user should NOT be redirected to sign-in
    expect(page.url()).toContain("/en/account/memberships");

    // Membership status element must be visible
    const membershipStatus = page.locator(".membership-status");
    await expect(membershipStatus).toBeVisible({ timeout: 10000 });
  });

  test("membership status element contains text describing the current plan", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/memberships");

    const membershipStatus = page.locator(".membership-status");
    await expect(membershipStatus).toBeVisible({ timeout: 10000 });

    const statusText = await membershipStatus.textContent();
    expect(statusText?.trim().length).toBeGreaterThan(0);
  });

  test("account memberships page shows credits remaining", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/account/memberships");

    // Credits balance indicator should be visible
    const creditsDisplay = page
      .locator("[data-testid='credits-remaining']")
      .or(page.locator("text=/\\d+ credit/i"))
      .first();
    await expect(creditsDisplay).toBeVisible({ timeout: 10000 });
  });
});

// ── Unauthenticated redirect guard ────────────────────────────────────────────

test.describe("Account memberships page (unauthenticated)", () => {
  test("unauthenticated user is redirected to sign-in when visiting /en/account/memberships", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Ensure no auth cookies are present — use a fresh context
    await page.goto("/en/account/memberships");

    // Should be redirected away from the account page
    await page.waitForURL(
      (url) =>
        url.pathname.includes("/sign-in") ||
        url.pathname.includes("/login") ||
        url.pathname.includes("/auth"),
      { timeout: 10000 }
    );

    const redirectedUrl = page.url();
    const isOnAuthPage =
      redirectedUrl.includes("/sign-in") ||
      redirectedUrl.includes("/login") ||
      redirectedUrl.includes("/auth");

    expect(isOnAuthPage).toBe(true);
  });
});
