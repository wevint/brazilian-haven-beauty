"use client";

interface KpiCardsProps {
  appointmentsToday: number;
  revenueToday: number;
  newClientsThisWeek: number;
  upcomingAppointments: number;
}

function formatRevenue(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function KpiCards({
  appointmentsToday,
  revenueToday,
  newClientsThisWeek,
  upcomingAppointments,
}: KpiCardsProps) {
  const cards = [
    { label: "Today's Appointments", value: appointmentsToday.toString() },
    { label: "Today's Revenue", value: formatRevenue(revenueToday) },
    { label: "New Clients This Week", value: newClientsThisWeek.toString() },
    { label: "Upcoming Appointments", value: upcomingAppointments.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="kpi-card rounded-lg border p-4 shadow-sm"
          style={{ backgroundColor: "var(--color-surface-card, #fff)" }}
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
