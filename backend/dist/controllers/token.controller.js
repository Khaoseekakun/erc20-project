import { addTokenToWallet, getTokenInfo } from "../services/token.service.js";
import { sendToken } from "../services/transaction.service.js";
import { importTokenSchema, sendTokenSchema } from "../validators/token.js";
export async function tokenInfo(_req, res) { return res.json({ success: true, token: await getTokenInfo() }); }
export async function send(req, res) { const input = sendTokenSchema.parse(req.body); const transaction = await sendToken(req.userId, input); return res.status(202).json({ success: true, message: "รับรายการส่ง Token แล้ว", transaction }); }
export async function importToken(req, res) { const input = importTokenSchema.parse(req.body); const token = await addTokenToWallet(req.userId, input.walletId, input.contractAddress); return res.status(201).json({ success: true, token }); }
