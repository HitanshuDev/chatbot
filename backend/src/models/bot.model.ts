import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // apiKey: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    avatar: String,
    description: String,
    theme: {
      type: String,
      default: "light",
    },
    initialPrompt: {
      type: String,
      default: "You are a helpful assistant.",
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 500,
    },
    model: {
      type: String,
      default: "gpt-3.5-turbo",
    },
    embeddings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Embedding",
      },
    ],
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

export default mongoose.model("Bot", botSchema);
