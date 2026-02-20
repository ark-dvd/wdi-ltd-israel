/**
 * Upstash Redis rate limiting — DOC-000 §6.8
 * 4 tiers: admin 60/min, auth 10/min, public leads 5/min, upload 20/min.
 * No in-memory state — serverless safe per DOC-000 §6.8.
 *
 * If UPSTASH_REDIS_REST_URL is not set, rate limiting is skipped
 * and all requests are allowed through (development / fallback mode).
 */
import type { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
}

interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

const UPSTASH_CONFIGURED = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

if (!UPSTASH_CONFIGURED) {
  console.warn(
    '[rate-limit] UPSTASH_REDIS_REST_URL not set — rate limiting disabled. All requests will be allowed.',
  );
}

/** No-op limiter that always allows requests */
const noopLimiter: RateLimiter = {
  limit: async () => ({ success: true }),
};

function createLimiter(
  windowSize: number,
  windowDuration: `${number} s` | `${number} m` | `${number} h` | `${number} d`,
  prefix: string,
): RateLimiter {
  if (!UPSTASH_CONFIGURED) return noopLimiter;

  const { Ratelimit } = require('@upstash/ratelimit') as typeof import('@upstash/ratelimit');
  const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');

  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(windowSize, windowDuration),
    prefix,
  });
}

/** Admin operations: 60 requests per 60 seconds */
export const adminRateLimit = createLimiter(60, '60 s', 'rl:admin');

/** Authentication: 10 requests per 60 seconds */
export const authRateLimit = createLimiter(10, '60 s', 'rl:auth');

/** Public lead intake: 5 requests per 60 seconds */
export const publicLeadRateLimit = createLimiter(5, '60 s', 'rl:leads');

/** Upload operations: 20 requests per 60 seconds */
export const uploadRateLimit = createLimiter(20, '60 s', 'rl:upload');

/** Extract identifier for rate limiting (IP or email) */
export function getIdentifier(request: NextRequest | Request, email?: string): string {
  if (email) return email;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  return ip;
}
