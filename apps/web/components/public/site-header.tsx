import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export interface SiteHeaderProps {
  locale: Locale;
  navLinks?: Array<{ href: string; label: string }>;
}

const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/prices", label: "Prices" },
  { href: "/contact", label: "Contact" },
];

/**
 * Public marketing site header.
 * Includes logo, main navigation, language toggle (EN/PT), and booking CTA.
 */
export function SiteHeader({
  locale,
  navLinks = defaultNavLinks,
}: SiteHeaderProps) {
  const alternateLocale: Locale = locale === "en" ? "pt" : "en";

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderBottom: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <div
        className="mx-auto flex h-16 items-center justify-between px-6"
        style={{ maxWidth: "var(--layout-container-max)" }}
      >
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2"
          aria-label="Brazilian Haven Beauty — Home"
        >
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-brand-primary)",
              letterSpacing: "var(--font-tracking-display)",
            }}
          >
            Brazilian Haven Beauty
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href === "/" ? "" : link.href}`}
              className="text-sm transition-colors"
              style={{
                color: "var(--color-text-secondary)",
                transitionDuration: "var(--motion-duration-fast)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: language toggle + CTA */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <Link
            href={`/${alternateLocale}`}
            className="text-xs font-medium px-3 py-1.5 rounded-pill border"
            aria-label={`Switch to ${alternateLocale === "en" ? "English" : "Português"}`}
            style={{
              borderRadius: "var(--radius-pill)",
              borderColor: "var(--color-border-default)",
              color: "var(--color-text-secondary)",
            }}
          >
            {alternateLocale.toUpperCase()}
          </Link>

          {/* Book Now CTA */}
          <Link
            href={`/${locale}/book`}
            className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-medium"
            style={{
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-pill)",
              boxShadow: "var(--shadow-button)",
              transitionDuration: "var(--motion-duration-base)",
            }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
