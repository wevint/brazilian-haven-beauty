import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import type { Locale } from "@/lib/i18n/config";

interface AccountLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout for the authenticated account route group.
 * Redirects unauthenticated users to the sign-in page.
 */
export default async function AccountLayout({
  children,
  params,
}: AccountLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale as Locale} />
      <main className="flex-1">
        <div
          className="mx-auto px-6 py-10"
          style={{ maxWidth: "var(--layout-container-max)" }}
        >
          {children}
        </div>
      </main>
      <SiteFooter locale={locale as Locale} />
    </div>
  );
}
