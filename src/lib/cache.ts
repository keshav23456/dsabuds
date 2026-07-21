import redisClient from "@/lib/redis";

export async function getCache<T = unknown>(key: string): Promise<T | null> {
  try {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err) {
    console.error("Redis GET Error:", (err as Error).message);
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("Redis SET Error:", (err as Error).message);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL Error:", (err as Error).message);
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error("Redis Pattern Delete Error:", (err as Error).message);
  }
}
