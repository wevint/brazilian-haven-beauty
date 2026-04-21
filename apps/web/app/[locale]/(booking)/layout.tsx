import { SiteHeader } from "@/components/public/site-header";
import type { Locale } from "@/lib/i18n/config";

interface BookingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout for the booking wizard route group.
 * Uses a simplified header without full navigation to reduce distraction
 * during the booking flow.
 */
export default async function BookingLayout({
  children,
  params,
}: BookingLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale as Locale} navLinks={[]} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
