import { Request, Response } from "express";
import Message from "../models/message.model";
import Conversation from "../models/conversation.model";
import Bot from "../models/bot.model";
import { openai } from "../utils/openai";
import { cacheGet, cacheSet } from "../utils/redis";

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId || req.ip;

    const bot = await Bot.findById(botId);
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const conversation = await Conversation.create({
      botId,
      userId,
      metadata: {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
        source: "api",
      },
    });

    res.status(201).json({
      conversation: {
        id: conversation._id,
        botId: conversation.botId,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    console.error("Start conversation error:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const conversations = await Conversation.find({ botId })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate({
      path: "messages",
      select: "sender content createdAt tokens",
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content required" });
    }

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const bot = await Bot.findById(conversation.botId);
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      botId: conversation.botId,
      sender: "user",
      content,
    });

    // Add to conversation
    conversation.messages.push(userMessage._id as any);

    // Get conversation history for context
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10);
    const history = messages.reverse().map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
    }));

    // Check cache for similar queries
    const cacheKey = `response:${bot._id}:${content.substring(0, 50)}`;
    let cachedResponse = await cacheGet(cacheKey);

    let botResponseContent = "I'm having trouble right now. Please try again.";

    if (cachedResponse) {
      botResponseContent = cachedResponse;
    } else {
      // Call OpenAI API
      try{
        const response = await openai.chat.completions.create({
          model: bot.model,
          messages: [
            {
              role: "system",
              content: bot.initialPrompt,
            },
            ...history,
          ] as any,

          temperature: bot.temperature,
          max_tokens: bot.maxTokens,
          
        });
        botResponseContent =
          response.choices[0].message.content ||
          "I couldn't generate a response.";

        // Cache the response
        await cacheSet(cacheKey, botResponseContent, 24 * 60 * 60);
      }catch(err){
          console.error("OpenAI error:", err);
      }
      

      
    }

    // Save bot message
    const botMessage = await Message.create({
      conversationId,
      botId: conversation.botId,
      sender: "bot",
      content: botResponseContent,
    });

    conversation.messages.push(botMessage._id as any);
    await conversation.save();

    res.status(201).json({
      message: {
        id: botMessage._id,
        sender: "bot",
        content: botResponseContent,
        createdAt: botMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    const total = await Message.countDocuments({ conversationId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await Message.deleteOne({ _id: messageId });

    // Remove from conversation
    await Conversation.findByIdAndUpdate(message.conversationId, {
      $pull: { messages: messageId },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
