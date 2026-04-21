/**
 * tRPC base infrastructure
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

export interface TRPCContext {
  session: { user?: { id: string; email: string; role?: string } } | null;
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const role = ctx.session.user.role;
  if (!role || !["owner", "manager", "staff"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
