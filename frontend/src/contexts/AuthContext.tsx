import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/axios";
export type User = { id: number; username: string; email: string };
type AuthValue = { user: User | null; loading: boolean; login: (user: User) => void; logout: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) { const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true); useEffect(() => { api.get("/auth/me").then(({ data }) => setUser(data.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []); return <AuthContext.Provider value={{ user, loading, login: setUser, logout: async () => { await api.post("/auth/logout"); setUser(null); } }}>{children}</AuthContext.Provider>; }
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
