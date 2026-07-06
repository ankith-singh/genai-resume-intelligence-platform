/**
 * logger.ts
 * Lightweight structured JSON logger. Zero external dependencies.
 *
 * Emits: { level, msg, timestamp, requestId?, ...context }
 * In development: pretty-prints. In production: JSON (parseable by Datadog/CloudWatch).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function emit(level: LogLevel, msg: string, context: Record<string, unknown> = {}) {
  if (LEVELS[level] < LEVELS[MIN_LEVEL]) return;

  const entry = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    ...context,
  };

  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit("debug", msg, ctx),
  info:  (msg: string, ctx?: Record<string, unknown>) => emit("info",  msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => emit("warn",  msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit("error", msg, ctx),

  /** Returns a child logger that always includes the given requestId */
  child: (requestId: string) => ({
    debug: (msg: string, ctx?: Record<string, unknown>) => emit("debug", msg, { requestId, ...ctx }),
    info:  (msg: string, ctx?: Record<string, unknown>) => emit("info",  msg, { requestId, ...ctx }),
    warn:  (msg: string, ctx?: Record<string, unknown>) => emit("warn",  msg, { requestId, ...ctx }),
    error: (msg: string, ctx?: Record<string, unknown>) => emit("error", msg, { requestId, ...ctx }),
  }),
};
