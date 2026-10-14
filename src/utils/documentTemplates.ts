import { MadrasahProfile, PKKMItem } from '../types';

export function generateStandardDocument(item: PKKMItem, profile: MadrasahProfile, customNotes?: string): string {
  const nomorSurat = `B-${String(item.id).padStart(3, '0')}/${profile.jenjang}.${profile.nsm.slice(0, 4)}/PP.00.5/${new Date().getMonth() + 1}/${profile.tahunPenilaian}`;
  const tanggal = profile.tanggalPenilaian || '21 Nopember 2026';
  const tempat = profile.kabupatenKota.replace('Kabupaten ', '').replace('Kota ', '');

  if (item.category === 'SK') {
    return `# KEMENTERIAN AGAMA REPUBLIK INDONESIA
## KANTOR KEMENTERIAN AGAMA ${profile.kabupatenKota.toUpperCase()}
### ${profile.namaMadrasah.toUpperCase()}
*Alamat: ${profile.alamat}, ${profile.desaKelurahan}, Kec. ${profile.kecamatan}, ${profile.kabupatenKota} - ${profile.provinsi}*
*NSM: ${profile.nsm} | NPSN: ${profile.npsn}*

---

### SURAT KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR: ${nomorSurat}**

**TENTANG**
**PENETAPAN ${item.title.toUpperCase()}**
**TAHUN AJARAN ${profile.tahunAjaran} / TAHUN PENILAIAN ${profile.tahunPenilaian}**

---

**DENGAN RAHMAT TUHAN YANG MAHA ESA**
**KEPALA ${profile.namaMadrasah.toUpperCase()},**

**Menimbang:**
a. bahwa dalam rangka optimalisasi pencapaian indikator kinerja ${item.folderName} pada ${profile.namaMadrasah}, dipandang perlu menetapkan ${item.title};
b. bahwa untuk menjamin ketertiban administrasi, kepastian hukum, dan kelancaran pelaksanaan tugas di madrasah berlandaskan nilai-nilai Kurikulum Berbasis Cinta (KBC) dan budaya mutu;
c. bahwa nama-nama/ketentuan yang tercantum dalam lampiran keputusan ini dipandang cakap dan memenuhi syarat untuk melaksanakan tugas sebagaimana mestinya;
d. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, b, dan c, perlu menetapkan Surat Keputusan Kepala ${profile.namaMadrasah}.

**Mengingat:**
1. Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;
2. Peraturan Pemerintah Nomor 57 Tahun 2021 tentang Standar Nasional Pendidikan;
3. Peraturan Menteri Agama Nomor 58 Tahun 2017 tentang Kepala Madrasah sebagaimana telah diubah dengan PMA Nomor 24 Tahun 2018;
4. Keputusan Menteri Agama (KMA) Nomor 450 Tahun 2024 tentang Pedoman Implementasi Kurikulum pada Madrasah;
5. Keputusan Direktur Jenderal Pendidikan Islam tentang Petunjuk Teknis Penilaian Kinerja Kepala Madrasah (PKKM) Tahun 2026;
6. Rencana Kerja Jangka Menengah (RKJM) dan Rencana Kerja Anggaran Madrasah (RKAM) ${profile.namaMadrasah}.

${customNotes ? `**Memperhatikan Catatan Tambahan:**\n${customNotes}\n` : ''}
**MEMUTUSKAN:**

**Menetapkan:**
**KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()} TENTANG ${item.title.toUpperCase()}.**

**KESATU:**
Menetapkan dan mengesahkan ${item.title} pada ${profile.namaMadrasah} Tahun Ajaran ${profile.tahunAjaran} sebagaimana tercantum dalam Lampiran I dan Lampiran II keputusan ini.

**KEDUA:**
Masing-masing pihak yang ditunjuk wajib melaksanakan tugas dan tanggung jawab secara profesional, akuntabel, serta mengedepankan prinsip Panca Cinta KBC (Cinta Allah & Rasul, Cinta Ilmu, Cinta Diri & Sesama, Cinta Lingkungan, dan Cinta Tanah Air).

**KETIGA:**
Segala biaya yang timbul akibat pelaksanaan keputusan ini dibebankan pada Anggaran Pendapatan dan Belanja Madrasah (BOS/e-RKAM) yang relevan atau sumber dana lain yang sah dan tidak mengikat.

**KEEMPAT:**
Keputusan ini mulai berlaku sejak tanggal ditetapkan, dan apabila terdapat kekeliruan dalam penetapannya di kemudian hari, akan dilakukan perbaikan sebagaimana mestinya.

---

Ditetapkan di: ${tempat}  
Pada tanggal: ${tanggal}

**Kepala ${profile.namaMadrasah}**

*(tanda tangan & stempel resmi)*

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}  
Pangkat/Gol.: ${profile.pangkatKepala}

---

### LAMPIRAN KEPUTUSAN KEPALA ${profile.namaMadrasah.toUpperCase()}
**NOMOR:** ${nomorSurat}  
**TENTANG:** ${item.title.toUpperCase()}

#### STRUKTUR TUGAS DAN RINCIAN OPERASIONAL

| No | Jabatan / Peran | Nama Personel | Tugas Pokok & Fungsi | Indikator Keberhasilan |
|:---|:---|:---|:---|:---|
| 1 | Pengarah & Penanggung Jawab | ${profile.namaKepala} | Memberikan kebijakan umum, monitoring, evaluasi, dan pengesahan berkas fisik PKKM. | Terlaksananya program 100% tepat waktu |
| 2 | Ketua Pelaksana | Guru Senior / Wakamad | Mengoordinasikan pengumpulan bukti fisik, menyusun jadwal, dan memimpin rapat teknis. | Terkumpulnya 205 instrumen fisik PKKM |
| 3 | Sekretaris | Tenaga Kependidikan / TU | Mengadministrasikan persuratan, notulen rapat, pengarsipan berkas digital, dan tautan Google Drive. | Arsip rapi fisik & link folder cloud |
| 4 | Koordinator Komponen | Guru Bidang / Tendik | Melakukan telaah instrumen, validasi modul ajar KBC, pengolahan nilai RDM, dan rekapitulasi data. | Berkas lengkap terverifikasi Pengawas |
| 5 | Perwakilan Komite | ${profile.namaKetuaKomite} | Memberikan dukungan kemitraan, transparansi pembiayaan, dan pengawasan independen. | Partisipasi aktif orang tua dan masyarakat |

${tempat}, ${tanggal}  
**Kepala Madrasah,**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
  }

  if (item.category === 'SOP') {
    return `# STANDAR OPERASIONAL PROSEDUR (SOP)
## ${profile.namaMadrasah.toUpperCase()}
### DOKUMEN BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian} - ITEM #${item.id}

---

**JUDUL SOP:** ${item.title.toUpperCase()}  
**NOMOR DOKUMEN:** SOP-${profile.jenjang}/${item.id}/${profile.tahunPenilaian}  
**TANGGAL BERLAKU:** ${tanggal}  
**PENANGGUNG JAWAB:** Kepala Madrasah (${profile.namaKepala})  
**DASAR HUKUM:** KMA Nomor 450 Tahun 2024 & Juknis PKKM Tahun 2026 Kemenag RI  

---

### 1. TUJUAN
1. Memberikan panduan baku, terukur, dan transparan dalam pelaksanaan ${item.title} di lingkungan ${profile.namaMadrasah}.
2. Menjamin terwujudnya iklim madrasah yang aman, nyaman, bebas kekerasan, berkarakter Islami, dan selaras dengan prinsip Kurikulum Berbasis Cinta (KBC).
3. Memberikan kepastian alur penanganan, koordinasi antar unit kerja, serta perlindungan hak bagi seluruh warga madrasah.

### 2. RUANG LINGKUP
SOP ini berlaku untuk seluruh peserta didik, pendidik (guru), tenaga kependidikan (staf tata usaha), pimpinan madrasah, orang tua murid, dan mitra stakeholder di ${profile.namaMadrasah}.

### 3. DEFINISI ISTILAH
- **KBC (Kurikulum Berbasis Cinta):** Pendekatan pendidikan holistik yang menempatkan rasa cinta, kasih sayang (welas asih), dan kesadaran spiritual sebagai pilar pembelajaran.
- **Warga Madrasah:** Seluruh individu yang beraktivitas di lingkungan madrasah.
- **Unit Penanganan:** Tim khusus yang ditunjuk Kepala Madrasah untuk menindaklanjuti prosedur ini.

### 4. ALUR PROSEDUR KERJA (FLOWCHART TAHAPAN)

| Tahap | Aktivitas Prosedur | Pelaksana | Waktu Maksimal | Dokumen / Output |
|:---|:---|:---|:---|:---|
| I. Penerimaan / Input | Menerima laporan, permohonan, atau data awal melalui formulir resmi/kotak aduan/portal digital madrasah. | Petugas Piket / Wali Kelas / BK | 1 x 24 Jam | Lembar Registrasi Laporan |
| II. Verifikasi & Asesmen | Melakukan klarifikasi fakta, asesmen kebutuhan lapangan, dan klasifikasi urgensi. | Tim Khusus / TPPK / Wakamad | 2 x 24 Jam | Berita Acara Klarifikasi |
| III. Tindakan / Intervensi | Melaksanakan mediasi, pendampingan, layanan bimbingan welas asih, atau tindak lanjut administratif. | Kepala Madrasah & Tim Terkait | 3 x 24 Jam | Lembar Rekomendasi Tindakan |
| IV. Monitoring & Evaluasi | Memantau perkembangan hasil penanganan, memastikan situasi kembali kondusif, dan pendampingan berkelanjutan. | Guru BK / Wali Kelas | 14 Hari Kerja | Lembar Catatan Pemantauan |
| V. Pengarsipan | Menyimpan berkas berita acara, bukti foto, dan memasukkan link ke Google Drive Bukti Fisik PKKM. | Staf Tata Usaha | Selesai | Folder G-Drive Bukti Fisik |

${customNotes ? `### 5. KETENTUAN KHUSUS / CATATAN TAMBAHAN\n${customNotes}\n` : ''}
### 6. PENGESAHAN DOKUMEN

Disahkan di: ${tempat}  
Pada tanggal: ${tanggal}  

**Disetujui Oleh:**  
**Kepala ${profile.namaMadrasah}**  

*(tanda tangan & cap stempel)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
  }

  if (item.category === 'Modul Ajar') {
    return `# MODUL AJAR / RENCANA PEMBELAJARAN MENDALAM
## INSERSI NILAI PANCA CINTA KBC (KURIKULUM MERDEKA MADRASAH)
### ${profile.namaMadrasah.toUpperCase()} - TAHUN AJARAN ${profile.tahunAjaran}

---

**Mata Pelajaran:** Pendidikan Agama Islam & Budi Pekerti / Umum  
**Fase / Kelas:** Fase D (Kelas VII/VIII) / Fase E-F  
**Alokasi Waktu:** 2 Pertemuan (4 x 40 Menit)  
**Penyusun:** Tim Guru Pengembang ${profile.namaMadrasah}  
**Validator:** Kepala Madrasah (${profile.namaKepala}) & Pengawas Pembina (${profile.namaPenilai})  

---

### I. IDENTITAS & KOMPONEN UMUM
- **Model Pembelajaran:** Deep Learning (Meaningful, Mindful, and Joyful Learning)
- **Profil Pelajar Pancasila & Rahmatan Lil Alamin:** Beriman, Bertakwa, Berakhlak Mulia, Gotong Royong, Bernalar Kritis, Berkeadaban (Ta'addub), Keteladanan (Qudwah).
- **Dimensi Panca Cinta KBC:**
  1. *Cinta Allah dan Rasul*: Membiasakan doa pembuka, rasa syukur atas akal dan nikmat ilmu.
  2. *Cinta Ilmu Pengetahuan*: Menumbuhkan rasa ingin tahu mendalam dan kecintaan membaca.
  3. *Cinta Diri dan Sesama*: Saling menghormati pendapat, diskusi kolaboratif tanpa perundungan.
  4. *Cinta Lingkungan*: Menjaga kebersihan ruang kelas dan efisiensi pemakaian alat peraga.
  5. *Cinta Tanah Air & Bangsa*: Mengaitkan materi pembelajaran dengan kontribusi bagi kemajuan bangsa.

### II. CAPAIAN PEMBELAJARAN (CP) & TUJUAN PEMBELAJARAN (TP)
- **Capaian Pembelajaran (CP):** Peserta didik mampu menganalisis konsep inti materi secara kritis, kontekstual, dan mengaitkannya dengan pengamalan akhlak karimah dalam kehidupan sehari-hari.
- **Tujuan Pembelajaran (TP):**
  1. Melalui telaah literatur dan diskusi kelompok, siswa dapat merumuskan konsep utama secara tepat dengan penuh ketelitian.
  2. Melalui simulasi pemecahan masalah (Problem-Based Learning), siswa mampu mengemukakan solusi kreatif yang sarat nilai empati.
  3. Siswa membiasakan refleksi diri harian (*Exit Ticket SEL*) sebagai wujud pembiasaan karakter Kurikulum Berbasis Cinta.

### III. KEGIATAN PEMBELAJARAN
#### A. Kegiatan Awal (15 Menit) - *Mindful & Welcoming Environment*
1. Guru menyapa peserta didik dengan senyum, salam, dan sapaan hangat bernuansa welas asih.
2. Membaca doa bersama dan melantunkan Asmaul Husna / tadarus Al-Qur'an singkat.
3. Melakukan presensi dengan metode cek emosi (*Emoticon Check-In*): Siswa menunjukkan suasana hatinya hari ini.
4. Guru memberikan apersepsi yang mengaitkan materi dengan fenomena nyata dan hikmah cinta kasih ilahiah.

#### B. Kegiatan Inti (55 Menit) - *Meaningful & Active Inquiry*
1. **Penyajian Masalah Kasus:** Guru menampilkan video/studi kasus kontekstual yang membutuhkan daya nalar dan kepekaan rasa.
2. **Eksplorasi Kolaboratif:** Peserta didik bekerja dalam kelompok heterogen dengan pembagian peran saling menghargai.
3. **Internalisasi Panca Cinta:** Setiap kelompok mengidentifikasi nilai kebaikan dan kepedulian yang terkandung dalam pemecahan masalah.
4. **Presentasi Terbuka:** Kelompok mempresentasikan gagasan dengan santun, kelompok lain memberikan apresiasi konstruktif (2 pujian, 1 masukan).

#### C. Kegiatan Penutup (10 Menit) - *Joyful Reflection & Exit Ticket*
1. Guru bersama peserta didik merumuskan kesimpulan pembelajaran yang menguatkan pemahaman esensial.
2. Peserta didik mengisi *Exit Ticket SEL Panca Cinta*: *"Apa hikmah kebaikan yang saya pelajari hari ini dan bagaimana saya menerapkannya di rumah?"*
3. Guru mengapresiasi keaktifan seluruh siswa dan menutup pembelajaran dengan doa hamdalah serta salam penutup.

### IV. ASESMEN PEMBELAJARAN
- **Asesmen Diagnostik Awal:** Kuis singkat pemetaan pemahaman awal (CBT/Google Form).
- **Asesmen Formatif:** Jurnal observasi sikap welas asih, keaktifan diskusi, dan lembar penilaian antar teman.
- **Asesmen Sumatif:** Uji kompetensi tertulis / portofolio karya kreatif berbasis rubrik KKTP.

${customNotes ? `### V. CATATAN KHUSUS MAPEL / KELAS\n${customNotes}\n` : ''}
---

Mengetahui,  
**Kepala ${profile.namaMadrasah}**  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}  

Guru Mata Pelajaran,  

**Tim Kurikulum & Pendidik**`;
  }

  if (item.category === 'Notulen & Berita Acara') {
    return `# BERITA ACARA DAN NOTULEN RAPAT RESMI
## ${profile.namaMadrasah.toUpperCase()}
### BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian} - ITEM #${item.id}

---

### BERITA ACARA
Pada hari ini, **Senin tanggal ${tanggal}**, bertempat di Ruang Rapat ${profile.namaMadrasah}, telah diselenggarakan rapat koordinasi dalam rangka **${item.title.toUpperCase()}**.

Rapat dihadiri oleh:
1. Kepala Madrasah (${profile.namaKepala})
2. Dewan Guru dan Staf Tenaga Kependidikan (${profile.namaMadrasah})
3. Pengurus Komite Madrasah (${profile.namaKetuaKomite})
4. Perwakilan Pengawas Pembina Kemenag (${profile.namaPenilai})

Setelah melalui pemaparan, diskusi mendalam, dan musyawarah mufakat, seluruh peserta rapat menyepakati:
1. Menyetujui dan mengesahkan seluruh rancangan program serta instrumen pelaksanaan kegiatan ${item.title}.
2. Seluruh dewan guru berkomitmen menerapkan nilai-nilai Kurikulum Berbasis Cinta (KBC), pembiasaan 7 KAIH, serta menjaga iklim belajar yang aman dan bebas perundungan.
3. Berkas hasil rapat ini dijadikan bagian tak terpisahkan dari dokumen bukti fisik Penilaian Kinerja Kepala Madrasah (PKKM) Tahun ${profile.tahunPenilaian}.

Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.

---

### NOTULENSI RAPAT
- **Agenda:** ${item.title}
- **Pimpinan Rapat:** ${profile.namaKepala} (Kepala Madrasah)
- **Notulis:** Staf Tata Usaha / Guru
- **Waktu Pelaksanaan:** Pukul 08.30 WIB s.d. 12.00 WIB

#### Ringkasan Jalannya Rapat:
1. **Pembukaan:** Rapat dibuka dengan pembacaan Ummul Kitab (Surah Al-Fatihah) dipimpin oleh Kepala Madrasah.
2. **Arahan Kepala Madrasah:**
   - Menyampaikan target kinerja madrasah tahun 2026 yang menitikberatkan pada digitalisasi (EMIS 4.0, RDM, e-RKAM) dan implementasi mendalam Kurikulum Berbasis Cinta.
   - Mengingatkan pentingnya keteraturan arsip fisik dan link Google Drive untuk 205 instrumen PKKM.
3. **Pemaparan Materi & Pembahasan:**
   - Review kesiapan dokumen pendukung, pembagian penanggung jawab per folder (A1 hingga E4).
   - Penegasan kembali peran TPPK madrasah dan disiplin positif tanpa kekerasan.
4. **Tanya Jawab & Masukan:**
   - Perwakilan komite madrasah menyampaikan dukungan penuh terhadap program pembiasaan ibadah dan program ramah lingkungan (Green School).
5. **Kesimpulan & Penutup:** Rapat ditutup dengan doa bersama.

${customNotes ? `#### Catatan Tambahan Hasil Rapat:\n${customNotes}\n` : ''}
---

${tempat}, ${tanggal}  

**Pimpinan Rapat / Kepala Madrasah,**  
**${profile.namaKepala}**  
NIP. ${profile.nipKepala}  

**Notulis Rapat,**  
**(Tim Tata Usaha)**`;
  }

  // Generic Official Format for Program Kerja, Laporan, Instrumen, Data & Rekapitulasi
  return `# DOKUMEN RESMI BUKTI FISIK PKKM TAHUN ${profile.tahunPenilaian}
## KEMENTERIAN AGAMA REPUBLIK INDONESIA
### ${profile.namaMadrasah.toUpperCase()}
*Komponen ${item.componentId} | Folder: ${item.folderName} | Nomor Urut: #${item.id}*

---

### DOKUMEN: ${item.title.toUpperCase()}
**Nomor Registrasi Arsip:** REG-PKKM-${profile.tahunPenilaian}/${item.folderId}/${String(item.id).padStart(3, '0')}  
**Status Dokumen:** Terverifikasi dan Siap Evaluasi Fisik  
**Tahun Ajaran:** ${profile.tahunAjaran}  

---

### I. LATAR BELAKANG & DASAR HUKUM
Dokumen ini disusun sebagai wujud pemenuhan bukti kinerja dan akuntabilitas manajerial Kepala Madrasah pada sub-komponen **${item.folderName}**. Disusun berdasarkan:
1. Petunjuk Teknis Penilaian Kinerja Kepala Madrasah (PKKM) Tahun 2026 Dirjen Pendidikan Islam Kemenag RI.
2. Keputusan Menteri Agama (KMA) Nomor 450 Tahun 2024 tentang Pedoman Implementasi Kurikulum Madrasah.
3. Standar Nasional Pendidikan (SNP) dan Evaluasi Diri Madrasah (EDM) ${profile.namaMadrasah}.
4. Prinsip Kurikulum Berbasis Cinta (KBC) dan Pembelajaran Mendalam (Deep Learning).

### II. TUJUAN & RUANG LINGKUP
- Memberikan bukti otentik pelaksanaan tugas dan fungsi pimpinan madrasah dalam mengelola ${item.title}.
- Menjadi tolok ukur evaluasi berkala bagi Pengawas Madrasah dan Tim Penilai PKKM.
- Mendorong peningkatan mutu berkelanjutan di lingkungan ${profile.namaMadrasah}.

### III. MATRIKS PELAKSANAAN & DATA BUKTI FISIK

| No | Uraian Kegiatan / Aspek Indikator | Realisasi Lapangan | Satuan / Volume | Keterangan & Bukti Pendukung |
|:---|:---|:---|:---|:---|
| 1 | Perencanaan & Sosialisasi Program | Terlaksana rapat dinas dan penyusunan instrumen | 1 Berkas Lengkap | SK Kamad, Berita Acara, Absensi |
| 2 | Pelaksanaan & Pendampingan Rutin | Diterapkan secara berkesinambungan di kelas / lingkungan madrasah | 100% Warga Madrasah | Dokumentasi Kegiatan, Foto/Video |
| 3 | Evaluasi & Pengolahan Data | Dianalisis berkala per semester | 2 Semester (Ganjil/Genap) | Rekapitulasi RDM / Aplikasi SIM |
| 4 | Tindak Lanjut & Inovasi Berkelanjutan | Tersusun Rencana Tindak Lanjut (RTL) | 1 Laporan RTL | Lembar Pengesahan Pengawas |

### IV. DESKRIPSI RINCI & ANALISIS CAPAIAN
Pelaksanaan **${item.title}** pada ${profile.namaMadrasah} telah memenuhi standar kelayakan yang ditetapkan dalam juknis PKKM 2026. Seluruh dewan guru dan tenaga kependidikan berpartisipasi aktif dalam memastikan data terinput secara valid baik pada sistem pelaporan Kemenag (EMIS 4.0, RDM, e-RKAM) maupun dalam pengarsipan folder cloud Google Drive.

${customNotes ? `### V. CATATAN KHUSUS / INFORMASI TAMBAHAN\n${customNotes}\n` : ''}
### VI. LEMBAR PENGESAHAN

Disahkan di: ${tempat}  
Pada tanggal: ${tanggal}  

Mengetahui / Memeriksa:  
**Penilai / Pengawas Pembina,**  

*(tanda tangan)*  

**${profile.namaPenilai}**  
NIP. ${profile.nipPenilai}  
${profile.jabatanPenilai}  

Kepala Madrasah Yang Dinilai:  
**Kepala ${profile.namaMadrasah},**  

*(tanda tangan & stempel resmi)*  

**${profile.namaKepala}**  
NIP. ${profile.nipKepala}`;
}
