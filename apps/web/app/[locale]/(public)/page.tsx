import type { Metadata } from "next";
import { HeroSection } from "@/components/public/hero-section";
import { CtaBanner } from "@/components/public/cta-banner";
import type { Locale } from "@/lib/i18n/config";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "pt"
        ? "Brazilian Haven Beauty — Depilação Premium"
        : "Brazilian Haven Beauty — Premium Waxing",
    description:
      locale === "pt"
        ? "Depilação brasileira premium e serviços de beleza. Agende online hoje."
        : "Premium Brazilian waxing and beauty services. Book online today.",
  };
}

/**
 * Home page placeholder.
 * Full visual implementation follows in US8 (T106).
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const isPt = locale === "pt";

  return (
    <>
      <HeroSection
        locale={locale as Locale}
        headline={isPt ? "Beleza com Confiança" : "Beauty with Confidence"}
        subline={
          isPt
            ? "Depilação brasileira premium e cuidados de beleza num ambiente acolhedor e profissional."
            : "Premium Brazilian waxing and beauty care in a welcoming, professional environment."
        }
        ctaLabel={isPt ? "Agendar Agora" : "Book Now"}
        ctaHref={`/${locale}/book`}
        secondaryCtaLabel={isPt ? "Ver Serviços" : "View Services"}
        secondaryCtaHref={`/${locale}/services`}
      />

      <div
        className="mx-auto py-16 px-6"
        style={{ maxWidth: "var(--layout-container-max)" }}
      >
        <p
          className="text-center"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-body-lg)",
          }}
        >
          {isPt
            ? "Conteúdo completo da página inicial em breve (US8)."
            : "Full home page content coming soon (US8)."}
        </p>
      </div>

      <div className="px-6 pb-16">
        <CtaBanner
          headline={isPt ? "Pronto para se sentir incrível?" : "Ready to feel amazing?"}
          subline={
            isPt
              ? "Agende sua consulta hoje e experimente a diferença."
              : "Book your appointment today and experience the difference."
          }
          ctaLabel={isPt ? "Agendar Agora" : "Book Now"}
          ctaHref={`/${locale}/book`}
          variant="brand"
        />
      </div>
    </>
  );
}
