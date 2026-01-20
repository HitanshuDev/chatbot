import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const payload = jwt.verify(token, JWT_CONFIG.secret) as any;
    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const payload = jwt.verify(token, JWT_CONFIG.secret) as any;
      (req as any).userId = payload.userId;
    }
    next();
  } catch (error) {
    next();
  }
};
