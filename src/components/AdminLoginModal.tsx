import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { verifyAdminLogin } from '../utils/storage';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isOpen === false) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = verifyAdminLogin(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Silakan periksa kembali akun Anda.');
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = verifyAdminLogin('admin', 'admin123');
      setIsLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Login Admin Portal
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-normal">
            Akses dashboard kontrol penuh untuk mengubah semua isi, jadwal, foto, dan data sekolah.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Login Pill */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 flex items-center justify-between gap-2">
            <div className="text-[11px] text-indigo-900">
              <span className="font-bold block">Akun Bawaan:</span>
              <span className="font-mono text-slate-600">admin / admin123</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Masuk Cepat</span>
            </button>
          </div>

          {/* Username / Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Username atau Email</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: admin atau admin@eksis.sch.id"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Kata Sandi (Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-slate-300" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Mode Admin'}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400 font-medium">
            Hanya dapat diakses oleh Pembina & Tim Pengelola Ekstrakurikuler.
          </p>
        </form>
      </div>
    </div>
  );
};
