import "dotenv/config";

import mongoose from "mongoose";
import Upload from "../models/upload.model";
import Embedding from "../models/embedding.model";
import Bot from "../models/bot.model";
import { embeddingQueue } from "../queues/embedding.queue";
import {
  chunkText,
  generateEmbedding,
  usingRealEmbeddings,
} from "../utils/embeddings";

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

embeddingQueue.process(async (job) => {
  const { uploadId } = job.data;

  const upload = await Upload.findById(uploadId);
  if (!upload) {
    throw new Error(`Upload ${uploadId} not found`);
  }

  upload.status = "processing";
  await upload.save();

  const chunks = chunkText(upload.content || "");
  console.log(`Job ${job.id}: ${upload.fileName} → ${chunks.length} chunks`);

  const embeddingIds = [];

  for (let i = 0; i < chunks.length; i++) {
    const vector = await generateEmbedding(chunks[i]);

    const embedding = await Embedding.create({
      botId: upload.botId,
      uploadId: upload._id,
      text: chunks[i],
      embedding: vector,
      metadata: {
        chunkIndex: i,
        source: upload.fileName,
      },
    });

    embeddingIds.push(embedding._id);
    await job.progress(Math.floor(((i + 1) / chunks.length) * 100));
  }

  upload.status = "completed";
  upload.embeddingIds = embeddingIds;
  upload.error = undefined;
  await upload.save();

  await Bot.findByIdAndUpdate(upload.botId, {
    $push: { embeddings: { $each: embeddingIds } },
  });

  return { embeddingCount: embeddingIds.length };
});

embeddingQueue.on("failed", async (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  const upload = await Upload.findById(job.data.uploadId);
  // Only mark failed once Bull has exhausted its retries.
  if (upload && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    upload.status = "failed";
    upload.error = err.message;
    await upload.save();
  }
});

embeddingQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed: ${result.embeddingCount} embeddings`);
});

console.log(
  `🚀 Embedding worker started (embeddings: ${
    usingRealEmbeddings() ? "OpenAI" : "local stub, no API key set"
  })`,
);
