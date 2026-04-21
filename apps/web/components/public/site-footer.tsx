import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export interface SiteFooterProps {
  locale: Locale;
}

const socialLinks = [
  { href: "https://instagram.com/brazilianhaven", label: "Instagram", icon: "IG" },
  { href: "https://facebook.com/brazilianhaven", label: "Facebook", icon: "FB" },
];

/**
 * Public site footer with navigation links, address, contact info,
 * social links, and legal links.
 */
export function SiteFooter({ locale }: SiteFooterProps) {
  return (
    <footer
      aria-label="Site footer"
      style={{
        backgroundColor: "var(--color-brand-primary)",
        color: "var(--color-text-inverse)",
      }}
    >
      <div
        className="mx-auto px-6 py-16"
        style={{ maxWidth: "var(--layout-container-max)" }}
      >
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              href={`/${locale}`}
              className="inline-block mb-4"
              aria-label="Brazilian Haven Beauty — Home"
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--font-size-h4)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--color-text-inverse)",
                  letterSpacing: "var(--font-tracking-display)",
                }}
              >
                Brazilian Haven Beauty
              </span>
            </Link>
            <p
              style={{
                fontSize: "var(--font-size-small)",
                lineHeight: "var(--font-line-relaxed)",
                color: "rgba(247, 243, 238, 0.7)",
              }}
            >
              Premium Brazilian waxing and beauty services in a welcoming,
              professional environment.
            </p>
          </div>

          {/* Navigation links */}
          <div>
            <h3
              className="mb-4 uppercase"
              style={{
                fontSize: "var(--font-size-micro)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--font-tracking-eyebrow)",
                color: "rgba(247, 243, 238, 0.5)",
              }}
            >
              Navigation
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-3">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About" },
                  { href: "/services", label: "Services" },
                  { href: "/prices", label: "Prices" },
                  { href: "/contact", label: "Contact" },
                  { href: "/book", label: "Book Appointment" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href === "/" ? "" : link.href}`}
                      style={{
                        fontSize: "var(--font-size-small)",
                        color: "rgba(247, 243, 238, 0.8)",
                        transitionDuration: "var(--motion-duration-fast)",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact + Address */}
          <div>
            <h3
              className="mb-4 uppercase"
              style={{
                fontSize: "var(--font-size-micro)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--font-tracking-eyebrow)",
                color: "rgba(247, 243, 238, 0.5)",
              }}
            >
              Contact
            </h3>
            <address
              className="not-italic flex flex-col gap-3"
              style={{
                fontSize: "var(--font-size-small)",
                lineHeight: "var(--font-line-relaxed)",
                color: "rgba(247, 243, 238, 0.8)",
              }}
            >
              <span>Brazilian Haven Beauty</span>
              <span>New York, NY</span>
              <a
                href="tel:+1-555-000-0000"
                style={{ color: "rgba(247, 243, 238, 0.8)" }}
              >
                (555) 000-0000
              </a>
              <a
                href="mailto:hello@brazilianhaven.com"
                style={{ color: "rgba(247, 243, 238, 0.8)" }}
              >
                hello@brazilianhaven.com
              </a>
            </address>
          </div>

          {/* Social links */}
          <div>
            <h3
              className="mb-4 uppercase"
              style={{
                fontSize: "var(--font-size-micro)",
                fontWeight: "var(--font-weight-semibold)",
                letterSpacing: "var(--font-tracking-eyebrow)",
                color: "rgba(247, 243, 238, 0.5)",
              }}
            >
              Follow Us
            </h3>
            <ul className="flex flex-col gap-3">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label} (opens in new tab)`}
                    style={{
                      fontSize: "var(--font-size-small)",
                      color: "rgba(247, 243, 238, 0.8)",
                    }}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(247, 243, 238, 0.12)" }}
        >
          <p
            style={{
              fontSize: "var(--font-size-micro)",
              color: "rgba(247, 243, 238, 0.5)",
            }}
          >
            &copy; {new Date().getFullYear()} Brazilian Haven Beauty. All rights reserved.
          </p>

          <nav aria-label="Legal navigation">
            <ul className="flex gap-4">
              {[
                { href: `/${locale}/privacy`, label: "Privacy Policy" },
                { href: `/${locale}/terms`, label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "var(--font-size-micro)",
                      color: "rgba(247, 243, 238, 0.5)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
