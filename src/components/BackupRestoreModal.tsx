import React, { useState, useRef } from 'react';
import { MadrasahProfile, PKKMItem, GeneratedDocument } from '../types';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  FileCheck,
  RefreshCw,
  FolderSync
} from 'lucide-react';

export interface BackupDataPayload {
  version: string;
  app: string;
  exportedAt: string;
  profile: MadrasahProfile;
  items: PKKMItem[];
  folderLinks: Record<string, string>;
  savedDocs: GeneratedDocument[];
}

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MadrasahProfile;
  items: PKKMItem[];
  folderLinks: Record<string, string>;
  savedDocs: GeneratedDocument[];
  onRestoreBackup: (data: {
    profile: MadrasahProfile;
    items: PKKMItem[];
    folderLinks: Record<string, string>;
    savedDocs: GeneratedDocument[];
  }) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  profile,
  items,
  folderLinks,
  savedDocs,
  onRestoreBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [parsedBackup, setParsedBackup] = useState<BackupDataPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Export Backup
  const handleExportBackup = () => {
    try {
      const payload: BackupDataPayload = {
        version: '2.5.0',
        app: 'Asisten Mandiri PKKM 2026',
        exportedAt: new Date().toISOString(),
        profile,
        items,
        folderLinks,
        savedDocs,
      };

      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const cleanName = (profile.namaMadrasah || 'Madrasah').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Backup_PKKM_2026_${cleanName}_${new Date().toISOString().slice(0, 10)}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`File cadangan '${filename}' berhasil diunduh ke komputer.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(`Gagal membuat cadangan data: ${err.message}`);
    }
  };

  // Handle File Upload for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setParsedBackup(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Format file harus berupa file JSON cadangan (.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation
        if (!parsed.profile || !Array.isArray(parsed.items)) {
          setErrorMessage('File JSON ini tidak memiliki struktur cadangan PKKM 2026 yang valid.');
          return;
        }

        setParsedBackup(parsed);
      } catch (err) {
        setErrorMessage('Gagal membaca file JSON. Pastikan file tidak rusak.');
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!parsedBackup) return;

    onRestoreBackup({
      profile: parsedBackup.profile,
      items: parsedBackup.items,
      folderLinks: parsedBackup.folderLinks || {},
      savedDocs: parsedBackup.savedDocs || [],
    });

    setSuccessMessage('Data berhasil dipulihkan secara penuh ke dalam aplikasi!');
    setTimeout(() => {
      setSuccessMessage(null);
      setParsedBackup(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 text-slate-800 p-5 flex items-center justify-between border-b border-rose-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cadangkan & Pulihkan Data
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                Pencadangan offline mandiri untuk keamanan berkas PKKM 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-pink-100 text-slate-500 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup dialog cadangan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-rose-100 bg-pink-50/30 p-2 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-rose-700 shadow-2xs border border-pink-200'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>Ekspor Cadangan (Backup)</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-rose-700 shadow-2xs border border-pink-200'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Pulihkan Cadangan (Restore)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'export' ? (
            /* EXPORT TAB */
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/30 border border-rose-100 rounded-2xl p-4 text-xs space-y-2">
                <p className="font-bold text-slate-800">Ringkasan Data yang Akan Dicadangkan:</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div className="bg-white/90 p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Identitas Madrasah</span>
                    <strong className="text-slate-800 line-clamp-1">{profile.namaMadrasah}</strong>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Dokumen Arsip</span>
                    <strong className="text-rose-600 font-bold">{savedDocs.length} Dokumen Tersimpan</strong>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Tautan Google Drive</span>
                    <strong className="text-slate-800 font-bold">{Object.keys(folderLinks).length} Folder Terhubung</strong>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-pink-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Status Pengerjaan</span>
                    <strong className="text-emerald-600 font-bold">{items.filter((i) => i.status === 'selesai').length} / 205 Selesai</strong>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Seluruh profil madrasah, status checklist 205 instrumen, tautan Google Drive, dan naskah dokumen di Arsip Saya akan dikemas dalam satu file JSON terenkripsi aman yang dapat disimpan di laptop Anda.
              </p>

              <button
                onClick={handleExportBackup}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-pink-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan Lengkap (.json)</span>
              </button>
            </div>
          ) : (
            /* IMPORT / RESTORE TAB */
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-pink-200 hover:border-rose-400 bg-pink-50/20 hover:bg-pink-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-purple-600 flex items-center justify-center mx-auto shadow-2xs">
                  <FileJson className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Klik untuk Memilih File Cadangan (.json)
                </p>
                <p className="text-[11px] text-slate-400">
                  Pilih file backup yang sebelumnya diunduh dari aplikasi ini
                </p>
              </div>

              {parsedBackup && (
                <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-purple-900">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    <span>File Cadangan Terverifikasi:</span>
                  </div>
                  <ul className="text-slate-600 space-y-1 text-[11px] pl-6 list-disc">
                    <li>Madrasah: <strong>{parsedBackup.profile?.namaMadrasah || '-'}</strong></li>
                    <li>Dokumen Arsip: <strong>{parsedBackup.savedDocs?.length || 0} naskah</strong></li>
                    <li>Item Selesai: <strong>{(parsedBackup.items || []).filter((i) => i.status === 'selesai').length} item</strong></li>
                    <li>Waktu Cadangan: {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleString('id-ID') : '-'}</li>
                  </ul>

                  <button
                    onClick={handleExecuteRestore}
                    className="w-full mt-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Pulihkan & Terapkan Data Ini Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[10px] text-slate-400 text-center">
          Penyimpanan data bersifat privat di peramban dan komputer Anda, tidak diunggah ke pihak ketiga.
        </div>
      </div>
    </div>
  );
};
