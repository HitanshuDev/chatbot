import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  googleAuth,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/google", googleAuth);

export default router;
