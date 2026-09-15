type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_BUCKETS = 10_000;

function boundedKey(value: string) {
  return value.trim().slice(0, 128) || "unknown";
}

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const normalizedKey = boundedKey(key);
  const previous = buckets.get(normalizedKey);
  const entry = !previous || previous.resetAt <= now
    ? { count: 1, resetAt: now + windowMs }
    : { count: previous.count + 1, resetAt: previous.resetAt };

  buckets.set(normalizedKey, entry);
  if (buckets.size > MAX_BUCKETS) {
    for (const [candidate, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(candidate);
    }
    while (buckets.size > MAX_BUCKETS) {
      const oldest = buckets.keys().next().value;
      if (oldest === undefined) break;
      buckets.delete(oldest);
    }
  }

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

export function clientIdentifier(headers: Headers) {
  const cloudflare = headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return boundedKey(cloudflare);
  const forwarded = headers.get("x-forwarded-for")?.split(",").map(value => value.trim()).filter(Boolean) ?? [];
  // Google front ends append the client and proxy addresses after any
  // user-supplied values, so the penultimate value is the useful boundary.
  return boundedKey(forwarded.at(forwarded.length > 1 ? -2 : -1) ?? "unknown");
}
