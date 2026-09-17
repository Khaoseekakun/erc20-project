import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { WalletPage } from "./pages/WalletPage";
import { SendTokenPage } from "./pages/SendTokenPage";
import { TokenInfoPage } from "./pages/TokenInfoPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminPage } from "./pages/AdminPage";
export default function App() { return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}><Route path="/" element={<DashboardPage />} /><Route path="/wallet" element={<WalletPage />} /><Route path="/send" element={<SendTokenPage />} /><Route path="/token" element={<TokenInfoPage />} /><Route path="/transactions" element={<TransactionsPage />} /><Route path="/admin" element={<AdminPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider></BrowserRouter>; }
