import { EventEmitter } from "node:events";

export type TransactionEvent = { id: number; walletId: number | null; tokenSymbol: string; status: "PENDING" | "SUCCESS" | "FAILED"; hash: string | null; errorMessage: string | null };
const emitter = new EventEmitter();

export function publishTransaction(userId: number, event: TransactionEvent) {
  emitter.emit(`transaction:${userId}`, event);
}

export function subscribeToTransactions(userId: number, callback: (event: TransactionEvent) => void) {
  const channel = `transaction:${userId}`;
  emitter.on(channel, callback);
  return () => emitter.off(channel, callback);
}
