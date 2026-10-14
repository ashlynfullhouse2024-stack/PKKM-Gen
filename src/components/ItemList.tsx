import React, { useState, useMemo } from 'react';
import { ComponentId, PKKMItem } from '../types';
import { PKKM_FOLDERS } from '../data/pkkmData';
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
  LayoutGrid 
} from 'lucide-react';

interface ItemListProps {
  items: PKKMItem[];
  activeComponent: ComponentId | 'ALL';
  onOpenGenerator: (item: PKKMItem) => void;
  onInstantGenerate: (item: PKKMItem) => void;
  onToggleStatus: (itemId: number) => void;
  onUpdateDriveUrl: (itemId: number, url: string) => void;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  activeComponent,
  onOpenGenerator,
  onInstantGenerate,
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

  return (
    <div className="space-y-4 font-sans">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor (#10), judul dokumen, 'KBC', 'TPPK', 'Modul Ajar'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-700 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
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
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-700 font-medium text-slate-700"
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
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-700 font-medium text-slate-700"
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
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-teal-700 font-medium text-slate-700"
            >
              <option value="ALL">Semua Status</option>
              <option value="selesai">Sudah Selesai</option>
              <option value="belum">Belum Dibuat</option>
            </select>

            {/* KBC Only Toggle */}
            <button
              onClick={() => setOnlyKbc(!onlyKbc)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyKbc
                  ? 'bg-purple-50 border-purple-300 text-purple-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <HeartHandshake className={`w-3.5 h-3.5 ${onlyKbc ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>Insersi KBC</span>
            </button>

            {/* View Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Tabel / Baris"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Kartu Kotak"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter results summary */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredItems.length}</strong> dari total <strong>{items.length}</strong> bukti fisik PKKM 2026
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
              className="text-teal-700 hover:text-teal-900 font-medium hover:underline"
            >
              Hapus Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Items Display */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada bukti fisik yang sesuai</h4>
          <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ubah pilihan filter Anda</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.status === 'selesai' ? 'bg-teal-50/20 hover:bg-teal-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Left: Item identity and descriptions */}
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Status toggle checkbox */}
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-1 text-slate-300 hover:text-teal-700 transition-colors shrink-0 cursor-pointer"
                    title={item.status === 'selesai' ? 'Tandai belum' : 'Tandai selesai'}
                  >
                    {item.status === 'selesai' ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-600 fill-teal-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  {/* Badges & Content */}
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="bg-slate-800 text-white font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                        #{item.id}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {item.folderName}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {item.kbcTag && (
                        <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] border border-purple-200/60">
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
                      <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="url"
                        placeholder="Link file/folder Google Drive untuk bukti fisik ini..."
                        value={item.gdriveUrl || ''}
                        onChange={(e) => onUpdateDriveUrl(item.id, e.target.value)}
                        className="flex-1 px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg bg-slate-50/60 hover:bg-white focus:bg-white focus:ring-1 focus:ring-teal-700 font-mono"
                      />
                      {item.gdriveUrl && (
                        <a
                          href={item.gdriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-teal-700 hover:text-teal-900"
                          title="Buka Link di Google Drive"
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
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Buat dokumen cepat dengan template standar resmi"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Template</span>
                  </button>

                  <button
                    onClick={() => onOpenGenerator(item)}
                    className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Generate dokumen dengan Gemini 3.8 Flash AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                item.status === 'selesai'
                  ? 'border-teal-300 bg-teal-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-800 text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                      #{item.id}
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded text-[10px]">
                      {item.folderId}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="text-slate-300 hover:text-teal-700 cursor-pointer"
                  >
                    {item.status === 'selesai' ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-50" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
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
                    <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] border border-purple-200/60">
                      <HeartHandshake className="w-3 h-3 text-purple-600" />
                      Insersi KBC
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {/* G-Drive input */}
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    placeholder="Link G-Drive..."
                    value={item.gdriveUrl || ''}
                    onChange={(e) => onUpdateDriveUrl(item.id, e.target.value)}
                    className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-md bg-slate-50 focus:bg-white font-mono"
                  />
                  {item.gdriveUrl && (
                    <a
                      href={item.gdriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-teal-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onInstantGenerate(item)}
                    className="py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>Template</span>
                  </button>
                  <button
                    onClick={() => onOpenGenerator(item)}
                    className="py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Generate</span>
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
