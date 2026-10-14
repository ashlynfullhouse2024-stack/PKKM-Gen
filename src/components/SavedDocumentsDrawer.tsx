import React, { useState } from 'react';
import { GeneratedDocument, PKKMItem } from '../types';
import { downloadAsWordDoc, markdownToHtml } from '../utils/exportHelpers';
import { 
  X, 
  Trash2, 
  Download, 
  ExternalLink, 
  FileCheck2, 
  Search, 
  Clock, 
  Printer, 
  Eye 
} from 'lucide-react';

interface SavedDocumentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocs: GeneratedDocument[];
  onDeleteDoc: (id: string) => void;
  onViewDoc: (doc: GeneratedDocument) => void;
  onClearAll: () => void;
}

export const SavedDocumentsDrawer: React.FC<SavedDocumentsDrawerProps> = ({
  isOpen,
  onClose,
  savedDocs,
  onDeleteDoc,
  onViewDoc,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedDocs.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.folderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(d.itemId).includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Arsip Dokumen Fisik Tersimpan</h3>
              <p className="text-[11px] text-emerald-200">
                {savedDocs.length} Dokumen Tersimpan di Browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Bulk Action */}
        <div className="p-3 border-b bg-slate-50 flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dokumen tersimpan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {savedDocs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Yakin ingin menghapus seluruh arsip dokumen tersimpan?')) {
                  onClearAll();
                }
              }}
              className="text-[11px] text-red-600 hover:text-red-800 font-semibold px-2 py-1 hover:bg-red-50 rounded"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {/* List of Documents */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Belum ada dokumen tersimpan</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Pilih salah satu item di daftar utama dan klik "Generate AI" atau "Simpan"
              </p>
            </div>
          ) : (
            filtered.map((doc) => {
              const html = markdownToHtml(doc.content);

              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                      #{doc.itemId} • {doc.folderId}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.updatedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onViewDoc(doc)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka & Cetak</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          downloadAsWordDoc(
                            `PKKM_2026_${doc.folderId}_Item_${doc.itemId}`,
                            doc.title,
                            html
                          )
                        }
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Unduh format Word"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Hapus dari arsip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
