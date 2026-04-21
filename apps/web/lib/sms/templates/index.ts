/**
 * Barrel export for all SMS message templates.
 *
 * Templates are plain functions that return a localised string.
 * They are added here as user story automations are implemented:
 * - US1 (T036): booking confirmation
 * - US7 (T100): reminders, waitlist, welcome, renewal, low-credit
 */

export type SmsLocale = "en" | "pt";
