"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/booking/pricing";
import type { BookingDetails } from "@/types/booking";
import type { CreateBookingResult } from "@/lib/booking/create-booking";

interface PaymentStepProps {
  bookingDetails: BookingDetails;
  onSuccess: (result: CreateBookingResult) => void;
  onBack: () => void;
}

function formatDateTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(new Date(isoString));
}

export function PaymentStep({
  bookingDetails,
  onSuccess,
  onBack,
}: PaymentStepProps) {
  const [error, setError] = useState<string | null>(null);

  const reserve = trpc.appointments.reserve.useMutation({
    onSuccess(data) {
      onSuccess(data);
    },
    onError(err) {
      if (err.message === "SLOT_UNAVAILABLE") {
        setError(
          "This time slot is no longer available. Please go back and choose another time."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    },
  });

  function handleConfirm() {
    setError(null);
    reserve.mutate({
      serviceId: bookingDetails.service.id,
      staffId: bookingDetails.staff.id,
      staffTier: bookingDetails.staff.tier as "junior" | "senior" | "master",
      startAt: bookingDetails.slot.startAt,
    });
  }

  const { service, staff, slot, priceUsd, durationMinutes } = bookingDetails;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Confirm &amp; Pay
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Review your booking details before confirming.
        </p>
      </div>

      {/* Booking summary card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-white">
          Booking Summary
        </h3>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Service</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {service.name}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Specialist</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {staff.firstName} {staff.lastName}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Date &amp; Time</dt>
            <dd className="text-right font-medium text-neutral-900 dark:text-white">
              {formatDateTime(slot.startAt)}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-neutral-500">Duration</dt>
            <dd className="font-medium text-neutral-900 dark:text-white">
              {durationMinutes} min
            </dd>
          </div>

          <div className="border-t border-neutral-100 pt-3 dark:border-neutral-700">
            <div className="flex justify-between text-base font-bold">
              <dt className="text-neutral-900 dark:text-white">Total</dt>
              <dd className="text-neutral-900 dark:text-white">
                {formatPrice(priceUsd)}
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Stripe Element placeholder */}
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center dark:border-neutral-600 dark:bg-neutral-800">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          Payment powered by Stripe
        </p>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Test card: 4242 4242 4242 4242 · Any future date · Any CVC
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={reserve.isPending}
          className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200 disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={reserve.isPending}
          className="ml-auto rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {reserve.isPending ? "Confirming…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
