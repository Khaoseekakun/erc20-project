import { Wallet, formatEther } from "ethers";
import { prisma } from "../config/prisma.js";
import { provider } from "../config/blockchain.js";
import { encryptPrivateKey } from "../utils/encryption.js";
import { ensureDefaultToken, listWalletTokens } from "./token.service.js";
export const WALLET_LIMIT = 3;
export async function createWalletForUser(userId) {
    const count = await prisma.wallet.count({ where: { userId } });
    if (count >= WALLET_LIMIT)
        throw Object.assign(new Error(`สร้าง Wallet ได้สูงสุด ${WALLET_LIMIT} ใบ`), { status: 400 });
    const generated = Wallet.createRandom();
    const encrypted = encryptPrivateKey(generated.privateKey);
    const wallet = await prisma.wallet.create({ data: { userId, address: generated.address, ...encrypted }, select: { id: true, address: true } });
    const defaultToken = await ensureDefaultToken();
    await prisma.walletToken.create({ data: { walletId: wallet.id, tokenId: defaultToken.id } });
    return wallet;
}
export async function getWalletDetails(userId) {
    const wallets = await prisma.wallet.findMany({ where: { userId }, select: { id: true, address: true }, orderBy: { createdAt: "asc" } });
    return Promise.all(wallets.map(async (wallet) => {
        const [eth, tokens] = await Promise.all([provider.getBalance(wallet.address), listWalletTokens(wallet.id)]);
        return { ...wallet, ethBalance: formatEther(eth), tokens };
    }));
}
