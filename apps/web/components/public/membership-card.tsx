"use client";

import Link from "next/link";

export interface PlanPricingEntry {
  staffTier: "junior" | "senior" | "master";
  priceUsd: number;
  stripePriceId: string;
}

export interface MembershipPlanCardData {
  id: string;
  name: string;
  billingCycle: "monthly" | "annual";
  creditsPerCycle: number;
  pricing: PlanPricingEntry[];
}

interface MembershipCardProps {
  plan: MembershipPlanCardData;
  locale: string;
}

const TIER_LABEL: Record<string, string> = {
  junior: "Junior",
  senior: "Senior",
  master: "Master",
};

export function MembershipCard({ plan, locale }: MembershipCardProps) {
  // Show the lowest-tier price as "from $X/mo"
  const lowestPrice =
    plan.pricing.length > 0
      ? Math.min(...plan.pricing.map((p) => p.priceUsd))
      : 0;

  const cycleLabel = plan.billingCycle === "monthly" ? "mo" : "yr";

  return (
    <div
      data-testid="membership-card"
      className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
    >
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
        {plan.name}
      </h3>

      <p className="mt-1 text-sm text-neutral-500">
        {plan.creditsPerCycle} credit{plan.creditsPerCycle !== 1 ? "s" : ""} /{" "}
        {plan.billingCycle === "monthly" ? "month" : "year"}
      </p>

      <div className="mt-4 space-y-1">
        {plan.pricing.map((p) => (
          <div
            key={p.staffTier}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-neutral-600 dark:text-neutral-400">
              {TIER_LABEL[p.staffTier] ?? p.staffTier}
            </span>
            <span className="font-medium text-neutral-900 dark:text-white">
              ${p.priceUsd.toFixed(2)}/{cycleLabel}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
        from{" "}
        <span className="text-base font-bold text-neutral-900 dark:text-white">
          ${lowestPrice.toFixed(2)}/{cycleLabel}
        </span>
      </p>

      <div className="mt-6">
        <Link
          href={`/${locale}/account/memberships`}
          className="block w-full rounded-xl bg-neutral-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Join
        </Link>
      </div>
    </div>
  );
}
