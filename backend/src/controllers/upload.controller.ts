import { Request, Response } from "express";
import Upload from "../models/upload.model";
import Embedding from "../models/embedding.model";
import Bot from "../models/bot.model";
import { openai } from "../utils/openai";

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { fileName, fileType, content, url } = req.body;
    const userId = (req as any).userId;

    if (!botId || !fileName || !fileType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const bot = await Bot.findById(botId);
    if (!bot || bot.ownerId.toString() !== userId) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const upload = await Upload.create({
      botId,
      fileName,
      fileType,
      content,
      url,
      status: "processing",
    });

    // Trigger async embedding job (in real app, this would be a queue job)
    processUpload(upload._id as string).catch((err) =>
      console.error("Error processing upload:", err)
    );

    res.status(201).json({
      upload: {
        id: upload._id,
        fileName: upload.fileName,
        status: upload.status,
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

    const uploads = await Upload.find({ botId }).select(
      "_id fileName fileType status createdAt embeddingIds"
    );

    res.json({ uploads });
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

    // Delete associated embeddings
    if (upload.embeddingIds && upload.embeddingIds.length > 0) {
      await Embedding.deleteMany({ _id: { $in: upload.embeddingIds } });
    }

    await Upload.deleteOne({ _id: uploadId });

    // Remove from bot embeddings array
    await Bot.findByIdAndUpdate(botId, {
      $pull: { embeddings: { $in: upload.embeddingIds } },
    });

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

// Helper function to process document and generate embeddings
async function processUpload(uploadId: string) {
  try {
    const upload = await Upload.findById(uploadId);
    if (!upload) return;

    // Chunk the content
    const chunks = chunkText(upload.content || "", 1000, 200);

    const embeddingIds = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding using OpenAI
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });

      const embedding = await Embedding.create({
        botId: upload.botId,
        uploadId: upload._id,
        text: chunk,
        embedding: response.data[0].embedding,
        metadata: {
          chunkIndex: i,
          source: upload.fileName,
        },
      });

      embeddingIds.push(embedding._id);
    }

    // Update upload
    upload.status = "completed";
    upload.embeddingIds = embeddingIds;
    await upload.save();

    // Update bot with new embeddings
    await Bot.findByIdAndUpdate(upload.botId, {
      $push: { embeddings: { $each: embeddingIds } },
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    const upload = await Upload.findById(uploadId);
    if (upload) {
      upload.status = "failed";
      upload.error = (error as Error).message;
      await upload.save();
    }
  }
}

function chunkText(
  text: string,
  chunkSize: number,
  overlapSize: number
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlapSize;
  }

  return chunks;
}

export const searchEmbeddings = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }

    // Generate embedding for query
    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const queryEmbedding = queryResponse.data[0].embedding;

    // Find similar embeddings (in production, use vector DB like Pinecone)
    const embeddings = await Embedding.find({ botId }).limit(100);

    // Calculate similarity and sort
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
