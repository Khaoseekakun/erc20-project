import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export function ProtectedRoute({ children }: { children: React.ReactNode }) { const { user, loading } = useAuth(); if (loading) return <div className="grid min-h-screen place-items-center bg-[#080a0f] text-white/60">กำลังตรวจสอบเซสชัน...</div>; return user ? <>{children}</> : <Navigate to="/login" replace />; }
