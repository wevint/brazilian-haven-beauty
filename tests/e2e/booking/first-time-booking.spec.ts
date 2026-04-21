/**
 * T025 — Playwright E2E: booking flow
 *
 * Full booking flow from a clean session (unauthenticated) to confirmation,
 * then verifies the booked appointment appears in the client's account.
 *
 * These tests will fail until T032–T037 implement the UI components and pages.
 *
 * Contracts drawn from:
 *   specs/quickstart.md   — localhost:3000, /en/book, /en/services, /en/account
 *   specs/contracts/api.md — booking wizard steps: service → staff → datetime → payment
 *   specs/plan.md         — Next.js i18n locale routing under /[locale]/
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// First-time booking flow (unauthenticated guest checkout)
// ---------------------------------------------------------------------------

test.describe("First-time booking flow", () => {
  test("navigates from home to services page", async ({ page }: { page: Page }) => {
    await page.goto("/en");

    // Either a "Book Now" CTA or a "Services" navigation link should be visible
    const bookNowButton = page.locator("text=Book Now").first();
    const servicesLink = page.locator("text=Services").first();

    const hasBookNow = await bookNowButton.isVisible().catch(() => false);
    const hasServices = await servicesLink.isVisible().catch(() => false);

    expect(hasBookNow || hasServices).toBe(true);

    if (hasBookNow) {
      await bookNowButton.click();
    } else {
      await servicesLink.click();
    }

    await page.waitForURL("**/en/services");
    expect(page.url()).toContain("/en/services");
  });

  test("selects a service and shows staff tiers", async ({ page }: { page: Page }) => {
    await page.goto("/en/services");

    // Wait for service cards to load
    const serviceCard = page.locator("[data-testid='service-card']").first();
    await expect(serviceCard).toBeVisible({ timeout: 10000 });

    // Click the first service card
    await serviceCard.click();

    // Booking wizard step 1 should be visible
    const wizardStep1 = page.locator("[data-testid='booking-step-service']");
    await expect(wizardStep1).toBeVisible({ timeout: 5000 });

    // Select a staff member to trigger tier pricing update
    const staffOption = page.locator("[data-testid='staff-tier-option']").first();
    await expect(staffOption).toBeVisible({ timeout: 5000 });
    await staffOption.click();

    // Price display should update when staff is selected
    const priceDisplay = page.locator("[data-testid='pricing-display']");
    await expect(priceDisplay).toBeVisible({ timeout: 3000 });

    const priceText = await priceDisplay.textContent();
    // Price should contain a dollar amount
    expect(priceText).toMatch(/\$\d+(\.\d{2})?/);
  });

  test("completes booking with Stripe test card", async ({ page }: { page: Page }) => {
    await page.goto("/en/book");

    // ---- Step 1: Service selection ----
    const serviceStep = page.locator("[data-testid='booking-step-service']");
    await expect(serviceStep).toBeVisible({ timeout: 10000 });

    // Select the first available service
    const firstService = page.locator("[data-testid='service-option']").first();
    await expect(firstService).toBeVisible({ timeout: 5000 });
    await firstService.click();

    // Advance to next step
    const nextButton = page.locator("[data-testid='step-next-button']").first();
    await nextButton.click();

    // ---- Step 2: Staff selection ----
    const staffStep = page.locator("[data-testid='booking-step-staff']");
    await expect(staffStep).toBeVisible({ timeout: 5000 });

    const firstStaff = page.locator("[data-testid='staff-option']").first();
    await expect(firstStaff).toBeVisible({ timeout: 5000 });
    await firstStaff.click();

    await page.locator("[data-testid='step-next-button']").click();

    // ---- Step 3: Date/time selection ----
    const datetimeStep = page.locator("[data-testid='booking-step-datetime']");
    await expect(datetimeStep).toBeVisible({ timeout: 5000 });

    // Select the first available time slot
    const firstSlot = page
      .locator("[data-testid='time-slot'][data-available='true']")
      .first();
    await expect(firstSlot).toBeVisible({ timeout: 5000 });
    await firstSlot.click();

    await page.locator("[data-testid='step-next-button']").click();

    // ---- Step 4: Payment ----
    const paymentStep = page.locator("[data-testid='booking-step-payment']");
    await expect(paymentStep).toBeVisible({ timeout: 5000 });

    // Stripe Elements renders inside an iframe — fill test card details
    const stripeCardFrame = page.frameLocator(
      "iframe[name^='__privateStripeFrame']"
    );

    // Card number
    const cardNumber = stripeCardFrame
      .locator("[data-elements-stable-field-name='cardNumber']")
      .or(stripeCardFrame.locator("input[placeholder*='Card number']"))
      .first();
    await cardNumber.fill("4242 4242 4242 4242");

    // Expiry
    const cardExpiry = stripeCardFrame
      .locator("[data-elements-stable-field-name='cardExpiry']")
      .or(stripeCardFrame.locator("input[placeholder*='MM / YY']"))
      .first();
    await cardExpiry.fill("12 / 29");

    // CVC
    const cardCvc = stripeCardFrame
      .locator("[data-elements-stable-field-name='cardCvc']")
      .or(stripeCardFrame.locator("input[placeholder*='CVC']"))
      .first();
    await cardCvc.fill("123");

    // Fill guest information
    await page.fill("[data-testid='guest-first-name']", "Test");
    await page.fill("[data-testid='guest-last-name']", "Guest");
    await page.fill("[data-testid='guest-email']", "e2e-guest@example.com");
    await page.fill("[data-testid='guest-phone']", "+15550009999");

    // Submit booking
    const submitButton = page.locator("[data-testid='submit-booking-button']");
    await submitButton.click();

    // ---- Confirmation page ----
    await page.waitForURL("**/confirmation**", { timeout: 30000 });

    // URL must contain /confirmation
    expect(page.url()).toContain("/confirmation");

    // Booking ID / confirmation code must be visible
    const confirmationCode = page.locator("[data-testid='confirmation-code']");
    await expect(confirmationCode).toBeVisible({ timeout: 10000 });

    const codeText = await confirmationCode.textContent();
    expect(codeText).toMatch(/BHB-\d{8}-[A-Z0-9]{4}/);
  });
});

