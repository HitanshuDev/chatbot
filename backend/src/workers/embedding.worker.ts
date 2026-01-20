import dotenv from "dotenv";
dotenv.config();

import Queue from "bull";
import Upload from "../models/upload.model";
import Embedding from "../models/embedding.model";
import Bot from "../models/bot.model";
import { openai } from "../utils/openai";
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string);

// Create Bull queue
const embeddingQueue = new Queue("embeddings", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
  },
});

embeddingQueue.process(async (job) => {
  const { uploadId } = job.data;

  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new Error("Upload not found");
  }

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

    // Update job progress
    job.progress(Math.floor(((i + 1) / chunks.length) * 100));
  }

  // Update upload
  upload.status = "completed";
  upload.embeddingIds = embeddingIds;
  await upload.save();

  // Update bot with new embeddings
  await Bot.findByIdAndUpdate(upload.botId, {
    $push: { embeddings: { $each: embeddingIds } },
  });

  return { embeddingIds };
});

embeddingQueue.on("failed", async (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  const upload = await Upload.findById(job.data.uploadId);
  if (upload) {
    upload.status = "failed";
    upload.error = err.message;
    await upload.save();
  }
});

embeddingQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

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

console.log("🚀 Embedding worker started...");
