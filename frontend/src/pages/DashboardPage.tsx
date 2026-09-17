import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Send,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import {
  AddressDisplay,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  TransactionStatusBadge,
} from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat, ethFormat, thaiDate } from "../utils/format";

type Token = { id: number; address: string; symbol: string; balance: string };
type Wallet = { id: number; address: string; ethBalance: string; tokens: Token[] };
type Item = {
  id: number;
  type?: "SEND" | "RECEIVE";
  from?: string;
  to: string;
  amount: string;
  symbol: string;
  status: string;
  createdAt: string;
};

export function DashboardPage() {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (showToastNotice = false) => {
      if (showToastNotice) setRefreshing(true);
      try {
        const [walletResult, txResult] = await Promise.all([
          api.get("/wallet"),
          api.get("/transactions?limit=5"),
        ]);
        setWallets(walletResult.data.wallets);
        setItems(txResult.data.items);
        if (showToastNotice) toast.success("อัปเดตข้อมูลล่าสุดเรียบร้อยแล้ว");
      } catch {
        if (showToastNotice) toast.error("ไม่สามารถรีเฟรชข้อมูลได้");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Reload when a transaction event occurs
  useTransactionEvents(() => {
    void load();
  });

  const balanceBySymbol = useMemo(
    () =>
      wallets
        .flatMap((wallet) => wallet.tokens)
        .reduce<Record<string, number>>(
          (result, token) => ({
            ...result,
            [token.symbol]: (result[token.symbol] ?? 0) + Number(token.balance),
          }),
          {}
        ),
    [wallets]
  );

  const totalEth = wallets.reduce((total, wallet) => total + Number(wallet.ethBalance), 0);
  const primaryToken = Object.entries(balanceBySymbol)[0];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="ภาพรวมกระเป๋า"
        detail="ยอดคงเหลือและสถานะธุรกรรมเชื่อมโยงบล็อกเชนแบบเรียลไทม์"
        action={
          <Button
            variant="secondary"
            loading={refreshing}
            onClick={() => void load(true)}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span>รีเฟรชข้อมูล</span>
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="h-28" />
          <Skeleton className="h-64" />
        </div>
      ) : wallets.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="ยังไม่มีกระเป๋าเงินในระบบ"
            body="เริ่มต้นสร้าง Ethereum Wallet ของคุณเพื่อรับและส่ง Token บน Sepolia Testnet"
            action={
              <Link to="/wallet">
                <Button>
                  <WalletCards size={17} />
                  <span>สร้าง Wallet แรกของคุณ</span>
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric
              label={primaryToken ? `${primaryToken[0]} Balance` : "Token Balance"}
              value={primaryToken ? assetFormat(String(primaryToken[1]), primaryToken[0]) : "0.00"}
              note={`${wallets.length} กระเป๋า · รองรับ Multi-Token`}
              accent="from-violet-500 via-purple-500 to-indigo-500"
            />
            <Metric
              label="Sepolia ETH Balance"
              value={ethFormat(String(totalEth))}
              note="ยอดรวม ETH สำหรับจ่ายค่า Gas บน Sepolia"
              accent="from-blue-500 via-cyan-500 to-teal-500"
            />
          </div>

          {/* Primary Wallet Quick Card */}
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153)]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    กระเป๋าเงินหลัก (Primary Wallet)
                  </p>
                </div>
                <div className="mt-2.5">
                  <AddressDisplay address={wallets[0].address} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                <Link to="/wallet" className="flex-1 sm:flex-initial">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    <WalletCards size={16} />
                    <span>จัดการ Wallet</span>
                  </Button>
                </Link>
                <Link to="/send" className="flex-1 sm:flex-initial">
                  <Button className="w-full sm:w-auto">
                    <Send size={16} />
                    <span>ส่ง Token</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Recent Transactions Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
                ธุรกรรมล่าสุด (Recent Activity)
              </h2>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 sm:text-sm"
              >
                <span>ดูประวัติทั้งหมด</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <Card className="overflow-hidden">
              {items.length === 0 ? (
                <EmptyState
                  title="ยังไม่มีประวัติธุรกรรม"
                  body="เมื่อคุณทำการโอนหรือรับเหรียญบนเครือข่าย Sepolia รายการจะแสดงที่นี่แบบเรียลไทม์"
                />
              ) : (
                <div className="divide-y divide-white/[.07]">
                  {items.map((item) => {
                    const isReceive = item.type === "RECEIVE";
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 p-4 transition-colors hover:bg-white/[.02] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid size-9 shrink-0 place-items-center rounded-xl border ${
                              isReceive
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-violet-500/30 bg-violet-500/10 text-violet-300"
                            }`}
                          >
                            {isReceive ? (
                              <ArrowDownLeft size={18} />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {isReceive ? "รับ Token จาก" : "ส่ง Token ไปยัง"}{" "}
                              <span className="font-mono text-white/80">
                                {item.to.slice(0, 6)}...{item.to.slice(-4)}
                              </span>
                            </p>
                            <p className="text-xs text-white/40">{thaiDate(item.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pl-12 sm:flex-col sm:items-end sm:pl-0">
                          <p
                            className={`text-sm font-bold sm:text-base ${
                              isReceive ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {isReceive ? "+" : "-"}
                            {assetFormat(item.amount, item.symbol)}
                          </p>
                          <TransactionStatusBadge status={item.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>
        </div>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-3 font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-1.5 text-xs text-white/40">{note}</p>
    </Card>
  );
}
