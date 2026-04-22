import type { Metadata } from "next";
import { ServiceCategoryGrid } from "@/components/public/service-category-grid";
import { trpcServer } from "@/lib/trpc/server";
import type { Locale } from "@/lib/i18n/config";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Services | Brazilian Haven Beauty",
  description:
    "Explore our full menu of premium Brazilian waxing and beauty services. Book online today.",
};

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const caller = await trpcServer();

  const services = await caller.services.list({
    locale: (locale as Locale) === "pt" ? "pt" : "en",
  });

  return (
    <div
      className="mx-auto px-6 py-12"
      style={{ maxWidth: "var(--layout-container-max)" }}
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {locale === "pt" ? "Nossos Serviços" : "Our Services"}
        </h1>
        <p className="mt-2 text-neutral-500">
          {locale === "pt"
            ? "Escolha o serviço que deseja agendar."
            : "Choose a service to get started."}
        </p>
      </div>

      <ServiceCategoryGrid services={services} locale={locale} />
    </div>
  );
}
