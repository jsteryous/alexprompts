/**
 * Best-effort, in-memory sliding-window rate limiter (per serverless instance).
 * Resets on cold start and is not shared across regions, the same caveat as the
 * area-scan guardrails in src/lib/areaScan.ts. It is enough to blunt casual abuse
 * (signup spam, confirmation-email bombing); move to Vercel KV / Upstash if a hard,
 * cross-instance guarantee is ever needed.
 */
const buckets = new Map<string, number[]>();

/** Records a hit for `key` and returns true when the caller is OVER the limit
 *  (i.e. should be rejected). `max` hits are allowed per `windowMs`. */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}
