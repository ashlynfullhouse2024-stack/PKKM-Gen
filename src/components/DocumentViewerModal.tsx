import React, { useState } from 'react';
import { MadrasahProfile, PKKMItem } from '../types';
import { markdownToHtml, downloadAsWordDoc } from '../utils/exportHelpers';
import { getDocumentOrientation } from '../utils/documentTemplates';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Save, 
  Edit3, 
  Eye, 
  Sparkles, 
  FileText,
  Building,
  CheckCircle2,
  LayoutTemplate
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  item: PKKMItem | null;
  profile: MadrasahProfile;
  title: string;
  content: string;
  onClose: () => void;
  onSaveDocument: (title: string, content: string, item: PKKMItem) => void;
  onRegenerate: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  item,
  profile,
  title,
  content: initialContent,
  onClose,
  onSaveDocument,
  onRegenerate,
}) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Auto-detect optimal orientation based on item characteristics
  React.useEffect(() => {
    if (item) {
      setOrientation(getDocumentOrientation(item));
    }
  }, [item]);

  // Sync content when initialContent changes
  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  if (!isOpen || !item) return null;

  const htmlContent = markdownToHtml(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // Dynamically inject @page orientation for browser print dialog
    const printStyleId = 'pkkm-print-orientation-style';
    let styleEl = document.getElementById(printStyleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = printStyleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@page { size: ${orientation}; margin: 12mm; }`;
    window.print();
  };

  const handleDownloadDoc = () => {
    const filename = `PKKM_2026_${item.folderId}_Item_${item.id}_${item.title.slice(0, 30)}_${orientation}`;
    downloadAsWordDoc(filename, title, htmlContent, orientation);
  };

  const handleSave = () => {
    onSaveDocument(title, content, item);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-all ${orientation === 'landscape' ? 'max-w-[96vw]' : 'max-w-5xl'}`}>
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 text-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden border-b border-rose-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-2xs font-mono">
              #{item.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {title}
                </h3>
                {orientation === 'landscape' ? (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full shadow-2xs">
                    Format Lanskap (Melebar)
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
                    Format Potret (Tegak)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-700 font-medium">
                {item.folderName} • {profile.namaMadrasah}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View / Edit Tab */}
            <div className="bg-white/90 p-0.5 rounded-xl flex items-center text-xs font-semibold mr-1 border border-pink-200/80 shadow-2xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-rose-500 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
                title="Lihat tata letak naskah resmi dalam format lembar kertas dinas A4"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Kertas</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-rose-500 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
                title="Buka naskah dalam mode penyunting teks untuk mengubah isi klausul atau menambahkan rincian"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Teks</span>
              </button>
            </div>

            {/* Dynamic Orientation Switcher: Potret vs Lanskap */}
            <div className="bg-white/90 p-0.5 rounded-xl flex items-center text-xs font-semibold mr-1 border border-pink-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
                title="Format Potret (Tegak / Vertikal): Cocok untuk SK, SOP, Surat Dinas, dan teks naratif"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Potret</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
                title="Format Lanskap (Mendatar / Horizontal): Sangat direkomendasikan untuk Jadwal Supervisi, Buku Kas BOS, Inventaris Sarpras, dan Matriks EDM"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Lanskap</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-white hover:bg-pink-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 border border-pink-200/80 cursor-pointer shadow-2xs"
              title="Salin seluruh isi teks naskah ke papan klip (clipboard) komputer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-rose-400" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer hover:scale-102"
              title={`Unduh dokumen ini ke format Microsoft Word (.doc) dengan tata letak ${orientation === 'landscape' ? 'Lanskap' : 'Potret'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word ({orientation === 'landscape' ? 'Lanskap' : 'Potret'})</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-102"
              title={`Cetak langsung naskah ini ke printer atau simpan sebagai file PDF ukuran A4 (${orientation === 'landscape' ? 'Lanskap' : 'Potret'})`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102"
              title="Simpan dokumen naskah ini ke arsip lokal madrasah dan tandai instrumen sebagai Selesai"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-200" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Tersimpan!' : 'Simpan'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Tutup jendela pratinjau dokumen dan kembali ke dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main View */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-6 flex justify-center">
          {activeTab === 'preview' ? (
            /* Printable A4 Paper Document Container (Adapts to Landscape / Portrait) */
            <div
              id="printable-area"
              className={`bg-white text-slate-900 w-full shadow-lg border border-slate-300 rounded-sm font-serif print:shadow-none print:border-none print:p-0 print:m-0 transition-all duration-200 ${
                orientation === 'landscape'
                  ? 'max-w-[1140px] min-h-[780px] p-6 sm:p-10'
                  : 'max-w-[850px] min-h-[1100px] p-8 sm:p-14'
              }`}
              style={{
                fontFamily: "'Merriweather', 'Times New Roman', serif",
              }}
            >
              {/* Official Kemenag Letterhead (Kop Surat) */}
              <div className="text-center pb-3 mb-4 border-b-4 border-double border-slate-900 relative">
                <div className="flex items-center justify-center gap-4 mb-1">
                  {/* Kemenag Logo Badge Icon */}
                  <div className="w-14 h-14 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs border-2 border-amber-400 shadow-sm shrink-0">
                    <span className="font-sans font-black text-center text-[10px] leading-tight">
                      IKHLAS<br />BERAMAL
                    </span>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold tracking-wider text-slate-900 font-sans uppercase">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </h2>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-sans uppercase">
                      KANTOR KEMENTERIAN AGAMA {profile.kabupatenKota.toUpperCase()}
                    </h3>
                    <h1 className="text-base sm:text-xl font-black text-emerald-900 font-sans uppercase tracking-tight mt-0.5">
                      {profile.namaMadrasah.toUpperCase()}
                    </h1>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 font-sans italic leading-tight">
                  {profile.alamat}, Desa {profile.desaKelurahan}, Kec. {profile.kecamatan}, {profile.kabupatenKota} - {profile.provinsi}
                </p>
                <p className="text-[10px] text-slate-500 font-sans font-mono">
                  NSM: {profile.nsm} | NPSN: {profile.npsn} | Email: {profile.namaMadrasah.toLowerCase().replace(/\s+/g, '')}@kemenag.go.id
                </p>
              </div>

              {/* Document Body */}
              <div
                className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Footer Note */}
              <div className="mt-12 pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] font-sans text-slate-400 italic">
                <span>Bukti Fisik PKKM Tahun {profile.tahunPenilaian} - Dokumen Otentik</span>
                <span>Komponen {item.componentId} - Item #{item.id}</span>
              </div>
            </div>
          ) : (
            /* Live Markdown / Text Editor */
            <div className="w-full max-w-4xl bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col h-full">
              <div className="flex items-center justify-between pb-2 mb-2 border-b">
                <span className="text-xs font-bold text-slate-700">
                  Editor Naskah Dokumen (Format Markdown / Teks Resmi)
                </span>
                <span className="text-xs text-slate-500">
                  Anda bisa mengubah nama, klausul, atau tabel sesuai kebutuhan madrasah
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 p-4 font-mono text-xs text-slate-800 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="bg-slate-50 px-6 py-2.5 border-t flex items-center justify-between text-xs text-slate-600 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${orientation === 'landscape' ? 'bg-purple-600' : 'bg-emerald-500'}`}></span>
            <span>
              Format Aktif: <strong>{orientation === 'landscape' ? 'Lanskap (A4 Melebar - Matriks/Tabel Rapi)' : 'Potret (A4 Tegak - Naskah Resmi)'}</strong> • Siap diverifikasi Pengawas ({profile.namaPenilai})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerate}
              className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Generate Ulang dengan AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
