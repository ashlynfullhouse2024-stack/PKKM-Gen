import React, { useState } from 'react';
import { UserAccount } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  UserPlus, 
  KeyRound, 
  LogIn, 
  Trash2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SellerAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  onAddAccount: (newAcc: UserAccount) => void;
  onSelectAccountToLogin: (acc: UserAccount) => void;
  onDeleteAccount?: (id: string) => void;
}

export const SellerAccountsModal: React.FC<SellerAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onAddAccount,
  onSelectAccountToLogin,
  onDeleteAccount,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // New account form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNamaLengkap, setNewNamaLengkap] = useState('');
  const [newMadrasah, setNewMadrasah] = useState('');
  const [newRole, setNewRole] = useState<'guru' | 'kepala_madrasah' | 'operator' | 'pengawas'>('guru');

  if (!isOpen) return null;

  const handleCopyAccount = (acc: UserAccount) => {
    const text = `Akses Login Aplikasi Bukti Fisik PKKM 2026 AI (lynk.id):\nUsername: ${acc.username}\nPassword: ${acc.password}\nStatus: Aktif Penuh (205 Instrumen Fisik + AI Gemini)\nWebsite: https://ais-pre-cpk2arqkt4mcg4gth7b4xj-499090783603.asia-east1.run.app`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newAcc: UserAccount = {
      id: `usr_${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      password: newPassword,
      namaLengkap: newNamaLengkap.trim() || 'Pembeli Lisensi Tambahan',
      namaMadrasah: newMadrasah.trim() || 'Madrasah Pengguna Lisensi',
      role: newRole,
      statusAktif: true,
      tanggalDibuat: new Date().toISOString().split('T')[0],
      kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
    };

    onAddAccount(newAcc);
    setNewUsername('');
    setNewPassword('');
    setNewNamaLengkap('');
    setNewMadrasah('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 border border-teal-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Panel Rahasia Penjual (Akses lynk.id)</h3>
              <p className="text-xs text-slate-300">
                Daftar 10 akun rahasia siap kirim ke pembeli yang melakukan checkout di lynk.id
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup panel lisensi penjual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Actions banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Total Akun Lisensi: <span className="text-teal-700 font-extrabold">{accounts.length} Akun</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Salin salah satu akun di bawah untuk dikirimkan ke pembeli lynk.id.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Buka atau tutup formulir untuk membuat username dan password lisensi baru"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAdding ? 'Tutup Form' : 'Tambah Akun Lisensi Baru'}</span>
            </button>
          </div>

          {/* Form Create New Account */}
          {isAdding && (
            <form
              onSubmit={handleCreateAccount}
              className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Generate Akun Pembeli Baru
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Username Pembeli *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="misal: madrasah_k4p1"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-700 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="misal: Berkah#5921"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-700 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Catatan Pembeli / Nama Guru
                  </label>
                  <input
                    type="text"
                    value={newNamaLengkap}
                    onChange={(e) => setNewNamaLengkap(e.target.value)}
                    placeholder="misal: Pembeli lynk.id #11"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Madrasah
                  </label>
                  <input
                    type="text"
                    value={newMadrasah}
                    onChange={(e) => setNewMadrasah(e.target.value)}
                    placeholder="misal: MTs Negeri..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          )}

          {/* List of Accounts */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              10 Akun Siap Dibagikan ke Pembeli:
            </h4>

            {accounts.map((acc, idx) => {
              const isCopied = copiedId === acc.id;
              const isMaster = acc.role === 'penjual';

              return (
                <div
                  key={acc.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
                    isMaster
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 w-5">
                        #{idx + 1}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {acc.username}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Password: <strong className="text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono">{acc.password}</strong>
                      </span>
                      {isMaster && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                          Akun Anda (Master Penjual)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleCopyAccount(acc)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Salin username dan password untuk dikirimkan ke pembeli"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin!' : 'Salin Akun'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectAccountToLogin(acc);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Masuk langsung ke aplikasi menggunakan akun pembeli ini untuk pengujian"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Coba Login</span>
                      </button>

                      {onDeleteAccount && !isMaster && (
                        <button
                          onClick={() => onDeleteAccount(acc.id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                          title="Hapus akun lisensi ini dari daftar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100 text-[11px]">
                    <span>{acc.namaLengkap} • {acc.namaMadrasah}</span>
                    <span className="text-teal-700 font-medium">{acc.kuotaDokumen || 'Akses Penuh'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span className="text-[11px] text-slate-500">
            Daftar ini hanya tampil saat login sebagai Admin Penjual (<strong>admin_lynk</strong>).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            title="Tutup panel rahasia penjual"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
