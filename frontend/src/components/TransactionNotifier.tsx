import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { TransactionEvent, useTransactionEvents } from "../hooks/useTransactionEvents";

export function TransactionNotifier() {
  const [event, setEvent] = useState<TransactionEvent | null>(null);
  useTransactionEvents((next) => { if (next.status !== "PENDING") setEvent(next); });
  useEffect(() => {
    if (!event) return;
    if ("Notification" in window && Notification.permission === "granted") new Notification("ERC BlockWallet", { body: event.status === "SUCCESS" ? `ส่ง ${event.tokenSymbol} สำเร็จแล้ว` : event.errorMessage ?? `ส่ง ${event.tokenSymbol} ไม่สำเร็จ` });
    const timer = window.setTimeout(() => setEvent(null), 7_000);
    return () => window.clearTimeout(timer);
  }, [event]);
  if (!event) return null;
  const success = event.status === "SUCCESS";
  return <div role="status" className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl ${success ? "border-emerald-400/30 bg-emerald-950 text-emerald-100" : "border-red-400/30 bg-red-950 text-red-100"}`}>{success ? <CheckCircle2 className="mt-0.5 shrink-0" size={19} /> : <XCircle className="mt-0.5 shrink-0" size={19} />}<div><p className="font-medium">{success ? "ส่ง Token สำเร็จ" : "ส่ง Token ไม่สำเร็จ"}</p><p className="mt-1 text-sm opacity-80">{success ? `${event.tokenSymbol} ได้รับการยืนยันแล้ว` : event.errorMessage}</p></div><button className="ml-2 opacity-60 hover:opacity-100" onClick={() => setEvent(null)} aria-label="ปิดการแจ้งเตือน">×</button></div>;
}
