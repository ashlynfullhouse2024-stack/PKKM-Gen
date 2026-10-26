import { PKKMItem, MadrasahProfile } from '../types';

export interface ItemGuidance {
  categoryType: 
    | 'guru_jtm' 
    | 'supervisi' 
    | 'kaldik' 
    | 'keuangan_bos' 
    | 'sarpras' 
    | 'sk_tim' 
    | 'akademik_kbc' 
    | 'administrasi_umum';
  titleBadge: string;
  headline: string;
  explanation: string;
  uploadDescription: string;
  uploadExamples: string[];
  placeholderText: string;
  showAcademicInputs: boolean;
  quickSamples: Array<{
    label: string;
    description: string;
    text: string;
  }>;
}

export function getItemGuidance(item: PKKMItem, profile: MadrasahProfile): ItemGuidance {
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();
  const folderLower = item.folderName.toLowerCase();
  const combined = `${titleLower} ${descLower} ${folderLower}`;

  // 1. GURU & PEMBAGIAN JTM
  if (
    combined.includes('pembagian tugas') ||
    combined.includes('beban kerja') ||
    combined.includes('jtm') ||
    combined.includes('jadwal mengajar') ||
    combined.includes('rincian tugas guru') ||
    combined.includes('tenaga kependidikan') ||
    (item.category === 'SK' && (combined.includes('tugas') || combined.includes('guru')))
  ) {
    return {
      categoryType: 'guru_jtm',
      titleBadge: 'DATA GURU & PEMBAGIAN JAM MENGAJAR (JTM)',
      headline: 'Penyesuaian Daftar Guru & Alokasi JTM Madrasah',
      explanation:
        'Dokumen ini membutuhkan data guru madrasah Anda. Anda bisa mengunggah file daftar nama guru, NIP, mapel yang diampu, serta jumlah jam tatap muka (JTM). AI Gemini akan otomatis merapikannya menjadi tabel SK resmi yang sah.',
      uploadDescription: 'Unggah file Excel/Word daftar nama guru, SK pembagian tugas tahun lalu, atau file jadwal:',
      uploadExamples: [
        'Daftar Nama Guru, NIP & Golongan (.docx / .txt / .csv)',
        'Rekap Pembagian JTM Semester (.xlsx / .csv diekspor ke teks)',
        'Jadwal Mengajar Mingguan Madrasah',
        'SK Pembagian Tugas Tahun Pelajaran Sebelumnya',
      ],
      placeholderText: `Contoh format data guru yang bisa Anda tempel atau upload:
1. Dra. Hj. Siti Aminah, M.Pd.I | NIP 19780512 200501 2 004 | Pembina IV/a | Fikih (24 JTM) | Wali Kelas 8A
2. Ahmad Fauzi, S.Pd | NIP 19850210 200901 1 008 | Penata III/c | Matematika (24 JTM) | Pembina OSIM
3. Nurul Hidayah, S.Pd.I | NIP 19910314 201903 2 015 | Penata Muda III/a | Al-Qur'an Hadis (20 JTM) + Koord. KBC (4 JTM)
4. Muhammad Rizki, M.Kom | NIP - (Non ASN) | Informatika (18 JTM) | Kepala Lab Komputer (6 JTM)
5. Dewi Lestari, S.Pd | NIP 19890722 201502 2 003 | Penata III/c | Bahasa Inggris (24 JTM) | Pembina Pramuka`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan Contoh 5 Guru & JTM',
          description: 'Isi otomatis contoh daftar guru dan pembagian jam mengajar',
          text: `Daftar Pembagian Tugas Guru ${profile.namaMadrasah} T.P. ${profile.tahunAjaran}:
1. Dra. Hj. Siti Aminah, M.Pd.I (NIP 19780512 200501 2 004 / Pembina IV/a) - Mengampu Fikih Kelas VII, VIII (24 JTM) + Wali Kelas 8A (2 JTM)
2. Ahmad Fauzi, S.Pd (NIP 19850210 200901 1 008 / Penata III/c) - Mengampu Matematika Kelas VIII, IX (24 JTM) + Pembina OSIM (2 JTM)
3. Nurul Hidayah, S.Pd.I (NIP 19910314 201903 2 015 / Penata Muda III/a) - Mengampu Al-Qur'an Hadis Kelas VII (20 JTM) + Koordinator Panca Cinta KBC (4 JTM)
4. Muhammad Rizki, M.Kom (Non ASN) - Mengampu Informatika Kelas VII, VIII, IX (18 JTM) + Kepala Lab Komputer (6 JTM)
5. Dewi Lestari, S.Pd (NIP 19890722 201502 2 003 / Penata III/c) - Mengampu Bahasa Inggris Kelas VIII, IX (24 JTM) + Pembina Pramuka (2 JTM)`,
        },
        {
          label: '💡 Tambahkan Tugas Tambahan (Waka & BK)',
          description: 'Rincian tugas Waka Kurikulum, Kesiswaan, Sarpras, Humas, dan BK',
          text: `Rincian Tugas Tambahan Tenaga Pendidik:
- Waka Kurikulum: H. Miftahul Huda, M.Ag (Ekuivalensi 12 JTM)
- Waka Kesiswaan: Agus Supriyanto, S.Pd (Ekuivalensi 12 JTM)
- Waka Sarana Prasarana: Irfan Hakim, S.T (Ekuivalensi 12 JTM)
- Waka Humas & Komite: Siti Maryam, S.Pd.I (Ekuivalensi 12 JTM)
- Guru Bimbingan Konseling: Rahmat Hidayat, S.Sos.I (Beban asuh 150 siswa)`,
        },
      ],
    };
  }

  // 2. SUPERVISI AKADEMIK & PKG
  if (
    combined.includes('supervisi') ||
    combined.includes('observasi') ||
    combined.includes('pkg') ||
    combined.includes('penilaian kinerja guru') ||
    combined.includes('evaluasi guru') ||
    combined.includes('pemantauan pembelajaran')
  ) {
    return {
      categoryType: 'supervisi',
      titleBadge: 'JADWAL & FOKUS OBSERVASI SUPERVISI AKADEMIK',
      headline: 'Penyesuaian Jadwal & Guru Sasaran Supervisi',
      explanation:
        'Dokumen ini membutuhkan jadwal pelaksanaan observasi kelas. Unggah draf jadwal supervisi madrasah atau daftar guru yang akan diobservasi (Nama, Mapel, Kelas, Hari/Tanggal). AI akan menyusun Jadwal Matriks Supervisi 9 Kolom beserta instrumen tindak lanjut.',
      uploadDescription: 'Unggah file jadwal supervisi, daftar guru yang disupervisi, atau program supervisi:',
      uploadExamples: [
        'Jadwal Supervisi Akademik Semester (.docx / .txt / .csv)',
        'Daftar Guru Sasaran Observasi Kelas',
        'Program Tahunan Supervisi Kepala Madrasah',
        'Instrumen Tindak Lanjut Supervisi Tahun Lalu',
      ],
      placeholderText: `Contoh data jadwal supervisi yang bisa Anda ketik atau upload:
- Senin, 15 September 2025: Dra. Hj. Siti Aminah | Fikih | Kelas 8A | Jam 1-2 | Fokus: Penerapan Deep Learning & Panca Cinta
- Selasa, 16 September 2025: Ahmad Fauzi, S.Pd | Matematika | Kelas 7B | Jam 3-4 | Fokus: Diferensiasi & Media Digital Interaktif
- Rabu, 17 September 2025: Nurul Hidayah, S.Pd.I | Al-Qur'an Hadis | Kelas 7A | Jam 2-3 | Fokus: Joyful Learning & Refleksi Siswa`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan Jadwal Supervisi 6 Guru',
          description: 'Isi jadwal supervisi lengkap dengan nama guru, mapel, kelas, dan tanggal',
          text: `Rencana Jadwal Supervisi Akademik Kepala Madrasah:
1. Dra. Hj. Siti Aminah, M.Pd.I - Fikih Kelas 8A - Senin, 15 September 2025 (Jam ke-1 s.d 2) - Fokus: Mindful & Meaningful Learning
2. Ahmad Fauzi, S.Pd - Matematika Kelas 7B - Selasa, 16 September 2025 (Jam ke-3 s.d 4) - Fokus: Pembelajaran Berdiferensiasi
3. Nurul Hidayah, S.Pd.I - Al-Qur'an Hadis Kelas 7A - Rabu, 17 September 2025 (Jam ke-2 s.d 3) - Fokus: Penguatan Karakter Panca Cinta KBC
4. Dewi Lestari, S.Pd - Bahasa Inggris Kelas 9C - Kamis, 18 September 2025 (Jam ke-5 s.d 6) - Fokus: Keterampilan Komunikasi Siswa
5. Muhammad Rizki, M.Kom - Informatika Kelas 8B - Jumat, 19 September 2025 (Jam ke-1 s.d 2) - Fokus: Praktik Komputasi & Keamanan Digital
6. Agus Supriyanto, S.Pd - PJOK Kelas 7C - Sabtu, 20 September 2025 (Jam ke-3 s.d 4) - Fokus: Disiplin Positif & Sportsmanship`,
        },
      ],
    };
  }

  // 3. KALENDER PENDIDIKAN (KALDIK)
  if (
    combined.includes('kalender pendidikan') ||
    combined.includes('kaldik') ||
    combined.includes('hari efektif') ||
    combined.includes('jadwal kegiatan tahunan') ||
    combined.includes('alokasi waktu')
  ) {
    return {
      categoryType: 'kaldik',
      titleBadge: 'KALDIK & RINCIAN HARI EFEKTIF MADRASAH',
      headline: 'Penyesuaian Kalender Pendidikan & Pekan Efektif',
      explanation:
        'Unggah draf Kalender Pendidikan Kanwil Kemenag wilayah Anda, rincian pekan efektif, tanggal asesmen madrasah, atau jadwal libur semester. AI Gemini akan menyusun dokumen matriks Kaldik resmi madrasah Anda.',
      uploadDescription: 'Unggah file kaldik Kemenag, rincian hari efektif, atau agenda kegiatan madrasah:',
      uploadExamples: [
        'Draf Kaldik Kanwil Kemenag Setempat (.docx / .txt)',
        'Rincian Pekan Efektif (RPE) Semester Ganjil/Genap',
        'Jadwal Asesmen (PTS, PAS, Asesmen Madrasah)',
        'Agenda Peringatan Hari Besar Islam (PHBI) & Libur',
      ],
      placeholderText: `Contoh data Kaldik madrasah:
- Awal Tahun Ajaran: 14 Juli 2025
- MATSAMA Siswa Baru: 14 - 16 Juli 2025
- Semester Ganjil: 19 Pekan Efektif KBM (106 Hari Efektif)
- Asesmen Sumatif Tengah Semester: 22 - 27 September 2025
- Penilaian Akhir Semester (PAS): 1 - 10 Desember 2025
- Pembagian Raport RDM: 19 Desember 2025
- Libur Akhir Semester Ganjil: 22 Desember 2025 - 3 Januari 2026`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan Rincian Pekan Efektif 2025/2026',
          description: 'Rincian pekan efektif semester ganjil dan genap sesuai Kaldik Kemenag',
          text: `Rincian Alokasi Waktu & Pekan Efektif Kaldik ${profile.namaMadrasah} T.P. ${profile.tahunAjaran}:
1. Semester Ganjil:
   - Juli: 3 Pekan Efektif (Awal Masuk & MATSAMA: 14-16 Juli 2025)
   - Agustus: 4 Pekan Efektif (Peringatan HUT RI ke-80: 17 Agustus 2025)
   - September: 4 Pekan Efektif (Asesmen Tengah Semester: 22-27 September 2025)
   - Oktober: 5 Pekan Efektif (Hari Santri Nasional: 22 Oktober 2025)
   - November: 4 Pekan Efektif (Hari Guru Nasional: 25 November 2025)
   - Desember: 2 Pekan Efektif KBM + 2 Pekan PAS & Raport RDM (19 Des 2025)
   - Total Semester Ganjil: 22 Pekan (19 Pekan Efektif Belajar)
2. Semester Genap:
   - Awal Masuk Semester Genap: 5 Januari 2026
   - Perkiraan Libur Awal Ramadhan 1447 H: Februari 2026
   - Asesmen Madrasah (AM) Kelas Akhir: Maret - April 2026
   - Penilaian Akhir Tahun (PAT): Juni 2026
   - Pembagian Raport Kenaikan Kelas: 20 Juni 2026`,
        },
      ],
    };
  }

  // 4. KEUANGAN, BOS & BKU
  if (
    combined.includes('bos') ||
    combined.includes('keuangan') ||
    combined.includes('bku') ||
    combined.includes('rkam') ||
    combined.includes('anggaran') ||
    combined.includes('biaya') ||
    combined.includes('buku kas')
  ) {
    return {
      categoryType: 'keuangan_bos',
      titleBadge: 'ANGGARAN & BELANJA BOS / RKAM MADRASAH',
      headline: 'Penyesuaian Komponen Anggaran & Buku Kas BOS',
      explanation:
        'Unggah draf Rencana Kegiatan dan Anggaran Madrasah (RKAM), rincian belanja BOS, atau komponen 8 Standar Nasional Pendidikan. AI akan menyusun Buku Kas Umum (BKU) 8 Kolom atau Laporan Realisasi Keuangan standar Ditjen Pendis Kemenag.',
      uploadDescription: 'Unggah catatan belanja BOS, ekspor RKAM, atau file rincian pagu:',
      uploadExamples: [
        'Catatan Rincian Belanja BOS Tahap I / II (.docx / .txt / .csv)',
        'Ringkasan Anggaran RKAM Madrasah',
        'Rekap Pengeluaran Operasional & Honor Guru',
        'Pagu Anggaran BOS Madrasah Berdasarkan Jumlah Siswa',
      ],
      placeholderText: `Contoh data belanja BOS yang bisa Anda upload atau ketik:
- Pagu Dana BOS Tahap I: Rp 125.000.000
- Belanja Komponen 1 (KBM & Buku KBC): Rp 22.500.000
- Belanja Komponen 2 (Langganan Daya & Jasa Internet): Rp 8.400.000
- Belanja Komponen 3 (Pemeliharaan Sarpras & Sanitasi): Rp 18.000.000
- Belanja Komponen 4 (Honorarium Guru Non-ASN): Rp 42.000.000
- Belanja Komponen 5 (Pengembangan Kompetensi Guru/Workshop KBC): Rp 12.000.000`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan 8 Komponen Belanja BOS Riil',
          description: 'Isi pos anggaran belanja BOS sesuai Juknis Bantuan Operasional Sekolah',
          text: `Rincian Rencana Penggunaan Dana BOS ${profile.namaMadrasah} T.P. ${profile.tahunAjaran}:
1. Penerimaan Dana BOS Tahap 1: Rp 135.000.000 (Berdasarkan jumlah siswa terdaftar EMIS)
2. Komponen Penggunaan Belanja:
   - Pengembangan Perpustakaan & Modul KBC: Rp 18.500.000
   - Kegiatan Penerimaan Peserta Didik Baru (PPDB) & MATSAMA: Rp 6.200.000
   - Kegiatan Pembelajaran & Ekstrakurikuler Keagamaan: Rp 14.800.000
   - Pelaksanaan Asesmen/Evaluasi Pembelajaran (RDM/PTS/PAS): Rp 15.300.000
   - Pemeliharaan Sarana & Prasarana Madrasah (Sanitasi & Cat): Rp 19.400.000
   - Langganan Daya dan Jasa (Listrik, Air, Internet WiFi): Rp 9.600.000
   - Pengembangan Profesi Pendidik & Tenaga Kependidikan: Rp 11.200.000
   - Pembayaran Honorarium Guru dan Tenaga Kependidikan Non-ASN: Rp 40.000.000
3. Saldo Kas Tunai: Rp 0 (Semua dialokasikan tepat sasaran dan akuntabel)`,
        },
      ],
    };
  }

  // 5. SARANA PRASARANA & INVENTARIS
  if (
    combined.includes('sarana') ||
    combined.includes('prasarana') ||
    combined.includes('inventaris') ||
    combined.includes('gedung') ||
    combined.includes('ruang') ||
    combined.includes('laboratorium') ||
    combined.includes('perpustakaan') ||
    combined.includes('meja') ||
    combined.includes('kursi') ||
    combined.includes('aset')
  ) {
    return {
      categoryType: 'sarpras',
      titleBadge: 'DATA SARANA PRASARANA & INVENTARIS MADRASAH',
      headline: 'Penyesuaian Aset, Gedung & Inventaris Ruang',
      explanation:
        'Unggah daftar gedung, jumlah meja/kursi, perangkat laboratorium, atau kondisi fisik aset madrasah Anda. AI akan menyusun Buku Inventaris Sarpras 11 Kolom lengkap dengan klasifikasi kondisi (Baik, Rusak Ringan, Rusak Berat).',
      uploadDescription: 'Unggah file daftar aset, inventaris ruangan, atau catatan sarpras madrasah:',
      uploadExamples: [
        'Daftar Inventaris Ruang & Gedung (.docx / .txt / .csv)',
        'Data Perangkat Laboratorium Komputer / IPA',
        'Buku Induk Barang Inventaris Madrasah',
        'Catatan Kebutuhan Perbaikan & Pengadaan Sarpras',
      ],
      placeholderText: `Contoh data sarpras yang bisa Anda upload atau ketik:
- Ruang Kelas: 12 Ruang (10 Baik, 2 Perlu Pengecatan Ulang)
- Lab Komputer: 1 Ruang, 32 Unit Komputer Client, 1 Server, 1 Proyektor LCD (Kondisi Baik)
- Lab IPA: 1 Ruang lengkap mikroskop & alat peraga (Kondisi Baik)
- Perpustakaan: 1 Ruang, 3.200 eksemplar buku kurikulum & referensi
- Meja & Kursi Siswa: 360 Set (330 Baik, 30 Rusak Ringan)
- Toilet Siswa & Guru: 8 Pintu (Sanitasi bersih dan mengalir baik)`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan Data Inventaris 12 Fasilitas',
          description: 'Isi tabel sarpras mencakup kelas, lab, perpustakaan, dan sarana ibadah',
          text: `Rekapitulasi Sarana dan Prasarana ${profile.namaMadrasah}:
1. Tanah & Bangunan: Luas Tanah 3.500 m2 (Sertifikat Hak Milik/Wakaf Kemenag)
2. Ruang Pembelajaran:
   - Ruang Kelas Teori: 12 Ruang (Ukuran 7x8m, Kondisi Baik 100%)
   - Laboratorium Komputer: 1 Ruang (35 PC All-in-One, 1 UPS Server, AC 2 PK - Baik)
   - Laboratorium IPA: 1 Ruang (Set Alat Praktik Thaharah, Anatomi, Fisika - Baik)
   - Perpustakaan Madrasah: 1 Ruang (Koleksi 2.850 Judul Buku, Pojok Baca Digital)
3. Sarana Penunjang & Ibadah:
   - Musholla Madrasah: Luas 120 m2 (Kapasitas 250 Jamaah, Tempat Wudhu Terpisah)
   - Ruang UKS / PMR: 1 Ruang (2 Tempat Tidur, Kotak P3K Lengkap, Timbangan, Tensimeter)
   - Ruang BK / Konseling Ramah Anak: 1 Ruang (Ruang Konseling Privat & Karir)
   - Lapangan Olahraga Multifungsi: 1 Lapangan (Futsal, Voli, Basket, Upacara)
4. Sanitasi: 10 Unit Toilet Siswa (Rasio 1:30) + 2 Toilet Guru (Kondisi Bersih Terawat)`,
        },
      ],
    };
  }

  // 6. SK TIM KHUSUS / TPPK / KOMITE
  if (
    combined.includes('tppk') ||
    combined.includes('kekerasan') ||
    combined.includes('komite') ||
    combined.includes('panitia') ||
    combined.includes('tim pengembang') ||
    combined.includes('struktur organisasi') ||
    combined.includes('tata tertib') ||
    combined.includes('satgas')
  ) {
    return {
      categoryType: 'sk_tim',
      titleBadge: 'SUSUNAN PENGURUS TIM / KEPANITIAAN MADRASAH',
      headline: 'Penyesuaian Struktur Tim, TPPK, atau Komite',
      explanation:
        'Unggah susunan kepengurusan komite, tim pencegahan kekerasan (TPPK), atau panitia kegiatan. AI akan menyusun SK resmi lengkap dengan konsideran Menimbang, Mengingat Permendikbudristek No. 46/2023, Memutuskan, dan Lampiran Struktur.',
      uploadDescription: 'Unggah file susunan anggota tim, draf SK, atau kepengurusan komite:',
      uploadExamples: [
        'Daftar Nama Anggota Tim / Panitia (.docx / .txt)',
        'Susunan Pengurus Komite Madrasah & Perwakilan Ortu',
        'Draf Pembagian Tugas Pokok (Tupoksi) Anggota Tim',
        'SK Kepanitiaan Tahun Sebelumnya',
      ],
      placeholderText: `Contoh susunan pengurus tim:
- Penanggung Jawab: ${profile.namaKepala} (Kepala Madrasah)
- Ketua Tim: Agus Supriyanto, S.Pd (Waka Kesiswaan)
- Sekretaris: Rahmat Hidayat, S.Sos.I (Guru BK)
- Anggota Guru: Nurul Hidayah, S.Pd.I
- Anggota Komite Madrasah: Drs. H. Subagyo (Ketua Komite)
- Anggota Perwakilan Wali Murid: Ibu Anita Rahmawati, S.E
- Anggota Tenaga Kependidikan: Ahmad Fauzi`,
      showAcademicInputs: false,
      quickSamples: [
        {
          label: '💡 Sisipkan Struktur Tim TPPK 7 Personel',
          description: 'Susunan lengkap TPPK sesuai Permendikbudristek 46/2023 & Edaran Kemenag',
          text: `Susunan Tim Pencegahan dan Penanganan Kekerasan (TPPK) ${profile.namaMadrasah}:
1. Pengarah / Penanggung Jawab: ${profile.namaKepala} (Kepala Madrasah)
2. Ketua TPPK: Agus Supriyanto, S.Pd (Wakil Kepala Madrasah Bidang Kesiswaan)
3. Sekretaris: Rahmat Hidayat, S.Sos.I (Guru Bimbingan dan Konseling)
4. Anggota Unsur Guru: Dra. Hj. Siti Aminah, M.Pd.I (Guru Senior)
5. Anggota Unsur Tenaga Kependidikan: Muhammad Rizki, M.Kom (Staf Tata Usaha)
6. Anggota Unsur Komite Madrasah: ${profile.namaKetuaKomite || 'Drs. H. Mulyono'} (Ketua/Pengurus Komite)
7. Anggota Unsur Perwakilan Orang Tua/Wali Siswa: Ibu Hj. Nurjanah, S.Pd (Tokoh Masyarakat & Wali Murid)
Fokus Utama: Zero Tolerance terhadap Bullying, Intoleransi, Pelecehan, serta penanaman Disiplin Positif berbasis Kurikulum Berbasis Cinta (Panca Cinta).`,
        },
      ],
    };
  }

  // 7. MODUL AJAR / KBC / PEMBELAJARAN
  if (
    item.category === 'Modul Ajar' ||
    item.kbcTag ||
    combined.includes('modul ajar') ||
    combined.includes('rpp') ||
    combined.includes('kbm') ||
    combined.includes('kurikulum berbasis cinta') ||
    combined.includes('panca cinta') ||
    combined.includes('al-qur\'an') ||
    combined.includes('pembelajaran') ||
    combined.includes('silabus')
  ) {
    return {
      categoryType: 'akademik_kbc',
      titleBadge: 'KURIKULUM BERBASIS CINTA (KBC) & MODUL AJAR',
      headline: 'Penyesuaian Modul Ajar & Panca Cinta KBC',
      explanation:
        'Masukkan rincian Capaian Pembelajaran (CP), materi pokok, serta integrasi dimensi Panca Cinta KBC (Cinta Allah, Diri, Sesama, Lingkungan, Bangsa) dan pendekatan Deep Learning (Mindful, Meaningful, Joyful).',
      uploadDescription: 'Unggah silabus guru, catatan materi pokok, atau draf modul ajar:',
      uploadExamples: [
        'Draf Modul Ajar / RPP Guru (.docx / .txt)',
        'Ringkasan Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP)',
        'Rancangan Proyek P5-PPRA / Praktik Siswa',
        'Catatan Pembelajaran Kurikulum Merdeka & KBC',
      ],
      placeholderText: `Contoh catatan pembelajaran:
- Mata Pelajaran: Pendidikan Agama Islam & Budi Pekerti (Fikih)
- Materi Pokok: Adab Bersuci dan Shalat Khusyuk
- Integrasi Panca Cinta: Menumbuhkan Cinta Allah & Rasul melalui shalat khusyuk dan kesadaran diri (Mindful Learning)
- Aktivitas Joyful: Simulasi wudhu hemat air dan diskusi kelompok empati antar sesama kawan`,
      showAcademicInputs: true,
      quickSamples: [
        {
          label: '💡 Sisipkan Rancangan Modul Deep Learning KBC',
          description: 'Langkah pembelajaran berkesadaran (Mindful), bermakna (Meaningful), & menggembirakan (Joyful)',
          text: `Rancangan Pembelajaran Terpadu Kurikulum Berbasis Cinta (KBC):
1. Capaian Pembelajaran: Peserta didik mampu merefleksikan nilai-nilai keilmuan dan ketaatan ibadah dengan penuh kesadaran diri.
2. Dimensi Panca Cinta yang Dikembangkan:
   - Cinta Allah & Rasul: Menjadikan ibadah sebagai kebutuhan jiwa, bukan sekadar kewajiban formalitas.
   - Cinta Sesama: Membiasakan senyum, sapa, salam, sopan, santun, dan saling menghargai pendapat kawan sekelas.
3. Pendekatan Deep Learning:
   - Mindful: 5 menit hening tadabbur ayat Al-Qur'an sebelum KBM dimulai.
   - Meaningful: Mengaitkan materi pelajaran dengan pemecahan masalah kehidupan nyata siswa.
   - Joyful: Game edukasi interaktif, apresiasi positif bagi setiap usaha belajar siswa, dan tidak ada hukuman fisik.`,
        },
      ],
    };
  }

  // 8. ADMINISTRASI UMUM / DEFAULT
  return {
    categoryType: 'administrasi_umum',
    titleBadge: 'CATATAN & DETAIL DOKUMEN MADRASAH',
    headline: 'Penyesuaian Data Naskah Madrasah',
    explanation:
      'Unggah catatan rapat, daftar hadir, SOP operasional, atau draf naskah madrasah yang sudah ada. AI Gemini akan merapikannya menjadi dokumen administrasi resmi yang terstandar.',
    uploadDescription: 'Unggah file draf dokumen, catatan rapat, atau format madrasah:',
    uploadExamples: [
      'File Naskah Draf Madrasah (.docx / .txt / .csv)',
      'Catatan Hasil Rapat / Notulen & Berita Acara',
      'Format SOP Pelayanan atau Pedoman Madrasah',
      'Catatan Tambahan Khusus untuk AI',
    ],
    placeholderText: `Contoh catatan yang bisa Anda upload atau ketik:
- Hari/Tanggal: Kamis, 18 September 2025
- Tempat: Ruang Rapat Pimpinan ${profile.namaMadrasah}
- Agenda Pembahasan: Persiapan Dokumen Akreditasi & Penilaian Kinerja Kepala Madrasah
- Pimpinan Rapat: ${profile.namaKepala}
- Hasil Kesepakatan: Pembagian PIC untuk 5 Komponen Utama PKKM dan target penyelesaian 100% tepat waktu`,
    showAcademicInputs: false,
    quickSamples: [
      {
        label: '💡 Sisipkan Contoh Notulen Rapat PKKM',
        description: 'Format notulen rapat dinas pembagian penanggung jawab instrumen PKKM',
        text: `Notulen Rapat Dinas Persiapan Bukti Fisik PKKM 2026:
- Agenda: Koordinasi Pengumpulan 205 Instrumen Bukti Fisik PKKM 2026
- Pimpinan Rapat: ${profile.namaKepala} (Kepala Madrasah)
- Peserta: Seluruh Wakil Kepala Madrasah, Kepala Lab, Kepala Perpustakaan, dan Dewan Guru
- Keputusan Pokok:
  1. Penanggung Jawab Komponen A (Manajerial): Waka Kurikulum & Waka Sarpras
  2. Penanggung Jawab Komponen B (Kewirausahaan): Tim Usaha & Humas Komite
  3. Penanggung Jawab Komponen C (Supervisi): Koordinator Guru Senior & Waka Kurikulum
  4. Penanggung Jawab Komponen D (Pengembangan Profesi): Tim PKG & Litbang Madrasah
  5. Penanggung Jawab Komponen E (Hasil Kinerja): Operator RDM, Bendahara BOS & Staf TU
  6. Seluruh dokumen wajib menginsersikan Kurikulum Berbasis Cinta (Panca Cinta KBC).`,
      },
    ],
  };
}
