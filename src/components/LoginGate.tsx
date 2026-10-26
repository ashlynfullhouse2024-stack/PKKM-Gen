import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, User, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginGateProps {
  accounts: UserAccount[];
  onLoginSuccess: (user: UserAccount, token?: string) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  accounts,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Attempt Server-Side Login & Token Generation
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('pkkm_session_token', data.token);
        }
        if (data.user) {
          setIsSubmitting(false);
          onLoginSuccess(data.user, data.token);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.error) {
          setErrorMessage(errData.error);
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // If server fetch fails (e.g. network/offline), fallback to local account check
      console.warn('Server auth unreachable, evaluating client credentials');
    }

    // 2. Client-side fallback check
    const match = accounts.find(
      (acc) =>
        acc.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        (acc.password === password || !acc.password)
    );

    setIsSubmitting(false);

    if (match) {
      if (!match.statusAktif) {
        setErrorMessage('Akun lisensi ini berstatus non-aktif. Silakan hubungi penjual.');
        return;
      }
      onLoginSuccess(match);
    } else {
      setErrorMessage('Username atau password lisensi belum terdaftar. Pastikan data akun yang Anda masukkan dari lynk.id sudah sesuai.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100/50 via-pink-50/80 to-purple-100/50 text-slate-800 flex items-center justify-center p-4 selection:bg-pink-100 selection:text-rose-900 font-sans">
      <div className="w-full max-w-md">
        {/* Main Clean Pastel Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-pink-100/50 border border-pink-200/70 p-7 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 text-white shadow-md shadow-pink-200/50 mb-1">
              <span className="font-serif font-black text-lg tracking-wider">PKKM</span>
            </div>

            <div>
              <span className="inline-block text-[11px] font-extrabold text-rose-800 bg-rose-50 border border-rose-200/80 px-3 py-0.5 rounded-full mb-1">
                Portal Akses Bukti Fisik PKKM 2026
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sistem Bukti Fisik PKKM 2026
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Silakan masukkan <strong>Username</strong> dan <strong>Password</strong> lisensi yang Anda peroleh setelah menyelesaikan transaksi di <strong>lynk.id</strong>.
              </p>
            </div>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Lisensi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username lisensi Anda..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-pink-50/30 border border-pink-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Lisensi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password lisensi..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-pink-50/30 border border-pink-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-rose-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan karakter password' : 'Tampilkan karakter password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 disabled:opacity-70 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 hover:scale-101"
              title="Masuk ke aplikasi dan buka seluruh akses generator bukti fisik PKKM 2026"
            >
              <span>{isSubmitting ? 'Memverifikasi Lisensi...' : 'Buka Akses PKKM 2026'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Buyer Assurance Information Box */}
          <div className="bg-gradient-to-r from-rose-50/70 via-pink-50/60 to-purple-50/70 border border-pink-200/60 rounded-2xl p-3.5 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Akses Penuh 205 Instrumen Bukti Fisik PKKM</span>
            </div>
            <p className="text-slate-600">
              Setiap lisensi terhubung dengan mesin penyusun dokumen berbasis referensi PKKM, ekspor Word (.doc), cetak A4, dan Kurikulum Berbasis Cinta (KBC).
            </p>
          </div>

          {/* Legal Disclaimer Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[10px] text-amber-900 leading-relaxed">
            <strong>Pemberitahuan & Disclaimer:</strong> Aplikasi ini merupakan perangkat bantu digital independen berbasis materi dan referensi instrumen PKKM Kementerian Agama RI, dan bukan merupakan portal resmi yang diterbitkan atau berafiliasi langsung dengan Kementerian Agama RI.
          </div>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-[11px] text-slate-500 mt-4 leading-relaxed">
          Aplikasi Pendamping Bukti Fisik PKKM 2026 • Berbasis Referensi Instrumen PKKM Madrasah
        </p>
      </div>
    </div>
  );
};
