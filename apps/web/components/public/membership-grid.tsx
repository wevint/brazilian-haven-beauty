import {
  MembershipCard,
  type MembershipPlanCardData,
} from "./membership-card";

interface MembershipGridProps {
  plans: MembershipPlanCardData[];
  locale: string;
}

export function MembershipGrid({ plans, locale }: MembershipGridProps) {
  if (plans.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        No membership plans are available at this time.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <MembershipCard key={plan.id} plan={plan} locale={locale} />
      ))}
    </div>
  );
}
