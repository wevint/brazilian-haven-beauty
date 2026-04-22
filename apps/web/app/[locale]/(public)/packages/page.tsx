import { trpcServer } from "@/lib/trpc/server";
import { PackageCard } from "@/components/public/package-card";

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const caller = await trpcServer();
  const packages = await caller.packages.list();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Service Packages</h1>
      {packages.length === 0 ? (
        <p>No packages available at this time.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
