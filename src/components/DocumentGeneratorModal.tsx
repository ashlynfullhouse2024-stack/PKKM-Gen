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
          setGenerationStep('Menganalisis instrumen PKKM & menyusun tata naskah berbasis pedoman PKKM...');
        }, 1200);

        const timer2 = setTimeout(() => {
          setGenerationStep('Mengintegrasikan Kurikulum Berbasis Cinta (KBC) & matriks bukti fisik...');
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
          // If fallback message was returned because no API key or other reason, use standard high-grade template
          console.log('AI fallback to standard template:', data.message || data.error);
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
      setGenerationStep('Menyiapkan template standar instan...');
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
        <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 px-6 py-4 text-slate-800 flex items-center justify-between border-b border-rose-200/80">
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Item Info Box */}
          <div className="bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-white border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
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

          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Kustomisasi Dokumen (Opsional)
              </h5>
              <span className="text-[11px] text-rose-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                Memberikan data riil madrasah ke AI
              </span>
            </div>

            {/* Explanatory Banner about Customization */}
            <div className="bg-pink-50/60 border border-pink-200/70 rounded-2xl p-3 text-[11px] text-slate-600 leading-relaxed space-y-1">
              <p className="font-bold text-rose-900">
                Apa fungsi formulir kustomisasi ini?
              </p>
              <p>
                Bagian ini menghubungkan <strong>poin bukti fisik PKKM</strong> di atas dengan <strong>kondisi riil madrasah Anda</strong>. Misalnya pada usaha madrasah, Anda dapat menginstruksikan jenis usaha <em>"Hidroponik Sayur"</em>, terhubung mapel <em>"IPA / Prakarya"</em> kelas 8. AI Gemini akan otomatis menyusun draf naskah resmi, tabel rincian kegiatan, dan lembar pengesahan yang otentik.
              </p>
            </div>

            {/* Show Mapel & Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran Terkait (Opsional)
                </label>
                <input
                  type="text"
                  value={mapel}
                  onChange={(e) => setMapel(e.target.value)}
                  placeholder="Misal: IPA, Prakarya, Fikih, dll"
                  className="w-full px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Isi jika dokumen terintegrasi KBM/P5/proyek siswa (contoh: IPA untuk Hidroponik).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat Kelas & Semester (Opsional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    placeholder="Kelas VII/VIII"
                    className="w-full px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Ganjil / Genap"
                    className="w-full px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tingkat sasaran implementasi kegiatan di madrasah.
                </p>
              </div>
            </div>

            {/* KBC Focus */}
            {item.kbcTag && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                  Fokus Dimensi Panca Cinta KBC
                </label>
                <select
                  value={temaKbc}
                  onChange={(e) => setTemaKbc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 bg-purple-50/40 font-medium text-slate-800"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Instruksi Khusus Guru untuk AI (Sangat Direkomendasikan)
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Contoh: Masukkan unit budidaya hidroponik pakcoy & selada, koordinator Bapak Zulkifli, S.Pd, dan omzet panen untuk kas madrasah..."
                className="w-full px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 font-medium text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                AI akan membaca catatan ini dan menjadikannya materi pokok dalam klausul dokumen resmi PKKM.
              </p>
            </div>
          </div>

          {/* Generating State */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-rose-950 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-purple-700/50">
              <Loader2 className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-200">Sedang Memproses Dokumen AI...</p>
                <p className="text-xs text-slate-300 mt-0.5">{generationStep}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-pink-50/40 px-6 py-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 border border-pink-200 bg-white hover:bg-pink-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 disabled:opacity-50 cursor-pointer"
              title="Batalkan proses pembuatan dokumen"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-pink-200/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-102"
              title="Mulai membuat naskah dokumen resmi lengkap dengan bantuan kecerdasan buatan Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate dengan Gemini AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
