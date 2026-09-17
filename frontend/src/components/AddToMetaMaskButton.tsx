import { WalletCards } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui";

type Token = { address: string; symbol: string; decimals: number };
type EthereumProvider = { request: (request: { method: string; params?: unknown }) => Promise<unknown> };

export function AddToMetaMaskButton({ token }: { token: Token }) {
  const [message, setMessage] = useState("");
  const addToken = async () => {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) return setMessage("ไม่พบ MetaMask — ใช้ Contract Address ด้านล่างเพิ่มด้วยตนเองได้");
    try {
      const added = await ethereum.request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: token.address, symbol: token.symbol, decimals: token.decimals, chainId: 11155111, image: `${window.location.origin}/logo.png` } } });
      setMessage(added ? "เพิ่ม Token ใน MetaMask แล้ว" : "ยังไม่ได้เพิ่ม Token — ใช้ Contract Address ด้านล่างได้");
    } catch {
      setMessage("ไม่สามารถเปิด MetaMask ได้ — ใช้ Contract Address ด้านล่างเพิ่มด้วยตนเองได้");
    }
  };

  return <div className="mt-5"><Button type="button" onClick={() => void addToken()} className="w-full"><WalletCards size={17} />เพิ่ม {token.symbol} ใน MetaMask</Button>{message && <p role="status" className="mt-3 text-xs leading-5 text-white/55">{message}</p>}</div>;
}
