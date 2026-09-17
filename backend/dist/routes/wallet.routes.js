import { Router } from "express";
import { createWallet, getWallet } from "../controllers/wallet.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
const router = Router();
router.use(requireAuth);
router.post("/create", asyncHandler(createWallet));
router.get("/", asyncHandler(getWallet));
export default router;
