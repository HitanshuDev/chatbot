import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      pageNumber: Number,
      chunkIndex: Number,
      source: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for vector similarity search
embeddingSchema.index({ embedding: "2dsphere" });

export default mongoose.model("Embedding", embeddingSchema);
