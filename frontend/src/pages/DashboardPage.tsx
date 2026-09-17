import { ArrowRight, RefreshCw, Send, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { AddressDisplay, Button, Card, EmptyState, PageHeader, Skeleton, TransactionStatusBadge } from "../components/ui";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat, ethFormat, thaiDate } from "../utils/format";

type Token = { id: number; address: string; symbol: string; balance: string };
type Wallet = { id: number; address: string; ethBalance: string; tokens: Token[] };
type Item = { id: number; to: string; amount: string; symbol: string; status: string; createdAt: string };

export function DashboardPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const [walletResult, txResult] = await Promise.all([api.get("/wallet"), api.get("/transactions?limit=5")]); setWallets(walletResult.data.wallets); setItems(txResult.data.items); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  useTransactionEvents(() => { void load(); });
  const balanceBySymbol = useMemo(() => wallets.flatMap((wallet) => wallet.tokens).reduce<Record<string, number>>((result, token) => ({ ...result, [token.symbol]: (result[token.symbol] ?? 0) + Number(token.balance) }), {}), [wallets]);
  const totalEth = wallets.reduce((total, wallet) => total + Number(wallet.ethBalance), 0);
  const primaryToken = Object.entries(balanceBySymbol)[0];

  return <>
    <PageHeader eyebrow="Dashboard" title="ภาพรวมกระเป๋า" detail="ยอดคงเหลือและสถานะธุรกรรมอัปเดตแบบเรียลไทม์" action={<Button onClick={() => void load()} className="bg-white/10 hover:bg-white/15"><RefreshCw size={16} />รีเฟรช</Button>} />
    {loading ? <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-36" /><Skeleton className="h-36" /></div> : wallets.length === 0 ? <Card><EmptyState title="ยังไม่มี Wallet" body="สร้าง Ethereum Wallet ของคุณเพื่อรับและส่ง Token บน Sepolia Testnet" action={<Link to="/wallet"><Button><WalletCards size={17} />สร้าง Wallet</Button></Link>} /></Card> : <>
      <div className="grid gap-4 md:grid-cols-2"><Metric label={primaryToken ? `${primaryToken[0]} Balance` : "Token Balance"} value={primaryToken ? assetFormat(String(primaryToken[1]), primaryToken[0]) : "—"} note={`${wallets.length} Wallet · รองรับหลาย Token`} accent="from-violet-500 to-indigo-500" /><Metric label="ETH Balance" value={ethFormat(String(totalEth))} note="รวม ETH สำหรับค่า Gas บน Sepolia" accent="from-blue-500 to-cyan-500" /></div>
      <Card className="mt-5 p-5"><p className="text-sm text-white/50">Wallet หลัก</p><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><AddressDisplay address={wallets[0].address} /><div className="flex gap-2"><Link to="/wallet"><Button className="bg-white/10 hover:bg-white/15">จัดการ Wallet</Button></Link><Link to="/send"><Button><Send size={16} />ส่ง Token</Button></Link></div></div></Card>
    </>}
    <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">ธุรกรรมล่าสุด</h2><Link to="/transactions" className="inline-flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200">ดูทั้งหมด <ArrowRight size={15} /></Link></div><Card>{items.length === 0 ? <EmptyState title="ยังไม่มีประวัติธุรกรรม" body="เมื่อมีการส่ง Token รายการจะแสดงที่นี่" /> : <div className="divide-y divide-white/[.07]">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium">ส่งไปยัง {item.to.slice(0, 6)}...{item.to.slice(-4)}</p><p className="mt-1 text-xs text-white/40">{thaiDate(item.createdAt)}</p></div><div className="text-right"><p className="font-medium">{assetFormat(item.amount, item.symbol)}</p><div className="mt-1"><TransactionStatusBadge status={item.status} /></div></div></div>)}</div>}</Card></section>
  </>;
}

function Metric({ label, value, note, accent }: { label: string; value: string; note: string; accent: string }) { return <Card className="relative overflow-hidden p-5"><div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} /><p className="text-sm text-white/55">{label}</p><p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-white/40">{note}</p></Card>; }
