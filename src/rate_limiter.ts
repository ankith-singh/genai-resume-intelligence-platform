/**
 * rate_limiter.ts
 * In-memory sliding window rate limiter. Zero external dependencies.
 *
 * WHY not express-rate-limit: avoids adding a dependency for a core security
 * primitive that interviewers will ask about. Shows you understand the algorithm.
 *
 * Algorithm: Each (IP, route-group) key stores an array of timestamps.
 * On each request, prune entries older than windowMs, then count remaining.
 * If count >= limit, reject. Otherwise, append current timestamp.
 *
 * Memory: O(limit) per active IP. Cleaned up after windowMs of inactivity
 * via periodic GC to prevent unbounded growth.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

interface RateLimitConfig {
  windowMs: number;   // sliding window size in milliseconds
  limit: number;      // max requests per window per IP
  label: string;      // for logging (e.g. "auth", "ai")
}

// Store: key → sorted array of request timestamps
const store = new Map<string, number[]>();

// GC: remove stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  let pruned = 0;
  store.forEach((timestamps, key) => {
    // If all timestamps are older than 10 minutes, remove the key
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 600_000) {
      store.delete(key);
      pruned++;
    }
  });
  if (pruned > 0) logger.debug("rate_limiter_gc", { pruned_keys: pruned });
}, 300_000);

export function createRateLimiter(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim()
      || req.socket.remoteAddress
      || "unknown";

    const key = `${config.label}:${ip}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or initialise timestamps for this key
    let timestamps = store.get(key) || [];

    // Prune timestamps outside the current window
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= config.limit) {
      const retryAfterSec = Math.ceil((timestamps[0] - windowStart) / 1000);
      logger.warn("rate_limit_exceeded", {
        ip,
        label: config.label,
        count: timestamps.length,
        limit: config.limit,
        retryAfterSec,
      });
      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-RateLimit-Limit", String(config.limit));
      res.setHeader("X-RateLimit-Remaining", "0");
      return res.status(429).json({
        error: "Too many requests. Please slow down.",
        retryAfterSeconds: retryAfterSec,
      });
    }

    timestamps.push(now);
    store.set(key, timestamps);

    res.setHeader("X-RateLimit-Limit", String(config.limit));
    res.setHeader("X-RateLimit-Remaining", String(config.limit - timestamps.length));
    next();
  };
}

// ── Pre-configured limiters ────────────────────────────────────────────

/** Auth endpoints: 10 attempts per 15 minutes per IP */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  label: "auth",
});

/** AI endpoints (Gemini calls): 30 requests per minute per IP */
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  label: "ai",
});

/** General API: 120 requests per minute per IP */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 120,
  label: "general",
});
