import React, { useState, useMemo } from 'react';
import { ComponentId, PKKMItem } from '../types';
import { PKKM_FOLDERS } from '../data/pkkmData';
import { getDocumentOrientation } from '../utils/documentTemplates';
import { 
  Search, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Circle, 
  Link2, 
  ExternalLink, 
  HeartHandshake, 
  LayoutList, 
  LayoutGrid,
  LayoutTemplate,
  UploadCloud
} from 'lucide-react';

interface ItemListProps {
  items: PKKMItem[];
  activeComponent: ComponentId | 'ALL';
  onOpenGenerator: (item: PKKMItem) => void;
  onInstantGenerate: (item: PKKMItem) => void;
  onOpenUploadItem?: (item: PKKMItem) => void;
  onToggleStatus: (itemId: number) => void;
  onUpdateDriveUrl: (itemId: number, url: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  activeComponent,
  onOpenGenerator,
  onInstantGenerate,
  onOpenUploadItem,
  onToggleStatus,
  onUpdateDriveUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyKbc, setOnlyKbc] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(items.map((it) => it.category));
    return Array.from(set).sort();
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Component filter
      if (activeComponent !== 'ALL' && item.componentId !== activeComponent) {
        return false;
      }
      // Folder filter
      if (selectedFolder !== 'ALL' && item.folderId !== selectedFolder) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'selesai' && item.status !== 'selesai') return false;
        if (selectedStatus === 'belum' && item.status === 'selesai') return false;
      }
      // KBC filter
      if (onlyKbc && !item.kbcTag) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = String(item.id) === query.replace('#', '');
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesFolder = item.folderName.toLowerCase().includes(query);
        if (!matchesId && !matchesTitle && !matchesDesc && !matchesFolder) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeComponent, selectedFolder, selectedCategory, selectedStatus, onlyKbc, searchTerm]);

  // Quick counts
  const completedCount = useMemo(() => items.filter((it) => it.status === 'selesai').length, [items]);
  const uncompletedCount = useMemo(() => items.filter((it) => it.status !== 'selesai').length, [items]);
  const kbcCount = useMemo(() => items.filter((it) => it.kbcTag).length, [items]);

  const searchShortcuts = ['SK', 'SOP', 'Modul Ajar', 'Laporan', 'Notulen', 'KBC', 'TPPK'];

  return (
    <div className="space-y-4 font-sans">
      {/* Controls Bar - Soft Pastel Theme */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-rose-100/90 p-4 sm:p-5 print:hidden space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
            <input
              type="text"
              placeholder="Cari nomor (#10), judul dokumen, 'KBC', 'TPPK', 'Modul Ajar'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 text-xs sm:text-sm border border-pink-200/80 rounded-2xl bg-pink-50/20 focus:bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                title="Hapus kata kunci pencarian dan tampilkan semua bukti fisik"
              >
                Reset
              </button>
            )}
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Folder Dropdown */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-white focus:ring-2 focus:ring-rose-400 font-semibold text-slate-700 cursor-pointer shadow-2xs"
              title="Filter dokumen berdasarkan 20 sub-folder penilaian (A1 s.d E4)"
            >
              <option value="ALL">Semua Folder (A1 - E4)</option>
              {PKKM_FOLDERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} - {f.name}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-white focus:ring-2 focus:ring-rose-400 font-semibold text-slate-700 cursor-pointer shadow-2xs"
              title="Filter dokumen berdasarkan jenis naskah (SK, SOP, Modul Ajar, Laporan, Notulen, dll)"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-pink-200/80 rounded-xl bg-white focus:ring-2 focus:ring-rose-400 font-semibold text-slate-700 cursor-pointer shadow-2xs"
              title="Filter dokumen berdasarkan status pengerjaan (Sudah Selesai atau Belum Dibuat)"
            >
              <option value="ALL">Semua Status</option>
              <option value="selesai">Sudah Selesai</option>
              <option value="belum">Belum Dibuat</option>
            </select>

            {/* KBC Only Toggle */}
            <button
              onClick={() => setOnlyKbc(!onlyKbc)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                onlyKbc
                  ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                  : 'bg-white border-pink-200/80 text-slate-700 hover:bg-purple-50'
              }`}
              title="Saring hanya dokumen yang memuat materi Kurikulum Berbasis Cinta (KBC), Panca Cinta & Deep Learning"
            >
              <HeartHandshake className={`w-3.5 h-3.5 ${onlyKbc ? 'text-purple-600' : 'text-purple-400'}`} />
              <span>Insersi KBC</span>
            </button>

            {/* View Mode Switcher */}
            <div className="bg-pink-50/50 p-1 rounded-xl flex items-center gap-1 border border-pink-200/60">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Beralih ke tampilan tabel daftar baris (List View)"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Beralih ke tampilan kartu kotak (Grid View)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills Row (Super Memudahkan!) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Filter Cepat:</span>
          
          <button
            onClick={() => {
              setSelectedStatus('ALL');
              setOnlyKbc(false);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'ALL' && !onlyKbc
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-pink-50/70 text-slate-700 hover:bg-pink-100/70 border border-pink-200/70'
            }`}
            title="Tampilkan seluruh dokumen"
          >
            Semua ({items.length})
          </button>

          <button
            onClick={() => {
              setSelectedStatus('belum');
              setOnlyKbc(false);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'belum'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100/70 border border-amber-200/70'
            }`}
            title="Tampilkan hanya dokumen yang belum dibuat"
          >
            Belum Selesai ({uncompletedCount})
          </button>

          <button
            onClick={() => {
              setSelectedStatus('selesai');
              setOnlyKbc(false);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'selesai'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/70'
            }`}
            title="Tampilkan hanya dokumen yang sudah selesai"
          >
            Sudah Selesai ({completedCount})
          </button>

          <button
            onClick={() => setOnlyKbc(true)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              onlyKbc
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100/70 border border-purple-200/70'
            }`}
            title="Tampilkan dokumen yang mengandung unsur Kurikulum Berbasis Cinta"
          >
            Panca Cinta KBC ({kbcCount})
          </button>

          {/* Quick Keyword Shortcuts */}
          <span className="text-pink-300 mx-1 hidden sm:inline">•</span>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Kata Kunci:</span>
          {searchShortcuts.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 hover:bg-pink-100/80 text-slate-600 hover:text-rose-700 border border-slate-200/70 transition-colors cursor-pointer"
              title={`Cari cepat dokumen dengan kata kunci '${tag}'`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Filter results summary */}
        <div className="pt-2 border-t border-pink-100/70 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-rose-700 font-extrabold">{filteredItems.length}</strong> dari total <strong>{items.length}</strong> bukti fisik PKKM 2026
          </span>
          {(searchTerm || selectedFolder !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || onlyKbc) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFolder('ALL');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setOnlyKbc(false);
              }}
              className="text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
              title="Reset dan kembalikan semua filter ke kondisi semula"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Items Display */}
      {/* Main Items Display */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/90 rounded-3xl border border-rose-100 p-12 text-center text-slate-400 shadow-2xs">
          <FileText className="w-12 h-12 mx-auto text-pink-200 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada bukti fisik yang sesuai</h4>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau klik "Hapus Semua Filter" di atas</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Table Mode */
        <div className="bg-white/95 rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-rose-50">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.status === 'selesai' ? 'bg-rose-50/25 hover:bg-rose-50/40 border-l-4 border-rose-400' : 'hover:bg-pink-50/30'
                }`}
              >
                {/* Left: Item identity and descriptions */}
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Status toggle checkbox */}
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-1 text-slate-300 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                    title={item.status === 'selesai' ? 'Klik untuk membatalkan tanda selesai' : 'Klik untuk menandai dokumen ini sudah selesai'}
                  >
                    {item.status === 'selesai' ? (
                      <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-pink-200 hover:text-rose-400" />
                    )}
                  </button>

                  {/* Badges & Content */}
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span 
                        className="bg-gradient-to-r from-rose-400 to-pink-500 text-white font-mono font-black px-2 py-0.5 rounded-md text-[10px] shadow-2xs"
                        title={`Nomor Urut Dokumen PKKM #${item.id} dari 205 total instrumen`}
                      >
                        #{item.id}
                      </span>
                      <span 
                        className="bg-pink-50 text-rose-800 font-semibold px-2 py-0.5 rounded-md border border-pink-200/60"
                        title={`Kategori Sub-Folder: ${item.folderName}`}
                      >
                        {item.folderName}
                      </span>
                      <span 
                        className="bg-purple-50 text-purple-800 font-semibold px-2 py-0.5 rounded-md border border-purple-200/60"
                        title={`Format Dokumen Fisik: ${item.category}`}
                      >
                        {item.category}
                      </span>
                      {getDocumentOrientation(item) === 'landscape' ? (
                        <span 
                          className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-200/80 text-[10px]"
                          title="Format dokumen otomatis disesuaikan dalam orientasi Lanskap (A4 Melebar) untuk tabel rapi"
                        >
                          Lanskap
                        </span>
                      ) : (
                        <span 
                          className="bg-slate-50 text-slate-600 font-medium px-2 py-0.5 rounded-md border border-slate-200/80 text-[10px]"
                          title="Format dokumen otomatis dalam orientasi Potret (A4 Tegak)"
                        >
                          Potret
                        </span>
                      )}
                      {item.kbcTag && (
                        <span 
                          className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] border border-purple-200"
                          title="Dokumen ini terintegrasi dengan Kurikulum Berbasis Cinta (KBC) dan Deep Learning"
                        >
                          <HeartHandshake className="w-3 h-3 text-purple-600" />
                          Insersi KBC
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    {/* Google Drive Link input row */}
                    <div className="pt-2 flex items-center gap-2 max-w-xl">
                      <Link2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <input
                        type="url"
                        placeholder="Link file/folder Google Drive untuk bukti fisik ini..."
                        value={item.gdriveUrl || ''}
                        onChange={(e) => onUpdateDriveUrl(item.id, e.target.value)}
                        className="flex-1 px-3 py-1 text-[11px] border border-pink-200/70 rounded-xl bg-pink-50/20 hover:bg-white focus:bg-white focus:ring-1 focus:ring-rose-400 font-mono transition-all"
                        title="Ketik atau tempel link Google Drive dokumen bukti fisik ini untuk rekapan Tim Asesor"
                      />
                      {item.gdriveUrl && (
                        <a
                          href={item.gdriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-sky-600 hover:text-sky-800 cursor-pointer"
                          title="Buka file/folder dokumen ini di Google Drive pada tab baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onInstantGenerate(item)}
                    className="px-3.5 py-2 border border-pink-200 hover:bg-pink-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Buat dokumen cepat dan instan menggunakan naskah template standar referensi PKKM"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Template</span>
                  </button>

                  {onOpenUploadItem && (
                    <button
                      onClick={() => onOpenUploadItem(item)}
                      className="px-3 py-2 border border-purple-200 hover:bg-purple-50 text-purple-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Unggah file naskah dokumen guru/madrasah (.docx / .txt) untuk bukti fisik ini"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenGenerator(item)}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
                    title="Generate naskah dokumen lengkap dan detail menggunakan kecerdasan buatan Gemini AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Generate AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                item.status === 'selesai'
                  ? 'border-rose-300 bg-rose-50/30 shadow-xs'
                  : 'border-rose-100 bg-white hover:border-pink-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="bg-gradient-to-r from-rose-400 to-pink-500 text-white font-mono font-black px-2 py-0.5 rounded-md text-[10px]"
                      title={`Instrumen PKKM #${item.id}`}
                    >
                      #{item.id}
                    </span>
                    <span 
                      className="bg-pink-50 text-rose-800 font-semibold px-2 py-0.5 rounded-md text-[10px] border border-pink-200/60"
                      title={`Sub-folder: ${item.folderId}`}
                    >
                      {item.folderId}
                    </span>
                    {getDocumentOrientation(item) === 'landscape' ? (
                      <span 
                        className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[9px] border border-indigo-200/60"
                        title="Format Lanskap"
                      >
                        Lanskap
                      </span>
                    ) : (
                      <span 
                        className="bg-slate-50 text-slate-500 font-medium px-1.5 py-0.5 rounded text-[9px] border border-slate-200/60"
                        title="Format Potret"
                      >
                        Potret
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="text-slate-300 hover:text-rose-600 cursor-pointer"
                    title={item.status === 'selesai' ? 'Klik untuk membatalkan tanda selesai' : 'Klik untuk menandai dokumen ini selesai'}
                  >
                    {item.status === 'selesai' ? (
                      <CheckCircle2 className="w-5 h-5 text-rose-500 fill-rose-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-pink-200 hover:text-rose-400" />
                    )}
                  </button>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {item.kbcTag && (
                  <div className="mt-2">
                    <span 
                      className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] border border-purple-200/60"
                      title="Dokumen ini bermuatan Kurikulum Berbasis Cinta (KBC)"
                    >
                      <HeartHandshake className="w-3 h-3 text-purple-600" />
                      Insersi KBC
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-rose-50 space-y-2">
                {/* G-Drive input */}
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <input
                    type="url"
                    placeholder="Link G-Drive..."
                    value={item.gdriveUrl || ''}
                    onChange={(e) => onUpdateDriveUrl(item.id, e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] border border-pink-200/70 rounded-xl bg-pink-50/20 focus:bg-white focus:ring-1 focus:ring-rose-400 font-mono transition-all"
                    title="Ketik atau tempel tautan Google Drive dokumen ini"
                  />
                  {item.gdriveUrl && (
                    <a
                      href={item.gdriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-sky-600 hover:text-sky-800 cursor-pointer"
                      title="Buka berkas di Google Drive pada tab baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onInstantGenerate(item)}
                    className="py-2 border border-pink-200 hover:bg-pink-50 text-slate-700 hover:text-rose-700 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    title="Buat dokumen cepat seketika menggunakan draf template referensi PKKM"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Template</span>
                  </button>
                  {onOpenUploadItem && (
                    <button
                      onClick={() => onOpenUploadItem(item)}
                      className="py-2 border border-purple-200 hover:bg-purple-50 text-purple-700 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      title="Unggah file naskah dokumen guru/madrasah (.docx / .txt)"
                    >
                      <UploadCloud className="w-3 h-3 text-purple-600" />
                      <span>Upload</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenGenerator(item)}
                    className="py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-[11px] font-bold rounded-xl shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer hover:scale-102"
                    title="Generate naskah dokumen lengkap dengan bantuan Gemini AI"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>AI</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
