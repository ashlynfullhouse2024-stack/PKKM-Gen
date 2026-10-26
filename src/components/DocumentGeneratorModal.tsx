import React, { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { MadrasahProfile, PKKMItem } from '../types';
import { generateStandardDocument } from '../utils/documentTemplates';
import { getItemGuidance } from '../utils/itemGuidance';
import { 
  Sparkles, 
  X, 
  Check, 
  FileText, 
  HeartHandshake, 
  Loader2, 
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface DocumentGeneratorModalProps {
  isOpen: boolean;
  item: PKKMItem | null;
  profile: MadrasahProfile;
  onClose: () => void;
  onDocumentGenerated: (title: string, content: string, item: PKKMItem) => void;
}

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({
  isOpen,
  item,
  profile,
  onClose,
  onDocumentGenerated,
}) => {
  const [mapel, setMapel] = useState('');
  const [kelas, setKelas] = useState('');
  const [semester, setSemester] = useState('Semester Ganjil');
  const [temaKbc, setTemaKbc] = useState('Cinta Allah & Rasul dan Cinta Sesama');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAcademicAccordion, setShowAcademicAccordion] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; wordCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive item guidance
  const guidance = item ? getItemGuidance(item, profile) : null;

  // Initialize and reset form when active item changes
  useEffect(() => {
    if (item && guidance) {
      setCustomPrompt('');
      setUploadedFile(null);
      setErrorMsg(null);
      if (guidance.showAcademicInputs) {
        setMapel('Pendidikan Agama Islam (Fikih)');
        setKelas('Kelas VIII / Fase D');
        setShowAcademicAccordion(true);
      } else {
        setMapel('');
        setKelas('');
        setShowAcademicAccordion(false);
      }
    }
  }, [item?.id]);

  if (!isOpen || !item || !guidance) return null;

  // Process file upload (docx, txt, md, csv)
  const processUploadedFile = async (file: File) => {
    setIsExtractingFile(true);
    setErrorMsg(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let extractedText = '';

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer });
        extractedText = res.value.trim();
      } else if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'rtf') {
        extractedText = (await file.text()).trim();
      } else {
        throw new Error(`Format .${ext} belum didukung. Gunakan file Word (.docx), file teks (.txt), atau data tabel (.csv).`);
      }

      if (!extractedText) {
        throw new Error('File tidak memiliki teks yang terbaca atau kosong.');
      }

      const words = extractedText.split(/\s+/).filter(Boolean).length;
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        wordCount: words,
      });

      // Append or replace in customPrompt
      setCustomPrompt((prev) => {
        if (prev.trim()) {
          return `${prev.trim()}\n\n--- [DATA DARI FILE: ${file.name}] ---\n${extractedText}`;
        }
        return extractedText;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca isi file.';
      setErrorMsg(msg);
    } finally {
      setIsExtractingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
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
      processUploadedFile(file);
    }
  };

  const handleClearUploadedFile = () => {
    setUploadedFile(null);
    setCustomPrompt('');
  };

  const handleInsertQuickSample = (sampleText: string) => {
    setCustomPrompt((prev) => {
      if (prev.trim()) {
        return `${prev.trim()}\n\n${sampleText}`;
      }
      return sampleText;
    });
  };

  const handleGenerate = async (useAi: boolean) => {
    setIsGenerating(true);
    setErrorMsg(null);

    const fullCustomNotes = [
      mapel ? `Mata Pelajaran: ${mapel}` : '',
      kelas ? `Tingkat / Fase: ${kelas}` : '',
      semester ? `Semester: ${semester}` : '',
      item.kbcTag && temaKbc ? `Fokus Panca Cinta KBC: ${temaKbc}` : '',
      customPrompt ? `Data Riil Madrasah & Catatan Guru:\n${customPrompt}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    if (useAi) {
      setGenerationStep('Menghubungkan ke Gemini 3.8 Flash AI...');
      try {
        const timer1 = setTimeout(() => {
          setGenerationStep('Menganalisis instrumen PKKM & menyusun tata naskah berbasis pedoman PKKM...');
        }, 1200);

        const timer2 = setTimeout(() => {
          setGenerationStep('Mengintegrasikan data riil madrasah, Kurikulum Berbasis Cinta & tabel bukti fisik...');
        }, 2800);

        const sessionToken = localStorage.getItem('pkkm_session_token') || '';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (sessionToken) {
          headers['Authorization'] = `Bearer ${sessionToken}`;
          headers['x-pkkm-auth-token'] = sessionToken;
        }

        const response = await fetch('/api/generate-document', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            item,
            profile,
            customPrompt: fullCustomNotes,
            style: 'formal',
          }),
        });

        clearTimeout(timer1);
        clearTimeout(timer2);

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          setErrorMsg('Sesi lisensi tidak terautentikasi atau kedaluwarsa. Dokumen dialihkan ke template standar.');
          const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
          onDocumentGenerated(item.title, fallbackDoc, item);
          setIsGenerating(false);
          return;
        }

        if (response.status === 429) {
          setErrorMsg(data.error || 'Batas kuota generate harian atau frekuensi tercapai. Menggunakan template standar instan.');
          const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
          onDocumentGenerated(item.title, fallbackDoc, item);
          setIsGenerating(false);
          return;
        }

        if (data.content) {
          onDocumentGenerated(item.title, data.content, item);
          setIsGenerating(false);
          return;
        } else {
          const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
          onDocumentGenerated(item.title, fallbackDoc, item);
          setIsGenerating(false);
          return;
        }
      } catch (err: unknown) {
        console.warn('AI call error, switching to standard template:', err);
        const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
        onDocumentGenerated(item.title, fallbackDoc, item);
        setIsGenerating(false);
        return;
      }
    } else {
      setGenerationStep('Menyiapkan template standar instan...');
      setTimeout(() => {
        const standardDoc = generateStandardDocument(item, profile, fullCustomNotes);
        onDocumentGenerated(item.title, standardDoc, item);
        setIsGenerating(false);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 px-6 py-4 text-slate-800 flex items-center justify-between border-b border-rose-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-md shadow-2xs">
                  ITEM #{item.id}
                </span>
                <span className="text-xs text-rose-800 font-bold">
                  {item.folderName}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                Generator Dokumen Fisik PKKM 2026
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-pink-100/50 transition-colors disabled:opacity-50 cursor-pointer"
            title="Tutup dialog generator dokumen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-slate-50/40 flex-1">
          {/* Target PKKM Item Summary */}
          <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-md mb-1.5 border border-rose-200/60">
                  Kategori: {item.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
              {item.kbcTag && (
                <span className="shrink-0 inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                  KBC Insersi
                </span>
              )}
            </div>
          </div>

          {/* Context-Aware Guidance Card */}
          <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-rose-700 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs uppercase">
                {guidance.titleBadge}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Untuk Madrasah: {profile.namaMadrasah}
              </span>
            </div>
            <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
              {guidance.headline}
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              {guidance.explanation}
            </p>
          </div>

          {/* Upload File Box Tailored to This Specific PKKM Point */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  📁
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    File Yang Bisa Anda Upload untuk Poin #{item.id}:
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                Format: .docx, .txt, .csv, .md
              </span>
            </div>

            {/* List of recommended file types for this item */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                Contoh berkas yang cocok diunggah ke bukti fisik ini:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                {guidance.uploadExamples.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Drag and Drop / Browse Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-purple-500 bg-purple-50/80 scale-101'
                  : 'border-slate-300 hover:border-purple-400 bg-slate-50/60 hover:bg-purple-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.txt,.md,.csv,.rtf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-purple-200 flex items-center justify-center text-purple-600">
                <UploadCloud className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Klik untuk pilih file dari komputer atau seret ke sini
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Teks dalam file Word/Excel/Teks akan diekstrak otomatis dan dimasukkan ke draf AI
                </p>
              </div>

              {isExtractingFile && (
                <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold animate-pulse mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengekstrak isi file...</span>
                </div>
              )}
            </div>

            {/* Uploaded File Notification Banner */}
            {uploadedFile && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block">
                      {uploadedFile.name}
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {uploadedFile.size} • {uploadedFile.wordCount} kata berhasil dimuat ke instruksi AI
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearUploadedFile}
                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Hapus file dan kosongkan catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          {/* 1-Click Quick Samples */}
          {guidance.quickSamples && guidance.quickSamples.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Belum Punya File? Gunakan Contoh Data Riil (1-Klik):</span>
                </span>
                <span className="text-[10px] text-amber-700 font-semibold">
                  Klik untuk mengisi
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {guidance.quickSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertQuickSample(sample.text)}
                    className="px-3 py-1.5 bg-white hover:bg-amber-100/60 text-slate-800 text-xs font-bold rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer hover:scale-102 text-left"
                    title={sample.description}
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Area for Teacher Notes / Extracted Content */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Rincian Data Riil Madrasah untuk AI:</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {customPrompt.length} karakter • {customPrompt.split(/\s+/).filter(Boolean).length} kata
              </span>
            </div>

            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={guidance.placeholderText}
              className="w-full p-3 text-xs border border-pink-200/80 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 font-mono leading-relaxed text-slate-800 resize-y"
            />
            <p className="text-[10px] text-slate-500">
              Data di atas akan dianalisis oleh AI Gemini untuk menyusun rincian tabel, klausul SK, serta data faktual bukti fisik #{item.id}.
            </p>
          </div>

          {/* Optional Academic Fields (Mapel & Kelas) - Accordion if not academic */}
          {guidance.showAcademicInputs ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
              <h6 className="text-xs font-bold text-slate-800">
                Data Pembelajaran & Kelas (Modul Ajar / KBC)
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran:
                  </label>
                  <input
                    type="text"
                    value={mapel}
                    onChange={(e) => setMapel(e.target.value)}
                    placeholder="Contoh: Pendidikan Agama Islam, IPA, dll"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tingkat Kelas & Semester:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      placeholder="Kelas VII / Fase D"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="Semester Ganjil"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
              <button
                type="button"
                onClick={() => setShowAcademicAccordion(!showAcademicAccordion)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span>+ Opsi Tambahan: Mata Pelajaran & Kelas (Khusus Dokumen KBM)</span>
                {showAcademicAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAcademicAccordion && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mata Pelajaran (Opsional):
                    </label>
                    <input
                      type="text"
                      value={mapel}
                      onChange={(e) => setMapel(e.target.value)}
                      placeholder="Isi jika dokumen terkait KBM spesifik"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kelas & Semester (Opsional):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                        placeholder="Kelas VII"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                      />
                      <input
                        type="text"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="Ganjil / Genap"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KBC Focus Dimensi */}
          {item.kbcTag && (
            <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-3.5 space-y-1.5">
              <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                <span>Fokus Dimensi Panca Cinta Kurikulum Berbasis Cinta (KBC):</span>
              </label>
              <select
                value={temaKbc}
                onChange={(e) => setTemaKbc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 bg-white font-medium text-slate-800"
              >
                <option value="Cinta Allah & Rasul dan Cinta Ilmu">
                  Cinta Allah & Rasul dan Cinta Ilmu (Spiritual & Keilmuan)
                </option>
                <option value="Cinta Diri & Sesama (Anti-Bullying & Empati)">
                  Cinta Diri & Sesama (Anti-Bullying, Disiplin Positif & Welas Asih)
                </option>
                <option value="Cinta Lingkungan (Green School & Konservasi)">
                  Cinta Lingkungan (Green School, Kebersihan Sanitasi & Bank Sampah)
                </option>
                <option value="Cinta Bangsa & Tanah Air (Moderasi Beragama)">
                  Cinta Bangsa & Tanah Air (Moderasi Beragama, Toleransi & Kerukunan)
                </option>
                <option value="Harmoni Seluruh 5 Dimensi Panca Cinta KBC">
                  Harmoni Seluruh 5 Dimensi Panca Cinta KBC
                </option>
              </select>
            </div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-rose-950 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-purple-700/50 animate-pulse">
              <Loader2 className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-200">Sedang Memproses Dokumen PKKM...</p>
                <p className="text-xs text-slate-300 mt-0.5">{generationStep}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-pink-50/40 px-6 py-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-4 py-2 border border-pink-200 hover:bg-pink-100/60 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Gunakan format standar instan referensi PKKM tanpa koneksi AI"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Template Baku</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 disabled:opacity-50"
              title="Proses dokumen dengan kecerdasan buatan Gemini AI dan data riil madrasah"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate Dokumen Otentik</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
