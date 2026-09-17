import { Copy, ExternalLink, RefreshCw, Send, ShieldCheck, WalletCards } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";
import { Button, Card, CopyButton, Input, PageHeader } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { assetFormat, ethFormat, shortAddress } from "../utils/format";

type Overview = {
  deployerAddress: string;
  ethBalance: string;
  token: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    balance: string;
    contractAddress: string;
  };
};

type Transaction = {
  hash: string;
  to: string;
  amount: string;
  symbol: string;
  etherscanUrl: string;
};

export function AdminPage() {
  const { toast } = useToast();

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
      const msg =
        detail.response?.status === 403
          ? "หน้านี้สำหรับ Admin เท่านั้น"
          : detail.response?.data?.message ?? "ไม่สามารถโหลดข้อมูลผู้ดูแลได้";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function fund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setTransaction(null);

    const toastId = toast.loading(
      `กำลังแจกจ่าย ${amount} ERCBWT ไปยัง ${shortAddress(address)}...`,
      {
        title: "Admin Faucet",
      }
    );

    try {
      const response = await api.post<{ transaction: Transaction }>("/admin/fund", {
        to: address,
        amount,
      });
      setTransaction(response.data.transaction);
      setAmount("");
      toast.success("แจกจ่าย ERCBWT สำเร็จแล้ว!", {
        id: toastId,
        title: "สำเร็จ",
      });
      await load();
    } catch (error: unknown) {
      const detail = error as { response?: { data?: { message?: string } } };
      const msg = detail.response?.data?.message ?? "ไม่สามารถแจก ERCBWT ได้";
      setMessage(msg);
      toast.error(msg, {
        id: toastId,
        title: "เกิดข้อผิดพลาด",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Restricted access"
        title="คอนโซลผู้ดูแลระบบ (ERCBWT Admin)"
        detail="ตรวจสอบสถานะกระเป๋า Deployer และแจกจ่ายเหรียญ (Faucet) แก่ผู้ใช้งาน"
        action={
          <Button
            variant="secondary"
            onClick={() => void load()}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>รีเฟรช</span>
          </Button>
        }
      />

      {message && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {message}
        </div>
      )}

      {loading && !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="h-32 skeleton" />
            <Card className="h-32 skeleton" />
            <Card className="h-32 skeleton" />
          </div>
          <Card className="h-80 skeleton" />
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            {/* Admin Overview Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Deployer BWT Balance
                </p>
                <p className="mt-2 font-mono text-xl font-bold text-violet-300 sm:text-2xl">
                  {assetFormat(data.token.balance, data.token.symbol)}
                </p>
                <p className="mt-1 text-xs text-white/40">เหรียญที่สามารถแจกจ่ายได้</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Deployer Sepolia ETH
                </p>
                <p className="mt-2 font-mono text-xl font-bold text-sky-300 sm:text-2xl">
                  {ethFormat(data.ethBalance)}
                </p>
                <p className="mt-1 text-xs text-white/40">สำหรับค่าธรรมเนียม Gas ของ Faucet</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Total Supply รวม
                </p>
                <p className="mt-2 font-mono text-xl font-bold text-white sm:text-2xl">
                  {assetFormat(data.token.totalSupply, data.token.symbol)}
                </p>
                <p className="mt-1 text-xs text-white/40">จำนวนเหรียญที่ Mint ทั้งหมด</p>
              </Card>
            </div>

            {/* Deployer Address Card */}
            <Card className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-violet-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Deployer Ethereum Address
                    </p>
                  </div>
                  <code className="mt-2 block font-mono text-xs break-all text-white/80 sm:text-sm">
                    {data.deployerAddress}
                  </code>
                </div>
                <CopyButton value={data.deployerAddress} compact />
              </div>
            </Card>

            {/* Faucet Form */}
            <Card className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 border-b border-white/[.08] pb-4">
                <Send size={18} className="text-violet-400" />
                <div>
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    แจกจ่ายโทเค็น (Admin Faucet)
                  </h2>
                  <p className="text-xs text-white/45">
                    โอน ERCBWT จาก Deployer ให้ผู้ใช้โดยตรงเพื่อการทดสอบระบบ
                  </p>
                </div>
              </div>

              <form onSubmit={fund} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    ที่อยู่กระเป๋าผู้รับ (Recipient Address)
                  </label>
                  <Input
                    value={address}
                    onChange={(event) => setAddress(event.target.value.trim())}
                    placeholder="0x..."
                    required
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    จำนวนที่ต้องการแจก (ERCBWT)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="เช่น 100"
                    required
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  loading={sending}
                  disabled={sending || !address || !amount}
                  type="submit"
                  className="w-full py-3 text-base"
                >
                  <Send size={16} />
                  <span>{sending ? "กำลังโอนบนบล็อกเชน..." : "ยืนยันและแจกจ่ายเหรียญ"}</span>
                </Button>
              </form>

              {transaction && (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <p className="font-semibold text-emerald-300">แจกจ่ายเหรียญสำเร็จ!</p>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    โอน {transaction.amount} {transaction.symbol} ไปยัง {shortAddress(transaction.to)}
                  </p>
                  <a
                    href={transaction.etherscanUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-violet-300 hover:text-violet-200 hover:underline"
                  >
                    <span>ดูบน Sepolia Etherscan ({shortAddress(transaction.hash)})</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </Card>
          </div>
        )
      )}
    </>
  );
}
