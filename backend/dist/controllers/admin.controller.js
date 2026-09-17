import { adminOverview, fundWallet } from "../services/admin.service.js";
import { fundWalletSchema } from "../validators/admin.js";
export async function overview(_req, res) { return res.json({ success: true, data: await adminOverview() }); }
export async function fund(req, res) { const input = fundWalletSchema.parse(req.body); const transaction = await fundWallet(req.userId, input.to, input.amount); return res.json({ success: true, message: "แจก BWT สำเร็จ", transaction }); }
