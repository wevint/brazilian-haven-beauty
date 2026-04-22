"use client";

interface AppointmentSummaryItem {
  id: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  startAt: Date | string;
  status: string;
}

interface DailySummaryProps {
  appointments: AppointmentSummaryItem[];
}

function formatTime(dt: Date | string): string {
  const d = dt instanceof Date ? dt : new Date(dt);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  checked_in: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  no_show: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export function DailySummary({ appointments }: DailySummaryProps) {
  if (appointments.length === 0) {
    return (
      <div className="mt-4 rounded-lg border p-6 text-center text-gray-500">
        No appointments today.
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Staff</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">{formatTime(appt.startAt)}</td>
              <td className="px-4 py-3">{appt.clientName}</td>
              <td className="px-4 py-3">{appt.serviceName}</td>
              <td className="px-4 py-3">{appt.staffName}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[appt.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {appt.status.replace("_", " ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
