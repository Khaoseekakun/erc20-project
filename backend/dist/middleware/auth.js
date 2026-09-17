import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function requireAuth(req, res, next) { try {
    const token = req.cookies?.blockwallet_token;
    if (!token)
        return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบ" });
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === "string" || typeof payload.sub !== "string")
        throw new Error("Invalid token");
    req.userId = Number(payload.sub);
    next();
}
catch {
    return res.status(401).json({ success: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
} }
