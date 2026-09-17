import { Interface, formatUnits, id, zeroPadValue } from "ethers";
import { provider } from "../config/blockchain.js";
import { prisma } from "../config/prisma.js";
import { publishTransaction } from "./transaction-events.service.js";

const transferInterface = new Interface(["event Transfer(address indexed from, address indexed to, uint256 value)"]);
const transferTopic = id("Transfer(address,address,uint256)");
const INITIAL_LOOKBACK_BLOCKS = 50_000;
let started = false;
let syncing = false;

export function startIncomingTransferSync() {
  if (started) return;
  started = true;
  void syncIncomingTransfers();
  provider.on("block", () => { void syncIncomingTransfers(); });
}

export async function syncIncomingTransfers() {
  if (syncing) return;
  syncing = true;
  try {
    const latestBlock = await provider.getBlockNumber();
    const tracked = await prisma.walletToken.findMany({ include: { wallet: true, token: true } });
    await Promise.all(tracked.map((entry) => syncWalletToken(entry, latestBlock)));
  } catch (error) {
    console.error("Incoming transfer sync failed:", error instanceof Error ? error.message : "Unknown error");
  } finally { syncing = false; }
}

async function syncWalletToken(entry: Awaited<ReturnType<typeof prisma.walletToken.findMany>>[number] & { wallet: { id: number; userId: number; address: string }; token: { id: number; address: string; symbol: string; decimals: number } }, latestBlock: number) {
  const fromBlock = entry.lastScannedBlock === null ? Math.max(0, latestBlock - INITIAL_LOOKBACK_BLOCKS) : Number(entry.lastScannedBlock) + 1;
  if (fromBlock > latestBlock) return;
  const logs = await provider.getLogs({ address: entry.token.address, topics: [transferTopic, null, zeroPadValue(entry.wallet.address, 32)], fromBlock, toBlock: latestBlock });
  for (const log of logs) {
    const parsed = transferInterface.parseLog(log);
    if (!parsed || !log.transactionHash) continue;
    const from = String(parsed.args[0]);
    const to = String(parsed.args[1]);
    const value = parsed.args[2] as bigint;
    try {
      const transaction = await prisma.transaction.create({ data: { userId: entry.wallet.userId, walletId: entry.wallet.id, tokenId: entry.token.id, direction: "RECEIVE", fromAddress: from, toAddress: to, amount: formatUnits(value, entry.token.decimals), tokenSymbol: entry.token.symbol, transactionHash: log.transactionHash, logIndex: log.index, status: "SUCCESS" } });
      publishTransaction(entry.wallet.userId, { id: transaction.id, walletId: transaction.walletId, tokenSymbol: transaction.tokenSymbol, status: "SUCCESS", hash: transaction.transactionHash, errorMessage: null });
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") continue;
      throw error;
    }
  }
  await prisma.walletToken.update({ where: { walletId_tokenId: { walletId: entry.walletId, tokenId: entry.tokenId } }, data: { lastScannedBlock: BigInt(latestBlock) } });
}
