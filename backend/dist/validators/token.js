import { z } from "zod";
export const sendTokenSchema = z.object({ walletId: z.number().int().positive(), tokenAddress: z.string().trim(), to: z.string().trim(), amount: z.string().regex(/^\d+(?:\.\d+)?$/, "Amount must be a normal decimal string") });
export const importTokenSchema = z.object({ walletId: z.number().int().positive(), contractAddress: z.string().trim() });
