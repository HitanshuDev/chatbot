import { Request, Response } from "express";
import Bot from "../models/bot.model";
import APIKey from "../models/apiKey.model";
import { generateAPIKey } from "../utils/apiKey";
import {hashApiKey} from "../utils/apiKey";

export const createBot = async (req: Request, res: Response) => {
  try {
    const { name, description, avatar, theme, initialPrompt, temperature, maxTokens, model } =
      req.body;
    const userId = (req as any).userId;

    if (!name) {
      return res.status(400).json({ error: "Bot name required" });
    }

    const apiKey = generateAPIKey();

    const hashedApiKey = hashApiKey(apiKey);

    const bot = await Bot.create({
      name,
      description,
      avatar,
      theme: theme || "light",
      initialPrompt: initialPrompt || "You are a helpful assistant.",
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 500,
      model: model || "gpt-3.5-turbo",
      ownerId: userId,
      // apiKey,
    });

    // Create API key record
    await APIKey.create({
      botId: bot._id,
      userId,
      keyHash: hashedApiKey,
      name: `${name} API Key`,
    });

    res.status(201).json({
      bot: {
        id: bot._id,
        name: bot.name,
        apiKey: apiKey,
        ...bot.toObject(),
      },
    });
  } catch (error) {
    console.error("Create bot error:", error);
    res.status(500).json({ error: "Failed to create bot" });
  }
};

export const getBots = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const bots = await Bot.find({ ownerId: userId }).select("-apiKey");
    
    res.json({ bots });
  } catch (error) {
    console.error("Get bots error:", error);
    res.status(500).json({ error: "Failed to fetch bots" });
  }
};

export const getBotById = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);

    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.json({ bot });
  } catch (error) {
    console.error("Get bot error:", error);
    res.status(500).json({ error: "Failed to fetch bot" });
  }
};

export const updateBot = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;
    const { name, description, avatar, theme, initialPrompt, temperature, maxTokens, model } =
      req.body;

    const bot = await Bot.findById(botId);

    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    if (name) bot.name = name;
    if (description) bot.description = description;
    if (avatar) bot.avatar = avatar;
    if (theme) bot.theme = theme;
    if (initialPrompt) bot.initialPrompt = initialPrompt;
    if (temperature !== undefined) bot.temperature = temperature;
    if (maxTokens) bot.maxTokens = maxTokens;
    if (model) bot.model = model;

    await bot.save();

    res.json({ bot });
  } catch (error) {
    console.error("Update bot error:", error);
    res.status(500).json({ error: "Failed to update bot" });
  }
};

export const deleteBot = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);

    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    await Bot.deleteOne({ _id: botId });
    await APIKey.deleteMany({ botId });

    res.json({ message: "Bot deleted successfully" });
  } catch (error) {
    console.error("Delete bot error:", error);
    res.status(500).json({ error: "Failed to delete bot" });
  }
};

export const getBotConfig = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);

    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.json({
      config: {
        name: bot.name,
        avatar: bot.avatar,
        theme: bot.theme,
        initialPrompt: bot.initialPrompt,
        temperature: bot.temperature,
        maxTokens: bot.maxTokens,
        model: bot.model,
      },
    });
  } catch (error) {
    console.error("Get bot config error:", error);
    res.status(500).json({ error: "Failed to fetch bot config" });
  }
};

