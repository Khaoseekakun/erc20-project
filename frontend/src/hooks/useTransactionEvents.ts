import { useEffect, useRef } from "react";

export type TransactionEvent = { id: number; walletId: number | null; tokenSymbol: string; status: "PENDING" | "SUCCESS" | "FAILED"; hash: string | null; errorMessage: string | null };

export function useTransactionEvents(onTransaction: (event: TransactionEvent) => void) {
  const callback = useRef(onTransaction);
  callback.current = onTransaction;

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
    const stream = new EventSource(`${baseUrl}/transactions/events`, { withCredentials: true });
    stream.addEventListener("transaction", (message) => {
      const event = JSON.parse((message as MessageEvent<string>).data) as TransactionEvent;
      callback.current(event);
    });
    return () => stream.close();
  }, []);
}
