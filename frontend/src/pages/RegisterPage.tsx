import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { Button, Input } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import { AuthShell, Field } from "./LoginPage";

export function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (formData.password.length < 8) {
      const msg = "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง";
      setError(msg);
      toast.error(msg);
      return;
    }

    setBusy(true);
    try {
      // Send payload to backend (no database schema changes needed!)
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success("สร้างบัญชีสำเร็จ! กรุณาเข้าสู่ระบบ");
      navigate("/login", { state: { registered: true } });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "ไม่สามารถสมัครสมาชิกได้";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="สร้างบัญชีผู้ใช้ใหม่"
      subtitle="สร้างกระเป๋า Custodial Wallet อัตโนมัติบน Sepolia Testnet เพื่อเริ่มต้นใช้งาน"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="ชื่อผู้ใช้ (Username)">
          <Input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
            placeholder="เช่น crypto_trader"
          />
        </Field>

        <Field label="อีเมล (Email)">
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
        </Field>

        <Field label="รหัสผ่าน (Password)">
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={72}
              placeholder="ความยาวอย่างน้อย 8 ตัวอักษร"
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

        <Field label="ยืนยันรหัสผ่านอีกครั้ง (Confirm Password)">
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={72}
              placeholder="กรอกรหัสผ่านเดิมซ้ำอีกครั้ง"
              className={`pr-10 ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? "border-rose-500/50 focus:border-rose-500"
                  : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white focus:outline-none"
              aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">รหัสผ่านยังไม่ตรงกัน</p>
          )}
        </Field>

        {error && (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </p>
        )}

        <Button loading={busy} disabled={busy} className="w-full py-3 text-base">
          {busy ? "กำลังสร้างบัญชี..." : "ยืนยันและสมัครสมาชิก"}
        </Button>

        <p className="pt-2 text-center text-xs text-white/50 sm:text-sm">
          มีบัญชีอยู่แล้ว?{" "}
          <Link className="font-medium text-violet-400 hover:text-violet-300 hover:underline" to="/login">
            เข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
