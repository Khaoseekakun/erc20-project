import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { rateLimitKey } from "../middleware/rateLimit.js";

const router = Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, keyGenerator: rateLimitKey, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "ลองใหม่อีกครั้งในภายหลัง" } });
router.post("/register", authLimit, asyncHandler(register));
router.post("/login", authLimit, asyncHandler(login));
router.post("/logout", logout);
router.get("/me", requireAuth, asyncHandler(me));
export default router;
