import { Router } from "express";
import multer from "multer";
import {
  uploadDocument,
  getUploads,
  deleteUpload,
  getUploadStatus,
  searchEmbeddings,
} from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/bots/:botId/uploads",
  authMiddleware,
  upload.single("file"),
  uploadDocument,
);
router.get("/bots/:botId/uploads", authMiddleware, getUploads);
router.delete("/bots/:botId/uploads/:uploadId", authMiddleware, deleteUpload);
router.get("/uploads/:uploadId/status", getUploadStatus);
router.post("/bots/:botId/search", searchEmbeddings);

export default router;
