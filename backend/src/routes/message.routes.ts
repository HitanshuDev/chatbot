import { Router } from "express";
import {
  startConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/message.controller";
import { optionalAuthMiddleware } from "../middleware/auth.middleware";
import { botAuthMiddleware } from "../middleware/botAuth.middleware";

const router = Router();

router.post(
  "/bots/:botId/conversations",
  optionalAuthMiddleware,
  startConversation
);
router.get(
  "/bots/:botId/conversations",
  optionalAuthMiddleware,
  getConversations
);
router.get(
  "/conversations/:conversationId",
  optionalAuthMiddleware,
  getConversationById
);
router.post(
  "/conversations/:conversationId/messages",
  optionalAuthMiddleware,
  sendMessage
);
router.get(
  "/conversations/:conversationId/messages",
  optionalAuthMiddleware,
  getMessages
);
router.delete("/messages/:messageId", optionalAuthMiddleware, deleteMessage);

export default router;
