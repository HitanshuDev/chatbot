import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: Date,
    rateLimit: {
      type: Number,
      default: 1000, // requests per hour
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("APIKey", apiKeySchema);
