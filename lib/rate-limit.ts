type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const previous = buckets.get(key);
  const entry = !previous || previous.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: previous.count + 1, resetAt: previous.resetAt };

  buckets.set(key, entry);
  if (buckets.size > 10_000) {
    for (const [candidate, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(candidate);
    }
  }

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

export function clientIdentifier(headers: Headers) {
  return headers.get("cf-connecting-ip")
    ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}
