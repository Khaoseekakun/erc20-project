import { Router } from "express";
import rateLimit from "express-rate-limit";
import { importToken, send, tokenInfo } from "../controllers/token.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import { rateLimitKey } from "../middleware/rateLimit.js";

const router = Router();
const sendLimit = rateLimit({ windowMs: 60 * 1000, limit: 3, keyGenerator: rateLimitKey, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "ส่ง Token ได้ไม่เกิน 3 ครั้งต่อนาที" } });
router.get("/info", asyncHandler(tokenInfo));
router.post("/send", requireAuth, sendLimit, asyncHandler(send));
router.post("/import", requireAuth, asyncHandler(importToken));
export default router;
