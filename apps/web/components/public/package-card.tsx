"use client";

interface PackageCardProps {
  pkg: {
    id: string;
    name: string;
    sessionCount: number;
    priceUsd: number | string;
    validityDays: number;
    staffTierRestriction?: string | null;
  };
  locale: string;
}

export function PackageCard({ pkg, locale }: PackageCardProps) {
  return (
    <div data-testid="package-card" className="rounded-lg border p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{pkg.name}</h3>
      <p className="mt-2 text-2xl font-bold">${Number(pkg.priceUsd).toFixed(2)}</p>
      <p className="text-sm text-gray-600">
        {pkg.sessionCount} sessions · valid {pkg.validityDays} days
      </p>
      {pkg.staffTierRestriction && (
        <p className="text-xs text-gray-500 mt-1">
          {pkg.staffTierRestriction} tier only
        </p>
      )}
      <a
        href={`/${locale}/account/packages`}
        className="mt-4 block rounded bg-black px-4 py-2 text-center text-white hover:bg-gray-800"
      >
        Buy Package
      </a>
    </div>
  );
}
