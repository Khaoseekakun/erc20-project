import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { AddToMetaMaskButton } from "../components/AddToMetaMaskButton";
import { Badge, Card, CopyButton, PageHeader } from "../components/ui";

type Token = { name: string; symbol: string; decimals: number; totalSupply: string; network: string; chainId: number; standard: string; contractAddress: string; etherscanUrl: string };

export function TokenInfoPage() {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/token/info").then(({ data }) => setToken(data.token)).catch(() => setError("ไม่สามารถอ่านข้อมูลจาก Smart Contract ได้")); }, []);

  return <>
    <PageHeader eyebrow="Token information" title="ERC BlockWallet Token" detail="ข้อมูลด้านล่างอ่านโดยตรงจาก ERC-20 Smart Contract" />
    {error && <Card className="p-6 text-red-200">{error}</Card>}
    {token && <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-white/45">Token</p><h2 className="mt-1 text-2xl font-semibold">{token.name}</h2></div><Badge>{token.symbol}</Badge></div><dl className="mt-8 grid gap-5 sm:grid-cols-2"><Info label="Network" value={token.network} /><Info label="Chain ID" value={String(token.chainId)} /><Info label="Token Standard" value={token.standard} /><Info label="Decimals" value={String(token.decimals)} /><Info label="Total Supply" value={`${token.totalSupply} ${token.symbol}`} /></dl></Card>
      <Card className="p-6"><p className="text-sm text-white/45">Smart Contract Address</p><div className="mt-3 flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 p-3"><code className="min-w-0 flex-1 break-all text-sm text-white/80">{token.contractAddress}</code><CopyButton value={token.contractAddress} compact /></div><AddToMetaMaskButton token={{ address: token.contractAddress, symbol: token.symbol, decimals: token.decimals }} /><p className="mt-3 text-xs leading-5 text-white/45">หากไม่สามารถเปิด MetaMask ได้ ให้คัดลอก Contract Address นี้แล้วเพิ่ม Token ด้วยตนเอง</p><a href={token.etherscanUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200">ดูบน Sepolia Etherscan <ExternalLink size={15} /></a></Card>
    </div>}
  </>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-white/40">{label}</dt><dd className="mt-1 text-sm font-medium text-white/80">{value}</dd></div>; }
