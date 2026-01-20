import { Router } from "express";
import {
  createBot,
  getBots,
  getBotById,
  updateBot,
  deleteBot,
  getBotConfig,
} from "../controllers/bot.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createBot);
router.get("/", authMiddleware, getBots);
router.get("/:botId", authMiddleware, getBotById);
router.patch("/:botId", authMiddleware, updateBot);
router.delete("/:botId", authMiddleware, deleteBot);
router.get("/:botId/config", authMiddleware, getBotConfig);

export default router;
