import React from 'react';
import { 
  Compass, 
  X, 
  Building2, 
  Layers, 
  Sparkles, 
  FileText, 
  Printer, 
  Download, 
  FolderSync, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface UserFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenGDrive: () => void;
  onOpenBatch: () => void;
  autoShowOnStart: boolean;
  onToggleAutoShow: (enabled: boolean) => void;
}

export const UserFlowModal: React.FC<UserFlowModalProps> = ({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenGDrive,
  onOpenBatch,
  autoShowOnStart,
  onToggleAutoShow,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      badge: 'Langkah Pertama',
      title: 'Lengkapi Profil Madrasah & Tim Penilai',
      desc: 'Isi nama madrasah, jenjang (MI/MTs/MA), alamat, nama Kepala Madrasah, dan nama Tim Pengawas/Penilai. Data ini otomatis menjadi KOP Surat dan tanda tangan di seluruh 205 dokumen.',
      icon: Building2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      actionLabel: 'Buka Profil Madrasah',
      action: () => {
        onClose();
        onOpenProfile();
      },
    },
    {
      step: 2,
      badge: 'Langkah Kedua',
      title: 'Telusuri & Filter 205 Instrumen Fisik PKKM',
      desc: 'Pilih Komponen A s.d E di atas dashboard atau gunakan kolom pencarian untuk mencari dokumen spesifik (contoh: "SK TPPK", "Modul Ajar", "KBC", "SOP", "Notulen").',
      icon: Layers,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      actionLabel: 'Jelajahi 205 Instrumen',
      action: onClose,
    },
    {
      step: 3,
      badge: 'Langkah Ketiga',
      title: 'Buat / Upload Dokumen (AI, Template, atau File Guru)',
      desc: 'Gunakan tombol "Generate AI" untuk naskah cerdas berorientasi KBC, "Template" untuk format baku seketika, atau tombol "Upload Dokumen Guru" (.docx / .txt) untuk menyesuaikan dokumen yang sudah dimiliki sekolah/guru ke profil madrasah aktif. Tersedia juga "Paket Cepat" untuk membuat banyak SK pokok sekaligus.',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      actionLabel: 'Lihat Paket Dokumen Cepat',
      action: () => {
        onClose();
        onOpenBatch();
      },
    },
    {
      step: 4,
      badge: 'Langkah Keempat',
      title: 'Edit Naskah, Unduh ke Word (.doc) atau Cetak A4 / PDF',
      desc: 'Pratinjau naskah dalam format kertas A4 dinas resmi. Anda dapat langsung mengedit redaksi klausul bila diperlukan, lalu unduh ke Microsoft Word (.doc) atau cetak langsung ke printer / simpan PDF.',
      icon: Printer,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      actionLabel: 'Paham',
      action: onClose,
    },
    {
      step: 5,
      badge: 'Langkah Kelima',
      title: 'Tautkan Google Drive & Cetak Rekapitulasi Asesor',
      desc: 'Simpan tautan folder Google Drive untuk 20 sub-folder (A1 s.d E4) melalui menu "Link Drive". Anda dapat mengekspor dan mencetak lembar matriks rekap link resmi untuk diserahkan ke Tim Pengawas/Penilai.',
      icon: FolderSync,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      actionLabel: 'Buka Manajemen Drive',
      action: () => {
        onClose();
        onOpenGDrive();
      },
    },
    {
      step: 6,
      badge: 'Langkah Keenam',
      title: 'Pantau Grafik Capaian Real-Time di Dashboard',
      desc: 'Setiap dokumen yang Anda tandai selesai akan otomatis menggerakkan grafik persentase kelengkapan komponen (A-E) di dashboard hingga mencapai target 100%.',
      icon: BarChart3,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      actionLabel: 'Selesai & Mulai',
      action: onClose,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-flow-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-purple-100 text-slate-800 p-5 sm:p-6 shrink-0 flex items-center justify-between border-b border-rose-200/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-rose-500 text-white uppercase shadow-2xs">
                  Panduan Pengguna
                </span>
                <span className="text-xs text-rose-800 font-semibold">• Standar PKKM 2026</span>
              </div>
              <h2 id="user-flow-title" className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Alur Praktis Penggunaan Aplikasi PKKM
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-pink-100 text-slate-500 hover:text-rose-700 flex items-center justify-center transition-colors border border-pink-200/80 cursor-pointer shadow-2xs"
            title="Tutup panduan alur penggunaan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Intro Banner */}
        <div className="bg-teal-50/80 border-b border-teal-100 px-5 sm:px-6 py-3 flex items-center gap-3 text-xs text-teal-900">
          <Lightbulb className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            Aplikasi ini dirancang sebagai asisten digital independen untuk mempermudah Bapak/Ibu Kepala Madrasah, Tim Pengembang, dan Guru dalam menyusun <strong>205 kelengkapan bukti fisik berbasis referensi instrumen PKKM Kementerian Agama RI</strong> secara terstruktur dan terpadu.
          </span>
        </div>

        {/* Steps Content Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[calc(92vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                        {item.step}
                      </span>
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={item.action}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                      title={`Klik untuk: ${item.actionLabel}`}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Tahap {item.step} dari 6
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tips Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tips Penting untuk Asesmen Penilaian:
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Format Microsoft Word (.doc)</strong>: Hasil unduhan langsung diformat rapi dengan tabel, konsideran surat dinas, dan kolom tanda tangan resmi, siap disunting atau ditambahkan lampiran foto kegiatan.
              </li>
              <li>
                <strong>Integrasi KBC & Deep Learning</strong>: Instrumen bernilai Panca Cinta (Cinta Allah & Rasul, Cinta Sesama, Cinta Lingkungan, Cinta Tanah Air, Cinta Diri) sudah memiliki template khusus untuk mempermudah evaluasi madrasah.
              </li>
              <li>
                <strong>Cetak Rekap Link Drive</strong>: Anda tidak perlu membakar CD atau flashdisk; cukup berikan dokumen rekap link folder Google Drive resmi yang diekspor dari aplikasi ini kepada Tim Asesor.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label 
            className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none"
            title="Centang pilihan ini agar pop up alur panduan ini otomatis muncul saat membuka aplikasi"
          >
            <input
              type="checkbox"
              checked={autoShowOnStart}
              onChange={(e) => onToggleAutoShow(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 border-slate-300 w-4 h-4 cursor-pointer"
            />
            <span>Tampilkan panduan ini secara otomatis setiap kali masuk</span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Tutup panduan dan mulai menggunakan aplikasi"
            >
              <span>Saya Mengerti & Mulai</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
