import { loginSchema, registerSchema } from "../validators/auth.js";
import { loginUser, publicUser, registerUser, signToken } from "../services/auth.service.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
const cookieOptions = { httpOnly: true, sameSite: "lax", secure: env.nodeEnv === "production", maxAge: 7 * 24 * 60 * 60 * 1000, path: "/" };
export async function register(req, res) { const input = registerSchema.parse(req.body); const result = await registerUser(input.username, input.email, input.password); if ("conflict" in result)
    return res.status(409).json({ success: false, message: result.conflict }); return res.status(201).json({ success: true, message: "สมัครสมาชิกสำเร็จ", user: result.user }); }
export async function login(req, res) { const input = loginSchema.parse(req.body); const user = await loginUser(input.email, input.password); if (!user)
    return res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }); res.cookie("blockwallet_token", signToken(user.id), cookieOptions); return res.json({ success: true, user }); }
export function logout(_req, res) { res.clearCookie("blockwallet_token", { ...cookieOptions, maxAge: undefined }); return res.json({ success: true }); }
export async function me(req, res) { const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, username: true, email: true } }); if (!user)
    return res.status(401).json({ success: false, message: "ไม่พบผู้ใช้" }); return res.json({ success: true, user: publicUser(user) }); }
