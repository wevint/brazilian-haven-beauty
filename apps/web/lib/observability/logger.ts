/**
 * Structured logger for Brazilian Haven Beauty.
 *
 * In development: pretty-prints to console with level prefix.
 * In production: emits structured JSON lines for log aggregation
 *   (e.g., Vercel Log Drains, Datadog, etc.)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

function formatDev(level: LogLevel, message: string, meta?: object): string {
  const prefix =
    level === "error"
      ? "❌"
      : level === "warn"
        ? "⚠️"
        : level === "info"
          ? "ℹ️"
          : "🔍";
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${prefix} [${level.toUpperCase()}] ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: object): void {
  if (isTest) return; // Suppress logs in test runs

  if (isDev) {
    const formatted = formatDev(level, message, meta);
    if (level === "error") {
      console.error(formatted);
    } else if (level === "warn") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
    return;
  }

  // Production: structured JSON
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: "brazilian-haven-beauty",
    ...meta,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Application logger instance.
 *
 * @example
 * logger.info("Booking confirmed", { appointmentId, clientId });
 * logger.error("Payment failed", { paymentIntentId, error: err.message });
 */
export const logger = {
  debug: (message: string, meta?: object) => log("debug", message, meta),
  info: (message: string, meta?: object) => log("info", message, meta),
  warn: (message: string, meta?: object) => log("warn", message, meta),
  error: (message: string, meta?: object) => log("error", message, meta),
};
