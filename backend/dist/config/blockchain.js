import { Contract, JsonRpcProvider } from "ethers";
import { env } from "./env.js";
export const erc20Abi = ["function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)", "function totalSupply() view returns (uint256)", "function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"];
export const provider = new JsonRpcProvider(env.rpcUrl);
export const readToken = new Contract(env.contractAddress, erc20Abi, provider);
export async function verifyBlockchainConfiguration() { const network = await provider.getNetwork(); if (network.chainId !== 11155111n)
    throw new Error(`Configured RPC is chain ${network.chainId}, not Sepolia (11155111).`); if ((await provider.getCode(env.contractAddress)) === "0x")
    throw new Error("Contract not found at ERC20_CONTRACT_ADDRESS on Sepolia."); }
