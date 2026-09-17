import { EventEmitter } from "node:events";
const emitter = new EventEmitter();
export function publishTransaction(userId, event) {
    emitter.emit(`transaction:${userId}`, event);
}
export function subscribeToTransactions(userId, callback) {
    const channel = `transaction:${userId}`;
    emitter.on(channel, callback);
    return () => emitter.off(channel, callback);
}
