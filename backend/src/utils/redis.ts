import redis from "redis";

let redisClient: redis.RedisClientType | null = null;

export const getRedisClient = async (): Promise<redis.RedisClientType> => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    await redisClient.connect();
  }
  return redisClient;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  const client = await getRedisClient();
  return await client.get(key);
};

export const cacheSet = async (
  key: string,
  value: string,
  ttl: number = 3600
): Promise<void> => {
  const client = await getRedisClient();
  await client.setEx(key, ttl, value);
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = await getRedisClient();
  await client.del(key);
};
