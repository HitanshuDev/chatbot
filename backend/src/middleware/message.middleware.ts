import {hashApiKey} from "../utils/apiKey";
import APIKey from "../models/apiKey.model";
export const apiKeyAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "API key required" });
  }

  const rawKey = auth.replace("Bearer ", "");
  const keyHash = hashApiKey(rawKey);

  const apiKey = await APIKey.findOne({ keyHash, status: "active" });
  if (!apiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  req.apiKey = apiKey;
  next();
};
