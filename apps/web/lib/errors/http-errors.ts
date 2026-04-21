import { AppError } from "./app-error";

/**
 * HTTP 404 — Resource not found.
 *
 * @example throw new NotFoundError("Appointment", appointmentId);
 */
export class NotFoundError extends AppError {
  constructor(
    resource = "Resource",
    id?: string,
    meta?: Record<string, unknown>
  ) {
    const message = id
      ? `${resource} with id "${id}" was not found.`
      : `${resource} was not found.`;
    super(message, "NOT_FOUND", 404, meta);
  }
}

/**
 * HTTP 401 — Authentication required.
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required.", meta?: Record<string, unknown>) {
    super(message, "UNAUTHORIZED", 401, meta);
  }
}

/**
 * HTTP 403 — Insufficient permissions.
 */
export class ForbiddenError extends AppError {
  constructor(
    message = "You do not have permission to perform this action.",
    meta?: Record<string, unknown>
  ) {
    super(message, "FORBIDDEN", 403, meta);
  }
}

/**
 * HTTP 422 — Validation failed.
 */
export class ValidationError extends AppError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 422, meta);
  }
}

/**
 * HTTP 409 — Booking slot is no longer available.
 */
export class SlotUnavailableError extends AppError {
  constructor(
    message = "This time slot is no longer available.",
    meta?: Record<string, unknown>
  ) {
    super(message, "SLOT_UNAVAILABLE", 409, meta);
  }
}

/**
 * HTTP 422 — Coupon failed validation.
 */
export class CouponInvalidError extends AppError {
  constructor(reason: string, meta?: Record<string, unknown>) {
    super(`Coupon is invalid: ${reason}`, "COUPON_INVALID", 422, meta);
  }
}

/**
 * HTTP 422 — Payment gateway rejected the payment.
 */
export class PaymentFailedError extends AppError {
  constructor(
    message = "Payment could not be processed.",
    meta?: Record<string, unknown>
  ) {
    super(message, "PAYMENT_FAILED", 422, meta);
  }
}
