import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    await redisClient.connect();
  }

  return redisClient;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const client = await getRedisClient();
  return client.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  ttl: number = 3600,
): Promise<void> => {
  const client = await getRedisClient();
  await client.setEx(key, ttl, value);
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = await getRedisClient();
  await client.del(key);
};
