import { Contract, Wallet, ZeroAddress, getAddress, isAddress, parseUnits } from "ethers";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { erc20Abi, provider } from "../config/blockchain.js";
import { blockchainMessage } from "../utils/blockchainErrors.js";
import { decryptPrivateKey } from "../utils/encryption.js";
import { publishTransaction } from "./transaction-events.service.js";

type SendInput = { walletId: number; tokenAddress: string; to: string; amount: string };

export async function sendToken(userId: number, input: SendInput) {
  if (!isAddress(input.to) || getAddress(input.to) === ZeroAddress) throw Object.assign(new Error("Wallet Address ไม่ถูกต้อง"), { status: 400 });
  if (!isAddress(input.tokenAddress)) throw Object.assign(new Error("Token Contract Address ไม่ถูกต้อง"), { status: 400 });

  const wallet = await prisma.wallet.findFirst({ where: { id: input.walletId, userId }, include: { tokens: { include: { token: true } } } });
  if (!wallet) throw Object.assign(new Error("ไม่พบ Wallet ที่เลือก"), { status: 404 });
  const tokenAddress = getAddress(input.tokenAddress);
  const walletToken = wallet.tokens.find(({ token }) => token.address.toLowerCase() === tokenAddress.toLowerCase());
  if (!walletToken) throw Object.assign(new Error("Token นี้ยังไม่ได้เพิ่มใน Wallet ที่เลือก"), { status: 400 });

  let units: bigint;
  try { units = parseUnits(input.amount, walletToken.token.decimals); } catch { throw Object.assign(new Error(`จำนวนเงินรองรับทศนิยมได้สูงสุด ${walletToken.token.decimals} ตำแหน่ง`), { status: 400 }); }
  if (units <= 0n) throw Object.assign(new Error("จำนวน Token ต้องมากกว่า 0"), { status: 400 });
  const [tokenBalance, ethBalance] = await Promise.all([
    new Contract(tokenAddress, erc20Abi, provider).balanceOf(wallet.address),
    provider.getBalance(wallet.address),
  ]);
  if (tokenBalance < units) throw Object.assign(new Error("ยอด Token ไม่เพียงพอ"), { status: 400 });
  if (ethBalance === 0n) throw Object.assign(new Error("Wallet ไม่มี Sepolia ETH สำหรับค่าธรรมเนียมเครือข่าย"), { status: 400 });

  const record = await prisma.transaction.create({ data: { userId, walletId: wallet.id, tokenId: walletToken.token.id, direction: "SEND", fromAddress: wallet.address, toAddress: getAddress(input.to), amount: input.amount, tokenSymbol: walletToken.token.symbol, status: "PENDING" } });
  publishTransaction(userId, { id: record.id, walletId: record.walletId, tokenSymbol: record.tokenSymbol, status: "PENDING", hash: null, errorMessage: null });
  setImmediate(() => { void broadcastTransfer(userId, record.id, wallet, walletToken.token, getAddress(input.to), units); });
  return toTransactionResponse(record);
}

async function broadcastTransfer(userId: number, transactionId: number, wallet: { id: number; address: string; encryptedPrivateKey: string; encryptionIv: string; authTag: string }, token: { id: number; address: string; symbol: string }, to: string, units: bigint) {
  try {
    const signer = new Wallet(decryptPrivateKey(wallet), provider);
    if (signer.address !== wallet.address) throw new Error("Wallet signing identity does not match stored address.");
    const contract = new Contract(token.address, erc20Abi, signer);
    const submitted = await contract.transfer(to, units);
    let record = await prisma.transaction.update({ where: { id: transactionId }, data: { transactionHash: submitted.hash } });
    publishTransaction(userId, { id: record.id, walletId: record.walletId, tokenSymbol: record.tokenSymbol, status: "PENDING", hash: record.transactionHash, errorMessage: null });
    const receipt = await submitted.wait(1);
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted");
    record = await prisma.transaction.update({ where: { id: transactionId }, data: { status: "SUCCESS" } });
    publishTransaction(userId, { id: record.id, walletId: record.walletId, tokenSymbol: record.tokenSymbol, status: "SUCCESS", hash: record.transactionHash, errorMessage: null });
  } catch (error) {
    const safeMessage = blockchainMessage(error);
    const record = await prisma.transaction.update({ where: { id: transactionId }, data: { status: "FAILED", errorMessage: safeMessage } });
    publishTransaction(userId, { id: record.id, walletId: record.walletId, tokenSymbol: record.tokenSymbol, status: "FAILED", hash: record.transactionHash, errorMessage: safeMessage });
  }
}

function toTransactionResponse(record: { id: number; walletId: number | null; amount: string; tokenSymbol: string; toAddress: string; transactionHash: string | null; status: string }) {
  return { id: record.id, walletId: record.walletId, hash: record.transactionHash, status: record.status, amount: record.amount, symbol: record.tokenSymbol, to: record.toAddress, etherscanUrl: record.transactionHash ? `${env.etherscanBaseUrl}/tx/${record.transactionHash}` : null };
}

export async function transactionHistory(userId: number, page: number, limit: number) {
  const [items, total] = await Promise.all([prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }), prisma.transaction.count({ where: { userId } })]);
  return { items: items.map((item) => ({ id: item.id, walletId: item.walletId, type: item.direction, from: item.fromAddress, to: item.toAddress, amount: item.amount, symbol: item.tokenSymbol, hash: item.transactionHash, status: item.status, errorMessage: item.errorMessage, createdAt: item.createdAt.toISOString(), etherscanUrl: item.transactionHash ? `${env.etherscanBaseUrl}/tx/${item.transactionHash}` : null })), pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
}
