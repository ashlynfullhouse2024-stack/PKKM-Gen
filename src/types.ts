export interface MadrasahProfile {
  namaMadrasah: string;
  jenjang: 'MI' | 'MTs' | 'MA';
  status: 'Negeri' | 'Swasta';
  nsm: string;
  npsn: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  tahunPenilaian: string;
  tahunAjaran: string;
  namaKepala: string;
  nipKepala: string;
  pangkatKepala: string;
  namaPenilai: string;
  nipPenilai: string;
  jabatanPenilai: string;
  namaKetuaKomite: string;
  tanggalPenilaian: string;
  masterDriveUrl: string;
}

export type ComponentId = 'A' | 'B' | 'C' | 'D' | 'E';

export interface PKKMFolder {
  id: string; // e.g. "A1", "A2", "B1"
  componentId: ComponentId;
  name: string;
  code: string;
  gdriveUrl?: string;
}

export interface PKKMItem {
  id: number; // 1 to 205
  componentId: ComponentId;
  folderId: string;
  folderName: string;
  title: string;
  category: 'SK' | 'SOP' | 'Modul Ajar' | 'Notulen & Berita Acara' | 'Program Kerja' | 'Laporan' | 'Instrumen' | 'Jurnal/Buku' | 'Data & Rekapitulasi' | 'Media/Foto' | 'Sertifikat/Piagam';
  description: string;
  requiredFields?: string[];
  kbcTag?: boolean; // Mentions KBC, Panca Cinta, or Deep Learning
  sampleTemplatePrompt?: string;
  gdriveUrl?: string;
  status: 'belum' | 'proses' | 'selesai';
}

export interface GeneratedDocument {
  id: string;
  itemId: number;
  itemTitle: string;
  componentId: ComponentId;
  folderId: string;
  title: string;
  content: string; // Markdown / HTML formatted
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  namaLengkap: string;
  role: 'penjual' | 'kepala_madrasah' | 'guru' | 'operator' | 'pengawas';
  namaMadrasah: string;
  statusAktif: boolean;
  tanggalDibuat: string;
  kuotaDokumen?: string;
}

