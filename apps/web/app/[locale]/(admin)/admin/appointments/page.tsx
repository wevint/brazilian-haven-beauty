import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { trpcServer } from "@/lib/trpc/server";
import { AppointmentsCalendarClient } from "@/components/admin/calendar/appointments-calendar-client";

interface AppointmentsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AppointmentsPage({ params }: AppointmentsPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}/sign-in`);
  }

  const caller = await trpcServer();
  const appointments = await caller.appointments.list({ date: new Date() });

  const events = appointments.map((appt) => ({
    id: appt.id,
    title: `${appt.service.name} - ${appt.client.name}`,
    start: appt.startAt instanceof Date ? appt.startAt.toISOString() : String(appt.startAt),
    end: appt.endAt instanceof Date ? appt.endAt.toISOString() : String(appt.endAt),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Appointments</h1>
      <AppointmentsCalendarClient events={events} />
    </div>
  );
}
