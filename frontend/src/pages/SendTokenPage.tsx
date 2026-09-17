import { Check, ChevronDown, Coins, Send, WalletCards } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "../api/axios";
import { Button, Card, ConfirmModal, Input, PageHeader } from "../components/ui";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat } from "../utils/format";

type Token = { id: number; address: string; name: string; symbol: string; decimals: number; balance: string };
type Wallet = { id: number; address: string; ethBalance: string; tokens: Token[] };
type PickOption = { value: string; title: string; detail: string; icon: ReactNode };

export function SendTokenPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const wallet = useMemo(() => wallets.find((item) => item.id === walletId) ?? null, [wallets, walletId]);
  const token = wallet?.tokens.find((item) => item.address === tokenAddress) ?? null;

  const loadWallets = async () => {
    const { data } = await api.get("/wallet");
    setWallets(data.wallets);
    setWalletId((current) => data.wallets.some((item: Wallet) => item.id === current) ? current : data.wallets[0]?.id ?? null);
  };

  useEffect(() => { void loadWallets(); }, []);
  useEffect(() => {
    if (wallet && !wallet.tokens.some((item) => item.address === tokenAddress)) setTokenAddress(wallet.tokens[0]?.address ?? "");
  }, [wallet, tokenAddress]);
  useTransactionEvents((event) => {
    if (event.status === "SUCCESS") { setMessage(`ส่ง ${event.tokenSymbol} สำเร็จ`); void loadWallets(); }
    if (event.status === "FAILED") setMessage(event.errorMessage ?? `ส่ง ${event.tokenSymbol} ไม่สำเร็จ`);
  });

  const openConfirm = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (!wallet || !token) return setMessage("กรุณาเลือก Wallet และ Token ก่อน");
    if (!/^0x[a-fA-F0-9]{40}$/.test(to) || !/^\d+(?:\.\d+)?$/.test(amount) || Number(amount) <= 0) return setMessage("กรุณากรอก Wallet Address และจำนวน Token ที่ถูกต้อง");
    setConfirm(true);
  };
  const submit = async () => {
    if (!wallet || !token) return;
    if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    setBusy(true);
    setMessage("");
    try {
      await api.post("/token/send", { walletId: wallet.id, tokenAddress: token.address, to, amount });
      setConfirm(false);
      setAmount("");
      setMessage("กำลังส่งธุรกรรมเบื้องหลัง คุณสามารถไปทำงานส่วนอื่นต่อได้");
    } catch (error: any) {
      setMessage(error.response?.data?.message ?? "ไม่สามารถส่ง Token ได้");
      setConfirm(false);
    } finally { setBusy(false); }
  };

  const walletOptions: PickOption[] = wallets.map((item, index) => ({ value: String(item.id), title: `Wallet ${index + 1}`, detail: `${item.address.slice(0, 8)}…${item.address.slice(-6)}`, icon: <WalletCards size={18} /> }));
  const tokenOptions: PickOption[] = (wallet?.tokens ?? []).map((item) => ({ value: item.address, title: item.symbol, detail: item.name, icon: <Coins size={18} /> }));
  const messageTone = message.startsWith("ส่ง") && message.endsWith("สำเร็จ") ? "bg-emerald-400/10 text-emerald-200" : message.startsWith("กำลัง") ? "bg-violet-400/10 text-violet-200" : "bg-red-400/10 text-red-200";

  return <>
    <PageHeader eyebrow="Transfer" title="ส่ง Token" detail="ระบบรับงานส่งทันที และติดตามการยืนยันบน Sepolia เบื้องหลัง" />
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <form onSubmit={openConfirm} className="space-y-5">
          <label className="block text-sm text-white/70"><span className="mb-2 block">Wallet ต้นทาง</span><TokenPicker value={walletId === null ? "" : String(walletId)} options={walletOptions} placeholder="เลือก Wallet" onChange={(value) => setWalletId(Number(value))} /></label>
          <label className="block text-sm text-white/70"><span className="mb-2 block">Token ที่ต้องการส่ง</span><TokenPicker value={tokenAddress} options={tokenOptions} placeholder="เลือก Token" disabled={!wallet} onChange={setTokenAddress} /></label>
          <label className="block text-sm text-white/70"><span className="mb-2 block">ปลายทาง Wallet Address</span><Input value={to} onChange={(event) => setTo(event.target.value)} placeholder="0x..." /></label>
          <label className="block text-sm text-white/70"><span className="mb-2 block">จำนวน {token?.symbol ?? "Token"}</span><Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="เช่น 100" /></label>
          {message && <p className={`rounded-xl p-3 text-sm ${messageTone}`}>{message}</p>}
          <Button type="submit" className="w-full"><Send size={17} />ตรวจสอบและส่ง Token</Button>
        </form>
      </Card>
      <Card className="p-5"><p className="text-sm text-white/45">ยอด Token ที่ส่งได้</p><p className="mt-3 text-2xl font-semibold">{token ? assetFormat(token.balance, token.symbol) : "—"}</p><p className="mt-3 text-sm text-white/40">หลังยืนยัน ระบบจะแจ้งผลให้ทันที แม้คุณย้ายไปหน้าอื่นแล้ว</p></Card>
    </div>
    <ConfirmModal open={confirm} title="ยืนยันการส่ง Token" onClose={() => setConfirm(false)} onConfirm={() => void submit()} busy={busy}><p className="text-sm leading-6 text-white/60">คุณกำลังจะส่ง <strong className="text-white">{amount} {token?.symbol}</strong> ไปยัง <code className="break-all text-violet-200">{to}</code> บน Sepolia Testnet</p></ConfirmModal>
  </>;
}

function TokenPicker({ value, options, placeholder, disabled = false, onChange }: { value: string; options: PickOption[]; placeholder: string; disabled?: boolean; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={root} className="relative">
    <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] px-3.5 py-3 text-left transition hover:border-violet-300/50 hover:bg-violet-400/[.04] focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-200">{selected?.icon ?? <Coins size={18} />}</span>
      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white">{selected?.title ?? placeholder}</span><span className="block truncate text-xs text-white/40">{selected?.detail ?? "เลือกจากรายการที่มี"}</span></span>
      <ChevronDown size={18} className={`shrink-0 text-white/45 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-violet-400/20 bg-[#151a25] p-1.5 shadow-2xl shadow-black/40"><div className="max-h-64 overflow-y-auto">
      {options.length === 0 ? <p className="px-3 py-4 text-sm text-white/45">ไม่มีรายการให้เลือก</p> : options.map((option) => (
        <button type="button" key={option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${option.value === value ? "bg-violet-500/20 text-white" : "text-white/70 hover:bg-white/[.07] hover:text-white"}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[.06] text-violet-200">{option.icon}</span>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{option.title}</span><span className="block truncate text-xs text-white/40">{option.detail}</span></span>
          {option.value === value && <Check size={17} className="text-violet-300" />}
        </button>
      ))}
    </div></div>}
  </div>;
}
