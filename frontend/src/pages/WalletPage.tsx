import { CirclePlus, QrCode, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { AddToMetaMaskButton } from "../components/AddToMetaMaskButton";
import { AddressDisplay, Button, Card, EmptyState, Input, PageHeader } from "../components/ui";
import { assetFormat, ethFormat } from "../utils/format";

type Token = { id: number; address: string; name: string; symbol: string; decimals: number; balance: string };
type Wallet = { id: number; address: string; ethBalance: string; tokens: Token[] };

export function WalletPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [limit, setLimit] = useState(3);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data } = await api.get("/wallet");
    setWallets(data.wallets);
    setLimit(data.limit);
    setSelectedId((current) => data.wallets.some((wallet: Wallet) => wallet.id === current) ? current : data.wallets[0]?.id ?? null);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const wallet = useMemo(() => wallets.find((item) => item.id === selectedId) ?? null, [wallets, selectedId]);

  const create = async () => {
    setBusy(true); setMessage("");
    try { await api.post("/wallet/create"); await load(); } catch (error: any) { setMessage(error.response?.data?.message ?? "ไม่สามารถสร้าง Wallet ได้"); } finally { setBusy(false); }
  };
  const importToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet) return;
    setBusy(true); setMessage("");
    try { await api.post("/token/import", { walletId: wallet.id, contractAddress }); setContractAddress(""); await load(); setMessage("เพิ่ม Token ใน Wallet แล้ว"); } catch (error: any) { setMessage(error.response?.data?.message ?? "ไม่สามารถเพิ่ม Token ได้"); } finally { setBusy(false); }
  };

  return <>
    <PageHeader eyebrow="My wallets" title="กระเป๋าของฉัน" detail={`สร้างได้สูงสุด ${limit} กระเป๋าต่อบัญชี และเพิ่ม ERC-20 Token ของ Sepolia ได้`} action={wallets.length < limit ? <Button disabled={busy} onClick={() => void create()}><CirclePlus size={17} />{busy ? "กำลังสร้าง..." : "สร้าง Wallet"}</Button> : undefined} />
    {message && <p className={`mb-5 rounded-xl p-3 text-sm ${message.startsWith("เพิ่ม") ? "bg-emerald-400/10 text-emerald-200" : "bg-red-400/10 text-red-200"}`}>{message}</p>}
    {wallets.length === 0 ? <Card><EmptyState title="พร้อมสร้าง Wallet ของคุณ" body="ระบบจะสร้าง Ethereum wallet จริงและเก็บ private key แบบเข้ารหัสสำหรับ Sepolia Testnet" action={<Button disabled={busy} onClick={() => void create()}><WalletCards size={17} />{busy ? "กำลังสร้าง..." : "สร้าง Wallet"}</Button>} /></Card> : <>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{wallets.map((item, index) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`min-w-36 rounded-xl border px-4 py-3 text-left text-sm transition ${item.id === wallet?.id ? "border-violet-400/50 bg-violet-500/15 text-white" : "border-white/10 bg-white/[.025] text-white/55 hover:border-white/25 hover:text-white"}`}><span className="block text-xs text-white/40">Wallet {index + 1}</span><span className="mt-1 block font-mono">{item.address.slice(0, 6)}…{item.address.slice(-4)}</span></button>)}</div>
      {wallet && <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card className="p-6"><p className="text-sm text-white/50">Wallet Address</p><div className="mt-3"><AddressDisplay address={wallet.address} /></div><div className="mt-6 rounded-xl bg-white/[.035] p-4"><p className="text-xs text-white/45">Sepolia ETH</p><p className="mt-2 text-xl font-semibold">{ethFormat(wallet.ethBalance)}</p></div></Card>
          <Card className="p-6"><div className="flex items-center justify-between gap-4"><div><p className="font-medium">Token ใน Wallet</p><p className="mt-1 text-sm text-white/45">รองรับ ERC-20 มากกว่าหนึ่งเหรียญ</p></div><span className="text-sm text-white/40">{wallet.tokens.length} Token</span></div><div className="mt-5 space-y-3">{wallet.tokens.map((token) => <div key={token.id} className="rounded-xl bg-white/[.035] p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-medium">{token.symbol}</p><p className="mt-1 text-xs text-white/40">{token.name}</p></div><p className="text-right font-semibold">{assetFormat(token.balance, token.symbol)}</p></div><AddToMetaMaskButton token={token} /></div>)}</div><form onSubmit={importToken} className="mt-6 border-t border-white/10 pt-5"><label className="text-sm text-white/65">เพิ่ม ERC-20 Token ด้วย Contract Address<Input value={contractAddress} onChange={(event) => setContractAddress(event.target.value)} placeholder="0x..." className="mt-2" /></label><Button disabled={busy || !contractAddress.trim()} type="submit" className="mt-3"><CirclePlus size={17} />เพิ่ม Token</Button></form></Card>
        </div>
        <Card className="flex min-h-80 flex-col items-center justify-center p-6 text-center"><img src="/logo.png" className="brand-logo size-28 rounded-3xl object-contain" alt="ERC BlockWallet Token logo" /><div className="mt-6 grid size-20 place-items-center rounded-2xl border border-dashed border-white/20 bg-white/[.025]"><QrCode size={34} className="text-violet-300" /></div><p className="mt-4 font-medium">รับ Token</p><p className="mt-1 text-sm text-white/45">แชร์ Wallet Address นี้เพื่อรับเหรียญ</p></Card>
      </div>}
    </>}
  </>;
}
