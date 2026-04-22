import { ServiceCard, type ServiceWithPricing } from "./service-card";

interface ServiceCategoryGridProps {
  services: ServiceWithPricing[];
  locale: string;
}

export function ServiceCategoryGrid({ services, locale }: ServiceCategoryGridProps) {
  // Group services by category
  const grouped = services.reduce<Record<string, ServiceWithPricing[]>>((acc, service) => {
    const cat = service.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500">
        No services available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`category-${category}`}>
          <h2
            id={`category-${category}`}
            className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white"
          >
            {category}
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grouped[category].map((service) => (
              <ServiceCard key={service.id} service={service} locale={locale} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
