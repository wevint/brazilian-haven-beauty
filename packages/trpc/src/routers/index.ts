/**
 * Root tRPC app router – registers all sub-routers.
 */

import { router } from "../trpc";
import { servicesRouter } from "./services";
import { staffRouter } from "./staff";
import { availabilityRouter } from "./availability";
import { appointmentsRouter } from "./appointments";
import { adminRouter } from "./admin";
import { paymentsRouter } from "./payments";
import { membershipsRouter } from "./memberships";

export const appRouter = router({
  services: servicesRouter,
  staff: staffRouter,
  availability: availabilityRouter,
  appointments: appointmentsRouter,
  admin: adminRouter,
  payments: paymentsRouter,
  memberships: membershipsRouter,
});

export type AppRouter = typeof appRouter;
