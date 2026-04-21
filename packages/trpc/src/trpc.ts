import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { Session } from "next-auth";

/**
 * tRPC context shape.
 * Created per request in `apps/web/lib/trpc/server.ts`.
 */
export interface TRPCContext {
  session: Session | null;
  headers: Headers;
}

/**
 * Initialize tRPC with our context type and custom error formatting.
 */
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/**
 * Public procedure — no authentication required.
 */
export const baseProcedure = t.procedure;

/**
 * Protected procedure — requires an authenticated session.
 * Throws UNAUTHORIZED if no session is present.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * Admin procedure — requires an authenticated session with an admin role.
 * Throws FORBIDDEN if the user's role is not in the admin set.
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as { role?: string };
  const adminRoles = ["owner", "manager", "staff"];

  if (!user.role || !adminRoles.includes(user.role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

/**
 * Owner procedure — requires role = 'owner'.
 */
export const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  const user = ctx.session.user as { role?: string };

  if (user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});
