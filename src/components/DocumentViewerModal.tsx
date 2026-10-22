import React, { useState } from 'react';
import { MadrasahProfile, PKKMItem } from '../types';
import { markdownToHtml, downloadAsWordDoc } from '../utils/exportHelpers';
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
  CheckCircle2
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
    window.print();
  };

  const handleDownloadDoc = () => {
    const filename = `PKKM_2026_${item.folderId}_Item_${item.id}_${item.title.slice(0, 30)}`;
    downloadAsWordDoc(filename, title, htmlContent);
  };

  const handleSave = () => {
    onSaveDocument(title, content, item);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md">
              #{item.id}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white line-clamp-1">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {item.folderName} • {profile.namaMadrasah}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* View / Edit Tab */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-xs font-semibold mr-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Lihat tata letak naskah resmi dalam format lembar kertas dinas A4"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Kertas</span>
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Buka naskah dalam mode penyunting teks untuk mengubah isi klausul atau menambahkan rincian"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Teks</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-slate-700 cursor-pointer"
              title="Salin seluruh isi teks naskah ke papan klip (clipboard) komputer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Unduh dokumen ini ke format Microsoft Word (.doc) yang siap dibuka dan diedit di laptop"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cetak langsung naskah ini ke printer atau simpan sebagai file PDF ukuran standar A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
              title="Simpan dokumen naskah ini ke arsip lokal madrasah dan tandai instrumen sebagai Selesai"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> : <Save className="w-3.5 h-3.5" />}
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
            /* Printable A4 Paper Document Container */
            <div
              id="printable-area"
              className="bg-white text-slate-900 w-full max-w-[850px] min-h-[1100px] p-8 sm:p-14 shadow-lg border border-slate-300 rounded-sm font-serif print:shadow-none print:border-none print:p-0 print:m-0"
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
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Format baku siap diverifikasi oleh Pengawas Pembina ({profile.namaPenilai})
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
