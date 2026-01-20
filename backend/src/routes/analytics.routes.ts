import { Router } from "express";
import { getBotUsage, getBotMetrics } from "../controllers/analytics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/bots/:botId/usage", authMiddleware, getBotUsage);
router.get("/bots/:botId/metrics", authMiddleware, getBotMetrics);

export default router;
