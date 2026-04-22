import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { trpcServer } from "@/lib/trpc/server";
import { formatPrice } from "@/lib/booking/pricing";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

type AppointmentStatus = "PENDING" | "SCHEDULED" | "CANCELLED" | string;

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const normalized = status.toUpperCase();

  const classes =
    normalized === "PENDING"
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
      : normalized === "SCHEDULED" || normalized === "CHECKED_IN"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
      : normalized === "CANCELLED" || normalized === "NO_SHOW"
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";

  const label =
    normalized === "SCHEDULED"
      ? "Scheduled"
      : normalized === "PENDING"
      ? "Pending"
      : normalized === "CANCELLED"
      ? "Cancelled"
      : normalized === "CHECKED_IN"
      ? "Checked In"
      : normalized === "NO_SHOW"
      ? "No Show"
      : status;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
}

function formatDateTimeNY(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(new Date(date));
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;

  const session = await auth();
  if (!session) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const caller = await trpcServer();
  const appointments = await caller.appointments.getUpcoming();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Account
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {session.user?.email}
          </p>
        </div>

        <Link
          href={`/${locale}/book`}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Book Now
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Upcoming Appointments
        </h2>

        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
            <p className="text-neutral-500">
              No upcoming appointments.{" "}
              <Link
                href={`/${locale}/book`}
                className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
              >
                Book your first service!
              </Link>
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <li
                key={appt.id}
                className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {appt.service.name}
                    </p>
                    <StatusBadge status={appt.status} />
                  </div>

                  <p className="text-sm text-neutral-500">
                    with {appt.staff.firstName} {appt.staff.lastName}
                  </p>

                  <p className="text-sm text-neutral-500">
                    {formatDateTimeNY(appt.startAt)}
                  </p>

                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {formatPrice(appt.priceUsd)}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Cancel stub — disabled in MVP */}
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
                    title="Cancellation coming soon"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
