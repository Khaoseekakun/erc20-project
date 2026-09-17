import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
export const publicUser = (user) => ({ id: user.id, username: user.username, email: user.email });
export async function registerUser(username, email, password) { const normalizedEmail = email.toLowerCase(); const existing = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { username }] }, select: { email: true, username: true } }); if (existing?.email === normalizedEmail)
    return { conflict: "อีเมลนี้ถูกใช้งานแล้ว" }; if (existing?.username === username)
    return { conflict: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }; return { user: await prisma.user.create({ data: { username, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) }, select: { id: true, username: true, email: true } }) }; }
export async function loginUser(email, password) { const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } }); if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return null; return publicUser(user); }
export function signToken(userId) { return jwt.sign({}, env.jwtSecret, { subject: String(userId), expiresIn: "7d" }); }
