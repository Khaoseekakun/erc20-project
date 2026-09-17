import { CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ToastType = "loading" | "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastOptions {
  id?: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  updateToast: (id: string, updates: Partial<Omit<ToastItem, "id">>) => void;
  dismissToast: (id: string) => void;
  toast: {
    loading: (message: string, options?: ToastOptions) => string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
    update: (id: string, updates: Partial<Omit<ToastItem, "id">>) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    if (timeoutsRef.current.has(id)) {
      window.clearTimeout(timeoutsRef.current.get(id));
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration = 4500) => {
      if (timeoutsRef.current.has(id)) {
        window.clearTimeout(timeoutsRef.current.get(id));
      }
      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, duration);
      timeoutsRef.current.set(id, timer);
    },
    [dismissToast]
  );

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = options?.id ?? `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duration = options?.duration ?? (type === "loading" ? 0 : 5000);

      setToasts((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, { id, type, message, title: options?.title, duration }];
      });

      if (type !== "loading" && duration > 0) {
        scheduleDismiss(id, duration);
      }

      return id;
    },
    [scheduleDismiss]
  );

  const updateToast = useCallback(
    (id: string, updates: Partial<Omit<ToastItem, "id">>) => {
      setToasts((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextType = updates.type ?? item.type;
            const nextDuration = updates.duration ?? (nextType === "loading" ? 0 : 5000);
            return {
              ...item,
              ...updates,
              duration: nextDuration,
            };
          }
          return item;
        })
      );

      const targetType = updates.type;
      if (targetType && targetType !== "loading") {
        scheduleDismiss(id, updates.duration ?? 5000);
      }
    },
    [scheduleDismiss]
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
      timeoutsRef.current.clear();
    };
  }, []);

  const toastMethods = {
    loading: (message: string, options?: ToastOptions) => showToast("loading", message, options),
    success: (message: string, options?: ToastOptions) => showToast("success", message, options),
    error: (message: string, options?: ToastOptions) => showToast("error", message, options),
    info: (message: string, options?: ToastOptions) => showToast("info", message, options),
    update: updateToast,
    dismiss: dismissToast,
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        updateToast,
        dismissToast,
        toast: toastMethods,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6 sm:w-96"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isLoading = toast.type === "loading";

  const borderColor = isLoading
    ? "border-violet-500/40"
    : isSuccess
    ? "border-emerald-500/40"
    : isError
    ? "border-rose-500/40"
    : "border-sky-500/40";

  const glowShadow = isLoading
    ? "shadow-[0_8px_24px_rgba(139,92,246,0.18)]"
    : isSuccess
    ? "shadow-[0_8px_24px_rgba(16,185,129,0.18)]"
    : isError
    ? "shadow-[0_8px_24px_rgba(244,63,94,0.18)]"
    : "shadow-[0_8px_24px_rgba(14,165,233,0.18)]";

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${borderColor} bg-[#10141d]/95 p-4 text-white backdrop-blur-md transition-all duration-300 ${glowShadow} animate-[modal-in_.22s_ease-out]`}
    >
      <div className="mt-0.5 shrink-0">
        {isLoading && <Loader2 className="animate-spin text-violet-400" size={20} />}
        {isSuccess && <CheckCircle2 className="text-emerald-400" size={20} />}
        {isError && <XCircle className="text-rose-400" size={20} />}
        {!isLoading && !isSuccess && !isError && <Info className="text-sky-400" size={20} />}
      </div>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <h4 className="text-sm font-semibold tracking-tight text-white">{toast.title}</h4>
        )}
        <p className={`text-xs leading-relaxed text-white/75 ${toast.title ? "mt-0.5" : "text-sm"}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={onDismiss}
        className="rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white focus:outline-none"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X size={16} />
      </button>
    </div>
  );
}

