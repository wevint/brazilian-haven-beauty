/**
 * PCI-SAQ-A storage guards (US3 — T063).
 *
 * Call assertNoRawCardData before persisting any payment-related object
 * to ensure no raw card data (PAN, CVV, full card number) is stored.
 */

const FORBIDDEN_KEYS = [
  "cardNumber",
  "card_number",
  "cvv",
  "cvc",
  "pan",
  "fullCardNumber",
] as const;

/**
 * Regex for 13-19 consecutive digits — the range that covers valid card numbers.
 * Does NOT match shorter digit strings (e.g. last4 = "4242") or strings with
 * non-digit characters (e.g. formatted "4111-1111-1111-1111").
 */
const CARD_NUMBER_REGEX = /^\d{13,19}$/;

/**
 * Assert that a data object contains no raw card data.
 *
 * Throws if:
 *   - Any key is in the FORBIDDEN_KEYS list
 *   - Any string value matches the 13-19 digit card number pattern
 *
 * Safe to call with: { last4, brand, stripePaymentIntentId, paypalOrderId, setupIntentId }
 */
export function assertNoRawCardData(data: Record<string, unknown>): void {
  for (const key of Object.keys(data)) {
    if ((FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      throw new Error(`Forbidden field: ${key}`);
    }

    const value = data[key];
    if (typeof value === "string" && CARD_NUMBER_REGEX.test(value)) {
      throw new Error(`Possible raw card number detected in field: ${key}`);
    }
  }
}
