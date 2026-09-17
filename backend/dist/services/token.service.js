import { Contract, formatUnits, getAddress, isAddress } from "ethers";
import { env } from "../config/env.js";
import { erc20Abi, provider, readToken } from "../config/blockchain.js";
import { prisma } from "../config/prisma.js";
import { syncIncomingTransfers } from "./incoming-transfers.service.js";
export async function ensureDefaultToken() {
    const [name, symbol, decimals] = await Promise.all([readToken.name(), readToken.symbol(), readToken.decimals()]);
    return prisma.token.upsert({
        where: { address: env.contractAddress },
        update: { name, symbol, decimals: Number(decimals) },
        create: { address: env.contractAddress, name, symbol, decimals: Number(decimals) },
    });
}
export async function listWalletTokens(walletId) {
    const defaultToken = await ensureDefaultToken();
    await prisma.walletToken.upsert({ where: { walletId_tokenId: { walletId, tokenId: defaultToken.id } }, update: {}, create: { walletId, tokenId: defaultToken.id } });
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId }, select: { address: true, tokens: { include: { token: true } } } });
    if (!wallet)
        throw Object.assign(new Error("ไม่พบ Wallet"), { status: 404 });
    return Promise.all(wallet.tokens.map(async ({ token }) => {
        const contract = new Contract(token.address, erc20Abi, provider);
        const balance = await contract.balanceOf(wallet.address);
        return { id: token.id, address: token.address, name: token.name, symbol: token.symbol, decimals: token.decimals, balance: formatUnits(balance, token.decimals) };
    }));
}
export async function addTokenToWallet(userId, walletId, address) {
    const wallet = await prisma.wallet.findFirst({ where: { id: walletId, userId }, select: { id: true } });
    if (!wallet)
        throw Object.assign(new Error("ไม่พบ Wallet ที่เลือก"), { status: 404 });
    if (!isAddress(address))
        throw Object.assign(new Error("Contract Address ไม่ถูกต้อง"), { status: 400 });
    const contractAddress = getAddress(address);
    if ((await provider.getCode(contractAddress)) === "0x")
        throw Object.assign(new Error("ไม่พบ Smart Contract นี้บน Sepolia"), { status: 400 });
    try {
        const contract = new Contract(contractAddress, erc20Abi, provider);
        const [name, symbol, decimals] = await Promise.all([contract.name(), contract.symbol(), contract.decimals()]);
        const token = await prisma.token.upsert({ where: { address: contractAddress }, update: { name, symbol, decimals: Number(decimals) }, create: { address: contractAddress, name, symbol, decimals: Number(decimals) } });
        await prisma.walletToken.upsert({ where: { walletId_tokenId: { walletId, tokenId: token.id } }, update: {}, create: { walletId, tokenId: token.id } });
        void syncIncomingTransfers();
        return token;
    }
    catch (error) {
        if (typeof error === "object" && error && "status" in error)
            throw error;
        throw Object.assign(new Error("Contract นี้ไม่ใช่ ERC-20 ที่รองรับ"), { status: 400 });
    }
}
export async function getTokenInfo() {
    const [name, symbol, decimals, totalSupply] = await Promise.all([readToken.name(), readToken.symbol(), readToken.decimals(), readToken.totalSupply()]);
    return { name, symbol, decimals: Number(decimals), totalSupply: formatUnits(totalSupply, decimals), network: "Sepolia", chainId: 11155111, standard: "ERC-20", contractAddress: env.contractAddress, etherscanUrl: `${env.etherscanBaseUrl}/address/${env.contractAddress}` };
}
