import { Router } from "express";
import rateLimit from "express-rate-limit";
import { fund, overview } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { asyncHandler } from "../middleware/error.js";
import { rateLimitKey } from "../middleware/rateLimit.js";

const router = Router();
const fundLimit = rateLimit({ windowMs: 60_000, limit: 3, keyGenerator: rateLimitKey, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "แจก ERCBWT ได้ไม่เกิน 3 ครั้งต่อนาที" } });
router.use(requireAuth, asyncHandler(requireAdmin));
router.get("/overview", asyncHandler(overview));
router.post("/fund", fundLimit, asyncHandler(fund));
export default router;
