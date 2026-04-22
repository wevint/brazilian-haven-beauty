import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Layout for the admin dashboard pages.
 * Defense-in-depth auth check in addition to the route group layout.
 */
export default async function AdminDashboardLayout({
  children,
  params,
}: AdminDashboardLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
