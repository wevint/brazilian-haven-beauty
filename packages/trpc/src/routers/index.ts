/**
 * Root tRPC app router – registers all sub-routers.
 */

import { router } from "../trpc";
import { servicesRouter } from "./services";
import { staffRouter } from "./staff";
import { availabilityRouter } from "./availability";
import { appointmentsRouter } from "./appointments";

export const appRouter = router({
  services: servicesRouter,
  staff: staffRouter,
  availability: availabilityRouter,
  appointments: appointmentsRouter,
});

export type AppRouter = typeof appRouter;
