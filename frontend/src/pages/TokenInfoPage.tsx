import { ExternalLink, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { AddToMetaMaskButton } from "../components/AddToMetaMaskButton";
import { Badge, Card, CopyButton, PageHeader } from "../components/ui";

type Token = {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  network: string;
  chainId: number;
  standard: string;
  contractAddress: string;
  etherscanUrl: string;
};

export function TokenInfoPage() {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/token/info")
      .then(({ data }) => setToken(data.token))
      .catch(() => setError("ไม่สามารถอ่านข้อมูลจาก Smart Contract ได้"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Token specification"
        title="ERC BlockWallet Token"
        detail="ข้อมูลพารามิเตอร์ทั้งหมดอ่านโดยตรงจาก ERC-20 Smart Contract บนเครือข่าย Sepolia"
      />

      {error && (
        <Card className="border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">
          <p>{error}</p>
        </Card>
      )}

      {loading && !token && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="h-80 skeleton" />
          <Card className="h-80 skeleton" />
        </div>
      )}

      {token && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main Info Card */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  ชื่อเหรียญ (Token Name)
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{token.name}</h2>
              </div>
              <Badge tone="violet">{token.symbol}</Badge>
            </div>

            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              <Info label="บล็อกเชน (Network)" value={token.network} />
              <Info label="รหัสเครือข่าย (Chain ID)" value={String(token.chainId)} />
              <Info label="มาตรฐานสัญญา (Token Standard)" value={token.standard} />
              <Info label="ทศนิยม (Decimals)" value={String(token.decimals)} />
              <div className="sm:col-span-2">
                <Info
                  label="ปริมาณเหรียญรวม (Total Supply)"
                  value={`${token.totalSupply} ${token.symbol}`}
                  highlight
                />
              </div>
            </dl>
          </Card>

          {/* Contract Address & Integration */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-violet-400" />
                <h3 className="font-semibold text-white">Smart Contract Address</h3>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-black/40 p-3.5">
                <code className="min-w-0 flex-1 font-mono text-xs break-all text-white/80 select-all sm:text-sm">
                  {token.contractAddress}
                </code>
                <CopyButton value={token.contractAddress} compact />
              </div>

              <div className="mt-5">
                <AddToMetaMaskButton
                  token={{
                    address: token.contractAddress,
                    symbol: token.symbol,
                    decimals: token.decimals,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-white/45">
                กดปุ่มด้านบนเพื่อเพิ่ม Token เข้าสู่กระเป๋า MetaMask ได้ในคลิกเดียว หรือคัดลอก Contract Address เพื่อเพิ่มด้วยตนเอง
              </p>

              <div className="mt-6 border-t border-white/[.08] pt-4">
                <a
                  href={token.etherscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 transition hover:text-violet-300 hover:underline sm:text-sm"
                >
                  <span>ตรวจสอบสัญญานี้บน Sepolia Etherscan</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

function Info({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-4">
      <dt className="text-xs font-medium text-white/40">{label}</dt>
      <dd
        className={`mt-1 font-mono text-sm sm:text-base ${
          highlight ? "font-bold text-violet-300" : "font-semibold text-white/90"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
