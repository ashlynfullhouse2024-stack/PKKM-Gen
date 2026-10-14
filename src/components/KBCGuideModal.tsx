import React from 'react';
import { 
  BookOpen, 
  X, 
  Heart, 
  Sparkles, 
  ShieldAlert, 
  BrainCircuit, 
  Award, 
  Users, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

interface KBCGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KBCGuideModal: React.FC<KBCGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Glosarium & Panduan Khusus PKKM 2026
              </h3>
              <p className="text-xs text-emerald-200">
                Memahami Konsep Inti: KBC, Panca Cinta, Deep Learning, 7 KAIH, 8 DPL & TPPK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Section 1: Kurikulum Berbasis Cinta (KBC) */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
              <h4 className="text-base font-bold text-purple-950">
                1. Kurikulum Berbasis Cinta (KBC) & KKBC
              </h4>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">
              <strong>KBC (Kurikulum Berbasis Cinta)</strong> adalah paradigma kurikulum khas madrasah yang menekankan pendidikan berbasis kasih sayang (welas asih), keteladanan (uswah hasanah), spiritualitas mendalam, dan penghormatan terhadap martabat setiap peserta didik tanpa kekerasan atau penghukuman fisik.
            </p>
            <p className="text-xs text-purple-900 mt-2">
              <strong>KKBC (Kebiasaan/Karakter Berbasis Cinta)</strong> adalah habituasi harian di madrasah seperti senyum salam sapa (3S), shalat dhuha berjamaah, infak subuh/jumat, adab santun, dan saling tolong-menolong.
            </p>
          </div>

          {/* Section 2: Panca Cinta KBC */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              2. Lima Pilar "Panca Cinta" dalam Instrumen PKKM 2026
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-xs text-emerald-800">1. Cinta Allah dan Rasul</span>
                <p className="text-xs text-slate-600 mt-1">
                  Pembiasaan ibadah fardhu & sunnah (shalat dhuha, tadarus), syukur atas ilmu, dan integritas tauhid.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-xs text-blue-800">2. Cinta Ilmu Pengetahuan</span>
                <p className="text-xs text-slate-600 mt-1">
                  Semangat literasi, rasa ingin tahu kritis, riset siswa (Myres/KIR), dan pemanfaatan teknologi digital / AI beretika.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-xs text-purple-800">3. Cinta Diri dan Sesama</span>
                <p className="text-xs text-slate-600 mt-1">
                  Madrasah ramah anak, anti-perundungan (Anti-Bullying), disiplin positif, dan saling empati antar siswa.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-xs text-teal-800">4. Cinta Lingkungan Hidup</span>
                <p className="text-xs text-slate-600 mt-1">
                  Gerakan Green School, pemilahan sampah organik-anorganik, konservasi air dan energi, serta taman madrasah asri.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white sm:col-span-2">
                <span className="font-bold text-xs text-rose-800">5. Cinta Bangsa dan Tanah Air</span>
                <p className="text-xs text-slate-600 mt-1">
                  Penguatan Moderasi Beragama, toleransi kebinekaan, cinta produk nusantara, dan kontribusi nyata pada kebaikan masyarakat luas.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Deep Learning (Pembelajaran Mendalam) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              3. Deep Learning (Pembelajaran Mendalam) dalam Modul Ajar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong className="text-indigo-900 block mb-1">Mindful Learning</strong>
                <p className="text-slate-600">
                  Siswa hadir utuh dengan kesadaran penuh, emosi stabil (*SEL Check-In*), dan siap menerima ilmu.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong className="text-indigo-900 block mb-1">Meaningful Learning</strong>
                <p className="text-slate-600">
                  Pembelajaran bermakna kontekstual yang mengaitkan materi ajar dengan kehidupan nyata dan kemaslahatan umat.
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <strong className="text-indigo-900 block mb-1">Joyful Learning</strong>
                <p className="text-slate-600">
                  Suasana kelas menggembirakan, apresiatif, interaktif, dan bebas dari rasa cemas atau takut salah.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Gerakan 7 KAIH & 8 DPL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h5 className="font-bold text-xs uppercase text-slate-800 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Gerakan 7 KAIH
              </h5>
              <p className="text-xs text-slate-500 mb-2">
                (7 Karakter Anak Indonesia Hebat):
              </p>
              <ul className="text-xs space-y-1 text-slate-700 list-disc list-inside">
                <li>1. Bangun pagi & ibadah tepat waktu</li>
                <li>2. Berbakti pada orang tua & guru</li>
                <li>3. Gemar membaca & haus ilmu</li>
                <li>4. Makan bergizi & menjaga kebersihan</li>
                <li>5. Olahraga teratur & tubuh bugar</li>
                <li>6. Jujur, amanah & bertanggung jawab</li>
                <li>7. Peduli sesama & gemar bersedekah</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h5 className="font-bold text-xs uppercase text-slate-800 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                8 Dimensi Profil Lulusan (8 DPL)
              </h5>
              <p className="text-xs text-slate-500 mb-2">
                Capaian lulusan madrasah pada Rapor Digital (RDM):
              </p>
              <ul className="text-xs space-y-1 text-slate-700 list-disc list-inside">
                <li>1. Keimanan & Ketakwaan kokoh</li>
                <li>2. Akhlak mulia & berkeadaban (Ta'addub)</li>
                <li>3. Penalaran kritis & analitis</li>
                <li>4. Kreativitas & daya cipta inovatif</li>
                <li>5. Gotong royong & kolaborasi</li>
                <li>6. Kemandirian belajar</li>
                <li>7. Moderasi beragama & kebinekaan global</li>
                <li>8. Kepedulian lingkungan & sosial</li>
              </ul>
            </div>
          </div>

          {/* Section 5: TPPK & Disiplin Positif */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h4 className="text-base font-bold text-red-950">
                5. TPPK (Tim Pencegahan dan Penanganan Kekerasan) Madrasah
              </h4>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">
              Setiap madrasah wajib memiliki Surat Keputusan pembentukan TPPK (Item #10), SOP Pelaporan dan Penanganan (Item #11), program kampanye "Madrasah Happy Tanpa Bully" (Item #12), dan buku jurnal pendampingan konseling (Item #13). Kebijakan disiplin madrasah berpindah dari model hukuman fisik ke <strong>Disiplin Positif & Restitusi</strong> (Item #67).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
