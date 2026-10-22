import React, { useState } from 'react';
import { MadrasahProfile, PKKMFolder, PKKMItem } from '../types';
import { PKKM_FOLDERS } from '../data/pkkmData';
import { 
  FolderSync, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Folder, 
  FolderCheck, 
  Link2, 
  Layers 
} from 'lucide-react';

interface GDriveMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MadrasahProfile;
  items: PKKMItem[];
  folderLinks: Record<string, string>;
  onSaveFolderLinks: (links: Record<string, string>) => void;
  onUpdateItemDrive: (itemId: number, url: string) => void;
}

export const GDriveMatrixModal: React.FC<GDriveMatrixModalProps> = ({
  isOpen,
  onClose,
  profile,
  items,
  folderLinks,
  onSaveFolderLinks,
  onUpdateItemDrive,
}) => {
  const [links, setLinks] = useState<Record<string, string>>(folderLinks);
  const [copied, setCopied] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('A1');

  if (!isOpen) return null;

  const handleLinkChange = (folderId: string, value: string) => {
    const updated = { ...links, [folderId]: value };
    setLinks(updated);
    onSaveFolderLinks(updated);
  };

  const handleCopySummary = () => {
    let summaryText = `# DAFTAR TAUTAN FOLDER BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian}\n`;
    summaryText += `## ${profile.namaMadrasah.toUpperCase()}\n`;
    summaryText += `Kepala Madrasah: ${profile.namaKepala} | Penilai: ${profile.namaPenilai}\n\n`;
    summaryText += `| Kode Folder | Nama Folder Sub-Komponen | Tautan Google Drive |\n`;
    summaryText += `|:---|:---|:---|\n`;

    PKKM_FOLDERS.forEach((f) => {
      const url = links[f.id] || profile.masterDriveUrl || 'Belum diisi';
      summaryText += `| ${f.id} | ${f.name} | [Buka Folder Drive](${url}) |\n`;
    });

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFolderItems = items.filter((it) => it.folderId === selectedFolderId);
  const currentFolder = PKKM_FOLDERS.find((f) => f.id === selectedFolderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center">
              <FolderSync className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Struktur Folder Google Drive Bukti Fisik PKKM 2026
              </h3>
              <p className="text-xs text-emerald-200">
                20 Folder Sub-Komponen (A.1 s.d E.4) sesuai bagan formulir penilaian resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors cursor-pointer"
            title="Tutup jendela manajemen folder Google Drive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Link Notification */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 shrink-0">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Master Drive URL:</strong> {profile.masterDriveUrl || 'Belum diatur di profil madrasah'}
            </span>
          </div>
          <button
            onClick={handleCopySummary}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Salin rekapitulasi 20 folder tautan Google Drive ke clipboard untuk dikirim ke Tim Asesor"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Rekap Link untuk Pengawas'}</span>
          </button>
        </div>

        {/* Main Grid: Left Folders List, Right Items in Folder */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Folder Navigator (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Daftar 20 Sub-Folder PKKM 2026
            </h4>
            {PKKM_FOLDERS.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const folderUrl = links[f.id] || '';
              const count = items.filter((it) => it.folderId === f.id).length;
              const finished = items.filter((it) => it.folderId === f.id && it.status === 'selesai').length;

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Folder className={`w-4 h-4 ${folderUrl ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-slate-800">{f.code}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {finished}/{count} selesai
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">{f.name}</p>

                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="url"
                      placeholder="Tempel tautan folder Drive di sini..."
                      value={folderUrl}
                      onChange={(e) => handleLinkChange(f.id, e.target.value)}
                      className="w-full px-2 py-1 text-[11px] border rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Folder Details & Evidence Items (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-5 bg-white">
            {currentFolder && (
              <div>
                <div className="flex items-start justify-between gap-4 pb-4 border-b">
                  <div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                      Sub-Komponen {currentFolder.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {currentFolder.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Berisi {currentFolderItems.length} item bukti fisik yang harus diunggah ke Google Drive
                    </p>
                  </div>
                  {links[currentFolder.id] && (
                    <a
                      href={links[currentFolder.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <span>Buka Folder</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Items in selected folder */}
                <div className="mt-4 space-y-3">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Daftar Item Bukti Fisik dalam Folder ini:
                  </h5>
                  {currentFolderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="bg-slate-200 text-slate-800 font-bold text-[10px] px-1.5 py-0.5 rounded mt-0.5">
                            #{item.id}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                            item.status === 'selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.status === 'selesai' ? 'Selesai' : 'Belum'}
                        </span>
                      </div>

                      {/* Direct Item Drive URL */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 shrink-0">Link File Drive:</span>
                        <input
                          type="url"
                          placeholder="Tautan langsung file dokumen/foto item ini..."
                          value={item.gdriveUrl || ''}
                          onChange={(e) => onUpdateItemDrive(item.id, e.target.value)}
                          className="flex-1 px-2 py-0.5 text-[11px] border rounded bg-white font-mono focus:ring-1 focus:ring-emerald-500"
                        />
                        {item.gdriveUrl && (
                          <a
                            href={item.gdriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-800"
                            title="Buka File"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
