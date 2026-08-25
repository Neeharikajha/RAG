import Redis from "ioredis";
import { REDIS_URL } from "../../config/env.js";

const memoryCache = new Map<string, { data: string; expiresAt: number }>();
let isRedisAvailable = false;

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => (times > 3 ? null : 1000),
});

redisClient.on("connect", () => {
  isRedisAvailable = true;
  console.log("Connected to Redis server at", REDIS_URL);
});

redisClient.on("error", () => {
  isRedisAvailable = false;
});

redisClient.connect().catch(() => {
  isRedisAvailable = false;
});

export async function getCachedValue<T>(key: string): Promise<T | null> {
  if (isRedisAvailable) {
    try {
      const cachedString = await redisClient.get(key);
      if (cachedString) return JSON.parse(cachedString) as T;
    } catch {}
  }

  const localEntry = memoryCache.get(key);
  if (localEntry) {
    if (Date.now() < localEntry.expiresAt) {
      try {
        return JSON.parse(localEntry.data) as T;
      } catch {}
    } else {
      memoryCache.delete(key);
    }
  }
  return null;
}

export async function setCachedValue<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600,
): Promise<void> {
  const jsonString = JSON.stringify(value);
  if (isRedisAvailable) {
    try {
      await redisClient.setex(key, ttlSeconds, jsonString);
      return;
    } catch {}
  }

  memoryCache.set(key, {
    data: jsonString,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (isRedisAvailable) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {}
  }
  memoryCache.clear();
}

export function getRedisStatus() {
  return {
    connected: isRedisAvailable,
    provider: isRedisAvailable ? "Redis (Port 6379)" : "In-Memory Cache (Fallback)",
  };
}
