import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import type { Locale } from "@/lib/i18n/config";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout for the admin dashboard route group.
 * Requires an authenticated session with an admin role.
 * Non-admin users are redirected to the home page.
 */
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}`);
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar placeholder — implemented in US2 (T044) */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0"
        style={{
          backgroundColor: "var(--color-brand-primary)",
          color: "var(--color-text-inverse)",
        }}
      >
        <div className="p-6">
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--font-size-h4)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-text-inverse)",
            }}
          >
            Admin
          </span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
