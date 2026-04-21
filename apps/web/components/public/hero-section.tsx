import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export interface HeroSectionProps {
  locale: Locale;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Optional background image URL (Cloudflare R2) */
  backgroundImageUrl?: string;
}

/**
 * Full-bleed hero section with headline, subline, and primary CTA.
 * Supports an optional secondary CTA and background image.
 */
export function HeroSection({
  locale,
  headline,
  subline,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  backgroundImageUrl,
}: HeroSectionProps) {
  return (
    <section
      aria-label="Hero"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-warm)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-panel)",
        minHeight: "clamp(480px, 60vh, 720px)",
        margin: "var(--space-6)",
      }}
    >
      {/* Background image overlay */}
      {backgroundImageUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--color-overlay-medium-dark)" }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 py-16"
        style={{ maxWidth: "var(--layout-content-readable)" }}
      >
        <h1
          className="mb-6"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-hero)",
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "var(--font-line-tight)",
            letterSpacing: "var(--font-tracking-display)",
            color: backgroundImageUrl
              ? "var(--color-text-inverse)"
              : "var(--color-text-primary)",
          }}
        >
          {headline}
        </h1>

        <p
          className="mb-10"
          style={{
            fontSize: "var(--font-size-body-lg)",
            lineHeight: "var(--font-line-relaxed)",
            color: backgroundImageUrl
              ? "var(--color-text-inverse)"
              : "var(--color-text-secondary)",
            maxWidth: "52ch",
          }}
        >
          {subline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Primary CTA */}
          <Link
            href={ctaHref}
            className="inline-flex items-center px-8 py-4 font-medium"
            style={{
              backgroundColor: "var(--color-brand-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-pill)",
              boxShadow: "var(--shadow-button)",
              fontSize: "var(--font-size-body-lg)",
              transitionDuration: "var(--motion-duration-base)",
              transitionTimingFunction: "var(--motion-ease-enter)",
            }}
          >
            {ctaLabel}
          </Link>

          {/* Secondary CTA */}
          {secondaryCtaLabel && secondaryCtaHref && (
            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center px-8 py-4 font-medium border"
              style={{
                backgroundColor: "transparent",
                color: backgroundImageUrl
                  ? "var(--color-text-inverse)"
                  : "var(--color-text-primary)",
                borderColor: backgroundImageUrl
                  ? "var(--color-border-inverse)"
                  : "var(--color-border-default)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--font-size-body-lg)",
                transitionDuration: "var(--motion-duration-base)",
              }}
            >
              {secondaryCtaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
