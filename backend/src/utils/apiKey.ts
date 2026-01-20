import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const generateAPIKey = (): string => {
  const prefix = "sk-";
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return prefix + randomBytes;
};

export const generateBotId = (): string => {
  return uuidv4();
};

export const validateAPIKey = (key: string): boolean => {
  return key.startsWith("sk-") && key.length > 10;
};

export const maskAPIKey = (key: string): string => {
  if (key.length <= 8) return key;
  return key.substring(0, 4) + "..." + key.substring(key.length - 4);
};
