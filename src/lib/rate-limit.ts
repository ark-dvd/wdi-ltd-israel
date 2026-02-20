/**
 * Upstash Redis rate limiting — DOC-000 §6.8
 * 4 tiers: admin 60/min, auth 10/min, public leads 5/min, upload 20/min.
 * No in-memory state — serverless safe per DOC-000 §6.8.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
  });
}

/** Admin operations: 60 requests per 60 seconds */
export const adminRateLimit = new Ratelimit({
  redis: createRedis(),
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  prefix: 'rl:admin',
});

/** Authentication: 10 requests per 60 seconds */
export const authRateLimit = new Ratelimit({
  redis: createRedis(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:auth',
});

/** Public lead intake: 5 requests per 60 seconds */
export const publicLeadRateLimit = new Ratelimit({
  redis: createRedis(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'rl:leads',
});

/** Upload operations: 20 requests per 60 seconds */
export const uploadRateLimit = new Ratelimit({
  redis: createRedis(),
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  prefix: 'rl:upload',
});

/** Extract identifier for rate limiting (IP or email) */
export function getIdentifier(request: Request, email?: string): string {
  if (email) return email;
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown';
  return ip;
}
