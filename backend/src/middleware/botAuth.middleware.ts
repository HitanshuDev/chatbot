import { Request, Response, NextFunction } from "express";
import Bot from "../models/bot.model";
import APIKey from "../models/apiKey.model";

export const botAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const botId = req.params.botId;

    if (!apiKey) {
      return res
        .status(401)
        .json({ error: "Missing API key (x-api-key header)" });
    }

    const bot = await Bot.findById(botId);
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const keyRecord = await APIKey.findOne({
      key: apiKey,
      botId,
      isActive: true,
    });

    if (!keyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Update last used
    keyRecord.lastUsed = new Date();
    await keyRecord.save();

    (req as any).botId = botId;
    (req as any).apiKey = apiKey;
    next();
  } catch (error) {
    console.error("Bot auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

  next();
};
