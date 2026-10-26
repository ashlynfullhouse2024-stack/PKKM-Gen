import React, { useState, useEffect, useMemo } from 'react';
import { ComponentId, GeneratedDocument, MadrasahProfile, PKKMItem, UserAccount } from './types';
import { DEFAULT_MADRASAH_PROFILE, getInitialItems } from './data/pkkmData';
import { getStoredAccounts, saveStoredAccounts } from './data/userAccounts';
import { generateStandardDocument } from './utils/documentTemplates';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { ItemList } from './components/ItemList';
import { ProfileModal } from './components/ProfileModal';
import { DocumentGeneratorModal } from './components/DocumentGeneratorModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { GDriveMatrixModal } from './components/GDriveMatrixModal';
import { BatchPackModal } from './components/BatchPackModal';
import { KBCGuideModal } from './components/KBCGuideModal';
import { SavedDocumentsDrawer } from './components/SavedDocumentsDrawer';
import { LoginGate } from './components/LoginGate';
import { SellerAccountsModal } from './components/SellerAccountsModal';
import { UserFlowModal } from './components/UserFlowModal';
import { BackupRestoreModal } from './components/BackupRestoreModal';
import { Check, Sparkles, Compass } from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'pkkm_2026_profile',
  ITEMS: 'pkkm_2026_items',
  SAVED_DOCS: 'pkkm_2026_saved_docs',
  FOLDER_LINKS: 'pkkm_2026_folder_links',
  ACTIVE_USER: 'pkkm_2026_active_user',
  AUTO_SHOW_USER_FLOW: 'pkkm_2026_auto_show_flow',
  HAS_SEEN_USER_FLOW: 'pkkm_2026_has_seen_flow',
};

