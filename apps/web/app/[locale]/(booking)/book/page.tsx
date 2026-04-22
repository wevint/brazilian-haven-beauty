"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ServiceStep } from "@/components/booking/service-step";
import { StaffStep } from "@/components/booking/staff-step";
import { DatetimeStep } from "@/components/booking/datetime-step";
import { PaymentStep } from "@/components/booking/payment-step";
import { trpc } from "@/lib/trpc/client";
import type { ServiceWithPricing } from "@/components/public/service-card";
import type { StaffSelection, TimeSlot, BookingDetails } from "@/types/booking";
import type { CreateBookingResult } from "@/lib/booking/create-booking";

type Step = "service" | "staff" | "datetime" | "payment";

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "service", label: "Service" },
  { key: "staff", label: "Specialist" },
  { key: "datetime", label: "Date & Time" },
  { key: "payment", label: "Payment" },
];

const STEP_INDEX: Record<Step, number> = {
  service: 0,
  staff: 1,
  datetime: 2,
  payment: 3,
};

export default function BookPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] =
    useState<ServiceWithPricing | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffSelection | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Fetch services list for the ServiceStep
  const { data: services = [], isLoading: servicesLoading } =
    trpc.services.list.useQuery({ locale: locale as "en" | "pt" });

  function handleServiceSelect(service: ServiceWithPricing) {
    setSelectedService(service);
    setStep("staff");
  }

  function handleStaffSelect(staff: StaffSelection) {
    setSelectedStaff(staff);
    setStep("datetime");
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep("payment");
  }

  function handlePaymentSuccess(result: CreateBookingResult) {
    router.push(`/${locale}/book/confirmation/${result.confirmationCode}`);
  }

  // Build BookingDetails once all selections are made
  const bookingDetails: BookingDetails | null =
    selectedService && selectedStaff && selectedSlot
      ? {
          service: {
            id: selectedService.id,
            name: selectedService.name,
            slug: selectedService.seoSlug,
          },
          staff: selectedStaff,
          slot: selectedSlot,
          // Resolve price by staff tier
          priceUsd:
            selectedService.pricing.find(
              (p) => p.staffTier === selectedStaff.tier
            )?.priceUsd ??
            selectedService.pricing[0]?.priceUsd ??
            0,
          durationMinutes:
            selectedService.pricing.find(
              (p) => p.staffTier === selectedStaff.tier
            )?.durationMinutes ??
            selectedService.pricing[0]?.durationMinutes ??
            0,
        }
      : null;

  const currentStepIndex = STEP_INDEX[step];

  return (
    <div
      className="mx-auto px-4 py-10 sm:px-6"
      style={{ maxWidth: "720px" }}
    >
      {/* Step progress indicator */}
      <nav className="mb-8" aria-label="Booking progress">
        <ol className="flex items-center gap-0">
          {STEP_LABELS.map(({ key, label }, i) => {
            const isDone = i < currentStepIndex;
            const isActive = i === currentStepIndex;
            return (
              <li key={key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isDone
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : isActive
                        ? "border-2 border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                        : "border-2 border-neutral-200 text-neutral-400 dark:border-neutral-600"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span
                    className={`mt-1 text-xs ${
                      isActive
                        ? "font-semibold text-neutral-900 dark:text-white"
                        : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 self-start mt-4 ${
                      i < currentStepIndex
                        ? "bg-neutral-900 dark:bg-white"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        {step === "service" && (
          <>
            {servicesLoading ? (
              <div className="py-8 text-center text-neutral-500">
                Loading services…
              </div>
            ) : (
              <ServiceStep
                services={services}
                selectedServiceId={selectedService?.id}
                locale={locale}
                onSelect={handleServiceSelect}
              />
            )}
          </>
        )}

        {step === "staff" && selectedService && (
          <StaffStep
            serviceId={selectedService.id}
            onSelect={handleStaffSelect}
            onBack={() => setStep("service")}
          />
        )}

        {step === "datetime" && selectedService && selectedStaff && (
          <DatetimeStep
            serviceId={selectedService.id}
            staffId={selectedStaff.id}
            staffTier={selectedStaff.tier}
            onSelect={handleSlotSelect}
            onBack={() => setStep("staff")}
          />
        )}

        {step === "payment" && bookingDetails && (
          <PaymentStep
            bookingDetails={bookingDetails}
            onSuccess={handlePaymentSuccess}
            onBack={() => setStep("datetime")}
          />
        )}
      </div>
    </div>
  );
}
