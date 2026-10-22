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
  Compass
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
  onLogout,
}) => {
  const isSeller = currentUser?.role === 'penjual';

  return (
    <header className="bg-slate-900 text-white shadow-sm border-b border-slate-800 print:hidden sticky top-0 z-40 backdrop-blur-md font-sans">
      {/* Top Subtle Ribbon */}
      <div className="bg-slate-950 px-4 py-1.5 text-[11px] text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            KEMENTERIAN AGAMA RI
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-300">
            Standar Bukti Fisik PKKM Tahun 2026 (205 Instrumen)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {currentUser && (
            <div 
              className="flex items-center gap-1.5 text-slate-300"
              title={`Sedang masuk sebagai ${currentUser.namaLengkap} (${currentUser.role.replace('_', ' ')})`}
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{currentUser.namaLengkap}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 capitalize">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          )}
          <span className="text-slate-700">|</span>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Keluar dari sesi akun dan kembali ke halaman login"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Madrasah Identity */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl bg-teal-800 border border-teal-700 flex items-center justify-center shrink-0 shadow-xs"
              title="Aplikasi Generator Bukti Fisik PKKM 2026 Ditjen Pendis Kemenag RI"
            >
              <span className="font-serif font-black text-amber-300 text-sm">PKKM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Generator Bukti Fisik PKKM</span>
                  <span className="bg-teal-900/80 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-700/60 font-mono">
                    2026
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <button
                  onClick={onOpenProfile}
                  className="font-medium text-slate-300 hover:text-teal-300 transition-colors flex items-center gap-1 group text-left cursor-pointer"
                  title="Klik untuk membuka dan menyunting identitas madrasah, kepala madrasah, dan tim penilai"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span className="underline decoration-slate-600 underline-offset-2">{profile.namaMadrasah}</span>
                  <span className="text-slate-400 text-[11px]">({profile.jenjang} • {profile.kabupatenKota})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pop-up Alur Penggunaan Button */}
            <button
              onClick={onOpenUserFlow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-900/60 hover:bg-teal-800/80 text-teal-200 text-xs font-semibold border border-teal-600/60 transition-all shadow-xs cursor-pointer"
              title="Buka panduan langkah demi langkah cara menggunakan aplikasi dari awal hingga selesai"
            >
              <Compass className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>Alur Penggunaan</span>
            </button>

            {/* Show Seller accounts button ONLY for seller/admin */}
            {isSeller && (
              <button
                onClick={onOpenSellerAccounts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 text-xs font-semibold border border-amber-700/50 transition-colors cursor-pointer"
                title="Kelola dan bagikan 10 username dan password untuk pembeli lynk.id"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Lisensi Pembeli (10)</span>
              </button>
            )}

            <button
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Atur identitas madrasah, kepala madrasah, dan tim penilai untuk KOP dan tanda tangan dokumen"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Profil Madrasah</span>
            </button>

            <button
              onClick={onOpenGDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Kelola tautan Google Drive untuk 20 sub-folder fisik (A1-E4) dan ekspor lembar rekap untuk pengawas"
            >
              <FolderSync className="w-3.5 h-3.5 text-teal-400" />
              <span>Link Drive (A1-E4)</span>
            </button>

            <button
              onClick={onOpenBatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Buat paket dokumen wajib sekaligus dalam 1 klik (Paket SK Pokok, Paket KBC, dll)"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Paket Cepat</span>
            </button>

            <button
              onClick={onOpenKBCGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Lihat glosarium materi Kurikulum Berbasis Cinta, Panca Cinta, Deep Learning & 7 KAIH"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Panduan KBC</span>
            </button>

            <button
              onClick={onOpenSaved}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-600 transition-colors ml-1 shadow-xs cursor-pointer"
              title="Lihat daftar semua dokumen fisik yang telah Anda generate dan simpan di aplikasi"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Arsip Saya</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-teal-900 text-teal-200 text-[10px] flex items-center justify-center font-bold">
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
