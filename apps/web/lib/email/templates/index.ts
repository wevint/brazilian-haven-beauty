/**
 * Barrel export for all React Email templates.
 *
 * Templates are added here as user story automations are implemented:
 * - US1 (T036): booking confirmation
 * - US7 (T099): reminders, waitlist, welcome, renewal, low-credit
 */

export { BaseEmail } from "./base";
export type { BaseEmailProps } from "./base";

export { BookingConfirmationEmail } from "./booking-confirmation";
export type { BookingConfirmationEmailProps } from "./booking-confirmation";
