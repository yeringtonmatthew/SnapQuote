import { redisRateLimit } from './rate-limit-redis';

// ---------------------------------------------------------------------------
// In-memory fallback (used when Upstash Redis is not configured or errors)
// ---------------------------------------------------------------------------
const hits = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= limit) {
    return false; // blocked
  }
  entry.count++;
  return true; // allowed
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    hits.forEach((entry, key) => {
      if (now > entry.resetAt) hits.delete(key);
    });
  }, 5 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Public API — async, tries Redis first, falls back to in-memory
// ---------------------------------------------------------------------------

/**
 * Check whether a request identified by `key` is within its rate limit.
 *
 * - When Upstash Redis is configured (`UPSTASH_REDIS_REST_URL` +
 *   `UPSTASH_REDIS_REST_TOKEN`), limits are enforced in Redis so they persist
 *   across serverless cold starts.
 * - Otherwise (or if Redis errors), falls back to an in-memory Map that works
 *   fine for single-instance / development use.
 *
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const result = await redisRateLimit(key, limit, windowMs);
  if (result !== null) return result;
  // Fallback to in-memory
  return inMemoryRateLimit(key, limit, windowMs);
}
