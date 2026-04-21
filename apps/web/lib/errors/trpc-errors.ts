import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { AppError } from "./app-error";

/**
 * Maps AppError codes to tRPC error codes.
 */
const APP_TO_TRPC_CODE: Record<string, TRPC_ERROR_CODE_KEY> = {
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "BAD_REQUEST",
  SLOT_UNAVAILABLE: "CONFLICT",
  COUPON_INVALID: "UNPROCESSABLE_CONTENT",
  PAYMENT_FAILED: "UNPROCESSABLE_CONTENT",
};

/**
 * Convert an AppError (or any unknown thrown value) into a TRPCError.
 *
 * Use in tRPC procedures that call domain services which throw AppErrors.
 *
 * @example
 * try {
 *   await reserveSlot(input);
 * } catch (err) {
 *   throw toTRPCError(err);
 * }
 */
export function toTRPCError(error: unknown): TRPCError {
  if (error instanceof TRPCError) return error;

  if (error instanceof AppError) {
    const code: TRPC_ERROR_CODE_KEY =
      APP_TO_TRPC_CODE[error.code] ?? "INTERNAL_SERVER_ERROR";
    return new TRPCError({
      code,
      message: error.message,
      cause: error,
    });
  }

  // Unknown error — wrap as internal server error
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message,
    cause: error instanceof Error ? error : undefined,
  });
}

/**
 * tRPC error formatter helper.
 * Attach to `initTRPC` `errorFormatter` to expose Zod validation details.
 *
 * Already used in packages/trpc/src/trpc.ts — this is exported for testing.
 */
export function formatTRPCError(
  shape: Record<string, unknown>,
  zodError: unknown
): Record<string, unknown> {
  return {
    ...shape,
    data: {
      ...(shape.data as object),
      zodError: zodError ?? null,
    },
  };
}
