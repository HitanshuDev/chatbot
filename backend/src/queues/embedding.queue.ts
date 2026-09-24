import Queue from "bull";

export interface EmbeddingJobData {
  uploadId: string;
}

export const EMBEDDING_QUEUE_NAME = "embeddings";

export const embeddingQueue = new Queue<EmbeddingJobData>(
  EMBEDDING_QUEUE_NAME,
  {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT || 6379),
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  },
);
