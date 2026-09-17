import { Router } from "express";
import { listTransactions, streamTransactions } from "../controllers/transaction.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

const router = Router();
router.get("/events", requireAuth, streamTransactions);
router.get("/", requireAuth, asyncHandler(listTransactions));
export default router;
