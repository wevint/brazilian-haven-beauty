"use client";

import { trpc } from "@/lib/trpc/client";
import { formatPrice } from "@/lib/booking/pricing";
import type { StaffSelection } from "@/types/booking";

interface StaffStepProps {
  serviceId: string;
  onSelect: (staff: StaffSelection) => void;
  onBack: () => void;
}

const TIER_LABELS: Record<string, string> = {
  junior: "Junior Specialist",
  senior: "Senior Specialist",
  master: "Master Specialist",
};

const TIER_BADGE_CLASSES: Record<string, string> = {
  junior:
    "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  senior:
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  master:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

function InitialsAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const initials =
    (firstName[0] ?? "").toUpperCase() + (lastName[0] ?? "").toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-xl font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
      {initials}
    </div>
  );
}

function StaffCard({
  staffId,
  serviceId,
  firstName,
  lastName,
  tier,
  photoUrl,
  selected,
  onSelect,
}: {
  staffId: string;
  serviceId: string;
  firstName: string;
  lastName: string;
  tier: string;
  photoUrl?: string | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const { data: staffData } = trpc.staff.getById.useQuery({
    staffId,
    serviceId,
  });

  const pricing = staffData?.pricing?.find((p) => p.staffTier === tier);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 bg-white p-5 text-center transition dark:bg-neutral-900 ${
        selected
          ? "border-neutral-900 dark:border-white"
          : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
      } shadow-sm`}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <InitialsAvatar firstName={firstName} lastName={lastName} />
      )}

      <div className="space-y-1">
        <p className="font-semibold text-neutral-900 dark:text-white">
          {firstName} {lastName}
        </p>

        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            TIER_BADGE_CLASSES[tier] ?? "bg-neutral-100 text-neutral-600"
          }`}
        >
          {TIER_LABELS[tier] ?? tier}
        </span>

        {pricing && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatPrice(pricing.priceUsd)}
            {" · "}
            {pricing.durationMinutes} min
          </p>
        )}
      </div>
    </button>
  );
}

export function StaffStep({ serviceId, onSelect, onBack }: StaffStepProps) {
  const { data: staffList, isLoading, isError } = trpc.staff.list.useQuery({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Choose Your Specialist
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Select the specialist you&apos;d like to book with.
        </p>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-neutral-500">
          Loading specialists…
        </div>
      )}

      {isError && (
        <div className="py-8 text-center text-red-500">
          Failed to load specialists. Please try again.
        </div>
      )}

      {staffList && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <StaffCard
              key={staff.id}
              staffId={staff.id}
              serviceId={serviceId}
              firstName={staff.firstName}
              lastName={staff.lastName}
              tier={staff.tier}
              photoUrl={staff.photoUrl}
              selected={false}
              onSelect={() =>
                onSelect({
                  id: staff.id,
                  firstName: staff.firstName,
                  lastName: staff.lastName,
                  tier: staff.tier,
                  photoUrl: staff.photoUrl,
                })
              }
            />
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
