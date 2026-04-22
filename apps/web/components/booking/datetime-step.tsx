"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import type { TimeSlot } from "@/types/booking";

interface DatetimeStepProps {
  serviceId: string;
  staffId: string;
  staffTier: string;
  onSelect: (slot: TimeSlot) => void;
  onBack: () => void;
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

function formatShortDay(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York",
  }).format(date);
}

function formatDayNum(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

function toDateString(date: Date): string {
  // Format as YYYY-MM-DD in America/New_York
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/New_York",
  });
  return formatter.format(date);
}

function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(new Date(isoString));
}

export function DatetimeStep({
  serviceId,
  staffId,
  staffTier,
  onSelect,
  onBack,
}: DatetimeStepProps) {
  // Build the next 14 days starting from today
  const today = new Date();
  const days: Date[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const dateStr = toDateString(selectedDate);

  const { data, isLoading, isError } = trpc.availability.getSlots.useQuery(
    {
      serviceId,
      staffId,
      date: dateStr,
      staffTier: staffTier as "junior" | "senior" | "master",
    },
    { enabled: !!selectedDate }
  );

  const slots: TimeSlot[] = data?.slots ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Choose Date &amp; Time
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pick a date and then select an available time slot.
        </p>
      </div>

      {/* Date picker row */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const isSelected = toDateString(day) === dateStr;
          return (
            <button
              key={toDateString(day)}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`flex min-w-[56px] flex-col items-center rounded-xl border px-3 py-2 text-sm transition ${
                isSelected
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide">
                {formatShortDay(day)}
              </span>
              <span className="text-base font-bold">{formatDayNum(day)}</span>
            </button>
          );
        })}
      </div>

      {/* Selected date label */}
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {formatDayLabel(selectedDate)}
      </p>

      {/* Time slots */}
      {isLoading && (
        <div className="py-6 text-center text-neutral-500">
          Loading available times…
        </div>
      )}

      {isError && (
        <div className="py-6 text-center text-red-500">
          Failed to load slots. Please try again.
        </div>
      )}

      {!isLoading && !isError && slots.length === 0 && (
        <div className="py-6 text-center text-neutral-500">
          No available times on this date. Please try another day.
        </div>
      )}

      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {slots.map((slot) => (
            <button
              key={slot.startAt}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelect(slot)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                slot.available
                  ? "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-white"
                  : "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-600"
              }`}
            >
              {formatTime(slot.startAt)}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-2 text-sm text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Back
      </button>
    </div>
  );
}
