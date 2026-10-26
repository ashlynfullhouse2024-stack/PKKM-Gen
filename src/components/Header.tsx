import React from 'react';
import { MadrasahProfile, UserAccount } from '../types';
import { 
  Building2, 
  FolderSync, 
  BookOpen, 
  FileCheck2, 
  Layers, 
  KeyRound, 
  LogOut, 
  UserCheck,
  Compass,
  HardDrive
} from 'lucide-react';

interface HeaderProps {
  profile: MadrasahProfile;
  currentUser: UserAccount | null;
  savedCount: number;
  onOpenProfile: () => void;
  onOpenGDrive: () => void;
  onOpenSaved: () => void;
  onOpenKBCGuide: () => void;
  onOpenBatch: () => void;
  onOpenSellerAccounts: () => void;
  onOpenUserFlow: () => void;
  onOpenBackup: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentUser,
  savedCount,
  onOpenProfile,
  onOpenGDrive,
  onOpenSaved,
  onOpenKBCGuide,
  onOpenBatch,
  onOpenSellerAccounts,
  onOpenUserFlow,
  onOpenBackup,
  onLogout,
}) => {
  const isSeller = currentUser?.role === 'penjual';

  return (
    <header className="bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border-b border-rose-100 print:hidden sticky top-0 z-40 font-sans">
      {/* Top Soft Ribbon */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 px-4 py-1.5 text-[11px] text-slate-600 flex flex-wrap justify-between items-center border-b border-pink-100/70">
        <div className="flex items-center space-x-2.5">
          <span className="inline-flex items-center gap-1.5 font-bold text-rose-700">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            REFERENSI INSTRUMEN PKKM
          </span>
          <span className="hidden sm:inline text-pink-300">•</span>
          <span className="hidden sm:inline text-slate-600 font-medium">
            Pedoman Bukti Fisik PKKM Tahun 2026 (205 Instrumen Lengkap)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {currentUser && (
            <div 
              className="flex items-center gap-1.5 text-slate-700"
              title={`Sedang masuk sebagai ${currentUser.namaLengkap} (${currentUser.role.replace('_', ' ')})`}
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-semibold text-slate-800">{currentUser.namaLengkap}</span>
              <span className="text-[10px] bg-white text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 capitalize font-medium shadow-2xs">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          )}
          <span className="text-pink-200">|</span>
          <button
            onClick={onLogout}
            className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Keluar dari sesi akun dan kembali ke halaman login"
          >
            <LogOut className="w-3 h-3 text-rose-500" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Madrasah Identity */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 border border-pink-200 flex items-center justify-center shrink-0 shadow-xs"
              title="Aplikasi Generator Bukti Fisik PKKM 2026 Ditjen Pendis Kemenag RI"
            >
              <span className="font-serif font-black text-white text-sm tracking-wider">PKKM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Generator Bukti Fisik PKKM</span>
                  <span className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200/80 font-mono">
                    2026
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <button
                  onClick={onOpenProfile}
                  className="font-medium text-slate-700 hover:text-rose-600 transition-colors flex items-center gap-1 group text-left cursor-pointer"
                  title="Klik untuk membuka dan menyunting identitas madrasah, kepala madrasah, dan tim penilai"
                >
                  <Building2 className="w-3.5 h-3.5 text-rose-500" />
                  <span className="underline decoration-pink-300 underline-offset-2 font-semibold">{profile.namaMadrasah}</span>
                  <span className="text-slate-500 text-[11px]">({profile.jenjang} • {profile.kabupatenKota})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons - Soft Pastel Styling */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pop-up Alur Penggunaan Button */}
            <button
              onClick={onOpenUserFlow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-all shadow-2xs cursor-pointer hover:scale-102"
              title="Buka panduan langkah demi langkah cara menggunakan aplikasi dari awal hingga selesai"
            >
              <Compass className="w-3.5 h-3.5 text-purple-600 animate-spin-slow" />
              <span>Alur Penggunaan</span>
            </button>

            {/* Show Seller accounts button ONLY for seller/admin */}
            {isSeller && (
              <button
                onClick={onOpenSellerAccounts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
                title="Kelola dan bagikan 10 username dan password untuk pembeli lynk.id"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Lisensi Pembeli (10)</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-rose-700 text-xs font-semibold border border-slate-200/80 hover:border-pink-200 transition-colors cursor-pointer"
              title="Atur identitas madrasah, kepala madrasah, dan tim penilai untuk KOP dan tanda tangan dokumen"
            >
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Profil Madrasah</span>
            </button>

            <button
              onClick={onOpenGDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 text-xs font-semibold border border-slate-200/80 hover:border-sky-200 transition-colors cursor-pointer"
              title="Kelola tautan Google Drive untuk 20 sub-folder fisik (A1-E4) dan ekspor lembar rekap untuk pengawas"
            >
              <FolderSync className="w-3.5 h-3.5 text-sky-500" />
              <span>Link Drive (A1-E4)</span>
            </button>

            <button
              onClick={onOpenBatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold border border-slate-200/80 hover:border-amber-200 transition-colors cursor-pointer"
              title="Buat paket dokumen wajib sekaligus dalam 1 klik (Paket SK Pokok, Paket KBC, dll)"
            >
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Paket Cepat</span>
            </button>

            <button
              onClick={onOpenKBCGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold border border-slate-200/80 hover:border-indigo-200 transition-colors cursor-pointer"
              title="Lihat glosarium materi Kurikulum Berbasis Cinta, Panca Cinta, Deep Learning & 7 KAIH"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Panduan KBC</span>
            </button>

            <button
              onClick={onOpenBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold border border-slate-200/80 hover:border-emerald-200 transition-colors cursor-pointer"
              title="Cadangkan (ekspor JSON) seluruh data madrasah atau pulihkan dari file cadangan sebelumnya"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cadangkan Data</span>
            </button>

            <button
              onClick={onOpenSaved}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-xs cursor-pointer"
              title="Lihat daftar semua dokumen fisik yang telah Anda generate dan simpan di aplikasi"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Arsip Saya</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-rose-600 text-[10px] flex items-center justify-center font-black">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
