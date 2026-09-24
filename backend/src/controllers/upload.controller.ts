import { Request, Response } from "express";
import Upload from "../models/upload.model";
import Embedding from "../models/embedding.model";
import Bot from "../models/bot.model";
import { embeddingQueue } from "../queues/embedding.queue";
import { generateEmbedding } from "../utils/embeddings";

type FileType = "pdf" | "txt" | "docx";

const EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  pdf: "pdf",
  txt: "txt",
  md: "txt",
  docx: "docx",
};

const extractText = async (file: Express.Multer.File): Promise<string> => {
  const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "pdf") {
    // Required lazily: pdf-parse runs a debug harness on import that reads a
    // sample file from disk and throws when it is absent.
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(file.buffer);
    return parsed.text;
  }

  if (extension === "txt" || extension === "md") {
    return file.buffer.toString("utf8");
  }

  throw new Error(`Unsupported file type: .${extension}. Upload a PDF or text file.`);
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";
    const fileType = EXTENSION_TO_FILE_TYPE[extension];
    if (!fileType) {
      return res.status(400).json({
        error: `Unsupported file type: .${extension}. Upload a PDF or text file.`,
      });
    }

    let content: string;
    try {
      content = await extractText(file);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }

    if (!content.trim()) {
      return res
        .status(400)
        .json({ error: "No readable text found in that file." });
    }

    const upload = await Upload.create({
      botId,
      fileName: file.originalname,
      fileType,
      fileSize: file.size,
      content,
      status: "pending",
    });

    await embeddingQueue.add({ uploadId: String(upload._id) });

    res.status(201).json({
      upload: {
        id: upload._id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        status: upload.status,
        embeddingCount: 0,
        createdAt: upload.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

export const getUploads = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const uploads = await Upload.find({ botId })
      .select("_id fileName fileType fileSize status error embeddingIds createdAt")
      .sort({ createdAt: -1 });

    res.json({
      uploads: uploads.map((upload) => ({
        id: upload._id,
        fileName: upload.fileName,
        fileType: upload.fileType,
        fileSize: upload.fileSize ?? 0,
        status: upload.status,
        error: upload.error,
        embeddingCount: upload.embeddingIds?.length ?? 0,
        createdAt: upload.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get uploads error:", error);
    res.status(500).json({ error: "Failed to fetch uploads" });
  }
};

export const deleteUpload = async (req: Request, res: Response) => {
  try {
    const { botId, uploadId } = req.params;
    const userId = (req as any).userId;

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const upload = await Upload.findById(uploadId);
    if (!upload || upload.botId.toString() !== botId) {
      return res.status(404).json({ error: "Upload not found" });
    }

    await Embedding.deleteMany({ uploadId: upload._id });

    await Upload.deleteOne({ _id: uploadId });

    if (upload.embeddingIds?.length) {
      await Bot.findByIdAndUpdate(botId, {
        $pull: { embeddings: { $in: upload.embeddingIds } },
      });
    }

    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({ error: "Failed to delete upload" });
  }
};

export const getUploadStatus = async (req: Request, res: Response) => {
  try {
    const { uploadId } = req.params;

    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ error: "Upload not found" });
    }

    res.json({
      upload: {
        id: upload._id,
        fileName: upload.fileName,
        status: upload.status,
        embeddingCount: upload.embeddingIds?.length || 0,
        error: upload.error,
      },
    });
  } catch (error) {
    console.error("Get upload status error:", error);
    res.status(500).json({ error: "Failed to fetch upload status" });
  }
};

export const searchEmbeddings = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    const queryEmbedding = await generateEmbedding(query);

    const embeddings = await Embedding.find({ botId }).limit(100);

    const results = embeddings
      .map((emb) => ({
        ...emb.toObject(),
        similarity: cosineSimilarity(queryEmbedding, emb.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Number(limit));

    res.json({ results });
  } catch (error) {
    console.error("Search embeddings error:", error);
    res.status(500).json({ error: "Failed to search embeddings" });
  }
};

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
