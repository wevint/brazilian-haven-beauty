import Link from "next/link";
import { db } from "@bhb/db";
import { formatPrice } from "@/lib/booking/pricing";

interface ConfirmationPageProps {
  params: Promise<{ locale: string; code: string }>;
}

function formatDateTimeNY(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(date);
}

function buildGoogleCalendarUrl(params: {
  title: string;
  startAt: Date;
  endAt: Date;
  location: string;
  description: string;
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const qs = new URLSearchParams({
    text: params.title,
    dates: `${fmt(params.startAt)}/${fmt(params.endAt)}`,
    location: params.location,
    details: params.description,
  });

  return `${base}&${qs.toString()}`;
}

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { locale, code } = await params;

  const appointment = await db.appointment.findFirst({
    where: { confirmationCode: code },
    include: {
      service: {
        select: { id: true, name: true, nameTranslations: true },
      },
      staff: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!appointment) {
    return (
      <div
        className="mx-auto px-6 py-20 text-center"
        style={{ maxWidth: "480px" }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Booking Not Found
        </h1>
        <p className="mt-3 text-neutral-500">
          We couldn&apos;t find a booking with that confirmation code.
        </p>
        <Link
          href={`/${locale}/book`}
          className="mt-6 inline-block rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Book an Appointment
        </Link>
      </div>
    );
  }

  const serviceName =
    locale === "pt"
      ? (
          appointment.service.nameTranslations as
            | Record<string, string>
            | null
        )?.pt ?? appointment.service.name
      : appointment.service.name;

  const staffFullName = `${appointment.staff.firstName} ${appointment.staff.lastName}`;

  const calendarUrl = buildGoogleCalendarUrl({
    title: `${serviceName} at Brazilian Haven Beauty`,
    startAt: appointment.startAt,
    endAt: appointment.endAt,
    location: "Brazilian Haven Beauty, New York, NY",
    description: `Booking confirmation code: ${code}`,
  });

  return (
    <div
      className="mx-auto px-4 py-12 sm:px-6"
      style={{ maxWidth: "560px" }}
    >
      {/* Confirmation header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl dark:bg-green-900">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-neutral-500">
          {locale === "pt"
            ? "Seu agendamento foi confirmado."
            : "Your appointment is all set."}
        </p>
      </div>

      {/* Confirmation code */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Confirmation Code
        </p>
        <p className="mt-2 text-3xl font-bold tracking-wider text-neutral-900 dark:text-white">
          {code}
        </p>
      </div>

      {/* Details card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <dl className="space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Service</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {serviceName}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Specialist</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {staffFullName}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Date &amp; Time</dt>
            <dd className="text-right font-medium text-neutral-900 dark:text-white">
              {formatDateTimeNY(appointment.startAt)}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Duration</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {appointment.durationMinutes} min
            </dd>
          </div>

          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-700">
            <div className="flex justify-between text-base font-bold">
              <dt className="text-neutral-900 dark:text-white">Total Paid</dt>
              <dd className="text-neutral-900 dark:text-white">
                {formatPrice(appointment.priceUsd)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Add to Google Calendar
        </a>

        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          View My Appointments
        </Link>
      </div>
    </div>
  );
}
