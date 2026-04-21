import { createTRPCRouter } from "../trpc";

/**
 * Application root router.
 *
 * Sub-routers are added here as user stories are implemented:
 * - services  (US1, T031)
 * - staff     (US1, T031)
 * - appointments (US1, T031)
 * - memberships  (US4, T070)
 * - packages     (US5, T080)
 * - coupons      (US6, T090)
 * - clients      (US2, T043)
 * - payments     (US3, T059)
 * - waitlist     (US7, T097)
 * - admin        (US2, T043)
 */
export const appRouter = createTRPCRouter({
  // Routers will be added here per user story.
});

export type AppRouter = typeof appRouter;
