"use client";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
}

interface DayCalendarProps {
  appointments: CalendarEvent[];
  onEventDrop?: (info: EventDropArg) => void;
}

export function DayCalendar({ appointments, onEventDrop }: DayCalendarProps) {
  return (
    <div className="rounded-lg border p-2">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        events={appointments}
        editable={true}
        droppable={true}
        eventDrop={onEventDrop}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek",
        }}
        height="auto"
      />
    </div>
  );
}
