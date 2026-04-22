/**
 * T055 — Playwright E2E: checkout and payment confirmation
 *
 * 4 tests covering the payment step of the booking wizard and the
 * post-payment confirmation page.
 *
 * These tests will FAIL until the corresponding UI is implemented in US3.
 *
 * Test coverage:
 *   1. Booking step 4 (payment step) renders payment summary with service
 *      name, price, and a payment method selector.
 *   2. Payment step shows a Stripe payment element container.
 *   3. Confirmation page shows the confirmation code after mock payment.
 *   4. Unauthenticated user attempting to confirm payment is redirected
 *      to sign-in.
 *
 * Contracts drawn from:
 *   specs/spec.md      — US3 payment step and confirmation page spec
 *   specs/quickstart.md — localhost:3000, route structure /[locale]/book/...
 *   tests/e2e/booking/first-time-booking.spec.ts — established test patterns
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Test 1: Payment step renders payment summary
// ---------------------------------------------------------------------------

test.describe("Booking step 4 — payment summary", () => {
  test("renders service name, price, and payment method selector", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Navigate directly to the booking wizard payment step.
    // The booking wizard stores progress in session/URL state; navigating
    // to /en/book with step=payment (or the 4th step route) surfaces the UI.
    await page.goto("/en/book?step=payment");

    // Wait for the payment step container to appear
    const paymentStep = page.locator("[data-testid='booking-step-payment']");
    await expect(paymentStep).toBeVisible({ timeout: 10000 });

    // Service name should be visible in the payment summary
    const serviceName = page
      .locator("[data-testid='payment-summary-service-name']")
      .or(page.locator("[data-testid='payment-summary'] [data-testid='service-name']"))
      .first();
    await expect(serviceName).toBeVisible({ timeout: 5000 });

    const serviceNameText = await serviceName.textContent();
    expect(serviceNameText).toBeTruthy();
    expect(serviceNameText!.length).toBeGreaterThan(0);

    // Price should be visible and contain a dollar amount
    const priceDisplay = page
      .locator("[data-testid='payment-summary-price']")
      .or(page.locator("[data-testid='payment-summary'] [data-testid='price']"))
      .first();
    await expect(priceDisplay).toBeVisible({ timeout: 5000 });

    const priceText = await priceDisplay.textContent();
    expect(priceText).toMatch(/\$\d+(\.\d{2})?/);

    // Payment method selector must be present (Stripe / PayPal toggle or tabs)
    const paymentMethodSelector = page
      .locator("[data-testid='payment-method-selector']")
      .or(page.locator("[data-testid='payment-methods']"))
      .first();
    await expect(paymentMethodSelector).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Test 2: Payment step shows Stripe payment element
// ---------------------------------------------------------------------------

test.describe("Booking step 4 — Stripe payment element", () => {
  test("shows the Stripe payment element container", async ({
    page,
  }: {
    page: Page;
  }) => {
    await page.goto("/en/book?step=payment");

    // Wait for payment step to render
    const paymentStep = page.locator("[data-testid='booking-step-payment']");
    await expect(paymentStep).toBeVisible({ timeout: 10000 });

    // Ensure the Stripe method option is selected (default)
    const stripeOption = page
      .locator("[data-testid='payment-method-stripe']")
      .or(page.locator("button:has-text('Card')"))
      .or(page.locator("button:has-text('Credit')"))
      .first();

    const stripeOptionVisible = await stripeOption
      .isVisible()
      .catch(() => false);
    if (stripeOptionVisible) {
      await stripeOption.click();
    }

    // The Stripe payment element container (wraps the Stripe iframe)
    const stripeElement = page
      .locator("[data-testid='stripe-payment-element']")
      .or(page.locator("#stripe-payment-element"))
      .or(page.locator(".stripe-payment-element"))
      .first();

    await expect(stripeElement).toBeVisible({ timeout: 10000 });

    // Stripe renders an iframe inside the container — verify it exists
    // (the actual iframe may take a moment to load from Stripe's JS SDK)
    const stripeIframe = page
      .frameLocator("iframe[name^='__privateStripeFrame']")
      .or(page.frameLocator("iframe[src*='stripe.com']"));

    // At minimum the container element must be present in the DOM
    const elementCount = await page
      .locator("[data-testid='stripe-payment-element'], #stripe-payment-element, .stripe-payment-element")
      .count();
    expect(elementCount).toBeGreaterThan(0);

    // Stripe iframe should be mounted within 15 seconds
    await expect(
      page.locator("iframe[name^='__privateStripeFrame']").or(
        page.locator("iframe[src*='stripe.com']")
      )
    ).toBeVisible({ timeout: 15000 });

    void stripeIframe; // referenced for type-checking
  });
});

// ---------------------------------------------------------------------------
// Test 3: Confirmation page shows confirmation code after mock payment
// ---------------------------------------------------------------------------

test.describe("Payment confirmation page", () => {
  test("confirmation page displays the confirmation code", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Navigate directly to a confirmation page with a test confirmation code.
    // In production this code comes from the Appointment.confirmationCode field.
    // The test uses a well-known test code that the E2E seed should create.
    const testConfirmationCode = "TEST-CODE";
    await page.goto(`/en/book/confirmation/${testConfirmationCode}`);

    // The confirmation page must be visible
    const confirmationPage = page
      .locator("[data-testid='confirmation-page']")
      .or(page.locator("[data-testid='booking-confirmation']"))
      .first();
    await expect(confirmationPage).toBeVisible({ timeout: 10000 });

    // The confirmation code must be displayed on the page
    const confirmationCodeEl = page
      .locator("[data-testid='confirmation-code']")
      .first();
    await expect(confirmationCodeEl).toBeVisible({ timeout: 5000 });

    const codeText = await confirmationCodeEl.textContent();
    expect(codeText).toBeTruthy();
    // Should contain the code either verbatim or in a BHB-YYYYMMDD-XXXX format
    expect(
      codeText!.includes(testConfirmationCode) ||
        /BHB-\d{8}-[A-Z0-9]{4}/.test(codeText!)
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 4: Unauthenticated user is redirected to sign-in
// ---------------------------------------------------------------------------

test.describe("Payment confirmation — authentication gate", () => {
  // Ensure no auth state is loaded for this test
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated user to sign-in when confirming payment", async ({
    page,
  }: {
    page: Page;
  }) => {
    // An unauthenticated user attempting to access the payment confirmation
    // page (or the payment step of the booking wizard for a protected route)
    // should be redirected to the sign-in page.

    // Attempt to access the booking payment step as an unauthenticated user
    await page.goto("/en/book?step=payment");

    // Wait for navigation to settle
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
      // networkidle may time out on slow connections — just proceed
    });

    const currentUrl = page.url();

    // User should have been redirected to sign-in
    const isOnSignIn =
      currentUrl.includes("/sign-in") ||
      currentUrl.includes("/login") ||
      currentUrl.includes("/auth") ||
      currentUrl.includes("/en/auth");

    if (!isOnSignIn) {
      // Alternatively the page may show a sign-in prompt/modal inline
      const signInPrompt = page
        .locator("[data-testid='sign-in-prompt']")
        .or(page.locator("text=Sign in"))
        .or(page.locator("text=Log in"))
        .or(page.locator("text=Entrar"))
        .first();
      await expect(signInPrompt).toBeVisible({ timeout: 5000 });
    } else {
      expect(isOnSignIn).toBe(true);
    }
  });

  test("redirects unauthenticated user away from confirmation code page", async ({
    page,
  }: {
    page: Page;
  }) => {
    // Accessing a confirmation page directly without authentication
    // should redirect to sign-in (the confirmation page is protected)
    await page.goto("/en/book/confirmation/BHB-20260510-AB12");

    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {
      // networkidle may time out on slow connections — just proceed
    });

    const currentUrl = page.url();

    const isOnSignIn =
      currentUrl.includes("/sign-in") ||
      currentUrl.includes("/login") ||
      currentUrl.includes("/auth") ||
      currentUrl.includes("/en/auth");

    if (!isOnSignIn) {
      // Inline sign-in prompt is also acceptable
      const signInPrompt = page
        .locator("[data-testid='sign-in-prompt']")
        .or(page.locator("text=Sign in"))
        .or(page.locator("text=Log in"))
        .or(page.locator("text=Entrar"))
        .first();
      await expect(signInPrompt).toBeVisible({ timeout: 5000 });
    } else {
      expect(isOnSignIn).toBe(true);
    }
  });
});
