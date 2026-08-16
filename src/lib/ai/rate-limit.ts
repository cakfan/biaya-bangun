export const RATE_LIMIT_MAX_REQUESTS = 10;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export type RateLimiter = {
  allow: (key: string) => boolean;
};

export function createRateLimiter(
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
  now: () => number = Date.now,
): RateLimiter {
  const requestTimestamps = new Map<string, number[]>();

  return {
    allow(key: string): boolean {
      const currentTime = now();
      const cutoff = currentTime - windowMs;
      const recent = (requestTimestamps.get(key) ?? []).filter(
        (timestamp) => timestamp > cutoff,
      );
      if (recent.length >= maxRequests) {
        requestTimestamps.set(key, recent);
        return false;
      }
      recent.push(currentTime);
      requestTimestamps.set(key, recent);
      return true;
    },
  };
}

export const chatRateLimiter = createRateLimiter();
