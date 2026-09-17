import { ArrowUpRight, Check, Coins, Fuel, Send, WalletCards } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Button, Card, ConfirmModal, Input, PageHeader } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat, ethFormat, shortAddress } from "../utils/format";

type Token = {
  id: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
};

type Wallet = {
  id: number;
  address: string;
  ethBalance: string;
  tokens: Token[];
};

export function SendTokenPage() {
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletId, setWalletId] = useState<number | null>(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const wallet = useMemo(
    () => wallets.find((item) => item.id === walletId) ?? null,
    [wallets, walletId]
  );
  const token = wallet?.tokens.find((item) => item.address === tokenAddress) ?? null;

  const loadWallets = async () => {
    try {
      const { data } = await api.get("/wallet");
      setWallets(data.wallets);
      setWalletId((current) =>
        data.wallets.some((item: Wallet) => item.id === current)
          ? current
          : data.wallets[0]?.id ?? null
      );
    } catch {
      toast.error("ไม่สามารถโหลดกระเป๋าเงินได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWallets();
  }, []);

  useEffect(() => {
    if (wallet && !wallet.tokens.some((item) => item.address === tokenAddress)) {
      setTokenAddress(wallet.tokens[0]?.address ?? "");
    }
  }, [wallet, tokenAddress]);

  // Reload wallets when transaction status updates
  useTransactionEvents((event) => {
    if (event.status === "SUCCESS") {
      void loadWallets();
    }
  });

  const handleQuickPercent = (percent: number) => {
    if (!token) return;
    const balanceNum = parseFloat(token.balance);
    if (isNaN(balanceNum) || balanceNum <= 0) return;
    const calculated = (balanceNum * (percent / 100)).toFixed(
      Math.min(token.decimals, 4)
    );
    setAmount(calculated.replace(/\.?0+$/, ""));
  };

  const openConfirm = (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet || !token) {
      toast.error("กรุณาเลือกกระเป๋าเงินและ Token ก่อน");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
      toast.error("รูปแบบ Wallet Address ปลายทางไม่ถูกต้อง");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("กรุณาระบุจำนวน Token ที่ถูกต้องและมากกว่า 0");
      return;
    }
    if (amountNum > parseFloat(token.balance)) {
      toast.error("ยอด Token คงเหลือในกระเป๋าไม่เพียงพอ");
      return;
    }
    if (parseFloat(wallet.ethBalance) <= 0) {
      toast.error("กระเป๋าไม่มี Sepolia ETH สำหรับค่าธรรมเนียมเครือข่าย (Gas)");
      return;
    }
    setConfirm(true);
  };

  const submit = async () => {
    if (!wallet || !token) return;

    setBusy(true);
    const toastId = toast.loading(
      `กำลังส่ง ${amount} ${token.symbol} ขึ้นสู่เครือข่าย Sepolia...`,
      {
        title: "กำลังประมวลผลธุรกรรม",
      }
    );

    try {
      await api.post("/token/send", {
        walletId: wallet.id,
        tokenAddress: token.address,
        to,
        amount,
      });

      setConfirm(false);
      setAmount("");
      setTo("");
      toast.info(
        "คำสั่งโอนถูกส่งเข้าบล็อกเชนแล้ว ระบบกำลังรอการยืนยันบล็อกในเบื้องหลัง...",
        {
          id: toastId,
          title: "กำลังรอยืนยันบล็อก",
          duration: 6000,
        }
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.message ?? "ไม่สามารถส่ง Token ได้";
      toast.error(errorMsg, {
        id: toastId,
        title: "การส่งล้มเหลว",
      });
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Transfer"
        title="ส่ง Token (ERC-20)"
        detail="โอนสินทรัพย์ไปยังกระเป๋า Ethereum ใดๆ บนเครือข่าย Sepolia Testnet"
      />

      {loading ? (
        <Card className="h-96 skeleton" />
      ) : wallets.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-white/60">ไม่พบกระเป๋าเงิน กรุณาสร้างกระเป๋าเงินก่อนทำรายการ</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Transfer Form Card */}
          <Card className="p-6 sm:p-8">
            <form onSubmit={openConfirm} className="space-y-6">
              {/* Wallet Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                  เลือกกระเป๋าต้นทาง (From Wallet)
                </label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {wallets.map((w, index) => (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => setWalletId(w.id)}
                      className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                        w.id === wallet?.id
                          ? "border-violet-500/50 bg-violet-500/10 text-white shadow-md shadow-violet-950/20"
                          : "border-white/10 bg-white/[.02] text-white/50 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-medium text-violet-300">
                          Wallet {index + 1}
                        </span>
                        {w.id === wallet?.id && <Check size={14} className="text-violet-400" />}
                      </div>
                      <span className="mt-1 font-mono text-xs text-white/80">
                        {shortAddress(w.address)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Token Selector */}
              {wallet && wallet.tokens.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                    เลือกเหรียญที่ต้องการส่ง (Token)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {wallet.tokens.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setTokenAddress(t.address)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          t.address === tokenAddress
                            ? "border-violet-500/50 bg-violet-500/15 text-white"
                            : "border-white/10 bg-white/[.02] text-white/50 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <Coins size={16} />
                        <span>{t.symbol}</span>
                        <span className="text-xs text-white/40">({assetFormat(t.balance, "")})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Address */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
                  ที่อยู่กระเป๋าปลายทาง (Recipient Address)
                </label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value.trim())}
                  placeholder="0x... (ความยาว 42 ตัวอักษร)"
                  required
                  className="font-mono text-sm"
                />
              </div>

              {/* Amount & Quick Fill Pills */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    จำนวนที่ต้องการส่ง (Amount)
                  </label>
                  {token && (
                    <span className="text-xs text-white/45">
                      คงเหลือ:{" "}
                      <span className="font-semibold text-white/80">
                        {assetFormat(token.balance, token.symbol)}
                      </span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    required
                    className="pr-20 font-mono text-base font-medium"
                  />
                  {token && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40">
                      {token.symbol}
                    </span>
                  )}
                </div>

                {/* Quick percentage pills */}
                <div className="mt-2.5 flex items-center gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <button
                      type="button"
                      key={percent}
                      onClick={() => handleQuickPercent(percent)}
                      className="rounded-lg border border-white/10 bg-white/[.03] px-2.5 py-1 text-xs font-medium text-white/60 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
                    >
                      {percent === 100 ? "MAX" : `${percent}%`}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full py-3 text-base">
                <Send size={17} />
                <span>ตรวจสอบและดำเนินการส่ง</span>
              </Button>
            </form>
          </Card>

          {/* Right Info Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-violet-300">
                <Fuel size={18} />
                <h3 className="text-sm font-semibold">เครือข่ายและค่า Gas</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                การทำรายการบน Sepolia Testnet จำเป็นต้องใช้ Sepolia ETH สำหรับชำระค่าธรรมเนียมธุรกรรม
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3.5">
                <p className="text-xs text-white/40">Sepolia ETH คงเหลือ</p>
                <p className="mt-1 text-base font-bold text-sky-300">
                  {wallet ? ethFormat(wallet.ethBalance) : "0.00 ETH"}
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-white">ความปลอดภัย Custodial</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Private Key ของคุณได้รับการเข้ารหัสด้วย AES-256-GCM ระบบจะถอดรหัสในหน่วยความจำชั่วคราวเพื่อลงนามธุรกรรมและส่งตรงไปยังโหนด Sepolia โดยไม่มีการเก็บบันทึกรหัสผ่าน
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirm}
        busy={busy}
        title="ยืนยันการส่ง Token"
        onClose={() => setConfirm(false)}
        onConfirm={submit}
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
            <p className="text-xs text-white/50">จำนวนที่จะโอน</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {amount} {token?.symbol}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-white/[.06]">
              <span className="text-white/45">จากกระเป๋า:</span>
              <span className="font-mono text-white/80">{wallet?.address ? shortAddress(wallet.address) : ""}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[.06]">
              <span className="text-white/45">ไปยังที่อยู่:</span>
              <span className="font-mono text-white/80">{shortAddress(to)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/45">เครือข่าย:</span>
              <span className="font-medium text-violet-300">Ethereum Sepolia (11155111)</span>
            </div>
          </div>
        </div>
      </ConfirmModal>
    </>
  );
}
