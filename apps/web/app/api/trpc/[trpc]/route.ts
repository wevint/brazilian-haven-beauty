import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@bhb/trpc";
import { auth } from "@/auth";
import { headers } from "next/headers";
import type { TRPCContext } from "@bhb/trpc";
import type { NextRequest } from "next/server";

/**
 * tRPC HTTP handler for Next.js App Router.
 * Handles all tRPC requests at /api/trpc/[procedure].
 */
async function createContext(req: NextRequest): Promise<TRPCContext> {
  const session = await auth();
  return {
    session,
    headers: req.headers,
  };
}

function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `tRPC error on '${path ?? "unknown"}':`,
              error
            );
          }
        : undefined,
  });
}

export { handler as GET, handler as POST };
