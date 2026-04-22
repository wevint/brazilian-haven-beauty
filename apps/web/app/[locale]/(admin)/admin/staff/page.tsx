import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/roles";
import { trpcServer } from "@/lib/trpc/server";
import { StaffTableClient } from "@/components/admin/staff/staff-table-client";

interface StaffPageProps {
  params: Promise<{ locale: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session || !isAdmin(session)) {
    redirect(`/${locale}/sign-in`);
  }

  const caller = await trpcServer();
  const staffList = await caller.staff.listAdmin();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Staff</h1>
      <StaffTableClient staff={staffList} />
    </div>
  );
}
