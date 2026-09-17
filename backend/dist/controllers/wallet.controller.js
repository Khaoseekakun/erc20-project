import { createWalletForUser, getWalletDetails } from "../services/wallet.service.js";
export async function createWallet(req, res) { const wallet = await createWalletForUser(req.userId); return res.status(201).json({ success: true, wallet }); }
export async function getWallet(req, res) { return res.json({ success: true, wallets: await getWalletDetails(req.userId), limit: 3 }); }
