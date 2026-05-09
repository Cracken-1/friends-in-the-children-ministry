import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type RateLimitKind = "public" | "newsletter" | "adminLogin" | "payment" | "telegram";

const limits: Record<RateLimitKind, { requests: number; window: `${number} ${"s" | "m" | "h"}` }> = {
  public: { requests: 60, window: "1 m" },
  newsletter: { requests: 3, window: "1 h" },
  adminLogin: { requests: 10, window: "15 m" },
  payment: { requests: 5, window: "15 m" },
  telegram: { requests: 100, window: "1 m" }
};

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const rateLimiters = new Map<RateLimitKind, Ratelimit>();

function getLimiter(kind: RateLimitKind) {
  if (!redis) {
    return undefined;
  }

  const cached = rateLimiters.get(kind);
  if (cached) {
    return cached;
  }

  const limit = limits[kind];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit.requests, limit.window),
    analytics: true,
    prefix: `ministry:${kind}`
  });
  rateLimiters.set(kind, limiter);
  return limiter;
}

export async function assertRateLimit(kind: RateLimitKind) {
  const limiter = getLimiter(kind);
  if (!limiter) {
    return { allowed: true, remaining: limits[kind].requests };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "127.0.0.1";
  const result = await limiter.limit(ip);

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset
  };
}
