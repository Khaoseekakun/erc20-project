import { useEffect, useRef } from "react";
import { useToast } from "../contexts/ToastContext";
import { useTransactionEvents } from "../hooks/useTransactionEvents";

export function TransactionNotifier() {
  const { toast } = useToast();
  const pendingToastIdRef = useRef<string | null>(null);

  useTransactionEvents((event) => {
    // Handle web desktop notification
    if ("Notification" in window && Notification.permission === "granted" && event.status !== "PENDING") {
      new Notification("ERC BlockWallet", {
        body:
          event.status === "SUCCESS"
            ? `ส่ง ${event.tokenSymbol} สำเร็จแล้ว`
            : event.errorMessage ?? `ส่ง ${event.tokenSymbol} ไม่สำเร็จ`,
      });
    }

    if (event.status === "PENDING") {
      const id = toast.loading(
        `กำลังส่ง ${event.tokenSymbol} บนเครือข่าย Sepolia...`,
        {
          id: pendingToastIdRef.current ?? `tx-${event.id}`,
          title: "กำลังดำเนินการธุรกรรม",
        }
      );
      pendingToastIdRef.current = id;
    } else if (event.status === "SUCCESS") {
      const toastId = pendingToastIdRef.current ?? `tx-${event.id}`;
      toast.success(`ส่ง ${event.tokenSymbol} สำเร็จและได้รับการยืนยันแล้ว`, {
        id: toastId,
        title: "ธุรกรรมสำเร็จ",
        duration: 5000,
      });
      pendingToastIdRef.current = null;
    } else if (event.status === "FAILED") {
      const toastId = pendingToastIdRef.current ?? `tx-${event.id}`;
      toast.error(event.errorMessage ?? `ส่ง ${event.tokenSymbol} ไม่สำเร็จ`, {
        id: toastId,
        title: "ธุรกรรมไม่สำเร็จ",
        duration: 6000,
      });
      pendingToastIdRef.current = null;
    }
  });

  return null;
}
