/**
 * i18n configuration for next-intl.
 * Supported locales: English (default) and Portuguese.
 */

export const locales = ["en", "pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Human-readable locale labels used in language toggles. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  pt: "Português",
};

/** Maps locale to BCP-47 language tag for html lang attribute. */
export const localeToBcp47: Record<Locale, string> = {
  en: "en-US",
  pt: "pt-BR",
};
