import React, { useState } from 'react';
import { MadrasahProfile } from '../types';
import { DEFAULT_MADRASAH_PROFILE } from '../data/pkkmData';
import { X, Building2, User, Award, Calendar, Link2, Check, RotateCcw } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MadrasahProfile;
  onSaveProfile: (profile: MadrasahProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<MadrasahProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleLoadSamplePdf = () => {
    setFormData(DEFAULT_MADRASAH_PROFILE);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Pengaturan Data Madrasah & PKKM</h3>
              <p className="text-xs text-emerald-200">
                Data ini akan otomatis disisipkan pada Kop, naskah SK, SOP, dan lembar pengesahan
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Preset Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-bold">Contoh Data Madrasah Standar:</span> MTs Al-Hikmah Nusantara (Kepala: Drs. H. Miftah Faridl, M.Pd.I & Penilai: Dr. H. Ahmad Syukron, M.Ag.)
            </div>
            <button
              type="button"
              onClick={handleLoadSamplePdf}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Muat Contoh Data
            </button>
          </div>

          {/* Section 1: Identitas Lembaga */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Identitas Satuan Pendidikan Madrasah
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Resmi Madrasah *
                </label>
                <input
                  type="text"
                  name="namaMadrasah"
                  value={formData.namaMadrasah}
                  onChange={handleChange}
                  required
                  placeholder="Misal: MTs Negeri 1 Cianjur"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang & Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="jenjang"
                    value={formData.jenjang}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MI">MI</option>
                    <option value="MTs">MTs</option>
                    <option value="MA">MA</option>
                  </select>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Statistik (NSM)</label>
                <input
                  type="text"
                  name="nsm"
                  value={formData.nsm}
                  onChange={handleChange}
                  placeholder="12 digit NSM"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  name="npsn"
                  value={formData.npsn}
                  onChange={handleChange}
                  placeholder="8 digit NPSN"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  placeholder="Jawa Barat"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap (Jalan, RT/RW)
                </label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Jl. Ki Hajar Dewantara No. 77"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
                <input
                  type="text"
                  name="desaKelurahan"
                  value={formData.desaKelurahan}
                  onChange={handleChange}
                  placeholder="Maju Jaya"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  placeholder="Sukarukun"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  name="kabupatenKota"
                  value={formData.kabupatenKota}
                  onChange={handleChange}
                  placeholder="Kabupaten Nusantara"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kepala Madrasah & Komite */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
              <User className="w-4 h-4 text-teal-700" />
              2. Kepala Madrasah & Komite
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kepala Madrasah (Gelar) *
                </label>
                <input
                  type="text"
                  name="namaKepala"
                  value={formData.namaKepala}
                  onChange={handleChange}
                  required
                  placeholder="Drs. H. Miftah Faridl, M.Pd.I"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  name="nipKepala"
                  value={formData.nipKepala}
                  onChange={handleChange}
                  placeholder="197604122003121004"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pangkat / Golongan</label>
                <input
                  type="text"
                  name="pangkatKepala"
                  value={formData.pangkatKepala}
                  onChange={handleChange}
                  placeholder="Pembina / IV-a"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Ketua Komite Madrasah
                </label>
                <input
                  type="text"
                  name="namaKetuaKomite"
                  value={formData.namaKetuaKomite}
                  onChange={handleChange}
                  placeholder="H. Bambang Sulistyo, M.M."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Data Penilai & Tanggal PKKM */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
              <Award className="w-4 h-4 text-teal-700" />
              3. Tim Penilai / Pengawas & Jadwal Penilaian PKKM
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Penilai-1 / Pengawas Pembina *
                </label>
                <input
                  type="text"
                  name="namaPenilai"
                  value={formData.namaPenilai}
                  onChange={handleChange}
                  required
                  placeholder="Dr. H. Ahmad Syukron, M.Ag."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Penilai-1</label>
                <input
                  type="text"
                  name="nipPenilai"
                  value={formData.nipPenilai}
                  onChange={handleChange}
                  placeholder="196811201995031001"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan Penilai</label>
                <input
                  type="text"
                  name="jabatanPenilai"
                  value={formData.jabatanPenilai}
                  onChange={handleChange}
                  placeholder="Pengawas Madrasah Madya Kemenag"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Penilaian</label>
                <input
                  type="text"
                  name="tahunPenilaian"
                  value={formData.tahunPenilaian}
                  onChange={handleChange}
                  placeholder="2026"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  name="tahunAjaran"
                  value={formData.tahunAjaran}
                  onChange={handleChange}
                  placeholder="2025/2026"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Dokumen / Penilaian
                </label>
                <input
                  type="text"
                  name="tanggalPenilaian"
                  value={formData.tanggalPenilaian}
                  onChange={handleChange}
                  placeholder="21 Nopember 2026"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Master Google Drive */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-2 border-b pb-1.5">
              <Link2 className="w-4 h-4 text-emerald-600" />
              4. Master Tautan Google Drive Madrasah
            </h4>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Folder Utama Bukti Fisik PKKM 2026 (Opsional)
              </label>
              <input
                type="url"
                name="masterDriveUrl"
                value={formData.masterDriveUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Folder utama yang menampung subfolder A1 sampai E4 untuk dibagikan kepada Pengawas/Penilai.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
