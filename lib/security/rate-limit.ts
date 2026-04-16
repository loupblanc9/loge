type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function checkRateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (current.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  buckets.set(key, current);
  return { ok: true, retryAfterSec: 0 };
}

