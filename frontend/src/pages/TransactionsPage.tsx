import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/axios";
import { Card, EmptyState, PageHeader, TransactionStatusBadge } from "../components/ui";
import { useTransactionEvents } from "../hooks/useTransactionEvents";
import { assetFormat, shortAddress, thaiDate } from "../utils/format";

type Item = { id: number; type: "SEND" | "RECEIVE"; from: string; to: string; amount: string; symbol: string; hash: string | null; status: string; createdAt: string; etherscanUrl: string | null; errorMessage: string | null };
type Response = { items: Item[]; pagination: { page: number; pages: number } };

export function TransactionsPage() {
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const load = useCallback(() => { api.get(`/transactions?page=${page}&limit=10`).then(({ data: response }) => setData(response)); }, [page]);
  useEffect(() => { load(); }, [load]);
  useTransactionEvents(() => load());

  return <><PageHeader eyebrow="Activity" title="ประวัติธุรกรรม" detail="แสดงทั้งรายการส่งออกและรายการรับเข้าแบบเรียลไทม์" /><Card className="overflow-hidden">{data?.items.length === 0 ? <EmptyState title="ยังไม่มีประวัติธุรกรรม" body="เมื่อมีการรับหรือส่ง Token รายการจะแสดงที่นี่" /> : <><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-white/[.07] bg-white/[.025] text-xs uppercase tracking-wider text-white/40"><tr><th className="px-5 py-4">ประเภท</th><th className="px-5 py-4">ธุรกรรม</th><th className="px-5 py-4">คู่รายการ</th><th className="px-5 py-4">จำนวน</th><th className="px-5 py-4">สถานะ</th><th className="px-5 py-4">เวลา</th></tr></thead><tbody className="divide-y divide-white/[.07]">{data?.items.map((item) => <tr key={item.id}><td className={`px-5 py-4 font-medium ${item.type === "RECEIVE" ? "text-emerald-300" : "text-violet-300"}`}>{item.type === "RECEIVE" ? "รับเข้า" : "ส่งออก"}</td><td className="px-5 py-4">{item.hash && item.etherscanUrl ? <a className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200" target="_blank" rel="noreferrer" href={item.etherscanUrl}>{shortAddress(item.hash)} <ExternalLink size={14} /></a> : <span className="text-white/40">กำลัง broadcast</span>}</td><td className="px-5 py-4 font-mono text-white/70">{shortAddress(item.type === "RECEIVE" ? item.from : item.to)}</td><td className="px-5 py-4 font-medium">{assetFormat(item.amount, item.symbol)}</td><td className="px-5 py-4"><TransactionStatusBadge status={item.status} />{item.errorMessage && <p className="mt-1 max-w-52 text-xs text-red-300">{item.errorMessage}</p>}</td><td className="px-5 py-4 text-white/45">{thaiDate(item.createdAt)}</td></tr>)}</tbody></table></div>{data && data.pagination.pages > 1 && <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-4 text-sm"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="disabled:opacity-30">ก่อนหน้า</button><span className="text-white/50">หน้า {page} / {data.pagination.pages}</span><button disabled={page === data.pagination.pages} onClick={() => setPage(page + 1)} className="disabled:opacity-30">ถัดไป</button></div>}</>}</Card></>;
}
