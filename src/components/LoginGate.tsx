import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginGateProps {
  accounts: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  accounts,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const match = accounts.find(
      (acc) =>
        acc.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        acc.password === password
    );

    if (match) {
      if (!match.statusAktif) {
        setErrorMessage('Akun lisensi ini berstatus non-aktif. Silakan hubungi penjual.');
        return;
      }
      onLoginSuccess(match);
    } else {
      setErrorMessage('Username atau password salah. Pastikan data akun yang Anda masukkan dari lynk.id sudah sesuai.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex items-center justify-center p-4 selection:bg-teal-100 selection:text-teal-900 font-sans">
      <div className="w-full max-w-md">
        {/* Main Clean Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-800 text-teal-100 shadow-sm mb-1">
              <span className="font-serif font-black text-base text-amber-300">PKKM</span>
            </div>

            <div>
              <span className="inline-block text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-full mb-1">
                Portal Lisensi Resmi 2026
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Sistem Bukti Fisik PKKM 2026
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Silakan masukkan <strong>Username</strong> dan <strong>Password</strong> lisensi yang Anda peroleh setelah menyelesaikan checkout di <strong>lynk.id</strong>.
              </p>
            </div>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Lisensi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username lisensi Anda..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password lisensi..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Buka Akses PKKM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Buyer Assurance Information Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Akses Penuh 205 Instrumen Fisik PKKM</span>
            </div>
            <p className="text-slate-500">
              Setiap lisensi pembeli langsung terhubung dengan mesin AI Gemini untuk generate dokumen, ekspor Word (.doc), cetak A4, dan Kurikulum Berbasis Cinta (KBC).
            </p>
          </div>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Penilaian Kinerja Kepala Madrasah (PKKM) 2026 • Kementerian Agama RI
        </p>
      </div>
    </div>
  );
};
