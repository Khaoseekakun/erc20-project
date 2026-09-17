import { Check, Copy, Loader2, X } from "lucide-react";
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { shortAddress } from "../../utils/format";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
}

export function Button({
  className = "",
  variant = "primary",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080a0f] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 active:scale-[.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] text-white shadow-lg shadow-violet-900/25 hover:bg-right hover:-translate-y-0.5 hover:shadow-violet-600/30 focus:ring-violet-400 active:translate-y-0",
    secondary:
      "bg-white/[.06] text-white/90 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 focus:ring-white/30",
    outline:
      "border border-violet-500/40 bg-violet-500/5 text-violet-300 hover:bg-violet-500/15 hover:border-violet-400 focus:ring-violet-400",
    danger:
      "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-950/30 hover:brightness-110 focus:ring-rose-400",
    ghost:
      "bg-transparent text-white/60 hover:bg-white/[.05] hover:text-white focus:ring-white/20",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-white/10 bg-white/[.03] px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 hover:border-white/20 focus:border-violet-500 focus:bg-white/[.05] focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function Card({
  children,
  className = "",
  hoverable = false,
}: {
  children?: ReactNode;
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[.08] bg-[#10141d]/90 shadow-xl shadow-black/40 backdrop-blur-sm transition-all duration-200 ${
        hoverable ? "hover:border-violet-500/30 hover:bg-[#121722] hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-2xl ${className}`} />;
}

export function Badge({
  children,
  tone = "violet",
  dot = false,
}: {
  children: ReactNode;
  tone?: "violet" | "green" | "red" | "amber";
  dot?: boolean;
}) {
  const colors = {
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    red: "border-rose-500/30 bg-rose-500/10 text-red-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  };

  const dotColors = {
    violet: "bg-violet-400",
    green: "bg-emerald-400",
    red: "bg-rose-400",
    amber: "bg-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${colors[tone]}`}
    >
      {dot && (
        <span className="relative flex size-1.5">
          <span
            className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${dotColors[tone]}`}
          />
          <span className={`relative inline-flex size-1.5 rounded-full ${dotColors[tone]}`} />
        </span>
      )}
      {children}
    </span>
  );
}

export function CopyButton({
  value,
  compact = false,
  onCopied,
}: {
  value: string;
  compact?: boolean;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      aria-label="คัดลอก Wallet Address"
      title={copied ? "คัดลอกแล้ว!" : "คัดลอก"}
      className="inline-flex items-center justify-center rounded-lg p-2 text-white/50 transition-all hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-400"
    >
      {copied ? (
        <Check size={16} className="text-emerald-400 transition-transform animate-in zoom-in" />
      ) : (
        <Copy size={16} />
      )}
      {!compact && <span className="sr-only">คัดลอก</span>}
    </button>
  );
}

export function AddressDisplay({ address }: { address: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 transition hover:border-white/20">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-white/80 sm:text-sm">
        {shortAddress(address)}
      </code>
      <CopyButton value={address} compact />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.2em] text-violet-400">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {detail && <p className="mt-1.5 text-xs text-white/50 sm:text-sm">{detail}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-xl text-violet-300 shadow-inner">
        ◈
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-white/50 sm:text-sm">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md transition-opacity"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md animate-[modal-in_.2s_ease-out] rounded-2xl border border-white/10 bg-[#141923] p-6 shadow-2xl shadow-black/80"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/[.08] pb-3">
          <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
          <button
            aria-label="ปิด"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-sm text-white/80">{children}</div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/[.08] pt-4">
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button loading={busy} disabled={busy} onClick={onConfirm}>
            {busy ? "กำลังดำเนินการ..." : "ยืนยัน"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TransactionStatusBadge({ status }: { status: string }) {
  const tone = status === "SUCCESS" ? "green" : status === "FAILED" ? "red" : "amber";
  const label =
    status === "SUCCESS" ? "สำเร็จ" : status === "FAILED" ? "ล้มเหลว" : "กำลังดำเนินการ";
  return (
    <Badge tone={tone} dot={status === "PENDING"}>
      {label}
    </Badge>
  );
}
