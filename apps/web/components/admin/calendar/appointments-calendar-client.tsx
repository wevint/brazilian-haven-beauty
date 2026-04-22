"use client";

import { useRouter } from "next/navigation";
import { DayCalendar } from "./day-calendar";
import type { EventDropArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
}

interface AppointmentsCalendarClientProps {
  events: CalendarEvent[];
}

export function AppointmentsCalendarClient({ events }: AppointmentsCalendarClientProps) {
  const router = useRouter();

  const handleEventDrop = async (info: EventDropArg) => {
    const appointmentId = info.event.id;
    const newStartAt = info.event.start;
    if (!newStartAt) return;

    try {
      const res = await fetch("/api/trpc/appointments.reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, newStartAt: newStartAt.toISOString() }),
      });
      if (!res.ok) {
        info.revert();
      } else {
        router.refresh();
      }
    } catch {
      info.revert();
    }
  };

  return <DayCalendar appointments={events} onEventDrop={handleEventDrop} />;
}
