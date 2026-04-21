import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brazilian Haven Beauty",
    template: "%s | Brazilian Haven Beauty",
  },
  description:
    "Premium Brazilian waxing and beauty services. Book online today.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://brazilianhaven.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "pt_BR",
    siteName: "Brazilian Haven Beauty",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout. Applies global CSS, sets base HTML attributes.
 * Locale-specific html lang is set by the [locale]/layout.tsx below.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for Cormorant Garamond + Manrope */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
