import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { trpcServer } from "@/lib/trpc/server";
import { KpiCards } from "@/components/admin/kpi-cards";
import { DailySummary } from "@/components/admin/daily-summary";

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}/sign-in`);
  }

  const caller = await trpcServer();
  const kpiData = await caller.admin.getKpiSummary();
  const appointments = await caller.appointments.list({ date: new Date() });

  const summaryAppointments = appointments.map((appt) => ({
    id: appt.id,
    clientName: appt.client.name,
    serviceName: appt.service.name,
    staffName: appt.staff.name,
    startAt: appt.startAt,
    status: appt.status,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <KpiCards {...kpiData} />
      <DailySummary appointments={summaryAppointments} />
    </div>
  );
}
