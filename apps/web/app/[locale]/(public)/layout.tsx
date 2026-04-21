import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import type { Locale } from "@/lib/i18n/config";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout for the public marketing route group.
 * Wraps pages with the site header and footer.
 */
export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale as Locale} />
    </div>
  );
}
