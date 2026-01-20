import { Router } from "express";
import { getWidgetScript, getWidgetConfig } from "../controllers/widget.controller";

const router = Router();

router.get("/bots/:botId/script.js", getWidgetScript);
router.get("/bots/:botId/config", getWidgetConfig);

export default router;
