import { subscribeToTransactions } from "../services/transaction-events.service.js";
import { transactionHistory } from "../services/transaction.service.js";
export async function listTransactions(req, res) {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50)
        return res.status(400).json({ success: false, message: "พารามิเตอร์ pagination ไม่ถูกต้อง" });
    return res.json({ success: true, ...(await transactionHistory(req.userId, page, limit)) });
}
export function streamTransactions(req, res) {
    res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" });
    res.flushHeaders();
    const unsubscribe = subscribeToTransactions(req.userId, (event) => res.write(`event: transaction\ndata: ${JSON.stringify(event)}\n\n`));
    const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 25_000);
    req.on("close", () => { clearInterval(heartbeat); unsubscribe(); res.end(); });
}
