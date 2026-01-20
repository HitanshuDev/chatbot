export const DATABASE_CONFIG = {
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/chatbot",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  expiresIn: "7d",
};

export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
};

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback",
};

export const CACHE_CONFIG = {
  ttl: {
    responses: 24 * 60 * 60, // 24 hours
    embeddings: 7 * 24 * 60 * 60, // 7 days
    config: 60 * 60, // 1 hour
  },
};
