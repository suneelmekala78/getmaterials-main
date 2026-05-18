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
    await redis.set(key, data, { ex: ttlSeconds });
  } catch {
    // Caching failed silently
  }

  return data;
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = Number(result[0]);
      const keys = result[1] as string[];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);
  } catch {
    // Invalidation failed silently
  }
}
