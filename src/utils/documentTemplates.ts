import { MadrasahProfile, PKKMItem } from '../types';

/**
 * Determines whether a PKKM item naturally requires a LANDSCAPE or PORTRAIT layout.
 * Wide multi-column tables (matrices, schedules, financial ledgers, inventory, grade recaps)
 * are set to 'landscape' for optimal readability and official A4 presentation.
 */
export function getDocumentOrientation(item: PKKMItem): 'portrait' | 'landscape' {
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  const cat = item.category;

  // 1. Definite Landscape Items: Jadwal, Matriks, Inventaris, Rekapitulasi, Anggaran, Jurnal 7 KAIH
  if (
    titleLower.includes('jadwal') ||
    titleLower.includes('matriks') ||
    titleLower.includes('inventaris') ||
    titleLower.includes('rekapitulasi') ||
    titleLower.includes('buku kas') ||
    titleLower.includes('bku') ||
    titleLower.includes('rkam') ||
    titleLower.includes('edm') ||
    titleLower.includes('rkjm') ||
    titleLower.includes('rkt') ||
    titleLower.includes('jurnal pembiasaan') ||
    titleLower.includes('7 kaih') ||
    titleLower.includes('pengolahan nilai') ||
    titleLower.includes('rapor') ||
    titleLower.includes('remedial') ||
    titleLower.includes('prestasi') ||
    titleLower.includes('tracer study') ||
    titleLower.includes('agenda surat') ||
    titleLower.includes('leger') ||
    titleLower.includes('peta') ||
    cat === 'Data & Rekapitulasi'
  ) {
    return 'landscape';
  }

  // 2. Specific Item IDs known to be wide tables in PKKM
  const landscapeIds = [6, 7, 12, 36, 46, 50, 60, 80, 86, 87, 88, 89, 90, 106, 107, 108, 109, 116, 117, 155, 156, 165, 166, 175, 176, 183, 191, 198, 203, 204];
  if (landscapeIds.includes(item.id)) {
    return 'landscape';
  }

  // 3. Default to Portrait for Narrative texts, SK, SOP, MoU, Modul Ajar
  return 'portrait';
}

/**
 * Main Standard Document Generator.
 * Dispatches to specialized, authentic Madrasah PKKM templates based on item category,
 * folder context, and specific item topic.
 */
