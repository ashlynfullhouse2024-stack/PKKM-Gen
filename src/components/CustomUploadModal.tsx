import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { MadrasahProfile, PKKMItem } from '../types';
import { getDocumentOrientation } from '../utils/documentTemplates';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  RotateCcw, 
  ArrowRight, 
  LayoutTemplate, 
  Save, 
  Eye, 
  HelpCircle,
  Building,
  FileCheck
} from 'lucide-react';

interface CustomUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MadrasahProfile;
  items: PKKMItem[];
  initialItem?: PKKMItem | null;
  onSaveAndOpenViewer: (item: PKKMItem, title: string, content: string) => void;
  onSaveDirectly: (item: PKKMItem, title: string, content: string) => void;
}

export const CustomUploadModal: React.FC<CustomUploadModalProps> = ({
  isOpen,
  onClose,
  profile,
  items,
  initialItem = null,
  onSaveAndOpenViewer,
  onSaveDirectly,
}) => {
  const [selectedItem, setSelectedItem] = useState<PKKMItem | null>(initialItem || items[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdapted, setIsAdapted] = useState<boolean>(false);
  const [adaptationLog, setAdaptationLog] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected item if initialItem is provided
  React.useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
      setDocumentTitle(initialItem.title);
      setOrientation(getDocumentOrientation(initialItem));
    } else if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]);
      setDocumentTitle(items[0].title);
      setOrientation(getDocumentOrientation(items[0]));
    }
  }, [initialItem, items]);

  if (!isOpen) return null;

  // Filter items for selection picker
  const filteredItems = items.filter((it) => {
    const matchComp = componentFilter === 'all' || it.componentId === componentFilter;
    const matchQuery = 
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(it.id).includes(searchQuery);
    return matchComp && matchQuery;
  });

  const handleSelectItem = (it: PKKMItem) => {
    setSelectedItem(it);
    setOrientation(getDocumentOrientation(it));
    if (!documentTitle || documentTitle === selectedItem?.title) {
      setDocumentTitle(it.title);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsAdapted(false);
    setAdaptationLog([]);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const rawText = result.value.trim();
        if (!rawText) {
          throw new Error('Dokumen Word kosong atau tidak memiliki teks yang terbaca.');
        }
        setUploadedContent(rawText);
        autoDetectOrientationFromText(rawText);
      } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'rtf') {
        const text = await file.text();
        if (!text.trim()) {
          throw new Error('File teks kosong.');
        }
        setUploadedContent(text);
        autoDetectOrientationFromText(text);
      } else if (ext === 'doc') {
        // Old Word 97-2003 binary format
        throw new Error('Format .doc versi lama (Word 97-2003) tidak didukung langsung. Silakan buka file di Microsoft Word atau Google Docs, lalu "Save As" sebagai .docx atau salin teksnya ke format .txt.');
      } else if (ext === 'pdf') {
        throw new Error('Untuk file PDF, Anda dapat menyalin isinya (Copy-Paste) atau menyimpan sebagai dokumen Word (.docx) agar tabel dan formatnya dapat disunting secara fleksibel.');
      } else {
        throw new Error(`Format file .${ext} belum didukung. Harap gunakan file berekstensi .docx, .txt, atau .md.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file.';
      setErrorMessage(msg);
      setUploadedContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const autoDetectOrientationFromText = (text: string) => {
    // If text contains markdown table with many columns (| col | col | col | col |)
    const lines = text.split('\n');
    let hasWideTable = false;
    for (const line of lines) {
      const pipes = (line.match(/\|/g) || []).length;
      if (pipes >= 6) {
        hasWideTable = true;
        break;
      }
    }
    if (hasWideTable) {
      setOrientation('landscape');
    } else if (selectedItem) {
      setOrientation(getDocumentOrientation(selectedItem));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Smart Adapter: Integrates uploaded document with active madrasah profile
  const handleAdaptToProfile = () => {
    if (!uploadedContent.trim() || !selectedItem) return;

    const logs: string[] = [];
    let text = uploadedContent;

    // 1. Detect & replace generic placeholders
    const placeholderRegexes = [
      /\[NAMA MADRASAH\]/gi,
      /\[NAMA SEKOLAH\]/gi,
      /MTs Negeri 1 Contoh/gi,
      /MI Negeri 1 Model/gi,
      /MA Al-Hikmah/gi,
      /Madrasah Contoh/gi,
    ];
    let replacedMadrasah = false;
    placeholderRegexes.forEach((rgx) => {
      if (rgx.test(text)) {
        text = text.replace(rgx, profile.namaMadrasah);
        replacedMadrasah = true;
      }
    });
    if (replacedMadrasah) {
      logs.push(`Nama madrasah diperbarui menjadi "${profile.namaMadrasah}".`);
    }

    // 2. Year update
    const yearRegex = /Tahun Pelajaran 202[0-4]\/202[1-5]/gi;
    if (yearRegex.test(text)) {
      text = text.replace(yearRegex, `Tahun Pelajaran ${profile.tahunAjaran}`);
      logs.push(`Tahun pelajaran disinkronkan ke "${profile.tahunAjaran}".`);
    }

    // 3. Kepala Madrasah & NIP placeholder replacement
    const kepalaRegexes = [
      /\[NAMA KEPALA MADRASAH\]/gi,
      /Drs\. H\. Ahmad Fauzi, M\.Pd\./gi,
      /H\. Abdullah, M\.Pd\./gi,
    ];
    kepalaRegexes.forEach((rgx) => {
      if (rgx.test(text)) {
        text = text.replace(rgx, profile.namaKepala);
        logs.push(`Nama Kepala Madrasah diperbarui menjadi "${profile.namaKepala}".`);
      }
    });

    const nipRegexes = [/\[NIP KEPALA\]/gi, /19750810 200003 1 002/gi];
    nipRegexes.forEach((rgx) => {
      if (rgx.test(text)) {
        text = text.replace(rgx, profile.nipKepala);
        logs.push(`NIP Kepala Madrasah diperbarui menjadi "${profile.nipKepala}".`);
      }
    });

    // 4. If content doesn't have an official KOP, prepend standard Kemenag KOP
    const hasKop = /KEMENTERIAN AGAMA REPUBLIK INDONESIA/i.test(text) || /KANTOR KEMENTERIAN AGAMA/i.test(text);
    if (!hasKop) {
      const officialKop = `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA KABUPATEN/KOTA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - Prov. ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn} | Tahun Penilaian: ${profile.tahunPenilaian}*
---

`;
      text = officialKop + text;
      logs.push(`Ditambahkan KOP resmi madrasah (${profile.namaMadrasah}) di bagian atas.`);
    }

    // 5. If item is marked with KBC tag and doesn't mention KBC, append Kurikulum Berbasis Cinta validation footer
    if (selectedItem.kbcTag && !/Kurikulum Berbasis Cinta/i.test(text) && !/Panca Cinta/i.test(text)) {
      const kbcNotice = `

---
### CATATAN INTEGRASI KURIKULUM BERBASIS CINTA (KBC) & DEEP LEARNING:
Dokumen bukti fisik ini telah diselaraskan dengan amanat Ditjen Pendis Kemenag RI terkait implementasi Kurikulum Berbasis Cinta (Panca Cinta) serta pendekatan Deep Learning (Mindful, Meaningful, & Joyful Learning) pada lingkungan ${profile.namaMadrasah}.
`;
      text += kbcNotice;
      logs.push('Diselaraskan dengan instrumen Kurikulum Berbasis Cinta (KBC Ditjen Pendis).');
    }

    // 6. Check if validation signature block is present, if not add signature
    const hasSignature = /Mengetahui,/i.test(text) || /Kepala Madrasah,/i.test(text);
    if (!hasSignature) {
      const signatureBlock = `

${profile.kabupatenKota}, ${profile.tanggalPenilaian}
Mengetahui,
Kepala ${profile.namaMadrasah}



**${profile.namaKepala}**
NIP. ${profile.nipKepala}
Pangkat/Gol: ${profile.pangkatKepala}
`;
      text += signatureBlock;
      logs.push(`Ditambahkan lembar pengesahan Kepala Madrasah (${profile.namaKepala}).`);
    }

    if (logs.length === 0) {
      logs.push(`Format dokumen telah diperiksa dan diselaraskan dengan identitas ${profile.namaMadrasah}.`);
    }

    setUploadedContent(text);
    setIsAdapted(true);
    setAdaptationLog(logs);
  };

  const handleOpenInViewer = () => {
    if (!selectedItem || !uploadedContent.trim()) return;
    onSaveAndOpenViewer(selectedItem, documentTitle || selectedItem.title, uploadedContent);
    onClose();
  };

  const handleSaveDirect = () => {
    if (!selectedItem || !uploadedContent.trim()) return;
    onSaveDirectly(selectedItem, documentTitle || selectedItem.title, uploadedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xs">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Upload & Kustomisasi Dokumen Mandiri
                </h2>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  File Guru / Madrasah
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Unggah file dokumen madrasah Anda (.docx / .txt) lalu sesuaikan otomatis dengan profil {profile.namaMadrasah}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Tutup jendela upload"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Two Column Layout */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Left Column: Item Selection & File Upload (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Step 1: Target PKKM Item Selection */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black flex items-center justify-center">1</span>
                  <span>Pilih Nomor Bukti Fisik PKKM</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium font-mono">
                  {selectedItem ? `#${selectedItem.id} (${selectedItem.folderId})` : 'Belum dipilih'}
                </span>
              </div>

              {/* Component quick filter buttons */}
              <div className="flex gap-1 mb-2 overflow-x-auto pb-1 text-xs">
                {['all', 'A', 'B', 'C', 'D', 'E'].map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setComponentFilter(comp)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      componentFilter === comp
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                    }`}
                  >
                    {comp === 'all' ? 'Semua (205)' : `Komp. ${comp}`}
                  </button>
                ))}
              </div>

              {/* Search box */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama instrumen, SK, SOP, modul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white"
                />
              </div>

              {/* Dropdown list of items */}
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                {filteredItems.slice(0, 50).map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleSelectItem(it)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      selectedItem?.id === it.id
                        ? 'bg-rose-50/80 font-bold text-rose-800'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 line-clamp-1">
                      <span className="shrink-0 font-mono text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded">
                        #{it.id}
                      </span>
                      <span className="truncate">{it.title}</span>
                    </div>
                    <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {it.category}
                    </span>
                  </button>
                ))}
              </div>

              {selectedItem && (
                <div className="mt-2 p-2.5 bg-rose-50/60 rounded-xl border border-rose-200/60 text-xs">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span>{selectedItem.title}</span>
                    <span className="text-[10px] font-semibold text-rose-600">Folder {selectedItem.folderId}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {selectedItem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Upload File Box */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black flex items-center justify-center">2</span>
                <span>Unggah File Dokumen Madrasah</span>
              </label>

              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-rose-500 bg-rose-50/80 scale-102'
                    : 'border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt,.md,.csv,.rtf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-rose-200 flex items-center justify-center text-rose-500">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Klik untuk pilih file atau seret ke sini
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung <span className="font-semibold text-rose-600">.docx</span>, <span className="font-semibold text-rose-600">.txt</span>, <span className="font-semibold text-rose-600">.md</span>
                  </p>
                </div>

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold animate-pulse mt-1">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Mengekstrak isi file...</span>
                  </div>
                )}
              </div>

              {fileName && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-emerald-900 truncate block">{fileName}</span>
                      <span className="text-[10px] text-emerald-700">{fileSize} • Berhasil diekstrak</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName('');
                      setUploadedContent('');
                      setIsAdapted(false);
                      setAdaptationLog([]);
                    }}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Hapus file"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Peringatan Format File:</span>
                    <span className="text-[11px]">{errorMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Orientation Setting */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black flex items-center justify-center">3</span>
                <span>Tata Letak Cetak & Ekspor Word</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Potret (Tegak)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  <span>Lanskap (Melebar)</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {orientation === 'landscape'
                  ? 'Format Lanskap diaktifkan untuk naskah bertabel banyak kolom seperti Jadwal, BKU, atau Sarpras.'
                  : 'Format Potret standar untuk naskah narasi seperti SK, SOP, Panduan, atau Berita Acara.'}
              </p>
            </div>
          </div>

          {/* Right Column: Content Preview, Smart Adaptation & Save (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Title Input & Smart Adaptation Trigger */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Judul Dokumen Bukti Fisik:
                </label>
                <button
                  type="button"
                  onClick={handleAdaptToProfile}
                  disabled={!uploadedContent.trim() || !selectedItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer hover:scale-102"
                  title="Otomatis ganti nama madrasah lama, pasang KOP resmi madrasah aktif, nama kepala, dan tahun ajaran"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sesuaikan Otomatis ke Profil Madrasah</span>
                </button>
              </div>

              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Masukkan judul dokumen bukti fisik..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white"
              />

              {/* Adaptation feedback banner */}
              {isAdapted && adaptationLog.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Penyesuaian Berhasil:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
                    {adaptationLog.map((log, idx) => (
                      <li key={idx}>{log}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Document Content Textarea Preview */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs flex-1 flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Isi Naskah Dokumen (Dapat diedit langsung)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {uploadedContent.length} karakter • {uploadedContent.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>

              <textarea
                value={uploadedContent}
                onChange={(e) => setUploadedContent(e.target.value)}
                placeholder="Isi teks dari file dokumen yang Anda unggah akan muncul di sini. Anda juga dapat langsung mengetik, mengedit tabel, atau menempelkan (paste) naskah Anda sendiri..."
                className="w-full flex-1 min-h-[320px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white leading-relaxed resize-y"
              />
            </div>

            {/* Actions: Open in Viewer or Save Directly */}
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building className="w-4 h-4 text-purple-600" />
                <span>Target: <strong>{profile.namaMadrasah}</strong> ({profile.tahunAjaran})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDirect}
                  disabled={!uploadedContent.trim() || !selectedItem}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer hover:scale-102"
                  title="Simpan dokumen ini langsung ke arsip bukti fisik PKKM madrasah"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Langsung ke Arsip</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenInViewer}
                  disabled={!uploadedContent.trim() || !selectedItem}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer hover:scale-102"
                  title="Buka dokumen di lembar pratinjau kertas resmi A4 untuk cetak atau unduh Word"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka di Pratinjau Kertas & Unduh Word</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
