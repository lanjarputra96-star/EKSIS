import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Mail,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  verifyAdminLogin,
  getAdminCredentials,
  requestForgotPasswordOTP,
  verifyResetCodeAndSetPassword,
} from '../utils/storage';
import { AdminUser } from '../types';

interface AdminLoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

type ViewMode = 'login' | 'forgot_request' | 'forgot_verify' | 'success';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen = true,
  onClose,
  onLoginSuccess,
}) => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password form state
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [currentCreds, setCurrentCreds] = useState(() => getAdminCredentials());

  useEffect(() => {
    if (isOpen) {
      setCurrentCreds(getAdminCredentials());
      setViewMode('login');
      setErrorMessage(null);
      setSuccessMessage(null);
      setPreviewOtp(null);

      // Fetch fresh server credentials
      fetch('/api/data', { cache: 'no-cache' })
        .then((res) => res.json())
        .then((json) => {
          const serverCreds = json.data?.adminCredentials || json.adminCredentials;
          if (serverCreds && serverCreds.password) {
            const merged = { ...getAdminCredentials(), ...serverCreds };
            localStorage.setItem('eksis_admin_credentials_v1', JSON.stringify(merged));
            setCurrentCreds(merged);
            if (!resetIdentifier) {
              setResetIdentifier(merged.email || 'Lanjarputra96@gmail.com');
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  if (isOpen === false) return null;

  // 1. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await verifyAdminLogin(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Silakan periksa kembali akun Anda.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Terjadi kesalahan saat memeriksa akun.');
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = async () => {
    const creds = currentCreds || getAdminCredentials();
    setUsername(creds.username);
    setPassword(creds.password);
    setErrorMessage(null);
    setIsLoading(true);

    const result = await verifyAdminLogin(creds.username, creds.password);
    setIsLoading(false);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    }
  };

  // 2. Submit Request OTP to Email
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await requestForgotPasswordOTP(resetIdentifier || currentCreds.email);
      setIsLoading(false);

      if (res.success) {
        setTargetEmail(res.targetEmail || currentCreds.email || 'Lanjarputra96@gmail.com');
        setSuccessMessage(res.message || 'Kode verifikasi telah dikirim ke email.');
        if (res.previewCode) {
          setPreviewOtp(res.previewCode);
          setOtpCode(res.previewCode); // Pre-fill for ultra smooth testing
        }
        setResendCountdown(60);
        setViewMode('forgot_verify');
      } else {
        setErrorMessage(res.message || 'Gagal mengirim kode verifikasi ke email.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server email.');
    }
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await requestForgotPasswordOTP(resetIdentifier || currentCreds.email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Kode verifikasi baru berhasil dikirimkan!');
        if (res.previewCode) {
          setPreviewOtp(res.previewCode);
          setOtpCode(res.previewCode);
        }
        setResendCountdown(60);
      } else {
        setErrorMessage(res.message || 'Gagal mengirim ulang kode.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Gagal menghubungi server.');
    }
  };

  // 4. Submit OTP & Set New Password
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Masukkan 6 digit kode verifikasi yang diterima di email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyResetCodeAndSetPassword(otpCode.trim(), newPassword);
      setIsLoading(false);

      if (res.success) {
        const updated = getAdminCredentials();
        setCurrentCreds(updated);
        setViewMode('success');
      } else {
        setErrorMessage(res.message || 'Kode verifikasi salah atau kedaluwarsa.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Terjadi kendala saat memverifikasi kode.');
    }
  };

  // 5. Automatic login with newly set password
  const handleInstantLoginAfterReset = async () => {
    setIsLoading(true);
    const creds = getAdminCredentials();
    const result = await verifyAdminLogin(creds.username, newPassword || creds.password);
    setIsLoading(false);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      onClose();
    } else {
      setViewMode('login');
      setUsername(creds.username);
      setPassword(newPassword);
    }
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
            {viewMode === 'login' && <ShieldCheck className="w-6 h-6 text-indigo-400" />}
            {viewMode === 'forgot_request' && <Mail className="w-6 h-6 text-amber-400" />}
            {viewMode === 'forgot_verify' && <KeyRound className="w-6 h-6 text-sky-400" />}
            {viewMode === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            {viewMode === 'login' && 'Login Admin Portal'}
            {viewMode === 'forgot_request' && 'Lupa Kata Sandi'}
            {viewMode === 'forgot_verify' && 'Verifikasi Email & Sandi Baru'}
            {viewMode === 'success' && 'Kata Sandi Berhasil Dipulihkan'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            {viewMode === 'login' &&
              'Akses dashboard kontrol penuh untuk mengubah semua isi, jadwal, foto, dan data sekolah.'}
            {viewMode === 'forgot_request' &&
              'Masukkan email atau username admin terdaftar. Kode OTP verifikasi akan dikirimkan ke email untuk mereset kata sandi.'}
            {viewMode === 'forgot_verify' &&
              'Periksa kotak masuk email Anda dan masukkan kode 6 digit verifikasi untuk menyimpan kata sandi baru ke Cloudflare.'}
            {viewMode === 'success' &&
              'Kata sandi admin telah diperbarui permanen di database Cloudflare D1 & server cloud.'}
          </p>
        </div>

        {/* ================= VIEW 1: NORMAL LOGIN ================= */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Login Pill / Cloudflare Sync Status */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 flex items-center justify-between gap-2">
              <div className="text-[11px] text-indigo-900">
                <span className="font-bold block">Status Akun Admin:</span>
                <span className="font-mono text-slate-600">
                  {currentCreds.password === 'admin123'
                    ? 'Bawaan: admin / admin123'
                    : 'Sandi Baru Aktif (Cloudflare D1)'}
                </span>
              </div>
              {currentCreds.password === 'admin123' ? (
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Masuk Cepat</span>
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                  Tersinkron Lintas Perangkat
                </span>
              )}
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kata Sandi (Password)</span>
                </label>
                {/* Lupa Kata Sandi Link */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setResetIdentifier(currentCreds.email || 'Lanjarputra96@gmail.com');
                    setViewMode('forgot_request');
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                >
                  Lupa Password?
                </button>
              </div>

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

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Database Cloudflare D1 Aktif</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setResetIdentifier(currentCreds.email || 'Lanjarputra96@gmail.com');
                  setViewMode('forgot_request');
                }}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Pulihkan Akun Lewat Email
              </button>
            </div>
          </form>
        )}

        {/* ================= VIEW 2: FORGOT PASSWORD REQUEST ================= */}
        {viewMode === 'forgot_request' && (
          <form onSubmit={handleRequestOtpSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Verifikasi Email Terdaftar</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                Sistem akan mengirimkan kode 6 digit ke alamat email pengelola sekolah untuk memverifikasi bahwa Anda adalah admin resmi portal.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Pemulihan atau Username Admin</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Lanjarputra96@gmail.com atau admin"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <span className="text-[10px] text-slate-400 block">
                Email terdaftar: <strong className="text-slate-600">{currentCreds.email || 'Lanjarputra96@gmail.com'}</strong>
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Mengirim Kode ke Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-indigo-200" />
                    <span>Kirim Kode Verifikasi ke Email</span>
                    <ArrowRight className="w-4 h-4 text-indigo-200" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setViewMode('login');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= VIEW 3: VERIFY OTP & SET NEW PASSWORD ================= */}
        {viewMode === 'forgot_verify' && (
          <form onSubmit={handleVerifyOtpSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Simulated / Instant Preview Banner for Testing Convenience */}
            {previewOtp && (
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 flex items-center justify-between gap-2">
                <div className="text-[11px]">
                  <span className="font-bold text-sky-900 block">Kode Verifikasi OTP:</span>
                  <span className="font-mono text-base font-extrabold tracking-widest text-indigo-700">
                    {previewOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(previewOtp)}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  Gunakan Kode
                </button>
              </div>
            )}

            {/* OTP Code Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kode Verifikasi Email (6 Digit)</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || isLoading}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0 ? `Kirim Ulang (${resendCountdown}s)` : 'Kirim Ulang Kode'}
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Contoh: 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Kata Sandi Baru</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 6 karakter..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Ulangi Kata Sandi Baru</span>
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Ketik ulang kata sandi baru..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Menyimpan ke Cloudflare...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verifikasi & Simpan Sandi Baru</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setViewMode('forgot_request');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ubah Email / Kirim Ulang</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= VIEW 4: SUCCESS RECOVERY ================= */}
        {viewMode === 'success' && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Kata Sandi Baru Berhasil Disimpan!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Akun admin Anda telah dipulihkan. Kata sandi baru telah disimpan secara permanen ke Database Cloudflare D1 & server cloud.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-bold font-mono text-slate-800">{currentCreds.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Pemulihan:</span>
                <span className="font-bold text-slate-800">{targetEmail || currentCreds.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penyimpanan:</span>
                <span className="font-semibold text-emerald-700">Cloudflare D1 (Permanen)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstantLoginAfterReset}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk ke Panel Admin Sekarang</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
