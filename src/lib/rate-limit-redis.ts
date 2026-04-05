/**
 * Redis-backed rate limiter using Upstash.
 *
 * Falls back to the in-memory rate limiter when UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN are not configured (e.g. local dev).
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// Cache Ratelimit instances by a composite key of (limit, windowMs)
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (limiter) return limiter;

  // Upstash sliding window expects a duration string.
  // Convert ms to the most appropriate unit.
  const windowSec = Math.max(1, Math.round(windowMs / 1000));
  const duration = `${windowSec} s` as `${number} s`;

  limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(limit, duration),
    prefix: 'snapquote_rl',
  });

  limiters.set(cacheKey, limiter);
  return limiter;
}

/**
 * Check rate limit using Upstash Redis.
 * Returns `null` if Redis is not configured (caller should fall back to in-memory).
 */
export async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean | null> {
  const limiter = getLimiter(limit, windowMs);
  if (!limiter) return null; // Redis not available

  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch {
    // If Redis fails at runtime, signal caller to fall back
    return null;
  }
}
