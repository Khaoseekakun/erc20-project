import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { Button, Input } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { data } = await api.post("/auth/login", { email: form.get("email"), password: form.get("password") });
      login(data.user);
      navigate("/");
    } catch (requestError: any) { setError(requestError.response?.data?.message ?? "ไม่สามารถเข้าสู่ระบบได้"); } finally { setBusy(false); }
  };
  return <AuthShell title="ยินดีต้อนรับกลับมา" subtitle="เข้าสู่ BlockWallet เพื่อจัดการ ERCBWT บน Sepolia"><form onSubmit={submit} className="space-y-4"><Field label="อีเมล"><Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></Field><Field label="รหัสผ่าน"><Input name="password" type="password" required autoComplete="current-password" placeholder="อย่างน้อย 8 ตัวอักษร" /></Field>{error && <p className="text-sm text-red-300">{error}</p>}<Button disabled={busy} className="w-full">{busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Button><p className="text-center text-sm text-white/45">ยังไม่มีบัญชี? <Link className="text-violet-300 hover:text-violet-200" to="/register">สมัครสมาชิก</Link></p></form></AuthShell>;
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="grid min-h-screen place-items-center bg-[#080a0f] px-5 text-white"><section className="w-full max-w-md animate-[modal-in_.3s_ease-out] rounded-3xl border border-white/10 bg-[#10141d] p-7 shadow-2xl sm:p-9"><div className="mb-8 text-center"><img src="/logo.png" className="brand-logo mx-auto mb-5 size-16 rounded-2xl object-contain" alt="ERC BlockWallet Token logo" /><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm leading-6 text-white/50">{subtitle}</p></div>{children}</section></main>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm text-white/70"><span className="mb-2 block">{label}</span>{children}</label>; }
