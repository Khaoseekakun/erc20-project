import type { Request, Response } from "express";
import { adminOverview, fundWallet } from "../services/admin.service.js";
import { fundWalletSchema } from "../validators/admin.js";
export async function overview(_req: Request, res: Response) { return res.json({ success: true, data: await adminOverview() }); }
export async function fund(req: Request, res: Response) { const input = fundWalletSchema.parse(req.body); const transaction = await fundWallet(req.userId!, input.to, input.amount); return res.json({ success: true, message: "แจก BWT สำเร็จ", transaction }); }
