import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";
import { Button, Card, EmptyState, PageHeader, TransactionStatusBadge } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat, shortAddress, thaiDate } from "../utils/format";

type Item = {
  id: number;
  type: "SEND" | "RECEIVE";
  from: string;
  to: string;
  amount: string;
  symbol: string;
  hash: string | null;
  status: string;
  createdAt: string;
  etherscanUrl: string | null;
  errorMessage: string | null;
};

type Response = {
  items: Item[];
  pagination: { page: number; pages: number; total?: number };
};

export function TransactionsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const { data: response } = await api.get(`/transactions?page=${page}&limit=10`);
        setData(response);
      } catch {
        toast.error("ไม่สามารถโหลดประวัติธุรกรรมได้");
      } finally {
        setLoading(false);
      }
    },
    [page, toast]
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Real-time update when an event comes through
  useTransactionEvents(() => {
    void load(true);
  });

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="ประวัติธุรกรรม"
        detail="รายการรับเข้าและส่งออกเหรียญบนเครือข่าย Sepolia อัปเดตแบบเรียลไทม์"
        action={
          <Button
            variant="secondary"
            onClick={() => void load()}
            title="รีเฟรชรายการ"
            className="w-full sm:w-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span>รีเฟรช</span>
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading && !data ? (
          <div className="p-8">
            <div className="space-y-4">
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
            </div>
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState
            title="ยังไม่มีประวัติธุรกรรม"
            body="เมื่อคุณทำการโอนหรือได้รับ Token รายการจะแสดงขึ้นที่นี่โดยอัตโนมัติ"
          />
        ) : (
          <>
            {/* Mobile View: Clean Card Layout (< 640px) */}
            <div className="divide-y divide-white/[.07] sm:hidden">
              {data?.items.map((item) => {
                const isReceive = item.type === "RECEIVE";
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`grid size-7 place-items-center rounded-lg border ${
                            isReceive
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-violet-500/30 bg-violet-500/10 text-violet-300"
                          }`}
                        >
                          {isReceive ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isReceive ? "text-emerald-300" : "text-violet-300"
                          }`}
                        >
                          {isReceive ? "รับเข้า (Receive)" : "ส่งออก (Send)"}
                        </span>
                      </div>
                      <TransactionStatusBadge status={item.status} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50">จำนวน:</span>
                      <span
                        className={`text-base font-bold ${
                          isReceive ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {isReceive ? "+" : "-"}
                        {assetFormat(item.amount, item.symbol)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white/45">{isReceive ? "จาก:" : "ไปยัง:"}</span>
                      <span className="text-white/80">
                        {shortAddress(isReceive ? item.from : item.to)}
                      </span>
                    </div>

                    {item.hash && item.etherscanUrl && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/[.05] text-xs">
                        <span className="text-white/40">Tx Hash:</span>
                        <a
                          className="inline-flex items-center gap-1 font-mono text-violet-400 hover:text-violet-300"
                          target="_blank"
                          rel="noreferrer"
                          href={item.etherscanUrl}
                        >
                          <span>{shortAddress(item.hash)}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {item.errorMessage && (
                      <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-xs text-rose-300">
                        {item.errorMessage}
                      </p>
                    )}

                    <p className="text-[11px] text-white/35">{thaiDate(item.createdAt)}</p>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Data Table (>= 640px) */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/[.08] bg-white/[.02] text-xs font-semibold uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-6 py-4">ประเภท</th>
                    <th className="px-6 py-4">Transaction Hash</th>
                    <th className="px-6 py-4">ที่อยู่คู่รายการ</th>
                    <th className="px-6 py-4">จำนวน</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4">วันเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.07]">
                  {data?.items.map((item) => {
                    const isReceive = item.type === "RECEIVE";
                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-white/[.02]"
                      >
                        <td className="px-6 py-4 font-semibold">
                          <div className="flex items-center gap-2">
                            <div
                              className={`grid size-6 place-items-center rounded-md border ${
                                isReceive
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-violet-500/30 bg-violet-500/10 text-violet-300"
                              }`}
                            >
                              {isReceive ? (
                                <ArrowDownLeft size={13} />
                              ) : (
                                <ArrowUpRight size={13} />
                              )}
                            </div>
                            <span
                              className={isReceive ? "text-emerald-300" : "text-violet-300"}
                            >
                              {isReceive ? "รับเข้า" : "ส่งออก"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.hash && item.etherscanUrl ? (
                            <a
                              className="inline-flex items-center gap-1 font-mono text-xs text-violet-400 hover:text-violet-300 hover:underline"
                              target="_blank"
                              rel="noreferrer"
                              href={item.etherscanUrl}
                            >
                              <span>{shortAddress(item.hash)}</span>
                              <ExternalLink size={13} />
                            </a>
                          ) : (
                            <span className="text-xs text-white/40">กำลังประมวลผล</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-white/75">
                          {shortAddress(isReceive ? item.from : item.to)}
                        </td>

                        <td
                          className={`px-6 py-4 font-bold ${
                            isReceive ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {isReceive ? "+" : "-"}
                          {assetFormat(item.amount, item.symbol)}
                        </td>

                        <td className="px-6 py-4">
                          <TransactionStatusBadge status={item.status} />
                          {item.errorMessage && (
                            <p className="mt-1 max-w-56 text-xs text-rose-400">
                              {item.errorMessage}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-white/45">
                          {thaiDate(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data && data.pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-white/[.08] px-5 py-4 text-sm">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 text-xs"
                >
                  <ChevronLeft size={15} />
                  <span>ก่อนหน้า</span>
                </Button>

                <span className="text-xs font-medium text-white/50 sm:text-sm">
                  หน้า {page} จากทั้งหมด {data.pagination.pages} หน้า
                </span>

                <Button
                  variant="secondary"
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 text-xs"
                >
                  <span>ถัดไป</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}
