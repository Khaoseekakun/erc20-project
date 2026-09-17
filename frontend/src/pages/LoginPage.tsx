import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { Button, Input } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registeredNotice = (location.state as { registered?: boolean })?.registered;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user);
      toast.success(`ยินดีต้อนรับกลับมา, ${data.user.username}`);
      navigate("/");
    } catch (requestError: any) {
      const msg = requestError.response?.data?.message ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="ยินดีต้อนรับกลับมา"
      subtitle="เข้าสู่ระบบ BlockWallet เพื่อจัดการ ERCBWT บน Sepolia Testnet"
    >
      {registeredNotice && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center text-xs text-emerald-300 sm:text-sm">
          สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field label="อีเมล">
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="รหัสผ่าน">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่านของคุณ"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white focus:outline-none"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {error && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </p>
        )}

        <Button loading={busy} disabled={busy} className="w-full py-3 text-base">
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>

        <p className="pt-2 text-center text-xs text-white/50 sm:text-sm">
          ยังไม่มีบัญชี?{" "}
          <Link className="font-medium text-violet-400 hover:text-violet-300 hover:underline" to="/register">
            สร้างบัญชีใหม่
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080a0f] px-4 py-8 text-white sm:px-6">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]"
      />

      <section className="relative z-10 w-full max-w-md animate-[modal-in_.28s_ease-out] rounded-3xl border border-white/[.08] bg-[#10141d]/90 p-7 shadow-2xl shadow-black/80 backdrop-blur-xl sm:p-9">
        <div className="mb-7 text-center">
          <div className="relative mx-auto mb-4 size-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 opacity-30 blur-md" />
            <img
              src="/logo.png"
              className="brand-logo relative size-16 rounded-2xl object-contain shadow-lg"
              alt="ERC BlockWallet Token logo"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 text-xs leading-relaxed text-white/50 sm:text-sm">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-white/70 sm:text-sm">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
