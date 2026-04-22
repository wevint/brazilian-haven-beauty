import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { trpcServer } from "@/lib/trpc/server";
import { ServicesTableClient } from "@/components/admin/services/services-table-client";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}/sign-in`);
  }

  const caller = await trpcServer();
  const services = await caller.services.list({ locale: locale as "en" | "pt" });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Services</h1>
      <ServicesTableClient services={services} />
    </div>
  );
}
