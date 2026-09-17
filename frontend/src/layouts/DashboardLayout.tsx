import {
  Coins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { TransactionNotifier } from "../components/TransactionNotifier";
import { Badge } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin =
    user?.email.toLowerCase() === (import.meta.env.VITE_ADMIN_EMAIL ?? "").toLowerCase();
  const availableNav = isAdmin
    ? [...nav, { to: "/admin", icon: ShieldCheck, label: "จัดการ ERCBWT" }]
    : nav;

  const signout = async () => {
    await logout();
    toast.info("ออกจากระบบเรียบร้อยแล้ว");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[.08] bg-[#0b0e14]/90 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            className="brand-logo size-8 rounded-lg object-contain"
            alt="BlockWallet logo"
          />
          <span className="text-sm font-bold tracking-tight">BlockWallet</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="violet" dot>
            Sepolia
          </Badge>
          <button
            className="rounded-xl border border-white/10 bg-white/[.05] p-2 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400"
            onClick={() => setOpen(!open)}
            aria-label="เปิดหรือปิดเมนู"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[.08] bg-[#0b0e14] p-4 transition-transform duration-300 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              className="brand-logo size-10 rounded-xl object-contain shadow-md"
              alt="ERC BlockWallet Token logo"
            />
            <div>
              <p className="font-bold tracking-tight text-white">BlockWallet</p>
              <p className="text-[11px] text-white/40">ERCBWT · Sepolia</p>
            </div>
          </div>
          {/* Close button inside drawer for mobile */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="ปิดเมนู"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {availableNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white shadow-[inset_0_0_0_1px_rgba(167,139,250,0.2)]"
                    : "text-white/55 hover:bg-white/[.04] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-violet-400 shadow-[0_0_8px_rgb(167_139_250)]" />
                  )}
                  <Icon
                    size={18}
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-violet-300" : "text-white/40 group-hover:text-white/70"
                    }`}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="mt-auto rounded-2xl border border-white/[.08] bg-white/[.025] p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-violet-500/20 text-xs font-bold text-violet-300">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "BW"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.username}</p>
              <p className="truncate text-[11px] text-white/40">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={signout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/15 focus:outline-none"
          >
            <LogOut size={14} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 hidden items-center justify-end md:flex">
            <Badge tone="violet" dot>
              Sepolia Testnet (Chain ID: 11155111)
            </Badge>
          </div>
          <Outlet />
        </div>
      </main>

      {/* Global Transaction SSE Event Bridge */}
      <TransactionNotifier />
    </div>
  );
}
