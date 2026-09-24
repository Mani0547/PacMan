import "server-only";

/** Tiny in-memory limiter for wrong Player Code guesses (best effort per serverless instance). */
const attempts = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 8;
const WINDOW_MS = 5 * 60 * 1000;

export function isBlocked(key: string): boolean {
  const a = attempts.get(key);
  if (!a) return false;
  if (a.resetAt < Date.now()) { attempts.delete(key); return false; }
  return a.count >= LIMIT;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else a.count++;
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
}

export const clearFailures = (key: string): void => { attempts.delete(key); };