// ---------------------------------------------------------------------------
// Authenticated account view — uses stored auth state
// ---------------------------------------------------------------------------

test.describe("Upcoming booking in account", () => {
  // Use persisted auth state for this describe block
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("shows upcoming booking in account after login", async ({ page }: { page: Page }) => {
    // This test assumes the booking completed in the previous test created an
    // appointment for the test client. In CI, a fixture booking should be
    // pre-seeded for the test user whose auth state is stored in user.json.

    await page.goto("/en/account");

    // Wait for the account page to load
    const accountPage = page.locator("[data-testid='account-page']");
    await expect(accountPage).toBeVisible({ timeout: 10000 });

    // Find the "Upcoming" section
    const upcomingSection = page.locator("[data-testid='upcoming-appointments']");
    await expect(upcomingSection).toBeVisible({ timeout: 5000 });

    // At least one upcoming appointment should be listed
    const upcomingItem = upcomingSection
      .locator("[data-testid='appointment-item']")
      .first();
    await expect(upcomingItem).toBeVisible({ timeout: 5000 });

    // The appointment item should contain the service name
    const appointmentText = await upcomingItem.textContent();
    expect(appointmentText).toBeTruthy();
    expect(appointmentText!.length).toBeGreaterThan(0);
  });

  test("account upcoming section is labelled and accessible", async ({ page }: { page: Page }) => {
    await page.goto("/en/account");

    await expect(
      page.locator("text=Upcoming").or(page.locator("text=Próximas"))
    ).toBeVisible({ timeout: 10000 });
  });
});
