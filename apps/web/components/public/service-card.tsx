"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/booking/pricing";

export interface ServicePricingEntry {
  staffTier: "junior" | "senior" | "master";
  priceUsd: number;
  durationMinutes: number;
}

export interface ServiceWithPricing {
  id: string;
  name: string;
  description: string;
  category: string;
  seoSlug: string;
  imageUrl?: string | null;
  allowWaitlist: boolean;
  pricing: ServicePricingEntry[];
}

interface ServiceCardProps {
  service: ServiceWithPricing;
  locale: string;
}

export function ServiceCard({ service, locale }: ServiceCardProps) {
  // Show the lowest available tier price as "from $XX"
  const lowestPrice = service.pricing.reduce(
    (min, p) => (p.priceUsd < min ? p.priceUsd : min),
    service.pricing[0]?.priceUsd ?? 0
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-neutral-300">
            ✨
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-tight text-neutral-900 dark:text-neutral-100">
          {service.name}
        </h3>

        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            from{" "}
            <span className="text-lg font-bold text-neutral-900 dark:text-white">
              {formatPrice(lowestPrice)}
            </span>
          </span>

          <Link
            href={`/${locale}/book?service=${service.seoSlug}`}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
