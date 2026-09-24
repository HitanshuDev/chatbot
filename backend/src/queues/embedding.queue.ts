import Queue from "bull";

export interface EmbeddingJobData {
  uploadId: string;
}

export const EMBEDDING_QUEUE_NAME = "embeddings";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const embeddingQueue = new Queue<EmbeddingJobData>(
  EMBEDDING_QUEUE_NAME,
  REDIS_URL,
  {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  },
);
