import { z } from "zod";
export const fundWalletSchema = z.object({ to: z.string().trim(), amount: z.string().regex(/^\d+(?:\.\d+)?$/, "Amount must be a normal decimal string") });
