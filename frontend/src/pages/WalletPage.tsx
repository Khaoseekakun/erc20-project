import { CirclePlus, Download, QrCode, RefreshCw, WalletCards } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { AddToMetaMaskButton } from "../components/AddToMetaMaskButton";
import { AddressDisplay, Button, Card, CopyButton, EmptyState, Input, PageHeader } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { assetFormat, ethFormat } from "../utils/format";

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

export function WalletPage() {
  const { toast } = useToast();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [limit, setLimit] = useState(3);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/wallet");
      setWallets(data.wallets);
      setLimit(data.limit);
      setSelectedId((current) =>
        data.wallets.some((w: Wallet) => w.id === current) ? current : data.wallets[0]?.id ?? null
      );
    } catch {
      toast.error("ไม่สามารถโหลดข้อมูลกระเป๋าได้");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const wallet = useMemo(
    () => wallets.find((item) => item.id === selectedId) ?? null,
    [wallets, selectedId]
  );

  const create = async () => {
    setBusy(true);
    const toastId = toast.loading("กำลังสร้าง Ethereum Keypair และจัดเก็บด้วย AES-256-GCM...", {
      title: "กำลังสร้างกระเป๋าเงินใหม่",
    });

    try {
      await api.post("/wallet/create");
      await load();
      toast.success("สร้างกระเป๋าเงิน Ethereum ใบใหม่สำเร็จ!", {
        id: toastId,
        title: "สร้างกระเป๋าสำเร็จ",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "ไม่สามารถสร้าง Wallet ได้", {
        id: toastId,
        title: "เกิดข้อผิดพลาด",
      });
    } finally {
      setBusy(false);
    }
  };

  const importToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!wallet) return;

    setBusy(true);
    const toastId = toast.loading("กำลังตรวจสอบ Smart Contract บน Sepolia...", {
      title: "กำลังนำเข้า Token",
    });

    try {
      await api.post("/token/import", {
        walletId: wallet.id,
        contractAddress,
      });
      setContractAddress("");
      await load();
      toast.success("เพิ่ม Token ในกระเป๋าเรียบร้อยแล้ว", {
        id: toastId,
        title: "นำเข้าสำเร็จ",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "ไม่สามารถเพิ่ม Token ได้", {
        id: toastId,
        title: "นำเข้าไม่สำเร็จ",
      });
    } finally {
      setBusy(false);
    }
  };

  const downloadQr = () => {
    if (!wallet) return;
    const svg = document.getElementById("wallet-qr-code");
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `blockwallet-${wallet.address.slice(0, 8)}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          toast.success("ดาวน์โหลด QR Code สำเร็จ");
        }
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      toast.error("ไม่สามารถดาวน์โหลดรูปภาพ QR Code ได้");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="My wallets"
        title="กระเป๋าของฉัน"
        detail={`สร้างได้สูงสุด ${limit} กระเป๋าต่อบัญชี พร้อมรองรับการเพิ่มเหรียญ ERC-20 บน Sepolia Testnet`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void load()}
              title="รีเฟรชข้อมูล"
              className="px-3"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
            {wallets.length < limit && (
              <Button loading={busy} disabled={busy} onClick={() => void create()}>
                <CirclePlus size={17} />
                <span>สร้าง Wallet</span>
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Card className="h-96 skeleton" />
          <Card className="h-96 skeleton" />
        </div>
      ) : wallets.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="พร้อมสร้างกระเป๋าเงินแรกของคุณ"
            body="ระบบจะสร้าง Ethereum Keypair จริงและจัดเก็บ Private Key แบบเข้ารหัส AES-256-GCM ปลอดภัยระดับสูงสุด"
            action={
              <Button loading={busy} disabled={busy} onClick={() => void create()}>
                <WalletCards size={17} />
                <span>สร้าง Wallet ทันที</span>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Responsive horizontal wallet selector tabs */}
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {wallets.map((item, index) => {
              const isSelected = item.id === wallet?.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative min-w-44 shrink-0 rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-violet-500/50 bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent text-white shadow-lg shadow-violet-950/20"
                      : "border-white/[.08] bg-white/[.02] text-white/60 hover:border-white/20 hover:bg-white/[.04] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Wallet {index + 1}
                    </span>
                    {isSelected && (
                      <span className="size-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgb(167_139_250)]" />
                    )}
                  </div>
                  <span className="mt-2 block font-mono text-xs text-white/90 sm:text-sm">
                    {item.address.slice(0, 6)}...{item.address.slice(-4)}
                  </span>
                  <span className="mt-1 block text-xs text-white/45">
                    {ethFormat(item.ethBalance)}
                  </span>
                </button>
              );
            })}
          </div>

          {wallet && (
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* Left Column: Wallet Details & Token Balances */}
              <div className="space-y-6">
                {/* Wallet Address & Native Balance */}
                <Card className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                        Ethereum Address
                      </p>
                      <div className="mt-2">
                        <AddressDisplay address={wallet.address} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3.5 sm:min-w-44">
                      <p className="text-xs font-medium text-white/45">Sepolia ETH (ค่า Gas)</p>
                      <p className="mt-1 text-lg font-bold text-sky-300">
                        {ethFormat(wallet.ethBalance)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Tokens in Wallet */}
                <Card className="p-6">
                  <div className="flex items-center justify-between border-b border-white/[.08] pb-4">
                    <div>
                      <h3 className="font-semibold text-white">Token ในกระเป๋านี้</h3>
                      <p className="mt-0.5 text-xs text-white/45">
                        รองรับเหรียญ ERC-20 ทุกประเภทบนเครือข่าย Sepolia
                      </p>
                    </div>
                    <span className="rounded-full bg-white/[.06] px-3 py-1 text-xs font-medium text-white/70">
                      {wallet.tokens.length} Token
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {wallet.tokens.map((token) => (
                      <div
                        key={token.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/[.06] bg-white/[.02] p-4 transition hover:border-white/15 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">{token.symbol}</p>
                            <span className="text-xs text-white/40">· {token.name}</span>
                          </div>
                          <p className="mt-1 font-mono text-xs text-white/45">
                            {token.address.slice(0, 10)}...{token.address.slice(-8)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <p className="text-base font-bold tracking-tight text-white sm:text-lg">
                            {assetFormat(token.balance, token.symbol)}
                          </p>
                          <div className="w-full sm:w-auto">
                            <AddToMetaMaskButton token={token} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Import Token Form */}
                  <form onSubmit={importToken} className="mt-6 border-t border-white/[.08] pt-5">
                    <label className="block text-xs font-medium text-white/70 sm:text-sm">
                      <span className="mb-2 block">เพิ่ม Token อื่นด้วย Contract Address</span>
                      <Input
                        value={contractAddress}
                        onChange={(event) => setContractAddress(event.target.value)}
                        placeholder="0x..."
                        className="font-mono"
                      />
                    </label>
                    <Button
                      variant="secondary"
                      disabled={busy || !contractAddress.trim()}
                      type="submit"
                      className="mt-3 w-full sm:w-auto"
                    >
                      <CirclePlus size={16} />
                      <span>เพิ่ม Token ในกระเป๋า</span>
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Right Column: Functional QR Code Card */}
              <div>
                <Card className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 flex items-center gap-2">
                    <QrCode size={18} className="text-violet-400" />
                    <h3 className="font-semibold text-white">รับ Token (Receive)</h3>
                  </div>
                  <p className="text-xs text-white/45">
                    สแกน QR Code นี้ด้วยกล้องหรือแอปกระเป๋าเงินเพื่อรับสินทรัพย์
                  </p>

                  {/* Scannable High-Contrast QR Code */}
                  <div className="relative my-6 grid place-items-center rounded-2xl bg-white p-4 shadow-xl shadow-black/60">
                    <QRCodeSVG
                      id="wallet-qr-code"
                      value={wallet.address}
                      size={180}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/logo.png",
                        height: 36,
                        width: 36,
                        excavate: true,
                      }}
                    />
                  </div>

                  {/* Address & Quick Actions */}
                  <div className="w-full space-y-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-2.5">
                      <p className="font-mono text-xs break-all text-white/80 select-all">
                        {wallet.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          void navigator.clipboard.writeText(wallet.address);
                          toast.success("คัดลอก Wallet Address แล้ว");
                        }}
                        className="w-full text-xs"
                      >
                        <CopyButton value={wallet.address} compact />
                        <span>คัดลอกที่อยู่</span>
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={downloadQr}
                        className="w-full text-xs"
                        title="ดาวน์โหลด QR Code เป็นไฟล์ภาพ"
                      >
                        <Download size={15} />
                        <span>ดาวน์โหลด</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
