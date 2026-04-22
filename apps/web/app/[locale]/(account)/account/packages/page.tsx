import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@bhb/db";

export default async function AccountPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/sign-in`);

  const packages = await db.clientPackage.findMany({
    where: { clientId: session.user.id, status: { in: ["active", "exhausted"] } },
    include: { package: true },
    orderBy: { purchasedAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Packages</h1>
      {packages.length === 0 ? (
        <p>
          You have no packages.{" "}
          <a href={`/${locale}/packages`}>Browse packages</a>
        </p>
      ) : (
        <ul className="space-y-4">
          {packages.map((cp) => (
            <li key={cp.id} className="rounded border p-4">
              <p className="font-semibold">{cp.package.name}</p>
              <p className="package-balance text-sm text-gray-600">
                Sessions remaining: {cp.sessionsRemaining}
              </p>
              <p className="text-sm">Expires: {cp.expiresAt.toLocaleDateString()}</p>
              <p className="text-sm capitalize">Status: {cp.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
