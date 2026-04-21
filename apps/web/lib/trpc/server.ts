import "server-only";
import { createCallerFactory, appRouter, type TRPCContext } from "@bhb/trpc";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * Creates a tRPC context for server-side use (React Server Components,
 * Server Actions, route handlers).
 *
 * Wrapped in React `cache()` so the session and headers are only read once
 * per request, even if `createContext` is called multiple times.
 */
export const createContext = cache(async (): Promise<TRPCContext> => {
  const session = await auth();
  const requestHeaders = await headers();

  return {
    session,
    headers: requestHeaders,
  };
});

/**
 * Server-side tRPC caller.
 * Use this in RSCs and Server Actions to call tRPC procedures directly
 * without HTTP round-trips.
 *
 * @example
 * const caller = await createCaller();
 * const services = await caller.services.list({ locale: "en" });
 */
export const createCaller = createCallerFactory(appRouter);

/**
 * Convenience helper: creates a caller with the current request context.
 */
export async function trpcServer() {
  const ctx = await createContext();
  return createCaller(ctx);
}
