import type { Metadata } from "next";
import { MembershipGrid } from "@/components/public/membership-grid";
import { trpcServer } from "@/lib/trpc/server";

export const metadata: Metadata = {
  title: "Membership Plans | Brazilian Haven Beauty",
  description:
    "Join a Brazilian Haven Beauty membership and enjoy recurring credits with flexible staff-tier pricing.",
};

interface MembershipsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MembershipsPage({
  params,
}: MembershipsPageProps) {
  const { locale } = await params;
  const caller = await trpcServer();
  const plans = await caller.memberships.plans.list({
    locale: locale as "en" | "pt",
  });

  return (
    <div
      className="mx-auto px-6 py-12"
      style={{ maxWidth: "var(--layout-container-max)" }}
    >
      <div className="mb-10">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
          Membership Plans
        </h1>
        <p className="mt-2 text-neutral-500">
          {locale === "pt"
            ? "Escolha o plano de assinatura ideal para você."
            : "Choose the membership plan that works best for you."}
        </p>
      </div>

      <MembershipGrid plans={plans} locale={locale} />
    </div>
  );
}
