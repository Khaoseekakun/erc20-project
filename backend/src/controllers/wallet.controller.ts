import type { Request, Response } from "express";
import { createWalletForUser, getWalletDetails } from "../services/wallet.service.js";
export async function createWallet(req: Request, res: Response) { const wallet = await createWalletForUser(req.userId!); return res.status(201).json({ success: true, wallet }); }
export async function getWallet(req: Request, res: Response) { return res.json({ success: true, wallets: await getWalletDetails(req.userId!), limit: 3 }); }
