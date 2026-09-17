import { z } from "zod";
export const registerSchema = z.object({ username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username may use letters, numbers, and underscore only"), email: z.string().trim().email().max(255), password: z.string().min(8).max(72) });
export const loginSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(72) });
