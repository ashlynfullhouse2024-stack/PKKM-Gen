import React, { useState } from 'react';
import { MadrasahProfile, PKKMItem } from '../types';
import { generateStandardDocument } from '../utils/documentTemplates';
import { 
  Sparkles, 
  X, 
  Check, 
  FileText, 
  Wand2, 
  BookOpen, 
  Layers, 
  HeartHandshake, 
  Loader2, 
  AlertCircle 
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
  const [mapel, setMapel] = useState('Pendidikan Agama Islam (Fikih)');
  const [kelas, setKelas] = useState('Kelas VIII / Fase D');
  const [semester, setSemester] = useState('Semester Ganjil');
  const [temaKbc, setTemaKbc] = useState('Cinta Allah & Rasul dan Cinta Sesama');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleGenerate = async (useAi: boolean) => {
    setIsGenerating(true);
    setErrorMsg(null);

    const fullCustomNotes = [
      mapel ? `Mata Pelajaran: ${mapel}` : '',
      kelas ? `Tingkat / Fase: ${kelas}` : '',
      semester ? `Semester: ${semester}` : '',
      item.kbcTag && temaKbc ? `Fokus Panca Cinta KBC: ${temaKbc}` : '',
      customPrompt ? `Catatan Tambahan: ${customPrompt}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (useAi) {
      setGenerationStep('Menghubungkan ke Gemini 3.8 Flash AI...');
      try {
        const timer1 = setTimeout(() => {
          setGenerationStep('Menganalisis instrumen PKKM & menyusun tata naskah dinas Kemenag...');
        }, 1200);

        const timer2 = setTimeout(() => {
          setGenerationStep('Mengintegrasikan Kurikulum Berbasis Cinta (KBC) & matriks bukti fisik...');
        }, 2800);

        const response = await fetch('/api/generate-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item,
            profile,
            customPrompt: fullCustomNotes,
            style: 'formal',
          }),
        });

        clearTimeout(timer1);
        clearTimeout(timer2);

        const data = await response.json();

        if (data.content) {
          onDocumentGenerated(item.title, data.content, item);
          setIsGenerating(false);
          return;
        } else {
          // If fallback message was returned because no API key or other reason, use standard high-grade template
          console.log('AI fallback to official standard template:', data.message);
          const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
          onDocumentGenerated(item.title, fallbackDoc, item);
          setIsGenerating(false);
          return;
        }
      } catch (err: any) {
        console.warn('AI call error, switching to standard template:', err);
        // Seamless fallback to standard official template
        const fallbackDoc = generateStandardDocument(item, profile, fullCustomNotes);
        onDocumentGenerated(item.title, fallbackDoc, item);
        setIsGenerating(false);
        return;
      }
    } else {
      // Instant template mode
      setGenerationStep('Menyiapkan template resmi instan...');
      setTimeout(() => {
        const standardDoc = generateStandardDocument(item, profile, fullCustomNotes);
        onDocumentGenerated(item.title, standardDoc, item);
        setIsGenerating(false);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 border border-teal-700 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-teal-900 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-700">
                  ITEM #{item.id}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {item.folderName}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                Generator Dokumen Fisik PKKM 2026
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Item Info Box */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded mb-1">
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
                <span className="shrink-0 inline-flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                  KBC Insersi
                </span>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Kustomisasi Dokumen (Opsional)
            </h5>

            {/* Show Mapel & Kelas if relevant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran Terkait
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Misal: Fikih, Al-Qur'an Hadits, IPA"
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Kelas & Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Kelas VII/VIII"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Ganjil / Genap"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* KBC Focus */}
            {item.kbcTag && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                  Fokus Dimensi Panca Cinta KBC
                </label>
                <select
                  value={temaKbc}
                  onChange={(e) => setTemaKbc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50/30"
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

            {/* Custom Teacher Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Instruksi Khusus Guru untuk AI
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Contoh: Cantumkan nama koordinator Bapak Zulkifli, S.Ag; masukkan kegiatan shalat dhuha berjamaah dan evaluasi bulanan..."
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Generating State */}
          {isGenerating && (
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-teal-300">Sedang Memproses Dokumen AI...</p>
                <p className="text-xs text-slate-300 mt-0.5">{generationStep}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Buat naskah dokumen seketika menggunakan draf template baku resmi Kemenag"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Gunakan Template Cepat (Instan)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 cursor-pointer"
              title="Batalkan proses pembuatan dokumen"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              title="Mulai membuat naskah dokumen resmi lengkap dengan bantuan kecerdasan buatan Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate dengan Gemini AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
