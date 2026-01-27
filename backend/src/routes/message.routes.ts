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
import { apiKeyAuth } from "../middleware/message.middleware";

const router = Router();

// Start a new conversation with a bot
// POST /bots/:botId/conversations
router.post(
  "/bots/:botId/conversations",
  optionalAuthMiddleware,
  startConversation
);

// Retrieve all conversations for a specific bot
// GET /bots/:botId/conversations
router.get(
  "/bots/:botId/conversations",
  optionalAuthMiddleware,
  getConversations
);

// Get a specific conversation by its ID
// GET /conversations/:conversationId
router.get(
  "/conversations/:conversationId",
  optionalAuthMiddleware,
  getConversationById
);

// Send a new message in an existing conversation
// POST /conversations/:conversationId/messages
router.post(
  "/conversations/:conversationId/messages",
  apiKeyAuth,
  sendMessage
);

// Retrieve all messages in a conversation
// GET /conversations/:conversationId/messages
router.get(
  "/conversations/:conversationId/messages",
  optionalAuthMiddleware,
  getMessages
);

// Delete a specific message by its ID
// DELETE /messages/:messageId
router.delete("/messages/:messageId", optionalAuthMiddleware, deleteMessage);

export default router;
