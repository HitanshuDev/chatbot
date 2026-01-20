import { Router } from "express";
import {
  uploadDocument,
  getUploads,
  deleteUpload,
  getUploadStatus,
  searchEmbeddings,
} from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/bots/:botId/uploads", authMiddleware, uploadDocument);
router.get("/bots/:botId/uploads", authMiddleware, getUploads);
router.delete("/bots/:botId/uploads/:uploadId", authMiddleware, deleteUpload);
router.get("/uploads/:uploadId/status", getUploadStatus);
router.post("/bots/:botId/search", searchEmbeddings);

export default router;