export default function App() {
  // 0. Accounts & Authentication State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => getStoredAccounts());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 1. Madrasah Profile State
  const [profile, setProfile] = useState<MadrasahProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.namaMadrasah?.includes('Cianjur') || parsed.namaPenilai?.includes('Endas')) {
          return DEFAULT_MADRASAH_PROFILE;
        }
        return parsed;
      }
      return DEFAULT_MADRASAH_PROFILE;
    } catch {
      return DEFAULT_MADRASAH_PROFILE;
    }
  });

  // 2. PKKM 205-Items State
  const [items, setItems] = useState<PKKMItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 205) {
          return parsed;
        }
      }
      return getInitialItems();
    } catch {
      return getInitialItems();
    }
  });

  // 3. Saved Documents State
  const [savedDocs, setSavedDocs] = useState<GeneratedDocument[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_DOCS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 4. Folder Drive Links State
  const [folderLinks, setFolderLinks] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FOLDER_LINKS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // 5. Active Component Filter
  const [activeComponent, setActiveComponent] = useState<ComponentId | 'ALL'>('ALL');

  // 6. Modal & Drawer States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGDriveOpen, setIsGDriveOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isKBCGuideOpen, setIsKBCGuideOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [autoShowUserFlow, setAutoShowUserFlow] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTO_SHOW_USER_FLOW);
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });
  const [isUserFlowOpen, setIsUserFlowOpen] = useState<boolean>(() => {
    try {
      const auto = localStorage.getItem(STORAGE_KEYS.AUTO_SHOW_USER_FLOW);
      const seen = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_USER_FLOW);
      if (auto === 'false') return false;
      return !seen;
    } catch {
      return false;
    }
  });

  // 7. Active Generator & Viewer Items
  const [generatorItem, setGeneratorItem] = useState<PKKMItem | null>(null);
  const [viewerData, setViewerData] = useState<{
    item: PKKMItem;
    title: string;
    content: string;
  } | null>(null);

  // 8. Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      }
    } catch (e) {
      console.warn('LocalStorage save user failed', e);
    }
  }, [currentUser]);

  useEffect(() => {
    saveStoredAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage save profile failed:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save items failed:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_DOCS, JSON.stringify(savedDocs));
    } catch (e) {
      console.warn('LocalStorage save docs failed:', e);
    }
  }, [savedDocs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDER_LINKS, JSON.stringify(folderLinks));
    } catch (e) {
      console.warn('LocalStorage save links failed:', e);
    }
  }, [folderLinks]);

  // Statistics calculation
  const completedCount = useMemo(() => {
    return items.filter((it) => it.status === 'selesai').length;
  }, [items]);

  const driveCount = useMemo(() => {
    return items.filter((it) => Boolean(it.gdriveUrl && it.gdriveUrl.trim())).length;
  }, [items]);

  const componentStats = useMemo(() => {
    const stats: Record<ComponentId, { total: number; completed: number }> = {
      A: { total: 45, completed: 0 },
      B: { total: 75, completed: 0 },
      C: { total: 30, completed: 0 },
      D: { total: 24, completed: 0 },
      E: { total: 31, completed: 0 },
    };

    items.forEach((it) => {
      if (it.status === 'selesai' && stats[it.componentId]) {
        stats[it.componentId].completed++;
      }
    });

    return stats;
  }, [items]);

  // Handlers for Authentication
  const handleLogin = (user: UserAccount, token?: string) => {
    setCurrentUser(user);
    if (token) {
      localStorage.setItem('pkkm_session_token', token);
    }
    // If user has specific madrasah, sync to profile
    if (user.namaMadrasah && user.namaMadrasah !== 'Pusat Distribusi Lisensi PKKM') {
      setProfile((prev) => ({
        ...prev,
        namaMadrasah: user.namaMadrasah,
      }));
    }
    if (autoShowUserFlow) {
      setIsUserFlowOpen(true);
    }
    showToast(`Selamat datang, ${user.namaLengkap}!`);
  };

  const handleRestoreBackup = (data: {
    profile?: MadrasahProfile;
    items?: PKKMItem[];
    folderLinks?: Record<string, string>;
    savedDocs?: GeneratedDocument[];
  }) => {
    if (data.profile) setProfile(data.profile);
    if (data.items && Array.isArray(data.items) && data.items.length === 205) {
      setItems(data.items);
    }
    if (data.folderLinks) setFolderLinks(data.folderLinks);
    if (data.savedDocs && Array.isArray(data.savedDocs)) setSavedDocs(data.savedDocs);
    showToast('Data madrasah & instrumen berhasil dipulihkan!');
  };

  const handleToggleAutoShowFlow = (enabled: boolean) => {
    setAutoShowUserFlow(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_SHOW_USER_FLOW, String(enabled));
    } catch (e) {
      console.warn('LocalStorage save auto show flow failed:', e);
    }
  };

  const handleCloseUserFlow = () => {
    setIsUserFlowOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.HAS_SEEN_USER_FLOW, 'true');
    } catch (e) {
      console.warn('LocalStorage save has seen flow failed:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Berhasil keluar dari sesi.');
  };

  const handleAddAccount = (newAcc: UserAccount) => {
    const updated = [newAcc, ...accounts];
    setAccounts(updated);
    showToast(`Akun '${newAcc.username}' berhasil dibuat untuk pembeli.`);
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    showToast('Akun telah dihapus.');
  };

  // Handlers for Items
  const handleToggleStatus = (itemId: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const nextStatus = it.status === 'selesai' ? 'belum' : 'selesai';
          return { ...it, status: nextStatus };
        }
        return it;
      })
    );
  };

  const handleUpdateDriveUrl = (itemId: number, url: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, gdriveUrl: url } : it))
    );
  };

  const handleInstantGenerate = (item: PKKMItem) => {
    const doc = generateStandardDocument(item, profile);
    setViewerData({
      item,
      title: item.title,
      content: doc,
    });
  };

  const handleDocumentGenerated = (title: string, content: string, item: PKKMItem) => {
    setGeneratorItem(null);
    setViewerData({
      item,
      title,
      content,
    });
  };

  const handleSaveDocument = (title: string, content: string, item: PKKMItem) => {
    const newDoc: GeneratedDocument = {
      id: `doc_${item.id}_${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      componentId: item.componentId,
      folderId: item.folderId,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedDocs((prev) => [newDoc, ...prev.filter((d) => d.itemId !== item.id)]);

    // Mark item as completed
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'selesai' } : it))
    );

    showToast(`Dokumen Bukti Fisik #${item.id} berhasil disimpan ke arsip.`);
  };

  const handleSaveBatch = (docs: { item: PKKMItem; title: string; content: string }[]) => {
    const newDocs: GeneratedDocument[] = docs.map((d) => ({
      id: `doc_${d.item.id}_${Date.now()}`,
      itemId: d.item.id,
      itemTitle: d.item.title,
      componentId: d.item.componentId,
      folderId: d.item.folderId,
      title: d.title,
      content: d.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setSavedDocs((prev) => [...newDocs, ...prev]);

    // Mark generated batch items as completed
    const batchItemIds = new Set(docs.map((d) => d.item.id));
    setItems((prev) =>
      prev.map((it) => (batchItemIds.has(it.id) ? { ...it, status: 'selesai' } : it))
    );

    showToast(`${docs.length} dokumen berhasil digenerate dan disimpan ke arsip.`);
  };

  const handleDeleteSavedDoc = (id: string) => {
    setSavedDocs((prev) => prev.filter((d) => d.id !== id));
    showToast('Dokumen telah dihapus dari arsip.');
  };

  const handleViewSavedDoc = (doc: GeneratedDocument) => {
    const foundItem = items.find((it) => it.id === doc.itemId) || {
      id: doc.itemId,
      componentId: doc.componentId,
      folderId: doc.folderId,
      folderName: doc.folderId,
      title: doc.title,
      category: 'SK',
      description: doc.itemTitle,
      status: 'selesai',
    };

    setIsSavedOpen(false);
    setViewerData({
      item: foundItem as PKKMItem,
      title: doc.title,
      content: doc.content,
    });
  };

  // If user is not logged in, show secure clean Login Gate
  if (!currentUser) {
    return (
      <LoginGate
        accounts={accounts}
        onLoginSuccess={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-pink-50/30 to-purple-50/30 text-slate-800 flex flex-col selection:bg-pink-100 selection:text-rose-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        profile={profile}
        currentUser={currentUser}
        savedCount={savedDocs.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenGDrive={() => setIsGDriveOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenKBCGuide={() => setIsKBCGuideOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenSellerAccounts={() => setIsSellerModalOpen(true)}
        onOpenUserFlow={() => setIsUserFlowOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Sub-header - Soft Girly Pastel Theme */}
      <div className="bg-gradient-to-r from-rose-100/70 via-pink-50/90 to-purple-100/70 py-6 px-4 sm:px-6 lg:px-8 border-b border-rose-200/60 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-white/90 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200/80 shadow-2xs">
                Berbasis Referensi PKKM Kemenag RI
              </span>
              <span className="text-pink-300 text-xs hidden sm:inline">•</span>
              <span className="text-slate-600 text-xs hidden sm:inline font-semibold">
                Tahun Ajaran {profile.tahunAjaran}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Sistem Otomatisasi Bukti Fisik PKKM 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              Buat dokumen administrasi PKKM lengkap 205 instrumen secara otomatis berbasis AI Gemini dan Kurikulum Berbasis Cinta (KBC). Siap ekspor format Word (.doc) dan cetak A4.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setIsUserFlowOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
              title="Buka petunjuk langkah demi langkah cara menggunakan aplikasi dari awal hingga selesai"
            >
              <Compass className="w-3.5 h-3.5 text-amber-200" />
              <span>Alur Penggunaan</span>
            </button>
            <button
              onClick={() => setIsBatchOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
              title="Buat paket dokumen wajib sekaligus dalam 1 kali klik (Paket SK Pokok, Paket KBC, dll)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Paket Cepat</span>
            </button>
            <button
              onClick={() => setIsKBCGuideOpen(true)}
              className="px-3 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-700 font-semibold text-xs rounded-xl border border-pink-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Buka panduan materi Kurikulum Berbasis Cinta, Panca Cinta, Deep Learning & 7 KAIH"
            >
              Panduan KBC
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Statistics and Component Selector */}
        <DashboardStats
          totalItems={items.length}
          completedCount={completedCount}
          driveCount={driveCount}
          activeComponent={activeComponent}
          onSelectComponent={setActiveComponent}
          componentStats={componentStats}
        />

        {/* Master 205 Items List */}
        <ItemList
          items={items}
          activeComponent={activeComponent}
          onOpenGenerator={(it) => setGeneratorItem(it)}
          onInstantGenerate={handleInstantGenerate}
          onToggleStatus={handleToggleStatus}
          onUpdateDriveUrl={handleUpdateDriveUrl}
        />
      </main>

      {/* Footer with Legal Disclaimer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-rose-100 py-6 px-4 text-center text-xs text-slate-500 print:hidden mt-8 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              K
            </div>
            <span className="font-semibold text-slate-700">
              Sistem Bukti Fisik PKKM 2026 AI • Kurikulum Berbasis Cinta
            </span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Berbasis format pedoman SK, SOP, Modul Ajar KBC, dan Tata Naskah Dinas Kementerian Agama RI
          </p>
        </div>

        {/* Clear Legal Disclaimer Box */}
        <div className="max-w-4xl mx-auto bg-rose-50/50 border border-rose-200/60 rounded-2xl p-3 text-[11px] text-slate-500 leading-relaxed text-center">
          <strong>Pemberitahuan Resmi / Disclaimer:</strong> Aplikasi ini merupakan perangkat bantu otomasi digital mandiri yang dikembangkan berdasarkan referensi instrumen Penilaian Kinerja Kepala Madrasah (PKKM) Kementerian Agama RI. Aplikasi ini bukan merupakan sistem atau portal resmi yang diterbitkan langsung oleh Kementerian Agama RI.
        </div>
      </footer>

      {/* MODALS */}
      {/* 0. Seller Accounts Modal (Accessible by Admin Penjual) */}
      <SellerAccountsModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        accounts={accounts}
        onAddAccount={handleAddAccount}
        onSelectAccountToLogin={handleLogin}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* 1. Profile Configuration Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          showToast('Data identitas madrasah & penilai berhasil diperbarui.');
        }}
      />

      {/* 2. Document Generator Modal (AI & Custom Params) */}
      <DocumentGeneratorModal
        isOpen={Boolean(generatorItem)}
        item={generatorItem}
        profile={profile}
        onClose={() => setGeneratorItem(null)}
        onDocumentGenerated={handleDocumentGenerated}
      />

      {/* 3. Document Viewer & Print Modal */}
      {viewerData && (
        <DocumentViewerModal
          isOpen={Boolean(viewerData)}
          item={viewerData.item}
          profile={profile}
          title={viewerData.title}
          content={viewerData.content}
          onClose={() => setViewerData(null)}
          onSaveDocument={handleSaveDocument}
          onRegenerate={() => {
            const it = viewerData.item;
            setViewerData(null);
            setGeneratorItem(it);
          }}
        />
      )}

      {/* 4. Google Drive Folder Matrix Modal */}
      <GDriveMatrixModal
        isOpen={isGDriveOpen}
        onClose={() => setIsGDriveOpen(false)}
        profile={profile}
        items={items}
        folderLinks={folderLinks}
        onSaveFolderLinks={(updated) => {
          setFolderLinks(updated);
          showToast('Tautan Google Drive berhasil disimpan.');
        }}
        onUpdateItemDrive={handleUpdateDriveUrl}
      />

      {/* 5. Batch Pack Generator Modal */}
      <BatchPackModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        items={items}
        profile={profile}
        onSaveBatch={handleSaveBatch}
      />

      {/* 6. KBC & Educational Guide Modal */}
      <KBCGuideModal
        isOpen={isKBCGuideOpen}
        onClose={() => setIsKBCGuideOpen(false)}
      />

      {/* 7. Saved Documents Drawer */}
      <SavedDocumentsDrawer
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedDocs={savedDocs}
        onDeleteDoc={handleDeleteSavedDoc}
        onViewDoc={handleViewSavedDoc}
        onClearAll={() => {
          setSavedDocs([]);
          showToast('Seluruh arsip berhasil dikosongkan.');
        }}
      />

      {/* 8. User Flow / Onboarding Guide Modal */}
      <UserFlowModal
        isOpen={isUserFlowOpen}
        onClose={handleCloseUserFlow}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenGDrive={() => setIsGDriveOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        autoShowOnStart={autoShowUserFlow}
        onToggleAutoShow={handleToggleAutoShowFlow}
      />

      {/* 9. Backup & Restore Data Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        profile={profile}
        items={items}
        folderLinks={folderLinks}
        savedDocs={savedDocs}
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Floating Quick Helper Button for Workflow Guide - Girly Soft Pastel Gradient */}
      <button
        onClick={() => setIsUserFlowOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white px-4 py-2.5 rounded-full shadow-lg border border-white/50 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer print:hidden backdrop-blur-md"
        title="Buka petunjuk langkah demi langkah alur penggunaan aplikasi PKKM 2026"
      >
        <Compass className="w-4 h-4 text-amber-200" />
        <span className="hidden sm:inline">Petunjuk Alur</span>
      </button>
    </div>
  );
}
