import { Copy, ExternalLink, LoaderCircle, RefreshCw, Send, WalletCards } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";
import { Card, PageHeader } from "../components/ui";

type Overview = {
  deployerAddress: string;
  ethBalance: string;
  token: { name: string; symbol: string; decimals: number; totalSupply: string; balance: string; contractAddress: string };
};
type Transaction = { hash: string; to: string; amount: string; symbol: string; etherscanUrl: string };
const compact = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await api.get<{ data: Overview }>("/admin/overview");
      setData(response.data.data);
    } catch (error: unknown) {
      const detail = error as { response?: { status?: number; data?: { message?: string } } };
      setMessage(detail.response?.status === 403 ? "หน้านี้สำหรับ Admin เท่านั้น" : detail.response?.data?.message ?? "ไม่สามารถโหลดข้อมูลผู้ดูแลได้");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function fund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setTransaction(null);
    try {
      const response = await api.post<{ transaction: Transaction }>("/admin/fund", { to: address, amount });
      setTransaction(response.data.transaction);
      setAmount("");
      await load();
    } catch (error: unknown) {
      const detail = error as { response?: { data?: { message?: string } } };
      setMessage(detail.response?.data?.message ?? "ไม่สามารถแจก ERCBWT ได้");
    } finally { setSending(false); }
  }

  const copy = (value: string) => { void navigator.clipboard.writeText(value); };

  return <>
    <PageHeader
      eyebrow="Restricted access"
      title="ERCBWT Management Console"
      action={<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-sm text-white/70 hover:bg-white/10"><RefreshCw size={16} />รีเฟรช</button>}
    />
    {loading ? (
      <div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-2xl bg-white/5" /><div className="h-32 animate-pulse rounded-2xl bg-white/5" /><div className="h-32 animate-pulse rounded-2xl bg-white/5" /></div>
    ) : data ? <>
      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Deployer ERCBWT Balance" value={`${data.token.balance} ${data.token.symbol}`} detail="ยอดที่ใช้แจกให้ผู้ใช้" />
        <Stat label="Deployer Sepolia ETH" value={`${data.ethBalance} ETH`} detail="ใช้จ่ายค่า Gas สำหรับการแจก" />
        <Stat label="Total Supply" value={`${data.token.totalSupply} ${data.token.symbol}`} detail={`${data.token.name} · ${data.token.decimals} decimals`} />
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <p className="text-sm font-medium text-white/70">แจก ERCBWT ให้ Wallet</p>
          <p className="mt-1 text-sm text-white/40">ธุรกรรมจะลงนามที่ backend และรอ 1 confirmation บน Sepolia</p>
          <form onSubmit={fund} className="mt-6 space-y-4">
            <label className="block text-sm text-white/70">Recipient Wallet Address<input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="0x..." className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-3 text-white outline-none placeholder:text-white/30 focus:border-violet-400" /></label>
            <label className="block text-sm text-white/70">จำนวน ERCBWT<input required value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="1000" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-3 text-white outline-none placeholder:text-white/30 focus:border-violet-400" /></label>
            <button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 font-semibold disabled:opacity-60">{sending ? <><LoaderCircle className="animate-spin" size={17} />กำลังส่งบน Sepolia...</> : <><Send size={17} />แจก ERCBWT</>}</button>
          </form>
          {message && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{message}</p>}
          {transaction && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm"><p className="font-medium text-emerald-200">แจก ERCBWT สำเร็จ</p><p className="mt-1 text-white/65">{transaction.amount} {transaction.symbol} → {compact(transaction.to)}</p><a href={transaction.etherscanUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">เปิดบน Etherscan <ExternalLink size={14} /></a></div>}
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-white/80"><WalletCards size={18} /><p className="font-medium">Deployer Wallet</p></div>
          <Address label="Address" value={data.deployerAddress} onCopy={copy} />
          <Address label="ERC-20 Contract" value={data.token.contractAddress} onCopy={copy} />
        </Card>
      </section>
    </> : <Card className="p-6 text-red-200">{message || "ไม่สามารถโหลดหน้า Admin ได้"}</Card>}
  </>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <Card className="p-5"><p className="text-sm text-white/50">{label}</p><p className="mt-3 break-all text-2xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-white/40">{detail}</p></Card>;
}

function Address({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string) => void }) {
  return <div className="mt-5"><p className="text-xs text-white/40">{label}</p><div className="mt-1 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2"><code className="text-sm text-white/75">{compact(value)}</code><button onClick={() => onCopy(value)} aria-label={`คัดลอก ${label}`} className="p-2 text-white/50 hover:text-white"><Copy size={16} /></button></div></div>;
}
