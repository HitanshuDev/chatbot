import rateLimit from "express-rate-limit";

export const sendMessageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 20 requests per window
  message: {
    error: "Too many messages. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
