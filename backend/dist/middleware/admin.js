import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
export async function requireAdmin(req, res, next) { const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { email: true } }); if (!user || user.email.toLowerCase() !== env.adminEmail)
    return res.status(403).json({ success: false, message: "คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ" }); next(); }
