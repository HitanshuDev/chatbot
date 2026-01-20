import { Request, Response } from "express";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import Bot from "../models/bot.model";

export const getBotUsage = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const totalConversations = await Conversation.countDocuments({ botId });
    const totalMessages = await Message.countDocuments({ botId });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const weekConversations = await Conversation.countDocuments({
      botId,
      createdAt: { $gte: lastWeek },
    });

    const weekMessages = await Message.countDocuments({
      botId,
      createdAt: { $gte: lastWeek },
    });

    res.json({
      usage: {
        totalConversations,
        totalMessages,
        weekConversations,
        weekMessages,
        avgMessagesPerConversation:
          totalConversations > 0 ? totalMessages / totalConversations : 0,
      },
    });
  } catch (error) {
    console.error("Get bot usage error:", error);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
};

export const getBotMetrics = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;
    const { startDate, endDate } = req.query;

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const filter: any = { botId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const conversations = await Conversation.find(filter).lean();
    const messages = await Message.find(filter).lean();

    const userMessages = messages.filter((m) => m.sender === "user");
    const botMessages = messages.filter((m) => m.sender === "bot");

    const avgResponseTime = calculateAvgResponseTime(messages);

    res.json({
      metrics: {
        totalConversations: conversations.length,
        totalMessages: messages.length,
        userMessages: userMessages.length,
        botMessages: botMessages.length,
        avgMessagesPerConversation:
          conversations.length > 0
            ? messages.length / conversations.length
            : 0,
        avgResponseTime,
        dateRange: {
          start: startDate || "all-time",
          end: endDate || "all-time",
        },
      },
    });
  } catch (error) {
    console.error("Get bot metrics error:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
};

function calculateAvgResponseTime(messages: any[]): number {
  if (messages.length < 2) return 0;

  let totalTime = 0;
  let count = 0;

  for (let i = 1; i < messages.length; i++) {
    if (
      messages[i].sender === "bot" &&
      messages[i - 1].sender === "user"
    ) {
      const responseTime =
        new Date(messages[i].createdAt).getTime() -
        new Date(messages[i - 1].createdAt).getTime();
      totalTime += responseTime;
      count++;
    }
  }

  return count > 0 ? totalTime / count : 0;
}
