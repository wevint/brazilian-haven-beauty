import { redirect } from "next/navigation";
import { auth } from "@/auth";

interface AccountMembershipsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountMembershipsPage({
  params,
}: AccountMembershipsPageProps) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/sign-in`);

  const { db } = await import("@bhb/db");
  const memberships = await db.membership.findMany({
    where: {
      clientId: session.user!.id,
      status: { in: ["active", "paused"] },
    },
    include: { plan: { include: { pricing: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        My Memberships
      </h1>

      {memberships.length === 0 ? (
        <p className="text-neutral-500">
          You have no active memberships.{" "}
          <a
            href={`/${locale}/memberships`}
            className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
          >
            Browse plans
          </a>
        </p>
      ) : (
        <ul className="space-y-4">
          {memberships.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <p className="font-semibold text-neutral-900 dark:text-white">
                {(m.plan.nameTranslations as { en: string; pt: string })[
                  locale as "en" | "pt"
                ] ?? m.plan.name}
              </p>
              <p className="membership-status text-sm text-gray-600 dark:text-gray-400">
                Status: {m.status}
              </p>
              <p className="text-sm text-neutral-500">
                Credits remaining: {m.creditBalance}
              </p>
              <p className="text-sm text-neutral-500">
                Next renewal: {m.nextRenewalAt.toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