export function generateStandardDocument(item: PKKMItem, profile: MadrasahProfile, customNotes?: string): string {
  const nomorSurat = `B-${String(item.id).padStart(3, '0')}/${profile.jenjang}.${profile.nsm.slice(0, 4)}/PP.00.5/${new Date().getMonth() + 1}/${profile.tahunPenilaian}`;
  const tanggal = profile.tanggalPenilaian || '21 Nopember 2026';
  const tempat = profile.kabupatenKota.replace('Kabupaten ', '').replace('Kota ', '');
  const titleLower = item.title.toLowerCase();

  // ==========================================
  // 1. LANDSCAPE TEMPLATES: MATRICES, SCHEDULES, FINANCIALS, INVENTORY
  // ==========================================

  // 1.A. Jadwal & Matriks Supervisi Akademik Guru (Komponen D / Item 155, 156, etc.)
  if (titleLower.includes('jadwal') && (titleLower.includes('supervisi') || item.componentId === 'D')) {
    return generateSupervisiSchedule(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.B. Buku Inventaris Sarana dan Prasarana (KIR / KIB) (Komponen B / B.4)
  if (titleLower.includes('inventaris') || (item.folderId === 'B4' && (titleLower.includes('sarana') || titleLower.includes('prasarana')))) {
    return generateSarprasInventory(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.C. Laporan Keuangan BOS & Buku Kas Umum (BKU) / Realisasi e-RKAM (Komponen B / B.5)
  if (titleLower.includes('buku kas') || titleLower.includes('bku') || titleLower.includes('realisasi') || (item.folderId === 'B5' && titleLower.includes('keuangan'))) {
    return generateFinancialBOS(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.D. Rekapitulasi Nilai RDM / Leger / Pengolahan Nilai Rapor (Item 6)
  if (titleLower.includes('rdm') || titleLower.includes('pengolahan nilai') || titleLower.includes('rapor')) {
    return generateRDMGradeRecap(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.E. Laporan Remedial dan Pengayaan (Item 7)
  if (titleLower.includes('remedial') || titleLower.includes('pengayaan')) {
    return generateRemedialPengayaan(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.F. Jurnal Pembiasaan 7 Karakter Anak Indonesia Hebat (7 KAIH) & KBC (Item 12, 198)
  if (titleLower.includes('7 kaih') || titleLower.includes('pembiasaan') || titleLower.includes('karakter')) {
    return generate7KAIHJournal(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.G. Evaluasi Diri Madrasah (EDM) & Matriks Tindak Lanjut (Komponen A / A.4 atau B.1)
  if (titleLower.includes('edm') || titleLower.includes('evaluasi diri')) {
    return generateEDMMatrix(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.H. Matriks Program Jangka Menengah (RKJM 4 Tahun) & RKT Tahunan (Item 46, etc.)
  if (titleLower.includes('rkjm') || titleLower.includes('rkt') || titleLower.includes('rencana kerja')) {
    return generateRKJMMatrix(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.I. Rekapitulasi Prestasi Murid, Guru, dan Lembaga (Komponen E / E.1 - E.4)
  if (item.componentId === 'E' || titleLower.includes('prestasi') || titleLower.includes('kejuaraan')) {
    return generatePrestasiRecap(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // 1.J. Buku Agenda Surat Masuk dan Keluar (Tata Usaha)
  if (titleLower.includes('agenda') || titleLower.includes('surat masuk') || titleLower.includes('persuratan')) {
    return generateSuratAgenda(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 2. PORTRAIT TEMPLATES: SURAT KEPUTUSAN (SK) SPESIFIK
  // ==========================================
  if (item.category === 'SK') {
    // 2.A. SK TPPK (Tim Pencegahan dan Penanganan Kekerasan)
    if (titleLower.includes('tppk') || titleLower.includes('kekerasan') || titleLower.includes('perundungan')) {
      return generateSKTPPK(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.B. SK Tim Pengembang Kurikulum (TPK/TPM)
    if (titleLower.includes('kurikulum') || titleLower.includes('tpm') || titleLower.includes('pengembang madrasah')) {
      return generateSKKurikulum(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.C. SK Pembagian Tugas Mengajar & Tugas Tambahan Guru
    if (titleLower.includes('pembagian tugas') || titleLower.includes('beban mengajar') || titleLower.includes('wali kelas')) {
      return generateSKPembagianTugas(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.D. SK Tim Pengelola BOS & Anggaran Madrasah
    if (titleLower.includes('bos') || titleLower.includes('keuangan') || titleLower.includes('anggaran')) {
      return generateSKBOS(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.E. SK Tim Sistem Informasi & Media Sosial / TIK Madrasah
    if (titleLower.includes('sim') || titleLower.includes('tik') || titleLower.includes('media') || titleLower.includes('website')) {
      return generateSKTIK(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.F. SK Tim Supervisor Akademik
    if (titleLower.includes('supervisi') || titleLower.includes('supervisor')) {
      return generateSKSupervisor(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.G. SK Komite Madrasah
    if (titleLower.includes('komite')) {
      return generateSKKomite(item, profile, tempat, tanggal, nomorSurat, customNotes);
    }

    // 2.H. Fallback SK Disesuaikan dengan Topik Item
    return generateSpecificSK(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 3. PORTRAIT TEMPLATES: STANDAR OPERASIONAL PROSEDUR (SOP)
  // ==========================================
  if (item.category === 'SOP') {
    return generateSpecificSOP(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 4. PORTRAIT/LANDSCAPE: MODUL AJAR & ANALISIS CP-TP
  // ==========================================
  if (item.category === 'Modul Ajar') {
    if (titleLower.includes('analisis cp') || titleLower.includes('atp')) {
      return generateCPTPAnalysis(item, profile, tempat, tanggal, customNotes);
    }
    return generateDeepLearningModulAjar(item, profile, tempat, tanggal, customNotes);
  }

  // ==========================================
  // 5. PORTRAIT: NOTULEN & BERITA ACARA
  // ==========================================
  if (item.category === 'Notulen & Berita Acara') {
    return generateBeritaAcaraNotulen(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 6. PORTRAIT: NOTA KESEPAHAMAN / MOU KEMITRAAN
  // ==========================================
  if (titleLower.includes('mou') || titleLower.includes('kemitraan') || titleLower.includes('kerjasama')) {
    return generateMoUPartnership(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 7. INSTRUMEN ASESMEN & PEMANTAUAN
  // ==========================================
  if (item.category === 'Instrumen' || titleLower.includes('instrumen')) {
    return generateAssessmentInstrument(item, profile, tempat, tanggal, nomorSurat, customNotes);
  }

  // ==========================================
  // 8. FALLBACK BERKAS RESMI MULTI-KOMPONEN
  // ==========================================
  return generateComprehensiveReport(item, profile, tempat, tanggal, nomorSurat, customNotes);
}

// -------------------------------------------------------------
// IMPLEMENTASI TEMPLATE SPESIFIK & MATRIKS LANSKAP
// -------------------------------------------------------------

function generateSupervisiSchedule(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### JADWAL DAN MATRIKS PELAKSANAAN SUPERVISI AKADEMIK GURU
**TAHUN AJARAN ${profile.tahunAjaran} / PERIODE PENILAIAN TAHUN ${profile.tahunPenilaian}**
*Nomor Dokumen: JADWAL-SUP/${profile.jenjang}/${profile.tahunPenilaian}/${String(item.id).padStart(3, '0')}*

---

#### A. Dasar Hukum & Petunjuk Teknis:
1. Permendikbudristek No. 46 Tahun 2023 tentang Pencegahan dan Penanganan Kekerasan di Satuan Pendidikan.
2. Peraturan Menteri Agama No. 58 Tahun 2017 jo PMA No. 24 Tahun 2018 tentang Kepala Madrasah.
3. Keputusan Menteri Agama (KMA) No. 450 Tahun 2024 tentang Implementasi Kurikulum pada Madrasah.
4. Juknis Penilaian Kinerja Kepala Madrasah (PKKM) Dirjen Pendidikan Islam Kemenag RI.

#### B. Matriks Jadwal Supervisi Pembelajaran di Kelas (Pendekatan Deep Learning & KBC):

| No | Nama Guru & NIP | Pangkat / Golongan | Mata Pelajaran | Kelas / Jam Ke | Hari / Tanggal Supervisi | Fokus Pengamatan / Aspek KBC | Supervisor Penilai | Paraf Guru |
|:--:|:---|:---:|:---|:---:|:---:|:---|:---|:---:|
| 1 | Siti Aminah, S.Pd.I.<br><small>NIP. 198503122011012015</small> | Penata / III-c | Al-Qur'an Hadis | Kelas VII-A / Jam 1-2 | Senin, 08 September 2025 | Pembiasaan Tajwid Berbasis Cinta Kasih | ${profile.namaKepala} | [✓] |
| 2 | M. Yusuf Arifin, M.Pd.<br><small>NIP. 198706142010011012</small> | Penata Tk. I / III-d | IPA Terpadu | Kelas VIII-B / Jam 3-4 | Selasa, 09 September 2025 | Problem-Based Learning: Cinta Lingkungan | ${profile.namaKepala} | [✓] |
| 3 | Dra. Hj. Ratna Dewi<br><small>NIP. 197804152006042008</small> | Pembina / IV-a | Matematika | Kelas IX-A / Jam 2-3 | Kamis, 11 September 2025 | Diferensiasi Konten & Asesmen Formatif | Guru Senior (Wakamad) | [✓] |
| 4 | Ahmad Fauzan, S.Pd.<br><small>NIP. 199208202019031011</small> | Penata Muda / III-a | Bahasa Arab | Kelas VII-C / Jam 4-5 | Senin, 15 September 2025 | Maharah Kalam & Deep Learning Mindful | ${profile.namaKepala} | [✓] |
| 5 | Nur Hidayah, S.Pd.<br><small>NUPTK. 4539762664210032</small> | Guru Tetap Yayasan | Bahasa Indonesia | Kelas VIII-A / Jam 1-2 | Rabu, 17 September 2025 | Menulis Teks Puisi Empati Sesama (KBC) | Guru Senior (Wakamad) | [✓] |
| 6 | Ujang Sulaeman, S.Pd.I.<br><small>NIP. 198911022015031004</small> | Penata / III-c | Fikih Ibadah | Kelas VII-B / Jam 3-4 | Kamis, 18 September 2025 | Praktik Shalat Khusyuk & Tawadhu | ${profile.namaKepala} | [✓] |
| 7 | Sri Wahyuni, S.Pd.<br><small>NIP. 199002142018012001</small> | Penata Muda Tk.I / III-b | Bahasa Inggris | Kelas IX-C / Jam 5-6 | Selasa, 23 September 2025 | Interactive Speaking & Peer Appreciation | Guru Senior (Wakamad) | [✓] |
| 8 | Hendra Kusuma, S.Si.<br><small>NUPTK. 8745763665200012</small> | Guru Tetap Yayasan | Prakarya & TIK | Kelas VIII-C / Jam 2-3 | Jumat, 26 September 2025 | Pemanfaatan Canva & Etika Digital | ${profile.namaKepala} | [✓] |

${customNotes ? `#### C. Catatan Khusus Pengawas / Tim Penilai:\n${customNotes}\n` : ''}
#### D. Instrumen Alur Tahapan Supervisi:
1. **Tahap Pra-Observasi:** Wawancara awal kesiapan modul ajar, rubrik asesmen, dan kesepakatan fokus perbaikan.
2. **Tahap Observasi Kelas:** Pengamatan langsung proses pembelajaran mendalam (Mindful, Meaningful, Joyful).
3. **Tahap Pasca-Observasi:** Dialog reflektif, penyampaian umpan balik konstruktif (2 apresiasi, 1 rekomendasi).
4. **Tindak Lanjut (RTL):** Pelatihan lanjutan melalui KKG/MGMP madrasah atau pembinaan tutor sebaya.

---

${tempat}, ${tanggal}

Mengetahui / Memverifikasi:  
**Pengawas Madrasah Pembina,**  
*(tanda tangan & stempel pengawas)*  

**${profile.namaPenilai}**  
NIP. ${profile.nipPenilai}  
${profile.jabatanPenilai}

Kepala Madrasah / Penanggung Jawab,  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel madrasah)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSarprasInventory(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### BUKU INVENTARIS SARANA DAN PRASARANA MADRASAH (KIR / KIB)
**TAHUN ANGGARAN ${profile.tahunPenilaian} / TAHUN AJARAN ${profile.tahunAjaran}**
*Nomor Registrasi: INV-SARPRAS/${profile.jenjang}/${profile.tahunPenilaian}/${String(item.id).padStart(3, '0')}*

---

#### A. Rekapitulasi Kondisi Sarana dan Prasarana Utama Madrasah:

| No | Kode Barang / Aset | Nama Barang / Jenis Sarpras | Merek / Spesifikasi Teknis | Tahun Pengadaan | Jumlah Unit | Kondisi: Baik (B) | Kondisi: Rusak Ringan (RR) | Kondisi: Rusak Berat (RB) | Lokasi Ruang | Sumber Anggaran |
|:--:|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|:---|
| 1 | 01.01.02.01 | Meja & Kursi Siswa | Kayu Jati / Standar Kemenag | 2023 | 180 Set | 165 Set | 15 Set | 0 Set | Ruang Kelas VII s.d IX | BOS Kemenag |
| 2 | 01.01.02.02 | Meja & Kursi Pendidik | Kayu Mahoni Berlaci | 2022 | 24 Set | 22 Set | 2 Set | 0 Set | Ruang Guru & Kantor | BOS Kemenag |
| 3 | 02.03.01.05 | Smart TV / Monitor Edukasi | Samsung 55 Inch UHD 4K | 2024 | 3 Unit | 3 Unit | 0 Unit | 0 Unit | Lab Komputer & Kelas IX | Bantuan Digitalisasi |
| 4 | 02.03.01.08 | Komputer PC Server ANBK | Core i7, 32GB RAM, 1TB SSD | 2023 | 2 Unit | 2 Unit | 0 Unit | 0 Unit | Ruang Server TIK | Dana Komite |
| 5 | 02.03.01.12 | Komputer Klien Siswa | Core i5, 8GB RAM, SSD 256GB | 2023 | 35 Unit | 33 Unit | 2 Unit | 0 Unit | Lab Multimedia | BOS Afirmasi/Kinerja |
| 6 | 02.05.02.01 | Proyektor LCD Digital | Epson EB-E500 3300 Lumens | 2022 | 5 Unit | 4 Unit | 1 Unit | 0 Unit | Ruang Kelas & Pertemuan | BOS Reguler |
| 7 | 03.01.04.01 | Lemari Arsip Berkas Surat | Besi 2 Pintu Anti Karat | 2021 | 6 Unit | 6 Unit | 0 Unit | 0 Unit | Ruang Tata Usaha (TU) | BOS Reguler |
| 8 | 03.02.01.04 | Kit Praktikum IPA Fisika/Biologi | Torso, Mikroskop Binokuler, Gelas | 2024 | 8 Set | 7 Set | 1 Set | 0 Set | Laboratorium IPA | DAK / Kemenag |
| 9 | 04.01.01.01 | Rak Buku Perpustakaan | Besi Double Sided 4 Tingkat | 2022 | 8 Unit | 8 Unit | 0 Unit | 0 Unit | Perpustakaan Ramah Anak | Hibah Komite |
| 10 | 05.02.01.02 | Generator Set Listrik Cadangan | Yanmar 5.500 Watt Silent | 2023 | 1 Unit | 1 Unit | 0 Unit | 0 Unit | Ruang Genset / Sarpras | Swadaya Madrasah |

${customNotes ? `#### B. Catatan Pemeliharaan & Tindak Lanjut:\n${customNotes}\n` : ''}
#### C. Ketentuan Tata Kelola & Pemeliharaan:
1. Pemutakhiran Buku Induk Barang Inventaris dilaksanakan setiap akhir semester oleh Koordinator Sarpras.
2. Seluruh aset madrasah terdata pada Aplikasi SIMAK-BMN / Aplikasi Sarpras Kemenag RI.
3. Barang rusak ringan diprioritaskan perbaikannya menggunakan pos alokasi dana pemeliharaan BOS e-RKAM.

---

${tempat}, ${tanggal}

Pengelola Sarana & Prasarana,  
*(tanda tangan)*  

**Koordinator Sarpras Madrasah**  
NIP. -

Menyetujui / Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & cap stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateFinancialBOS(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### BUKU KAS UMUM (BKU) DAN LAPORAN REALISASI ANGGARAN BOS MADRASAH
**PERIODE ANGGARAN TAHUN ${profile.tahunPenilaian} / TAHAP I DAN II**
*Sinkronisasi e-RKAM Kemenag RI | Nomor Register: BKU-BOS/${profile.tahunPenilaian}/${String(item.id).padStart(3, '0')}*

---

#### A. Rekapitulasi Pembukuan Kas Umum (Penerimaan & Pengeluaran Dana BOS):

| No | Hari / Tanggal | No. Bukti / BAP | Kode e-RKAM | Uraian Rincian Belanja Kegiatan Madrasah | Penerimaan (Rp) | Pengeluaran (Rp) | Saldo Kas (Rp) |
|:--:|:---:|:---|:---|:---|:---:|:---:|:---:|
| 1 | 15 Januari 2026 | - | 00.00.00 | Saldo Awal Kas & Bank Tahun Anggaran 2026 | 2.450.000 | 0 | 2.450.000 |
| 2 | 22 Januari 2026 | TRF-BOS-01 | 04.01.01 | Penerimaan Pencairan Dana BOS Tahap I Rek. Madrasah | 128.400.000 | 0 | 130.850.000 |
| 3 | 28 Januari 2026 | KWT-001/BOS | 05.02.01 | Pengadaan Modul Ajar dan Buku Kurikulum KBC & P5 | 0 | 18.250.000 | 112.600.000 |
| 4 | 05 Februari 2026 | KWT-002/BOS | 05.03.02 | Pembayaran Langganan Internet IndiHome Madrasah | 0 | 1.850.000 | 110.750.000 |
| 5 | 12 Februari 2026 | KWT-003/BOS | 06.01.04 | Pemeliharaan Lab Komputer & Instalasi Kabel Jaringan | 0 | 4.600.000 | 106.150.000 |
| 6 | 25 Februari 2026 | KWT-004/BOS | 07.02.01 | Honorarium Guru Bukan Pegawai Negeri Sipil (GBPNS) | 0 | 28.500.000 | 77.650.000 |
| 7 | 10 Maret 2026 | KWT-005/BOS | 08.01.03 | Konsumsi & ATK Pelaksanaan Asesmen Madrasah (AM) | 0 | 7.420.000 | 70.230.000 |
| 8 | 20 Maret 2026 | KWT-006/BOS | 09.02.02 | Kegiatan Pembiasaan Panca Cinta KBC & Ramadhan Ceria | 0 | 6.800.000 | 63.430.000 |
| 9 | 05 April 2026 | KWT-007/BOS | 05.03.02 | Pembayaran Rekening Listrik PLN & Air PDAM | 0 | 2.150.000 | 61.280.000 |
| 10 | 15 April 2026 | KWT-008/BOS | 06.02.01 | Pengadaan Bahan Habis Pakai UKS & Kebersihan Madrasah | 0 | 3.280.000 | 58.000.000 |

${customNotes ? `#### B. Rekonsiliasi Bank dan Pajak:\n${customNotes}\n` : ''}
#### C. Pernyataan Tanggung Jawab Mutlak (SPTJM):
Seluruh pengeluaran dana Bantuan Operasional Sekolah (BOS) telah diverifikasi keabsahannya, dibayarkan pajaknya (PPN/PPh 21/23) sesuai regulasi, dan diinput ke dalam aplikasi e-RKAM Kementerian Agama Republik Indonesia secara berkala.

---

${tempat}, ${tanggal}

Bendahara Pengelola BOS,  
*(tanda tangan & meterai)*  

**Bendahara Madrasah**  
NIP. -

Mengetahui dan Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel resmi)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateRDMGradeRecap(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### REKAPITULASI PENGOLAHAN NILAI RAPOR DIGITAL MADRASAH (RDM)
**SEMESTER GANJIL / GENAP - TAHUN AJARAN ${profile.tahunAjaran}**
*Sampel Validasi Nilai Kuantitatif & Deskripsi Kualitatif Kurikulum Madrasah*

---

#### A. Sampel Leger Capaian Hasil Belajar Siswa (Integrasi RDM Kemenag):

| No | NISN | Nama Lengkap Peserta Didik | Rerata Formatif | Nilai Sumatif Lingkup Materi | Nilai Sumatif Akhir Semester | Nilai Akhir Rapor | Predikat Capaian | Deskripsi Kualitatif Capaian Kompetensi (KBC) | Status Kelulusan / KKM |
|:--:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| 1 | 0098765431 | Ahmad Zaki Ramadhan | 88 | 86 | 90 | 88 | A (Sangat Baik) | Menunjukkan penguasaan istimewa dalam mengaitkan hikmah ibadah dengan pembiasaan peduli sesama | Tuntas Penuh |
| 2 | 0098765432 | Annisa Nurul Fatihah | 92 | 90 | 94 | 92 | A (Sangat Baik) | Sangat terampil bernalar kritis, teliti, dan memiliki kepekaan sosial yang tinggi saat kerja kelompok | Tuntas Penuh |
| 3 | 0098765433 | Bagas Aditya Pratama | 80 | 78 | 82 | 80 | B (Baik) | Menguasai konsep dasar materi dengan baik; perlu sedikit bimbingan pada pemecahan soal analitis | Tuntas |
| 4 | 0098765434 | Daffa Maulana Yusuf | 85 | 84 | 86 | 85 | A (Sangat Baik) | Menunjukkan sikap disiplin, aktif bertanya, dan antusiasme tinggi dalam menyelesaikan proyek KBC | Tuntas Penuh |
| 5 | 0098765435 | Fatimah Zahra Al-Munawwarah | 94 | 92 | 96 | 94 | A (Istimewa) | Menunjukkan capaian luar biasa dalam literasi, hafalan, serta keteladanan akhlak budi pekerti | Tuntas Penuh |
| 6 | 0098765436 | Gilang Permana | 76 | 75 | 78 | 76 | B (Cukup Baik) | Memenuhi standar ketercapaian; telah menuntaskan pendampingan remedial pada aspek konsep dalil | Tuntas Remedial |
| 7 | 0098765437 | Hana Salma Lathifah | 89 | 88 | 91 | 89 | A (Sangat Baik) | Sangat mahir mempresentasikan hasil karya dengan artikulatif, santun, dan saling menghargai | Tuntas Penuh |
| 8 | 0098765438 | Ihsan Nur Cahyono | 84 | 82 | 85 | 84 | B (Baik) | Mampu bekerjasama dalam tim dengan solid, jujur, serta konsisten menjaga kebersihan ruang kelas | Tuntas |

${customNotes ? `#### B. Analisis Ketuntasan Klasikal Madrasah:\n${customNotes}\n` : ''}
#### C. Keterangan Pengolahan Nilai:
- **Ketuntasan Klasikal:** 100% siswa mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).
- Seluruh deskripsi naratif telah tervalidasi pada server Aplikasi Rapor Digital Madrasah (RDM) Kementerian Agama RI.

---

${tempat}, ${tanggal}

Wakamad Bidang Kurikulum,  
*(tanda tangan)*  

**Waka Kurikulum Madrasah**  
NIP. -

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateRemedialPengayaan(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### LAPORAN DAN JADWAL PROGRAM REMEDIAL DAN PENGAYAAN
**SEMESTER GANJIL / GENAP - TAHUN AJARAN ${profile.tahunAjaran}**
*Nomor Berkas: REM-PENG/${profile.jenjang}/${profile.tahunPenilaian}/${String(item.id).padStart(3, '0')}*

---

#### A. Matriks Program Pelaksanaan Remedial (Bagi Siswa Belum Mencapai KKTP):

| No | Hari / Tanggal | Mata Pelajaran | Nama Peserta Didik | Tujuan Pembelajaran (TP) Yang Belum Tuntas | Nilai Awal | Bentuk Intervensi / Pendampingan | Nilai Akhir Remedial | Status Ketuntasan |
|:--:|:---:|:---|:---|:---|:---:|:---|:---:|:---:|
| 1 | Selasa, 14 Okt 2025 | Fikih Ibadah | Gilang Permana | Menganalisis rukun & syarat shalat jamak qashar | 62 | Bimbingan tutor sebaya & penugasan mandiri | 78 | Tuntas |
| 2 | Rabu, 15 Okt 2025 | Matematika | M. Rizky Pratama | Menyelesaikan persamaan linear satu variabel | 58 | Pembelajaran ulang terfokus dengan modul visual | 76 | Tuntas |
| 3 | Kamis, 16 Okt 2025 | IPA Terpadu | Siti Nurhaliza | Menganalisis sistem pencernaan nutrisi manusia | 64 | Bedah studi kasus klinis & lembar kerja KBC | 80 | Tuntas |

#### B. Matriks Program Pelaksanaan Pengayaan (Bagi Siswa Telah Mencapai Nilai Maksimal):

| No | Hari / Tanggal | Mata Pelajaran | Nama Peserta Didik | Nilai Awal | Bentuk Kegiatan Pengayaan / Pengembangan | Luaran Portofolio / Hasil Karya |
|:--:|:---:|:---|:---|:---:|:---|:---|
| 1 | Jumat, 17 Okt 2025 | IPA & Matematika | Fatimah Zahra Al-Munawwarah | 94 | Pembinaan intensif olimpiade KSM & riset MYRES | Makalah mini riset uji kandungan nutrisi makanan lokal |
| 2 | Jumat, 17 Okt 2025 | Bahasa Inggris | Annisa Nurul Fatihah | 92 | Pembuatan naskah pidato bahasa asing (Speech) | Rekaman video storytelling bertema *Loving Environment* |
| 3 | Sabtu, 18 Okt 2025 | Al-Qur'an Hadis | Ahmad Zaki Ramadhan | 90 | Pendalaman kajian asbabun nuzul & tahfidz juz 30 | Hafalan mutqin 1 juz dan resume tafsir ringkas |

${customNotes ? `#### C. Catatan Evaluasi Guru:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Guru Mata Pelajaran / Koordinator Remedial,  
*(tanda tangan)*  

**Tim Kurikulum & Pendidik**  

Mengetahui:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generate7KAIHJournal(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### JURNAL PEMBIASAAN 7 KARAKTER ANAK INDONESIA HEBAT (7 KAIH)
**DAN PENERAPAN DISIPLIN POSITIF KURIKULUM BERBASIS CINTA (KBC)**
*Tahun Ajaran ${profile.tahunAjaran} | Instrumen Bukti Fisik PKKM 2026 - Item #${item.id}*

---

#### A. Matriks Pembiasaan Harian Karakter Mulia Siswa Madrasah:

| No | Hari / Tanggal | Dimensi 7 KAIH & Panca Cinta | Bentuk Kegiatan Nyata Pembiasaan | Sasaran Kelas | Waktu & Lokasi | Catatan Perkembangan Siswa | Paraf Guru Pendamping |
|:--:|:---:|:---|:---|:---:|:---:|:---|:---:|
| 1 | Senin, 01 Sept 2025 | Bangun Pagi & Beribadah (Cinta Allah) | Shalat Dhuha berjamaah dan Asmaul Husna | Seluruh Kelas VII-IX | 06.45 WIB / Masjid Madrasah | 98% siswa hadir tepat waktu dengan tertib dan khusyuk | [✓] |
| 2 | Selasa, 02 Sept 2025 | Berakhlak Mulia & Hormat (Cinta Diri & Sesama) | Budaya 5S (Senyum, Sapa, Salam, Sopan, Santun) di gerbang | Kelas VII-A s.d VII-D | 06.30 WIB / Pintu Gerbang | Menyapa guru dan sesama teman dengan hangat dan penuh hormat | [✓] |
| 3 | Rabu, 03 Sept 2025 | Cinta Tanah Air & Gotong Royong | Operasi Semut (Pungut Sampah) & Kebersihan Kelas | Kelas VIII-A s.d VIII-C | 07.00 WIB / Lingkungan Madrasah | Area taman dan selasar bersih, kesadaran membuang sampah tinggi | [✓] |
| 4 | Kamis, 04 Sept 2025 | Gemar Membaca & Bernalar Kritis (Cinta Ilmu) | Gerakan 15 Menit Literasi Buku Non-Pelajaran | Kelas IX-A s.d IX-D | 07.15 WIB / Pojok Baca Kelas | Siswa antusias meresume hikmah buku fiksi/sejarah Islam | [✓] |
| 5 | Jumat, 05 Sept 2025 | Peduli Sesama & Dermawan (Cinta Kasih) | Gerakan Infaq Berkah Jumat & Sedekah Sayur KBC | Seluruh Warga Madrasah | 07.30 WIB / Lapangan Madrasah | Terkumpul dana sosial dan paket sayur untuk warga duafa sekitar | [✓] |
| 6 | Senin, 08 Sept 2025 | Disiplin Positif & Tangguh | Upacara Bendera & Refleksi Stop Bullying | Seluruh Siswa & Guru | 07.00 WIB / Lapangan Upacara | Ikrar madrasah ramah anak dibacakan dengan khidmat | [✓] |
| 7 | Selasa, 09 Sept 2025 | Hidup Sehat & Bugar | Sarapan Bergizi Bersama & Senam Kesegaran Jasmani | Kelas VII & VIII | 07.00 WIB / Halaman Utama | Siswa membawa bekal menu sehat 4 sehat 5 sempurna dari rumah | [✓] |

${customNotes ? `#### B. Catatan Khusus Guru BK & Kesiswaan:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Koordinator Pembiasaan Karakter / KBC,  
*(tanda tangan)*  

**Tim Penjamin Mutu Karakter Madrasah**  

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateEDMMatrix(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### MATRIKS LAPORAN EVALUASI DIRI MADRASAH (EDM)
**DAN REKAPITULASI RENCANA PROGRAM TINDAK LANJUT BERBASIS DATA (e-RKAM)**
*Tahun Anggaran ${profile.tahunPenilaian} | Instrumen Bukti Fisik PKKM - Item #${item.id}*

---

#### A. Rekapitulasi Skor Capaian 5 Budaya Mutu EDM:

| No | Aspek Budaya Mutu Madrasah | Indikator Kunci EDM | Bukti Fisik / Fakta Lapangan | Skor Kinerja (1 - 4) | Analisis Akar Masalah | Program Kegiatan Prioritas Penanganan | Estimasi Alokasi Dana (BOS/e-RKAM) |
|:--:|:---|:---|:---|:---:|:---|:---|:---:|
| 1 | Budaya Kedisiplinan Siswa & Guru | A.1 Pembiasaan ibadah shalat dan kedisiplinan hadir tepat waktu | Presensi fingerprint guru (98%) dan jurnal shalat dhuha siswa | 3,85 (Tingkat 4) | Sangat baik, perlu konsistensi pada apel sore | Penguatan reward guru & siswa teladan | Rp 3.500.000 |
| 2 | Budaya Pengembangan Diri GTK | B.2 Keaktifan guru dalam KKG/MGMP dan pelatihan mandiri Pintar | Sertifikat webinar Pintar Kemenag & laporan diseminasi KBC | 3,70 (Tingkat 4) | Beberapa guru madrasah butuh pendampingan IT mendalam | Workshop In-House Training Deep Learning & Canva | Rp 8.400.000 |
| 3 | Budaya Proses Pembelajaran | C.3 Guru merancang modul ajar berdiferensiasi dan asesmen formatif | Portofolio modul ajar KBC dan bank soal CBT madrasah | 3,60 (Tingkat 4) | Masih ada metode ceramah pada sebagian kecil guru senior | Supervisi klinis sejawat dan klinik pedagogik | Rp 4.200.000 |
| 4 | Budaya Sarana dan Prasarana | D.2 Ketersediaan buku teks perpustakaan dan laboratorium TIK | Rasio 1:1 buku pelajaran dan lab komputer memadai | 3,45 (Tingkat 3) | Kebutuhan proyektor interaktif di beberapa ruang kelas | Penambahan 2 unit proyektor dan perawatan kabel LAN | Rp 9.500.000 |
| 5 | Budaya Pembiayaan & Akuntabilitas | E.1 Transparansi penyusunan RKAM bersama Komite Madrasah | Berita acara rapat komite, BKU, dan laporan SPJ BOS | 3,90 (Tingkat 4) | Pengelolaan keuangan sangat akuntabel dan tertib pajak | Penerapan sistem pelaporan digital kas madrasah | Rp 2.000.000 |

${customNotes ? `#### B. Rekomendasi Tim Penilai / Asesor:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Ketua Tim Pengembang Madrasah (TPM),  
*(tanda tangan)*  

**Ketua TPM / Wakamad**  
NIP. -

Mengetahui dan Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & cap stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateRKJMMatrix(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### MATRIKS RENCANA KERJA JANGKA MENENGAH (RKJM 4 TAHUNAN)
**DAN RENCANA KERJA TAHUNAN (RKT) MADRASAH**
*Periode Strategis: 2024 - 2028 | Fokus Implementasi PKKM Tahun ${profile.tahunPenilaian}*

---

#### A. Matriks Program Prioritas 8 Standar Nasional Pendidikan (SNP) & KBC:

| No | Standar Nasional Pendidikan | Sasaran Strategis Madrasah | Indikator Kinerja Utama | Target Th 1 (2024/2025) | Target Th 2 (2025/2026) | Target Th 3 (2026/2027) | Target Th 4 (2027/2028) | Penanggung Jawab |
|:--:|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Standar Kompetensi Lulusan | Meningkatkan rata-rata nilai akademik & tahfidz | 100% Lulusan hafal minimal Juz 30 dan berkarakter KBC | 85% Siswa | 95% Siswa | 100% Siswa | 100% Unggul | Wakamad Kesiswaan |
| 2 | Standar Isi & Kurikulum | Mengembangkan Kurikulum Madrasah terintegrasi KBC | Dokumen KOM/KTSP tervalidasi Kemenag tepat waktu | 100% Terbit | 100% Terbit | 100% Digital | 100% Unggulan | Wakamad Kurikulum |
| 3 | Standar Proses | Mewujudkan pembelajaran interaktif berbasis Deep Learning | Seluruh guru menerapkan model Mindful & Joyful | 80% Guru | 90% Guru | 100% Guru | Mandiri Berbagi | Tim Supervisor |
| 4 | Standar Penilaian | Menerapkan digitalisasi asesmen formatif & sumatif | Pelaksanaan CBT mandiri via RDM & Google Workspace | 85% Mapel | 95% Mapel | 100% Paperless | Berbasis AI | Koord. Asesmen |
| 5 | Standar PTK | Peningkatan kualifikasi S1/S2 dan sertifikasi pendidik | 100% Guru bersertifikat pendidik profesional | 75% Guru | 85% Guru | 95% Guru | 100% Guru | Kepala Madrasah |
| 6 | Standar Sarana Prasarana | Pemenuhan smart classroom dan digital library | Rasio komputer 1:1 saat asesmen & wifi terdistribusi | 30 PC | 40 PC | 50 PC | Smart Board | Koord. Sarpras |
| 7 | Standar Pengelolaan | Mewujudkan tata kelola madrasah ramah anak & TPPK | Nol kasus kekerasan (zero violence) di lingkungan madrasah | 0 Kasus | 0 Kasus | 0 Kasus | Predikat Nasional | Tim TPPK |
| 8 | Standar Pembiayaan | Optimalisasi serapan anggaran e-RKAM & audit wajar | Serapan dana BOS >98% dan laporan realisasi transparan | Serapan 99% | Serapan 100% | Serapan 100% | Akuntabel WTP | Bendahara BOS |

${customNotes ? `#### B. Catatan Kebijakan Tahunan:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Ketua Komite Madrasah,  
*(tanda tangan)*  

**${profile.namaKetuaKomite}**  

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generatePrestasiRecap(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### REKAPITULASI CAPAIAN PRESTASI MADRASAH, GURU, DAN PESERTA DIDIK
**TAHUN AJARAN ${profile.tahunAjaran} / TAHUN PENILAIAN ${profile.tahunPenilaian}**
*Komponen E: Hasil Kinerja Kepala Madrasah | Dokumen Item #${item.id}*

---

#### A. Rekapitulasi Piagam & Sertifikat Kejuaraan / Prestasi Terverifikasi:

| No | Nama Peserta Didik / GTK | Kategori Prestasi | Nama Ajang / Kompetisi | Bidang / Cabang Lomba | Tingkat Kejuaraan | Peringkat / Medali | Nomor Sertifikat / Piagam | Lembaga Penyelenggara |
|:--:|:---|:---:|:---|:---|:---:|:---:|:---|:---|
| 1 | Fatimah Zahra Al-Munawwarah | Siswa | Kompetisi Sains Madrasah (KSM) | Matematika Terintegrasi | Kabupaten / Kota | Juara I (Emas) | 412/KSM.KAB/VIII/2025 | Kemenag Kab/Kota |
| 2 | Ahmad Zaki Ramadhan | Siswa | Madrasah Young Researchers (MYRES) | Ilmu Keagamaan Islam | Provinsi | Juara II (Perak) | 884/MYRES.JBR/IX/2025 | Kanwil Kemenag Provinsi |
| 3 | Annisa Nurul Fatihah | Siswa | Musabaqah Hifzhil Qur'an (MHQ) | Tahfidz 5 Juz Putri | Kabupaten / Kota | Juara I | 102/MHQ.LPTQ/X/2025 | LPTQ & Pemda |
| 4 | M. Yusuf Arifin, M.Pd. | Guru | Anugerah Guru Inspiratif Madrasah | Inovasi Media Belajar KBC | Provinsi | Juara III | 711/GTK.INSP/XI/2025 | Ditjen Pendis Kemenag |
| 5 | Tim Robotik Madrasah | Siswa | Madrasah Robotic Competition (MRC) | Mobile Robot Rescue | Nasional | Juara Harapan I | MRC-NAS/552/XII/2025 | Kemenag RI |
| 6 | Tim Futsal Madrasah | Siswa | Liga Pelajar Madrasah (AKSIOMA) | Cabang Futsal Putra | Kabupaten / Kota | Juara I | 098/AKSIOMA/X/2025 | KKMTs Kemenag |
| 7 | Dra. Hj. Ratna Dewi | Guru | Lomba Penulisan Karya Tulis Guru | Penelitian Tindakan Kelas | Kabupaten / Kota | Juara II | 245/PTK.GURU/VIII/2025 | PGRI / Kemenag |
| 8 | ${profile.namaMadrasah} | Kelembagaan | Akreditasi Satuan Pendidikan | Visitasi BAN-PDM | Nasional | Nilai 94 (Peringkat A) | 1857/BAN-PDM/SK/2024 | BAN-PDM Kemendikbud-Kemenag |

${customNotes ? `#### B. Catatan Tambahan Pembinaan Prestasi:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Koordinator Pembina Prestasi / Ekstrakurikuler,  
*(tanda tangan)*  

**Waka Kesiswaan & Pembina Bakat**  

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSuratAgenda(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### BUKU AGENDA SURAT MASUK DAN SURAT KELUAR TATA USAHA
**TAHUN ANGGARAN ${profile.tahunPenilaian} / TAHUN PELAJARAN ${profile.tahunAjaran}**
*Nomor Register Tata Kelola: AGENDA-TU/${profile.tahunPenilaian}/${String(item.id).padStart(3, '0')}*

---

#### A. Rekapitulasi Registrasi Surat Masuk & Disposisi Pimpinan:

| No | No. Agenda | Tanggal Diterima | Nomor Surat Resmi | Tanggal Surat | Asal Pengirim Surat | Perihal / Isi Ringkas Surat | Disposisi Kepala Madrasah | Tindak Lanjut Unit Kerja |
|:--:|:---:|:---:|:---|:---:|:---|:---|:---|:---|
| 1 | AG-001 | 05 Jan 2026 | B-112/Kk.10.04/PP.00/01/2026 | 02 Jan 2026 | Kantor Kemenag Kab/Kota | Edaran Kalender Pendidikan Semester Genap | Tindak lanjuti dan sosialisasikan ke guru | Wakamad Kurikulum (Selesai) |
| 2 | AG-002 | 14 Jan 2026 | 045/KOMITE/MTs/I/2026 | 12 Jan 2026 | Pengurus Komite Madrasah | Permohonan Rapat Pleno Rancangan e-RKAM | Jadwalkan rapat hari Sabtu, 17 Jan 2026 | Tim BOS & TU (Selesai) |
| 3 | AG-003 | 25 Jan 2026 | B-452/Kk.10.04/PP.01/01/2026 | 23 Jan 2026 | Seksi Penma Kantor Kemenag | Verifikasi Data EMIS 4.0 & Simpatika Semester II | Segera selesaikan sinkronisasi data siswa | Operator Madrasah (Selesai) |
| 4 | AG-004 | 08 Feb 2026 | 120/Pusk.CKR/II/2026 | 06 Feb 2026 | UPTD Puskesmas Setempat | Jadwal Skrining Kesehatan & Imunisasi Remaja | Fasilitasi ruang UKS dan dampingi siswa | Pembina UKS (Selesai) |
| 5 | AG-005 | 20 Feb 2026 | B-780/Kk.10.04/PP.00/02/2026 | 18 Feb 2026 | Pengawas Madrasah Pembina | Pemberitahuan Supervisi Akademik Guru | Siapkan instrumen dan jadwal supervisi | Waka Kurikulum (Selesai) |

${customNotes ? `#### B. Catatan Pengarsipan:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Petugas Agenda Persuratan,  
*(tanda tangan)*  

**Staf Tata Usaha Madrasah**  

Mengetahui:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

// -------------------------------------------------------------
// IMPLEMENTASI SURAT KEPUTUSAN (SK) SPESIFIK & RESMI
// -------------------------------------------------------------

function generateSKTPPK(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PEMBENTUKAN TIM PENCEGAHAN DAN PENANGANAN KEKERASAN (TPPK)**
**PADA ${profile.namaMadrasah.toUpperCase()} TAHUN AJARAN ${profile.tahunAjaran}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa kekerasan dalam bentuk apapun, termasuk perundungan (bullying), kekerasan fisik, psikis, seksual, dan intoleransi tidak boleh terjadi di lingkungan madrasah;
b. bahwa untuk menjamin terselenggaranya lingkungan pendidikan yang aman, nyaman, menyenangkan, serta berlandaskan nilai-nilai Kurikulum Berbasis Cinta (KBC), perlu dibentuk tim khusus;
c. bahwa nama-nama yang tercantum dalam Lampiran Keputusan ini dipandang memenuhi integritas dan kompetensi untuk melaksanakan tugas penanganan kekerasan;
d. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, b, dan c, perlu menetapkan Keputusan Kepala ${profile.namaMadrasah} tentang Pembentukan Tim Pencegahan dan Penanganan Kekerasan (TPPK).

**Mengingat:**
1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Undang-Undang Nomor 35 Tahun 2014 tentang Perubahan atas UU Nomor 23 Tahun 2002 tentang Perlindungan Anak;
3. Peraturan Menteri Agama Nomor 58 Tahun 2017 tentang Kepala Madrasah sebagaimana telah diubah dengan PMA Nomor 24 Tahun 2018;
4. Permendikbudristek Nomor 46 Tahun 2023 tentang Pencegahan dan Penanganan Kekerasan di Lingkungan Satuan Pendidikan;
5. Keputusan Direktur Jenderal Pendidikan Islam tentang Petunjuk Teknis Pencegahan Kekerasan pada Madrasah;
6. Panduan Implementasi Kurikulum Berbasis Cinta (KBC) dan Tata Naskah Dinas Kementerian Agama RI.

${customNotes ? `**Memperhatikan Arahan Khusus:**\n${customNotes}\n` : ''}

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG PEMBENTUKAN TIM PENCEGAHAN DAN PENANGANAN KEKERASAN (TPPK) TAHUN AJARAN ${profile.tahunAjaran}.**

**KESATU:**
Membentuk Tim Pencegahan dan Penanganan Kekerasan (TPPK) pada ${profile.namaMadrasah} dengan susunan personalia sebagaimana tercantum dalam Lampiran I keputusan ini.

**KEDUA:**
Tim TPPK sebagaimana dimaksud pada Diktum KESATU bertugas menyusun SOP pencegahan kekerasan, menyediakan kanal aduan rahasia ramah anak, melakukan investigasi mediasi berprinsip cinta kasih, serta memastikan pendampingan korban.

**KETIGA:**
Segala pembiayaan operasional yang timbul akibat pelaksanaan keputusan ini dibebankan pada pos kegiatan pembinaan kesiswaan anggaran BOS e-RKAM ${profile.namaMadrasah}.

**KEEMPAT:**
Keputusan ini mulai berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

*(tanda tangan & stempel dinas)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}  
Pangkat/Gol.: ${profile.pangkatKepala}

---

### LAMPIRAN I KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR:** ${nomorSurat}  
**TANGGAL:** ${tanggal}  
**TENTANG:** SUSUNAN PERSONALIA TIM PENCEGAHAN DAN PENANGANAN KEKERASAN (TPPK)

| No | Nama Lengkap / NIP | Jabatan Kedinasan | Kedudukan dalam TPPK | Uraian Tugas Pokok |
|:--:|:---|:---|:---:|:---|
| 1 | ${profile.namaKepala}<br><small>NIP. ${profile.nipKepala}</small> | Kepala Madrasah | Penanggung Jawab Utama | Menetapkan kebijakan penanganan, koordinasi dinas eksternal, dan penjaminan perlindungan korban. |
| 2 | M. Yusuf Arifin, M.Pd.<br><small>NIP. 198706142010011012</small> | Guru BK / Kesiswaan | Ketua TPPK | Mengoordinasikan tindak lanjut laporan aduan, mediasi welas asih, dan investigasi internal. |
| 3 | Siti Khodijah, S.Pd.<br><small>NIP. 199104152019032014</small> | Guru BK | Sekretaris TPPK | Mengadministrasikan buku register aduan, berita acara klarifikasi, dan pelaporan berkala ke Kemenag. |
| 4 | ${profile.namaKetuaKomite} | Ketua Komite Madrasah | Anggota Perwakilan Wali Murid | Memberikan jembatan komunikasi dengan orang tua/wali siswa dan pendampingan advokasi ramah anak. |
| 5 | Ujang Sulaeman, S.Pd.I.<br><small>NIP. 198911022015031004</small> | Pembina OSIM | Anggota Pendidik | Sosialisasi kampanye anti-bullying, pembiasaan 5S, dan penegakan disiplin positif tanpa kekerasan. |

${tempat}, ${tanggal}  
**Kepala Madrasah,**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKKurikulum(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN TIM PENGEMBANG KURIKULUM MADRASAH (TPK)**
**DAN IMPLEMENTASI KURIKULUM BERBASIS CINTA (KBC) TAHUN AJARAN ${profile.tahunAjaran}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa dalam rangka meningkatkan mutu lulusan, penguatan literasi-numerasi, serta karakter Panca Cinta, perlu disusun Kurikulum Madrasah yang adaptif dan kontekstual;
b. bahwa KMA Nomor 450 Tahun 2024 mengamanatkan setiap satuan pendidikan madrasah untuk menyusun dan menetapkan kurikulum operasional madrasah;
c. bahwa untuk kelancaran tugas tersebut, perlu ditetapkan Tim Pengembang Kurikulum (TPK) ${profile.namaMadrasah} Tahun Ajaran ${profile.tahunAjaran};
d. bahwa nama-nama yang tercantum dalam lampiran keputusan ini dipandang cakap dan mampu melaksanakan amanah tersebut.

**Mengingat:**
1. Undang-Undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Peraturan Pemerintah No. 57 Tahun 2021 tentang Standar Nasional Pendidikan jo PP No. 4 Tahun 2022;
3. Keputusan Menteri Agama (KMA) No. 450 Tahun 2024 tentang Pedoman Implementasi Kurikulum pada Madrasah;
4. Juknis Penilaian Kinerja Kepala Madrasah (PKKM) Dirjen Pendis Kemenag RI.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG PENETAPAN TIM PENGEMBANG KURIKULUM MADRASAH (TPK) TAHUN AJARAN ${profile.tahunAjaran}.**

**KESATU:**
Membentuk Tim Pengembang Kurikulum (TPK) ${profile.namaMadrasah} Tahun Ajaran ${profile.tahunAjaran} dengan susunan personalia sebagaimana tercantum dalam Lampiran keputusan ini.

**KEDUA:**
Tim sebagaimana dimaksud pada Diktum KESATU bertugas menyusun Dokumen Kurikulum Madrasah (KOM), Analisis CP-TP, Alur Tujuan Pembelajaran (ATP), Modul Ajar Deep Learning, dan Panduan Projek Penguatan Profil Pelajar Pancasila dan Profil Pelajar Rahmatan Lil Alamin (P5-PPRA).

**KETIGA:**
Segala biaya yang timbul dibebankan pada anggaran BOS e-RKAM madrasah.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}

---

### LAMPIRAN KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR:** ${nomorSurat}  
**TENTANG:** SUSUNAN TIM PENGEMBANG KURIKULUM (TPK)

| No | Nama Lengkap & NIP | Jabatan Struktural | Jabatan dalam TPK | Uraian Tugas Pengembang |
|:--:|:---|:---|:---:|:---|
| 1 | ${profile.namaKepala} | Kepala Madrasah | Penanggung Jawab | Memberikan garis kebijakan, evaluasi mutu kurikulum, dan pengesahan dokumen resmi. |
| 2 | ${profile.namaPenilai} | Pengawas Pembina | Narasumber Ahli | Memberikan bimbingan teknis, telaah instrumen KMA 450, dan verifikasi kelayakan naskah. |
| 3 | Waka Kurikulum Madrasah | Wakamad Kurikulum | Ketua TPK | Mengoordinasikan seluruh tahapan penyusunan KOM, kalender akademik, dan jadwal KBM. |
| 4 | Koordinator PAI | Guru Fikih/Akidah | Koord. Muatan Keagamaan & KBC | Mengawal insersi 5 nilai Panca Cinta KBC dalam seluruh perangkat pembelajaran agama. |
| 5 | Koordinator Umum | Guru Bahasa/IPA | Koord. Muatan Umum & Deep Learning | Memastikan sintaks pembelajaran mendalam (Mindful, Meaningful, Joyful) terintegrasi. |

${tempat}, ${tanggal}  
**Kepala Madrasah,**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKPembagianTugas(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PEMBAGIAN TUGAS MENGAJAR GURU DAN TUGAS TAMBAHAN**
**TAHUN AJARAN ${profile.tahunAjaran}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**  
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa proses belajar mengajar merupakan inti kegiatan pendidikan pada madrasah;
b. bahwa demi kelancaran dan ketertiban tugas keguruan, perlu ditetapkan pembagian beban jam mengajar dan tugas tambahan bagi pendidik dan tenaga kependidikan;
c. bahwa nama-nama yang tercantum dalam lampiran ini memenuhi syarat kualifikasi akademik dan beban kerja guru (JTM) sesuai Simpatika / EMIS Kemenag.

**Mengingat:**
1. Undang-Undang No. 14 Tahun 2005 tentang Guru dan Dosen;
2. PMA No. 58 Tahun 2017 tentang Kepala Madrasah;
3. KMA No. 450 Tahun 2024 tentang Kurikulum Madrasah;
4. Petunjuk Teknis Beban Kerja Guru Madrasah Ditjen Pendis Kemenag RI.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG PEMBAGIAN TUGAS MENGAJAR DAN TUGAS TAMBAHAN TAHUN AJARAN ${profile.tahunAjaran}.**

**KESATU:**
Menugaskan guru untuk melaksanakan tugas pembelajaran dan tugas tambahan sebagaimana tercantum dalam Lampiran I dan Lampiran II keputusan ini.

**KEDUA:**
Masing-masing guru berkewajiban merencanakan, melaksanakan, mengevaluasi proses pembelajaran, serta melaksanakan bimbingan karakter KBC.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}

---

### LAMPIRAN I: PEMBAGIAN TUGAS GURU & BEBAN MENGAJAR (JTM)

| No | Nama Guru & Gelar | NIP / NUPTK | Gol. | Mata Pelajaran Diampu | Beban Mengajar (JTM) | Tugas Tambahan | Ekuivalensi JTM Total |
|:--:|:---|:---:|:---:|:---|:---:|:---|:---:|
| 1 | Siti Aminah, S.Pd.I. | 198503122011012015 | III-c | Al-Qur'an Hadis (Kelas VII & VIII) | 18 JTM | Wali Kelas VII-A | 24 JTM |
| 2 | M. Yusuf Arifin, M.Pd. | 198706142010011012 | III-d | IPA Terpadu (Kelas VIII & IX) | 16 JTM | Wakamad Kurikulum | 28 JTM |
| 3 | Dra. Hj. Ratna Dewi | 197804152006042008 | IV-a | Matematika (Kelas IX) | 16 JTM | Koordinator Supervisi | 24 JTM |
| 4 | Ahmad Fauzan, S.Pd. | 199208202019031011 | III-a | Bahasa Arab (Kelas VII s.d IX) | 18 JTM | Pembina Bahasa & Riset | 24 JTM |
| 5 | Nur Hidayah, S.Pd. | 4539762664210032 | GTY | Bahasa Indonesia (Kelas VII & VIII) | 20 JTM | Kepala Perpustakaan | 26 JTM |

${tempat}, ${tanggal}  
**Kepala Madrasah,**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKBOS(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN TIM MANAJEMEN BANTUAN OPERASIONAL SEKOLAH (BOS)**
**PADA ${profile.namaMadrasah.toUpperCase()} TAHUN ANGGARAN ${profile.tahunPenilaian}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**  
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa dana Bantuan Operasional Sekolah (BOS) merupakan program pemerintah untuk mendanai operasional non-personalia bagi satuan pendidikan madrasah;
b. bahwa untuk menjamin transparansi, efektivitas, dan akuntabilitas pengelolaan dana BOS sesuai petunjuk teknis Kemenag RI, perlu dibentuk Tim Manajemen BOS Madrasah;
c. bahwa nama-nama yang tercantum dalam lampiran keputusan ini dipandang memiliki integritas dan kapabilitas dalam pengelolaan keuangan madrasah.

**Mengingat:**
1. Undang-Undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Keputusan Direktur Jenderal Pendidikan Islam tentang Petunjuk Teknis Pengelolaan Bantuan Operasional Sekolah pada Madrasah Tahun Anggaran ${profile.tahunPenilaian};
3. Rencana Kegiatan dan Anggaran Madrasah (e-RKAM) ${profile.namaMadrasah}.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG TIM MANAJEMEN BOS MADRASAH TAHUN ANGGARAN ${profile.tahunPenilaian}.**

**KESATU:**
Membentuk Tim Manajemen BOS pada ${profile.namaMadrasah} dengan susunan personalia sebagaimana tercantum dalam Lampiran keputusan ini.

**KEDUA:**
Tim sebagaimana dimaksud pada Diktum KESATU bertugas menyusun e-RKAM bersama komite, membukukan pengeluaran pada BKU, memungut dan menyetor pajak, serta mempublikasikan laporan pertanggungjawaban.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}

---

### LAMPIRAN: SUSUNAN TIM MANAJEMEN BOS MADRASAH

| No | Nama Lengkap | Jabatan Kedinasan | Jabatan dalam Tim BOS | Uraian Wewenang Pokok |
|:--:|:---|:---|:---:|:---|
| 1 | ${profile.namaKepala} | Kepala Madrasah | Penanggung Jawab | Kuasa Pengguna Anggaran, validasi SPJ, dan otorisasi pencairan rekening madrasah. |
| 2 | Bendahara Madrasah | Staf Keuangan | Bendahara Pengelola | Penginputan BKU, transaksi perbankan, rekonsiliasi e-RKAM, dan kuitansi belanja. |
| 3 | ${profile.namaKetuaKomite} | Ketua Komite | Anggota / Pengawas | Pengawasan independen transparansi penggunaan dana bagi peningkatan mutu siswa. |
| 4 | Staf Tata Usaha | Urusan Aset | Anggota / Verifikator Aset | Pencatatan belanja modal ke dalam Buku Inventaris Sarpras madrasah. |

${tempat}, ${tanggal}  
**Kepala Madrasah,**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKTIK(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN TIM PENGELOLA SISTEM INFORMASI MADRASAH (SIM),**
**MEDIA SOSIAL, DAN TEKNOLOGI INFORMASI KOMUNIKASI (TIK)**
**TAHUN AJARAN ${profile.tahunAjaran}**

---

**Menimbang:**
a. bahwa percepatan transformasi digital madrasah memerlukan pengelolaan sistem informasi dan media komunikasi yang profesional, aman, dan beretika;
b. bahwa untuk mengoptimalkan layanan EMIS 4.0, Rapor Digital Madrasah (RDM), e-RKAM, Simpatika, serta media publikasi prestasi madrasah, perlu ditetapkan tim pengelola TIK;
c. bahwa nama-nama yang tercantum dalam lampiran dipandang memiliki kecakapan digital dan dedikasi tinggi.

**Mengingat:**
1. Undang-Undang No. 11 Tahun 2008 jo UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik (ITE);
2. Peraturan Menteri Agama tentang Tata Kelola Teknologi Informasi dan Komunikasi Kemenag;
3. Pedoman Madrasah Digital Ditjen Pendis Kemenag RI.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA MADRASAH TENTANG TIM PENGELOLA SIM DAN TIK TAHUN AJARAN ${profile.tahunAjaran}.**

**KESATU:**
Membentuk Tim Pengelola SIM dan TIK ${profile.namaMadrasah} sebagaimana tercantum dalam Lampiran.

**KEDUA:**
Tim bertugas menjaga keamanan data digital madrasah, mengelola website dan media sosial resmi, serta memastikan kelancaran asesmen berbasis komputer (CBT/ANBK).

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKSupervisor(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN TIM SUPERVISOR PEMBELAJARAN DAN PENILAIAN KINERJA GURU (PKG)**
**TAHUN AJARAN ${profile.tahunAjaran}**

---

**Menimbang:**
a. bahwa supervisi akademik merupakan fungsi esensial Kepala Madrasah dalam menjamin dan meningkatkan mutu proses belajar mengajar;
b. bahwa dalam rangka menjangkau seluruh guru secara komprehensif, Kepala Madrasah dapat mendelegasikan wewenang supervisi klinis kepada guru senior yang kompeten;
c. bahwa nama-nama dalam lampiran keputusan ini memenuhi syarat kualifikasi dan sertifikasi pendidik.

**Mengingat:**
1. PMA No. 58 Tahun 2017 tentang Kepala Madrasah;
2. Juknis Penilaian Kinerja Guru (PKG) dan PKKM Ditjen Pendis Kemenag RI.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA MADRASAH TENTANG TIM SUPERVISOR PEMBELAJARAN TAHUN AJARAN ${profile.tahunAjaran}.**

**KESATU:**
Menetapkan Tim Supervisor Pembelajaran ${profile.namaMadrasah} Tahun Ajaran ${profile.tahunAjaran} sebagaimana terlampir.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSKKomite(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENGUKUHAN PENGURUS KOMITE MADRASAH**
**PERIODE TAHUN 2024 - 2027**

---

**Menimbang:**
a. bahwa Komite Madrasah adalah lembaga mandiri yang mewadahi peran serta masyarakat dalam rangka meningkatkan mutu, pemerataan, dan efisiensi pendidikan;
b. bahwa hasil musyawarah rapat pleno orang tua/wali murid tanggal 15 Juli 2024 telah memilih susunan pengurus komite yang baru;
c. bahwa berdasarkan PMA No. 16 Tahun 2020 tentang Komite Madrasah, susunan pengurus perlu dikukuhkan melalui Surat Keputusan Kepala Madrasah.

**Mengingat:**
1. Undang-Undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Peraturan Menteri Agama (PMA) Nomor 16 Tahun 2020 tentang Komite Madrasah.

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA MADRASAH TENTANG PENGUKUHAN PENGURUS KOMITE MADRASAH PERIODE 2024 - 2027.**

**KESATU:**
Mengukuhkan susunan pengurus Komite ${profile.namaMadrasah} sebagaimana tercantum dalam Lampiran.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateSpecificSK(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN ${item.title.toUpperCase()}**
**TAHUN AJARAN ${profile.tahunAjaran} / TAHUN PENILAIAN ${profile.tahunPenilaian}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**  
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa dalam rangka pemenuhan instrumen ${item.folderName} pada ${profile.namaMadrasah}, dipandang perlu menetapkan ${item.title};
b. bahwa untuk menjamin kepastian hukum, kelancaran koordinasi, dan akuntabilitas kinerja sesuai regulasi Ditjen Pendis Kemenag RI;
c. bahwa nama-nama yang tercantum dalam lampiran keputusan ini dipandang cakap dan memenuhi syarat kualifikasi tugas;
d. bahwa berdasarkan pertimbangan a, b, dan c, perlu menetapkan Surat Keputusan Kepala ${profile.namaMadrasah}.

**Mengingat:**
1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Peraturan Pemerintah Nomor 57 Tahun 2021 tentang Standar Nasional Pendidikan;
3. Peraturan Menteri Agama Nomor 58 Tahun 2017 tentang Kepala Madrasah;
4. Keputusan Menteri Agama Nomor 450 Tahun 2024 tentang Implementasi Kurikulum Madrasah;
5. Petunjuk Teknis Penilaian Kinerja Kepala Madrasah (PKKM) Dirjen Pendidikan Islam.

${customNotes ? `**Memperhatikan:**\n${customNotes}\n` : ''}

**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG ${item.title.toUpperCase()}.**

**KESATU:**
Menetapkan dan mengesahkan ${item.title} pada ${profile.namaMadrasah} sebagaimana tercantum dalam Lampiran keputusan ini.

**KEDUA:**
Masing-masing pihak yang ditunjuk wajib melaksanakan tugas dengan penuh tanggung jawab, berintegritas, serta mengedepankan prinsip Kurikulum Berbasis Cinta (KBC).

**KETIGA:**
Segala biaya yang timbul dibebankan pada anggaran BOS e-RKAM madrasah atau sumber dana lain yang sah.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

// -------------------------------------------------------------
// IMPLEMENTASI SOP, MODUL AJAR, INSTRUMEN, DAN LAINNYA
// -------------------------------------------------------------

function generateSpecificSOP(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# STANDAR OPERASIONAL PROSEDUR (SOP)
## ${profile.namaMadrasah.toUpperCase()}
### ${item.title.toUpperCase()}
*Nomor Dokumen: SOP-${profile.jenjang}/${item.id}/${profile.tahunPenilaian} | Tanggal Berlaku: ${tanggal}*

---

| Identitas SOP | Rincian Dokumen Resmi |
|:---|:---|
| **Judul Prosedur** | ${item.title} |
| **Penanggung Jawab** | Kepala Madrasah (${profile.namaKepala}) |
| **Unit Pelaksana** | Pendidik, Tenaga Kependidikan, Siswa, dan Komite Madrasah |
| **Dasar Hukum** | KMA No. 450 Tahun 2024 & Juknis PKKM 2026 Ditjen Pendis Kemenag RI |

---

### 1. TUJUAN
Memberikan panduan kerja yang terstandar, akuntabel, dan transparan dalam pelaksanaan **${item.title}** di lingkungan ${profile.namaMadrasah} berlandaskan nilai kasih sayang Kurikulum Berbasis Cinta (KBC).

### 2. RUANG LINGKUP
Prosedur ini mencakup seluruh tahapan mulai dari perencanaan, verifikasi berkas, pelaksanaan teknis, hingga pengarsipan dan evaluasi berkala.

### 3. ALUR PROSEDUR KERJA (FLOWCHART 5 TAHAPAN):

| Tahap | Aktivitas Prosedur | Pelaksana / Penanggung Jawab | Durasi Maksimal | Output Dokumen |
|:---:|:---|:---|:---:|:---|
| **I** | **Penerimaan & Registrasi:** Menerima permohonan, aduan, atau instruksi kerja melalui loket resmi madrasah. | Staf Tata Usaha / Petugas Piket | 1 Hari Kerja | Lembar Disposisi / Formulir Aduan |
| **II** | **Telaah & Verifikasi:** Memeriksa kelayakan berkas, kesesuaian regulasi, dan fakta lapangan. | Tim Terkait / Wakamad | 2 Hari Kerja | Berita Acara Verifikasi |
| **III** | **Tindakan & Eksekusi:** Melaksanakan penanganan teknis, mediasi, atau instruksi operasional. | Kepala Madrasah & Tim Inti | 3 Hari Kerja | Lembar Rekomendasi Tindakan |
| **IV** | **Evaluasi & Pengendalian Mutu:** Memantau hasil penanganan dan memastikan ketercapaian target kinerja. | Pengawas Pembina / Guru BK | 7 Hari Kerja | Laporan Hasil Monitoring |
| **V** | **Pengarsipan Berkas Digital:** Menyimpan naskah ke folder arsip madrasah dan upload link Google Drive PKKM. | Operator SIM / Arsiparis TU | Selesai | Link Google Drive Folder ${item.folderId} |

${customNotes ? `### 4. CATATAN KHUSUS PELAKSANAAN:\n${customNotes}\n` : ''}
### 5. PENGESAHAN DOKUMEN:

Disahkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & cap stempel dinas)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateCPTPAnalysis(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, customNotes?: string): string {
  return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### ANALISIS CAPAIAN PEMBELAJARAN (CP) DAN ALUR TUJUAN PEMBELAJARAN (ATP)
**INSERSI NILAI PANCA CINTA KURIKULUM BERBASIS CINTA (KBC)**
*Fase D (MTs / Kelas VII - IX) | Tahun Ajaran ${profile.tahunAjaran}*

---

#### Matriks Analisis Elemen, CP, TP, dan Insersi Panca Cinta:

| No | Elemen Capaian | Rumusan Capaian Pembelajaran (CP) | Tujuan Pembelajaran (TP) Terinci | Nilai Panca Cinta KBC | Dimensi Profil Pelajar Pancasila & Rahmatan Lil Alamin | Alokasi Waktu |
|:--:|:---|:---|:---|:---|:---|:---:|
| 1 | Al-Qur'an & Hadis | Peserta didik mampu membaca, menghafal, dan menganalisis ayat tentang toleransi dan kepedulian sosial. | 1.1 Siswa mampu melafalkan QS. Al-Hujurat: 13 dengan tartil.<br>1.2 Siswa mampu mengidentifikasi pesan persaudaraan universal. | Cinta Allah & Cinta Sesama Manusia | Beriman, Bertakwa, Berkeadaban (Ta'addub) | 6 JP |
| 2 | Fikih Ibadah | Peserta didik memahami ketentuan ibadah praktis dan hikmah sosial zakat, infaq, dan sedekah. | 2.1 Siswa menganalisis hikmah zakat sebagai jembatan kasih sayang.<br>2.2 Siswa mempraktikkan simulasi sedekah berkah di madrasah. | Cinta Diri & Cinta Sesama | Mandiri, Gotong Royong, Keteladanan (Qudwah) | 8 JP |
| 3 | IPA / Sains | Peserta didik memahami interaksi ekosistem dan dampak perubahan iklim terhadap kelangsungan hidup. | 3.1 Siswa menganalisis rantai makanan di lingkungan madrasah.<br>3.2 Siswa merancang proyek mini daur ulang sampah organik. | Cinta Lingkungan & Alam Sekitar | Bernalar Kritis, Kreatif, Berwawasan Lingkungan | 10 JP |
| 4 | Bahasa Indonesia | Peserta didik mampu menulis teks deskripsi dan narasi ekspresif yang menumbuhkan rasa empati. | 4.1 Siswa menyusun teks narasi bertema bakti kepada orang tua.<br>4.2 Siswa membacakan karya dengan penghayatan welas asih. | Cinta Orang Tua & Cinta Tanah Air | Berkebinekaan Global, Cinta Tanah Air | 8 JP |

${customNotes ? `#### Catatan Integrasi Pembelajaran:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Guru Mata Pelajaran,  
*(tanda tangan)*  

**Tim MGMP Madrasah**  

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateDeepLearningModulAjar(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, customNotes?: string): string {
  return `# MODUL AJAR / RENCANA PEMBELAJARAN MENDALAM
## INSERSI NILAI PANCA CINTA KBC (KURIKULUM MERDEKA MADRASAH)
### ${profile.namaMadrasah.toUpperCase()} - TAHUN AJARAN ${profile.tahunAjaran}

---

**Mata Pelajaran:** Pendidikan Agama Islam & Sains Terintegrasi  
**Fase / Kelas:** Fase D (Kelas VIII) / Semester Ganjil  
**Alokasi Waktu:** 2 Pertemuan (4 x 40 Menit)  
**Pendekatan:** Deep Learning (*Mindful, Meaningful, Joyful Learning*)  

---

### I. DIMENSI PANCA CINTA KBC
1. **Cinta Allah & Rasul:** Membiasakan doa dengan kesadaran hati penuh kepasrahan.
2. **Cinta Ilmu:** Mengembangkan rasa ingin tahu yang mendalam dan gairah membaca.
3. **Cinta Diri & Sesama:** Saling menghargai, kerja kelompok kolaboratif tanpa perundungan.
4. **Cinta Lingkungan:** Menjaga kebersihan dan hemat energi di kelas.
5. **Cinta Bangsa & Tanah Air:** Menghubungkan manfaat ilmu bagi kemaslahatan masyarakat Indonesia.

### II. KEGIATAN PEMBELAJARAN MENDALAM
#### A. Kegiatan Awal (15 Menit) - *Mindful & Welcoming*
1. Guru menyapa dengan senyum tulus, salam kehangatan, dan menanyakan kondisi emosi (*Check-in Emosi Siswa*).
2. Membaca Asmaul Husna bersama dan tadarus singkat 3 ayat Al-Qur'an.
3. Apersepsi bermakna: Guru menghubungkan materi pelajaran dengan peristiwa nyata yang menggugah empati.

#### B. Kegiatan Inti (55 Menit) - *Meaningful Inquiry*
1. **Studi Kasus Kontekstual:** Siswa mengamati video fenomena nyata yang membutuhkan solusi kritis.
2. **Eksplorasi Kolaboratif:** Siswa berdiskusi dalam kelompok majemuk dengan saling mendengarkan secara aktif.
3. **Penyajian Karya Kreatif:** Siswa mempresentasikan gagasan; kelompok lain memberikan apresiasi (2 pujian, 1 masukan santun).

#### C. Kegiatan Penutup (10 Menit) - *Joyful Reflection & Exit Ticket*
1. Guru dan siswa merumuskan simpulan hikmah pembelajaran.
2. Siswa mengisi kartu refleksi (*Exit Ticket KBC*): *"Satu kebaikan yang ingin saya amalkan hari ini di rumah."*
3. Doa penutup dan salam perpisahan penuh kasih sayang.

### III. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)
- **Asesmen Formatif:** Jurnal observasi sikap welas asih dan lembar penilaian antar teman.
- **Asesmen Sumatif:** Portofolio karya proyek terintegrasi rubrik KKTP.

---

${tempat}, ${tanggal}

Guru Pengampu,  
*(tanda tangan)*  

**Pendidik Mata Pelajaran**  

Mengetahui:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateBeritaAcaraNotulen(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# BERITA ACARA DAN NOTULENSI RAPAT RESMI
## ${profile.namaMadrasah.toUpperCase()}
### BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian} - ITEM #${item.id}

---

### I. BERITA ACARA RAPAT
Pada hari ini, **Senin tanggal ${tanggal}**, bertempat di Ruang Rapat Pimpinan ${profile.namaMadrasah}, telah diselenggarakan rapat koordinasi resmi mengenai **${item.title.toUpperCase()}**.

Rapat dihadiri oleh:
1. Kepala Madrasah (${profile.namaKepala})
2. Dewan Guru dan Staf Tenaga Kependidikan (${profile.namaMadrasah})
3. Ketua Komite Madrasah (${profile.namaKetuaKomite})
4. Pengawas Madrasah Pembina (${profile.namaPenilai})

**Hasil Kesepakatan Musyawarah Mufakat:**
1. Mengesahkan seluruh susunan program, matriks pelaksanaan, dan alokasi anggaran terkait ${item.title}.
2. Seluruh warga madrasah berkomitmen menegakkan Kurikulum Berbasis Cinta (KBC), pembiasaan 7 KAIH, serta memastikan nol kasus kekerasan.
3. Berkas berita acara ini menjadi bagian sah portofolio penilaian kinerja PKKM Tahun ${profile.tahunPenilaian}.

---

### II. NOTULENSI RAPAT
- **Agenda:** ${item.title}
- **Pimpinan Rapat:** ${profile.namaKepala} (Kepala Madrasah)
- **Notulis:** Staf Tata Usaha
- **Waktu Pelaksanaan:** Pukul 08.30 WIB s.d. 12.00 WIB

| Waktu | Sesi Pembahasan | Poin Pembahasan Pokok | Keputusan Rapat |
|:---:|:---|:---|:---|
| 08.30 - 09.00 | Pembukaan & Pengantar | Sambutan Kepala Madrasah mengenai target mutu dan digitalisasi madrasah. | Disepakati target ketercapaian 100%. |
| 09.00 - 10.30 | Pemaparan Teknis | Pembahasan matriks bukti fisik, pembagian penanggung jawab komponen. | Tiap koordinator bertanggung jawab atas kelengkapan dokumen. |
| 10.30 - 11.30 | Tanggapan Komite & Guru | Masukan Ketua Komite terkait penguatan akhlak dan fasilitas pendukung. | Komite mendukung penuh pembiayaan pendampingan. |
| 11.30 - 12.00 | Pengesahan & Doa | Pembacaan draf kesepakatan dan penandatanganan berita acara. | Dokumen resmi disahkan. |

${customNotes ? `#### Catatan Khusus Rapat:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Pimpinan Rapat / Kepala Madrasah,  
*(tanda tangan)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}  

Notulis Rapat,  
*(tanda tangan)*  

**Sekretaris / Tata Usaha**`;
}

function generateMoUPartnership(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  const isKesehatan = item.title.toLowerCase().includes('kesehatan') || item.title.toLowerCase().includes('puskesmas') || item.title.toLowerCase().includes('uks');
  const pihakKedua = isKesehatan ? 'UPTD PUSKESMAS KECAMATAN SETEMPAT' : 'KEPOLISIAN SEKTOR / MITRA KELEMBAGAAN';
  const perihal = isKesehatan ? 'PELAYANAN KESEHATAN REMAJA, SKRINING BERKALA, DAN MADRASAH SEHAT' : 'PEMBINAAN KAMTIBMAS, KEDISIPLINAN, DAN MITRA PENGEMBANGAN MADRASAH';

  return `# NOTA KESEPAHAMAN / MEMORANDUM OF UNDERSTANDING (MoU)
## TENTANG ${perihal}
### NOMOR: ${nomorSurat}

---

Pada hari ini, **Senin tanggal ${tanggal}**, bertempat di ${profile.namaMadrasah}, kami yang bertanda tangan di bawah ini:

1. **${profile.namaKepala}**, Kepala ${profile.namaMadrasah}, bertindak untuk dan atas nama ${profile.namaMadrasah}, berkedudukan di ${profile.alamat}, selanjutnya disebut sebagai **PIHAK PERTAMA**.
2. **Pimpinan / Kepala ${pihakKedua}**, berkedudukan di wilayah ${profile.kabupatenKota}, selanjutnya disebut sebagai **PIHAK KEDUA**.

Secara bersama-sama sepakat untuk mengadakan Perjanjian Kerjasama (MoU) dengan ketentuan sebagai berikut:

**PASAL 1: TUJUAN KERJASAMA**  
Kerjasama ini bertujuan untuk meningkatkan mutu layanan, kesehatan peserta didik, perlindungan anak, serta ketertiban lingkungan madrasah secara terintegrasi dan berkesinambungan.

**PASAL 2: RUANG LINGKUP KEGIATAN**  
1. Penyelenggaraan penyuluhan berkala, skrining fisik/mental, dan pembinaan karakter disiplin positif.
2. Fasilitasi rujukan layanan darurat dan pendampingan psikososial bagi peserta didik.
3. Pelaksanaan kegiatan bersama yang mendukung program Madrasah Ramah Anak dan Kurikulum Berbasis Cinta (KBC).

**PASAL 3: HAK DAN KEWAJIBAN**  
- PIHAK PERTAMA memfasilitasi waktu, tempat, dan kepesertaan siswa secara tertib.
- PIHAK KEDUA menyediakan tenaga ahli, materi penyuluhan, dan pemeriksaan medis/kamtibmas berkala.

**PASAL 4: JANGKA WAKTU**  
Perjanjian ini berlaku selama 3 (tiga) tahun terhitung sejak ditandatangani, dan dapat diperpanjang atas kesepakatan kedua belah pihak.

---

${tempat}, ${tanggal}

PIHAK KEDUA,  
**Pimpinan ${pihakKedua}**  

*(tanda tangan & stempel instansi)*  

**(Pejabat Berwenang)**  

PIHAK PERTAMA,  
**Kepala ${profile.namaMadrasah}**  

*(tanda tangan & stempel madrasah)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateAssessmentInstrument(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# INSTRUMEN ASESMEN DAN PEMANTAUAN MUTU
## ${profile.namaMadrasah.toUpperCase()}
### BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian} - ITEM #${item.id}
*Judul Instrumen: ${item.title.toUpperCase()}*

---

#### Lembar Rubrik Penilaian Kinerja & Ketercapaian Indikator:

| No | Aspek / Indikator Pengamatan | Deskripsi Kriteria Capaian | Skor 4 (Sangat Baik) | Skor 3 (Baik) | Skor 2 (Cukup) | Skor 1 (Kurang) | Catatan Bukti Fisik Lapangan |
|:--:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Kesesuaian Dokumen dengan Regulasi | Kelengkapan konsideran, nomor dinas, dan pengesahan Kemenag | Lengkap 100% | Lengkap 85% | Cukup 70% | Belum lengkap | Terlampir SK & tanda tangan basah |
| 2 | Keterlibatan Stakeholder | Keterlibatan guru, tendik, komite madrasah, dan siswa | Sangat aktif | Cukup aktif | Terbatas | Tidak ada bukti | Notulen rapat & absensi kehadiran |
| 3 | Integrasi Nilai Panca Cinta KBC | Penanaman nilai cinta Allah, ilmu, diri, lingkungan, dan tanah air | Terinsersi utuh | Sebagian besar | Terbatas | Belum tampak | Lembar refleksi & dokumentasi aksi |
| 4 | Ketertiban Arsip & Akses Digital | Ketersediaan berkas fisik dan tautan Google Drive | Terintegrasi rapi | Rapi sebagian | Belum tertata | Tidak ada | Link Drive valid dan dapat diakses |

${customNotes ? `#### Catatan Tambahan Penilai:\n${customNotes}\n` : ''}

---

${tempat}, ${tanggal}

Tim Penilai Internal Madrasah,  
*(tanda tangan)*  

**Koordinator Penjamin Mutu**  

Mengetahui:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}

function generateComprehensiveReport(item: PKKMItem, profile: MadrasahProfile, tempat: string, tanggal: string, nomorSurat: string, customNotes?: string): string {
  return `# LAPORAN RESMI PELAKSANAAN PROGRAM MADRASAH
## ${profile.namaMadrasah.toUpperCase()}
### ${item.title.toUpperCase()}
*Nomor Registrasi: LAP-${profile.jenjang}/${item.folderId}/${String(item.id).padStart(3, '0')}/${profile.tahunPenilaian}*

---

### I. LATAR BELAKANG DAN TUJUAN
Laporan ini disusun sebagai dokumen pertanggungjawaban manajerial dan bukti fisik kinerja sub-komponen **${item.folderName}**. Bertujuan mendokumentasikan pelaksanaan program secara terukur, akuntabel, dan berorientasi pada peningkatan budaya mutu madrasah.

### II. MATRIKS REALISASI PELAKSANAAN DAN OUTPUT:

| No | Rincian Tahapan Aktivitas | Sasaran Peserta / Objek | Waktu Pelaksanaan | Volume / Satuan | Output Dokumen Riil | Capaian Kinerja (%) |
|:--:|:---|:---|:---:|:---:|:---|:---:|
| 1 | Rapat Koordinasi & Pembentukan Tim | Seluruh Guru & Staf | Awal Semester | 1 Berkas SK | SK Penetapan & Notulen Rapat | 100% |
| 2 | Implementasi Operasional Program | Seluruh Peserta Didik | Berkelanjutan | Harian / Mingguan | Jurnal Kegiatan & Foto Dokumentasi | 100% |
| 3 | Evaluasi & Pengendalian Capaian | Tim Pengembang Madrasah | Tengah Semester | 1 Laporan | Rekapitulasi Data & Lembar Evaluasi | 95% |
| 4 | Diseminasi Hasil & Pelaporan Kemenag | Pengawas Pembina | Akhir Semester | 1 Berkas Portofolio | Lembar Verifikasi Penilai PKKM | 100% |

### III. KESIMPULAN DAN REKOMENDASI MUTU
Pelaksanaan program **${item.title}** pada ${profile.namaMadrasah} telah terlaksana dengan efektif sesuai sasaran rencana kerja tahunan (RKT). Seluruh dewan guru dan tenaga kependidikan berdedikasi tinggi dalam mewujudkan madrasah yang unggul, berprestasi, dan berakhlak mulia.

${customNotes ? `### IV. CATATAN KHUSUS PELAPORAN:\n${customNotes}\n` : ''}
---

${tempat}, ${tanggal}

Penanggung Jawab Program,  
*(tanda tangan)*  

**Wakamad / Koordinator Komponen**  

Mengesahkan:  
**Kepala ${profile.namaMadrasah},**  
*(tanda tangan & stempel resmi)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}
