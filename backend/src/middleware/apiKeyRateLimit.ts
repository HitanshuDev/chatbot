import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../utils/redis";

const WINDOW_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 20; // 20 messages per minute

export const apiKeyRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = (req as any).apiKey;

    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const redis = await getRedisClient();

    const key = `ratelimit:apikey:${apiKey._id}`;
    const current = await redis.incr(key);

    // first hit → start window
    if (current === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (current > MAX_REQUESTS) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please slow down.",
      });
    }

    // optional (nice DX)
    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS.toString());
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, MAX_REQUESTS - current).toString(),
    );

    next();
  } catch (err) {
    console.error("Rate limit error:", err);
    // fail-open → don't break chat if Redis is down
    next();
  }
};
