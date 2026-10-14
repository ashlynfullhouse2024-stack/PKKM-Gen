import React from 'react';
import { ComponentId } from '../types';
import { PKKM_COMPONENTS } from '../data/pkkmData';
import { CheckCircle2, Cloud, Sparkles, FileText, Heart } from 'lucide-react';

interface DashboardStatsProps {
  totalItems: number;
  completedCount: number;
  driveCount: number;
  activeComponent: ComponentId | 'ALL';
  onSelectComponent: (comp: ComponentId | 'ALL') => void;
  componentStats: Record<ComponentId, { total: number; completed: number }>;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalItems,
  completedCount,
  driveCount,
  activeComponent,
  onSelectComponent,
  componentStats,
}) => {
  const percentage = Math.round((completedCount / (totalItems || 1)) * 100);
  const drivePercentage = Math.round((driveCount / (totalItems || 1)) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 mb-6 print:hidden font-sans">
      {/* 4 Clean Soothing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-slate-100">
        {/* Card 1: Total PKKM */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Bukti Fisik
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              205 <span className="text-xs font-normal text-slate-500">Item</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Juknis Ditjen Pendis 2026</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-slate-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Kelengkapan Dokumen */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dokumen Selesai
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {completedCount} <span className="text-xs font-normal text-slate-500">/ {totalItems}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-teal-700">{percentage}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Google Drive */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tautan G-Drive
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {driveCount} <span className="text-xs font-normal text-slate-500">Terisi</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Folder A1 s.d E4 ({drivePercentage}%)
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Cloud className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Insersi KBC */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Insersi Panca Cinta
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              38 <span className="text-xs font-normal text-slate-500">Item KBC</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Deep Learning & 7 KAIH</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5 Component Navigation Buttons */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Filter 5 Komponen Utama PKKM:
          </span>
          <button
            onClick={() => onSelectComponent('ALL')}
            className={`text-xs px-3 py-1 rounded-lg transition-colors font-semibold ${
              activeComponent === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tampilkan Semua (205)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {PKKM_COMPONENTS.map((comp) => {
            const stats = componentStats[comp.id as ComponentId] || { total: comp.count, completed: 0 };
            const compPercent = Math.round((stats.completed / (stats.total || 1)) * 100);
            const isSelected = activeComponent === comp.id;

            return (
              <button
                key={comp.id}
                onClick={() => onSelectComponent(comp.id as ComponentId)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 shadow-xs ring-1 ring-teal-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      KOMPONEN {comp.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {stats.completed}/{comp.count}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                    {comp.name}
                  </h4>
                </div>

                <div className="mt-2.5">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${compPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
