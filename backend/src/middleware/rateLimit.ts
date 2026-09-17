import type { Request } from "express";
// Express resolves req.ip only through the explicitly configured trusted proxies.
// This ignores spoofed X-Forwarded-For headers when TRUST_PROXY_HOPS is 0.
export const rateLimitKey = (request: Request) => request.ip ?? request.socket.remoteAddress ?? "unknown";
