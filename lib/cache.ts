import { Redis } from "@upstash/redis";

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !url.startsWith("https://")) {
    return null;
  }
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export const redis = createRedisClient();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) return cached;
  } catch {
    // Cache miss or error, proceed to fetch
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  } catch {
    // Caching failed silently
  }

  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Invalidation failed silently
  }
}
