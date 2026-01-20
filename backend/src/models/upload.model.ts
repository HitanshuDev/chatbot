import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "txt", "docx", "url"],
      required: true,
    },
    fileSize: Number,
    url: String,
    storageKey: String, // For cloud storage reference
    content: String, // Text content after parsing
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    embeddingIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Embedding",
      },
    ],
    error: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Upload", uploadSchema);
