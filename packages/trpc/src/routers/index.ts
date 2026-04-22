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
import { packagesRouter } from "./packages";

export const appRouter = router({
  services: servicesRouter,
  staff: staffRouter,
  availability: availabilityRouter,
  appointments: appointmentsRouter,
  admin: adminRouter,
  payments: paymentsRouter,
  packages: packagesRouter,
});

export type AppRouter = typeof appRouter;
