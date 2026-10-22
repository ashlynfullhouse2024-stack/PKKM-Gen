import React, { useState } from 'react';
import { MadrasahProfile, PKKMItem } from '../types';
import { generateStandardDocument } from '../utils/documentTemplates';
import { 
  Layers, 
  X, 
  Check, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  UserCheck, 
  DollarSign, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

interface BatchPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PKKMItem[];
  profile: MadrasahProfile;
  onSaveBatch: (docs: { item: PKKMItem; title: string; content: string }[]) => void;
}

interface CuratedPack {
  id: string;
  name: string;
  badge: string;
  icon: any;
  color: string;
  description: string;
  itemIds: number[];
}

const CURATED_PACKS: CuratedPack[] = [
  {
    id: 'sk-wajib',
    name: 'Paket SK Keputusan Wajib Madrasah',
    badge: '8 Dokumen SK',
    icon: ShieldCheck,
    color: 'emerald',
    description: 'Surat Keputusan resmi pilar kelembagaan: SK TPPK, SK SIM TIK, SK Komite, SK Tim PKG, SK Pembagian Tugas, SK Kurikulum, SK Tim BOS, dan SK Supervisor.',
    itemIds: [10, 22, 35, 51, 74, 76, 101, 153],
  },
  {
    id: 'kbc-pembelajaran',
    name: 'Paket Kurikulum Berbasis Cinta (KBC)',
    badge: '6 Dokumen Inti KBC',
    icon: HeartHandshake,
    color: 'purple',
    description: 'Dokumen kunci implementasi Kurikulum Cinta: Analisis CP-TP Insersi KBC, Modul Ajar Deep Learning, SOP Disiplin Positif, dan Jurnal 7 KAIH.',
    itemIds: [1, 2, 3, 11, 67, 198],
  },
  {
    id: 'supervisi-lengkap',
    name: 'Paket Supervisi Guru & Tendik (D1 - D3)',
    badge: '6 Dokumen Supervisi',
    icon: UserCheck,
    color: 'blue',
    description: 'Perencanaan dan pelaksanaan supervisi akademik: Program Supervisi Tahunan, Jadwal Supervisi, Lembar Pra-Observasi, Instrumen Kelas, dan Dokumen RTL.',
    itemIds: [153, 154, 155, 156, 160, 169],
  },
  {
    id: 'keuangan-akuntabilitas',
    name: 'Paket Akuntabilitas & Keuangan Madrasah',
    badge: '5 Dokumen Keuangan',
    icon: DollarSign,
    color: 'amber',
    description: 'Bukti transparansi manajerial: Berita Acara Rapat RKAM Komite, Peta Belanja KBC, Laporan Evaluasi Anggaran, dan SK Tim Pengelola BOS.',
    itemIds: [101, 102, 103, 107, 109],
  },
];

export const BatchPackModal: React.FC<BatchPackModalProps> = ({
  isOpen,
  onClose,
  items,
  profile,
  onSaveBatch,
}) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('sk-wajib');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePack = CURATED_PACKS.find((p) => p.id === selectedPackId);
  const packItems = items.filter((it) => activePack?.itemIds.includes(it.id));

  const handleGeneratePack = async () => {
    if (!activePack) return;
    setIsProcessing(true);
    setSuccessMsg(null);

    const generatedDocs = packItems.map((it) => {
      const docContent = generateStandardDocument(it, profile);
      return {
        item: it,
        title: it.title,
        content: docContent,
      };
    });

    // Simulate batch generation progress
    setTimeout(() => {
      onSaveBatch(generatedDocs);
      setIsProcessing(false);
      setSuccessMsg(`Berhasil menghasilkan ${generatedDocs.length} dokumen ${activePack.name}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Paket Dokumen Cepat (Batch Generator)
              </h3>
              <p className="text-xs text-emerald-200">
                Generate sekumpulan dokumen fisik utama sekaligus dalam hitungan detik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors cursor-pointer"
            title="Tutup jendela paket dokumen cepat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pack Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CURATED_PACKS.map((pack) => {
              const Icon = pack.icon;
              const isSelected = selectedPackId === pack.id;

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {pack.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {pack.badge}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {pack.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Details of selected pack */}
          {activePack && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Item yang akan dibuat ({packItems.length} Dokumen):
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {packItems.map((it) => (
                  <div
                    key={it.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-2 shadow-xs"
                  >
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      #{it.id}
                    </span>
                    <span className="font-medium text-slate-800 line-clamp-1">{it.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Dokumen yang dibuat otomatis disesuaikan dengan identitas <strong>{profile.namaMadrasah}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
              title="Tutup jendela paket dokumen dan kembali ke dashboard"
            >
              Tutup
            </button>
            <button
              onClick={handleGeneratePack}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              title="Generate seluruh dokumen resmi dalam paket ini secara otomatis sekaligus"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Membuat Seluruh Dokumen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Paket Ini Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
