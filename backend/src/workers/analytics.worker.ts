import "dotenv/config";

import Queue from "bull";
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string);

// Create Bull queue
const analyticsQueue = new Queue(
  "analytics",
  process.env.REDIS_URL || "redis://localhost:6379",
);

analyticsQueue.process(async (job) => {
  const { botId, action } = job.data;

  // Process analytics data
  // In a real app, aggregate and store analytics
  console.log(`Processing analytics for bot ${botId}: ${action}`);

  return { success: true };
});

analyticsQueue.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed`);
});

console.log("📊 Analytics worker started...");
