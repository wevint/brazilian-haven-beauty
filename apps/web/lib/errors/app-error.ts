/**
 * Base application error class.
 *
 * All domain-specific errors extend AppError to provide consistent
 * `code`, `statusCode`, and `message` properties across the codebase.
 */
export class AppError extends Error {
  /** Machine-readable error code (e.g., "NOT_FOUND", "SLOT_UNAVAILABLE"). */
  public readonly code: string;

  /** HTTP-equivalent status code for use in HTTP responses. */
  public readonly statusCode: number;

  /** Optional structured metadata for logging / client display. */
  public readonly meta?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode = 500,
    meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.meta = meta;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.meta ? { meta: this.meta } : {}),
    };
  }
}
