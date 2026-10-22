import React, { useState, useMemo } from 'react';
import { ComponentId } from '../types';
import { PKKM_COMPONENTS } from '../data/pkkmData';
import { 
  CheckCircle2, 
  Cloud, 
  FileText, 
  Heart, 
  BarChart3, 
  TrendingUp,
  Percent,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Legend
} from 'recharts';

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
  const [chartMode, setChartMode] = useState<'percentage' | 'counts'>('percentage');

  const percentage = Math.round((completedCount / (totalItems || 1)) * 100);
  const drivePercentage = Math.round((driveCount / (totalItems || 1)) * 100);

  // Prepare data for Recharts visualization
  const chartData = useMemo(() => {
    const shortNames: Record<ComponentId, string> = {
      A: 'A. Pengembangan',
      B: 'B. Manajerial',
      C: 'C. Kewirausahaan',
      D: 'D. Supervisi',
      E: 'E. Prestasi',
    };

    const colors: Record<ComponentId, { main: string; light: string }> = {
      A: { main: '#059669', light: '#a7f3d0' }, // Emerald / Hijau Kemenag
      B: { main: '#2563eb', light: '#bfdbfe' }, // Blue
      C: { main: '#d97706', light: '#fde68a' }, // Amber / Kewirausahaan
      D: { main: '#7c3aed', light: '#ddd6fe' }, // Purple
      E: { main: '#db2777', light: '#fbcfe8' }, // Pink
    };

    return PKKM_COMPONENTS.map((comp) => {
      const stats = componentStats[comp.id as ComponentId] || { total: comp.count, completed: 0 };
      const pct = Math.round((stats.completed / (stats.total || 1)) * 100);
      const remaining = Math.max(0, stats.total - stats.completed);
      const colorSet = colors[comp.id as ComponentId] || { main: '#0d9488', light: '#ccfbf1' };

      return {
        id: comp.id as ComponentId,
        name: comp.name,
        shortName: shortNames[comp.id as ComponentId] || `Komp ${comp.id}`,
        total: stats.total,
        completed: stats.completed,
        remaining,
        percentage: pct,
        color: colorSet.main,
        lightColor: colorSet.light,
      };
    });
  }, [componentStats]);

  // Average progress across all components
  const averagePercentage = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.percentage, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[220px] transition-all">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: data.color }}
              />
              <span className="font-bold text-slate-800">KOMPONEN {data.id}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {data.percentage}%
            </span>
          </div>

          <p className="font-medium text-slate-700 mb-2 leading-snug">
            {data.name}
          </p>

          <div className="space-y-1 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center text-slate-600">
              <span>Selesai:</span>
              <span className="font-bold text-emerald-600">{data.completed} Dokumen</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Belum Selesai:</span>
              <span className="font-semibold text-slate-500">{data.remaining} Dokumen</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200/60 font-semibold">
              <span>Total Beban:</span>
              <span>{data.total} Dokumen</span>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-teal-600 font-medium text-center italic">
            Klik batang diagram untuk memfilter daftar
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 mb-6 print:hidden font-sans">
      {/* 4 Clean Soothing Summary Cards */}
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

      {/* RECHARTS DATA VISUALIZATION SECTION: Persentase Penyelesaian Tiap Komponen (A-E) Real-Time */}
      <div className="py-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Visualisasi Progres Real-Time Komponen PKKM (A — E)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-9">
              Pantauan capaian penyelesaian dokumen otomatis diperbarui seketika saat status item diperbarui. Rata-rata kemajuan: <span className="font-semibold text-teal-700">{averagePercentage}%</span>
            </p>
          </div>

          {/* Toggle between Percentage and Document Counts */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setChartMode('percentage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === 'percentage'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan grafik batang persentase kelengkapan dokumen tiap komponen (A-E)"
            >
              <Percent className="w-3.5 h-3.5" />
              Persentase (%)
            </button>
            <button
              onClick={() => setChartMode('counts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartMode === 'counts'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan grafik perbandingan jumlah dokumen yang sudah selesai vs belum selesai"
            >
              <Layers className="w-3.5 h-3.5" />
              Jumlah Dokumen
            </button>
          </div>
        </div>

        {/* The Recharts Chart Container */}
        <div className="w-full h-64 sm:h-72 bg-gradient-to-b from-slate-50/50 to-white rounded-xl border border-slate-200/70 p-3 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'percentage' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  dy={8}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={100}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: 'Target 100%',
                    position: 'top',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="percentage"
                  name="Persentase Selesai (%)"
                  radius={[8, 8, 2, 2]}
                  cursor="pointer"
                  onClick={(entry: any) => {
                    if (entry && entry.id) {
                      onSelectComponent(entry.id);
                    }
                  }}
                >
                  {chartData.map((entry) => {
                    const isSelected = activeComponent === entry.id;
                    return (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.color}
                        opacity={activeComponent === 'ALL' || isSelected ? 1 : 0.4}
                        stroke={isSelected ? '#0f172a' : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="completed"
                  name="Dokumen Selesai"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(entry: any) => entry?.id && onSelectComponent(entry.id)}
                />
                <Bar
                  dataKey="remaining"
                  name="Belum Selesai"
                  fill="#e2e8f0"
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(entry: any) => entry?.id && onSelectComponent(entry.id)}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Real-time Component Progress Badges under chart */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          {chartData.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectComponent(item.id)}
              className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                activeComponent === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>Komponen {item.id}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className={`text-base font-extrabold ${activeComponent === item.id ? 'text-white' : 'text-slate-800'}`}>
                  {item.percentage}%
                </span>
                <span className={`text-[10px] ${activeComponent === item.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  ({item.completed}/{item.total})
                </span>
              </div>
            </div>
          ))}
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
            className={`text-xs px-3 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
              activeComponent === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tampilkan seluruh 205 instrumen bukti fisik dari Komponen A sampai E"
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
                title={`Filter daftar bukti fisik hanya untuk Komponen ${comp.id}: ${comp.name} (${stats.completed}/${comp.count} selesai)`}
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
