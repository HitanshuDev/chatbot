import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes";
import botRoutes from "./routes/bot.routes";
import messageRoutes from "./routes/message.routes";
import uploadRoutes from "./routes/upload.routes";
import analyticsRoutes from "./routes/analytics.routes";
import widgetRoutes from "./routes/widget.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/health", (_, res) => res.json({ status: "OK" }));

// API Routes
app.use("/v1/auth", authRoutes);
app.use("/v1/bots", botRoutes);
app.use("/v1", messageRoutes);
app.use("/v1", uploadRoutes);
app.use("/v1", analyticsRoutes);
app.use("/v1", widgetRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
