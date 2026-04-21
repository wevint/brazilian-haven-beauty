import { Inngest } from "inngest";

/**
 * Inngest client instance.
 *
 * The `id` uniquely identifies this application in the Inngest dashboard.
 * All functions registered here share this app ID.
 */
export const inngest = new Inngest({
  id: "brazilian-haven-beauty",
  name: "Brazilian Haven Beauty",
});

/**
 * Typed event map for this application.
 * Add new events here as they are implemented in user story phases.
 *
 * Convention: "domain/event.past-tense"
 */
export type Events = {
  // US1 booking events (T098)
  "booking/appointment.created": {
    data: {
      appointmentId: string;
      clientId: string;
      startAt: string;
      locale: "en" | "pt";
    };
  };
  "booking/appointment.cancelled": {
    data: {
      appointmentId: string;
      clientId: string;
    };
  };
  // US4 membership events (T098)
  "membership/subscription.renewed": {
    data: {
      membershipId: string;
      clientId: string;
    };
  };
  "membership/credit.low": {
    data: {
      membershipId: string;
      clientId: string;
      creditsRemaining: number;
    };
  };
  // US7 automation events (T098)
  "notification/reminder.24h": {
    data: {
      appointmentId: string;
      clientId: string;
    };
  };
  "notification/reminder.2h": {
    data: {
      appointmentId: string;
      clientId: string;
    };
  };
};
