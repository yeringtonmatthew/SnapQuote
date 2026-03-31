const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
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
