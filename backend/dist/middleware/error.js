import { ZodError } from "zod";
export const asyncHandler = (handler) => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
export const errorHandler = (error, _req, res, _next) => { if (error instanceof ZodError)
    return res.status(400).json({ success: false, message: error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }); const status = typeof error === "object" && error && "status" in error && typeof error.status === "number" ? error.status : 500; const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในระบบ"; const publicMessage = typeof error === "object" && error && "publicMessage" in error && error.publicMessage === true; if (status >= 500)
    console.error("Request failed:", message); return res.status(status).json({ success: false, message: status >= 500 && !publicMessage ? "เกิดข้อผิดพลาดในระบบ" : message }); };
