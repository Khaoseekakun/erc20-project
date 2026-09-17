import { Coins, History, LayoutDashboard, LogOut, Menu, Send, ShieldCheck, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { TransactionNotifier } from "../components/TransactionNotifier";
import { Badge } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

const nav = [
  { to: "/", icon: LayoutDashboard, label: "ภาพรวม" },
  { to: "/wallet", icon: WalletCards, label: "กระเป๋าของฉัน" },
  { to: "/send", icon: Send, label: "ส่ง Token" },
  { to: "/token", icon: Coins, label: "ข้อมูล Token" },
  { to: "/transactions", icon: History, label: "ประวัติธุรกรรม" },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL ?? "").toLowerCase();
  const availableNav = isAdmin ? [...nav, { to: "/admin", icon: ShieldCheck, label: "จัดการ ERCBWT" }] : nav;
  const signout = async () => { await logout(); navigate("/login"); };

  return <div className="min-h-screen bg-[#080a0f] text-white">
    <button className="fixed right-4 top-4 z-40 rounded-xl border border-white/10 bg-[#10141d] p-2 text-white transition hover:border-violet-300/40 hover:bg-white/[.08] focus:outline-none focus:ring-2 focus:ring-violet-400 md:hidden" onClick={() => setOpen(!open)} aria-label="เปิดหรือปิดเมนู">{open ? <X /> : <Menu />}</button>
    <aside className={`fixed inset-y-0 z-30 flex w-64 flex-col border-r border-white/[.07] bg-[#0b0e14] p-4 transition-transform duration-300 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-9 flex items-center gap-3 px-2 pt-2"><img src="/logo.png" className="brand-logo size-11 rounded-xl object-contain" alt="ERC BlockWallet Token logo" /><div><p className="font-semibold tracking-tight">ERC BlockWallet</p><p className="text-xs text-white/40">ERCBWT · Sepolia</p></div></div>
      <nav className="space-y-1">{availableNav.map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/70 ${isActive ? "bg-violet-500/15 text-violet-200 shadow-[inset_0_0_0_1px_rgb(167_139_250_/_0.12)]" : "text-white/55 hover:bg-white/[.045] hover:pl-4 hover:text-white"}`}><Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />{label}</NavLink>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/[.07] bg-white/[.025] p-3"><p className="truncate text-sm font-medium">{user?.username}</p><p className="truncate text-xs text-white/40">{user?.email}</p><button onClick={signout} className="mt-3 flex items-center gap-2 text-sm text-white/55 transition hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-violet-400"><LogOut size={16} />ออกจากระบบ</button></div>
    </aside>
    <main className="min-h-screen md:ml-64"><div className="mx-auto max-w-6xl px-5 py-7 pt-20 md:px-9 md:pt-9"><div className="mb-8 flex justify-end"><Badge tone="violet">● Sepolia Testnet</Badge></div><Outlet /></div></main>
    <TransactionNotifier />
  </div>;
}
