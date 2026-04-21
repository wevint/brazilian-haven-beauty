import Link from "next/link";

export interface CtaBannerProps {
  headline: string;
  subline?: string;
  ctaLabel: string;
  ctaHref: string;
  /** Visual variant. Defaults to 'brand' (dark green). */
  variant?: "brand" | "warm" | "neutral";
}

const variantStyles: Record<
  NonNullable<CtaBannerProps["variant"]>,
  { bg: string; text: string; subText: string }
> = {
  brand: {
    bg: "var(--color-brand-primary)",
    text: "var(--color-text-inverse)",
    subText: "rgba(247, 243, 238, 0.8)",
  },
  warm: {
    bg: "var(--color-bg-warm)",
    text: "var(--color-text-primary)",
    subText: "var(--color-text-secondary)",
  },
  neutral: {
    bg: "var(--color-bg-soft)",
    text: "var(--color-text-primary)",
    subText: "var(--color-text-secondary)",
  },
};

/**
 * Full-width call-to-action banner. Used between page sections
 * to drive conversions (booking, membership sign-up, etc.).
 */
export function CtaBanner({
  headline,
  subline,
  ctaLabel,
  ctaHref,
  variant = "brand",
}: CtaBannerProps) {
  const styles = variantStyles[variant];

  return (
    <section
      aria-label="Call to action"
      className="w-full py-16 px-6"
      style={{
        backgroundColor: styles.bg,
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-panel)",
      }}
    >
      <div
        className="mx-auto flex flex-col items-center text-center gap-6"
        style={{ maxWidth: "var(--layout-container-max)" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--font-size-h2)",
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "var(--font-line-heading)",
            letterSpacing: "var(--font-tracking-heading)",
            color: styles.text,
          }}
        >
          {headline}
        </h2>

        {subline && (
          <p
            style={{
              fontSize: "var(--font-size-body-lg)",
              lineHeight: "var(--font-line-relaxed)",
              color: styles.subText,
              maxWidth: "52ch",
            }}
          >
            {subline}
          </p>
        )}

        <Link
          href={ctaHref}
          className="inline-flex items-center px-8 py-4 font-medium"
          style={{
            backgroundColor:
              variant === "brand"
                ? "var(--color-bg-elevated)"
                : "var(--color-brand-primary)",
            color:
              variant === "brand"
                ? "var(--color-brand-primary)"
                : "var(--color-text-inverse)",
            borderRadius: "var(--radius-pill)",
            boxShadow: "var(--shadow-button)",
            fontSize: "var(--font-size-body-lg)",
            fontWeight: "var(--font-weight-semibold)",
            transitionDuration: "var(--motion-duration-base)",
            transitionTimingFunction: "var(--motion-ease-enter)",
          }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
