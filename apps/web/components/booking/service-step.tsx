"use client";

import { ServiceCard, type ServiceWithPricing } from "@/components/public/service-card";

interface ServiceStepProps {
  services: ServiceWithPricing[];
  selectedServiceId?: string;
  locale: string;
  onSelect: (service: ServiceWithPricing) => void;
}

export function ServiceStep({
  services,
  selectedServiceId,
  locale,
  onSelect,
}: ServiceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Choose a Service
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Select the service you&apos;d like to book.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={`text-left ring-2 transition ${
              selectedServiceId === service.id
                ? "ring-neutral-900 dark:ring-white"
                : "ring-transparent hover:ring-neutral-300"
            } rounded-2xl`}
          >
            <ServiceCard service={service} locale={locale} />
          </button>
        ))}
      </div>
    </div>
  );
}
