import { Contract, Wallet, ZeroAddress, formatEther, formatUnits, getAddress, isAddress, parseUnits } from "ethers";
import { env } from "../config/env.js";
import { erc20Abi, provider, readToken } from "../config/blockchain.js";
import { prisma } from "../config/prisma.js";
import { blockchainMessage } from "../utils/blockchainErrors.js";
export async function adminOverview() { const deployer = new Wallet(env.deployerPrivateKey).address; const [name, symbol, decimals, supply, bwt, eth] = await Promise.all([readToken.name(), readToken.symbol(), readToken.decimals(), readToken.totalSupply(), readToken.balanceOf(deployer), provider.getBalance(deployer)]); return { deployerAddress: deployer, token: { name, symbol, decimals: Number(decimals), totalSupply: formatUnits(supply, decimals), balance: formatUnits(bwt, decimals), contractAddress: env.contractAddress }, ethBalance: formatEther(eth) }; }
export async function fundWallet(adminUserId, to, amount) { if (!isAddress(to) || getAddress(to) === ZeroAddress)
    throw Object.assign(new Error("Wallet Address ไม่ถูกต้อง"), { status: 400 }); const signer = new Wallet(env.deployerPrivateKey, provider); const decimals = await readToken.decimals(); let units; try {
    units = parseUnits(amount, decimals);
}
catch {
    throw Object.assign(new Error(`จำนวนเงินรองรับทศนิยมได้สูงสุด ${decimals} ตำแหน่ง`), { status: 400 });
} if (units <= 0n)
    throw Object.assign(new Error("จำนวน BWT ต้องมากกว่า 0"), { status: 400 }); const [balance, symbol, ethBalance] = await Promise.all([readToken.balanceOf(signer.address), readToken.symbol(), provider.getBalance(signer.address)]); if (balance < units)
    throw Object.assign(new Error("ยอด BWT ของ deployer ไม่เพียงพอ"), { status: 400 }); if (ethBalance === 0n)
    throw Object.assign(new Error("deployer ไม่มี Sepolia ETH สำหรับค่า Gas"), { status: 400 }); let record = await prisma.transaction.create({ data: { userId: adminUserId, fromAddress: signer.address, toAddress: getAddress(to), amount, tokenSymbol: symbol, status: "PENDING" } }); try {
    const contract = new Contract(env.contractAddress, erc20Abi, signer);
    const tx = await contract.transfer(getAddress(to), units);
    record = await prisma.transaction.update({ where: { id: record.id }, data: { transactionHash: tx.hash } });
    const receipt = await tx.wait(1);
    if (!receipt || receipt.status !== 1)
        throw new Error("Transaction reverted");
    await prisma.transaction.update({ where: { id: record.id }, data: { status: "SUCCESS" } });
    return { hash: tx.hash, to: getAddress(to), amount, symbol, status: "SUCCESS", etherscanUrl: `${env.etherscanBaseUrl}/tx/${tx.hash}` };
}
catch (error) {
    const safeMessage = blockchainMessage(error);
    await prisma.transaction.update({ where: { id: record.id }, data: { status: "FAILED", errorMessage: safeMessage } });
    throw Object.assign(new Error(safeMessage), { status: 502, publicMessage: true });
} }
