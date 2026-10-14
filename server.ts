import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    app: 'PKKM 2026 AI Document Generator',
  });
});

// Document Generation Endpoint
app.post('/api/generate-document', async (req: Request, res: Response) => {
  try {
    const { item, profile, customPrompt, style } = req.body;

    if (!item || !profile) {
      return res.status(400).json({ error: 'Item dan Profile madrasah wajib diisi' });
    }

    // If Gemini API is available, use gemini-3.8-flash
    if (ai) {
      try {
        const prompt = `Buatkan naskah dokumen resmi fisik PKKM Tahun 2026 yang lengkap, sangat detail, otentik, dan siap cetak untuk instrumen berikut:

INFORMASI INSTRUMEN PKKM:
- Nomor Item: #${item.id} (dari total 205 item PKKM 2026)
- Komponen: Komponen ${item.componentId} (${item.folderName})
- Judul Dokumen: ${item.title}
- Kategori Dokumen: ${item.category}
- Deskripsi Item: ${item.description}
- Mengandung Unsur KBC/Panca Cinta: ${item.kbcTag ? 'Ya (Kurikulum Berbasis Cinta / Deep Learning / 7 KAIH / Panca Cinta)' : 'Tidak'}

DATA MADRASAH:
- Nama Madrasah: ${profile.namaMadrasah} (${profile.jenjang} ${profile.status})
- NSM: ${profile.nsm} | NPSN: ${profile.npsn}
- Alamat: ${profile.alamat}, Desa/Kel: ${profile.desaKelurahan}, Kec: ${profile.kecamatan}, ${profile.kabupatenKota}, Prov: ${profile.provinsi}
- Kepala Madrasah: ${profile.namaKepala} (NIP: ${profile.nipKepala}, Pangkat: ${profile.pangkatKepala})
- Pengawas / Penilai: ${profile.namaPenilai} (NIP: ${profile.nipPenilai}, Jabatan: ${profile.jabatanPenilai})
- Ketua Komite: ${profile.namaKetuaKomite}
- Tahun Ajaran: ${profile.tahunAjaran} | Periode Penilaian: Tahun ${profile.tahunPenilaian}
- Tanggal Dokumen: ${profile.tanggalPenilaian}

${customPrompt ? `INSTRUKSI KHUSUS DARI GURU/PENGGUNA:\n${customPrompt}\n` : ''}

PANDUAN FORMAT & KONTEN (STANDAR RESMI KEMENAG RI):
1. Format output dalam Markdown yang terstruktur sangat rapi.
2. Cantumkan KOP MADRASAH resmi (Kementerian Agama RI, Kantor Kemenag Kabupaten/Kota, Nama Madrasah, Alamat & NSM).
3. Jika jenis dokumen adalah Surat Keputusan (SK): buat format SK resmi dengan Nomor Surat dinas, Konsideran Menimbang (a-d), Mengingat (UU Sisdiknas, PMA Kepala Madrasah, KMA 450 Tahun 2024, Juknis PKKM 2026), Memutuskan (KESATU, KEDUA, KETIGA, KEEMPAT), dan Lampiran struktur tim/rincian tugas berbentuk tabel.
4. Jika jenis dokumen adalah SOP: buat dengan format SOP dinas (Tujuan, Ruang Lingkup, Dasar Hukum, Definisi, Tabel Alur Flowchart Prosedur 5 Tahap, Pengesahan).
5. Jika jenis dokumen adalah Modul Ajar / Analisis CP-TP / ATP: buat lengkap dengan sintaks Deep Learning (Mindful, Meaningful, Joyful), Insersi 5 Nilai Panca Cinta KBC, Langkah KBM Awal-Inti-Penutup, Exit Ticket SEL, dan Rubrik Asesmen KKTP.
6. Jika jenis dokumen adalah Notulen / Berita Acara: buat Berita Acara lengkap penandatangan, susunan agenda, ringkasan arahan Kepala Madrasah, dan notulensi musyawarah.
7. Jika jenis dokumen adalah Program Kerja / Laporan / Rekapitulasi: cantumkan Latar Belakang, Tujuan, Matriks Tabel Pelaksanaan detail dengan data angka realistis, dan lembar evaluasi.
8. Selalu akhiri dengan Tempat, Tanggal, dan Lembar Tanda Tangan resmi (Kepala Madrasah Yang Dinilai & Pengawas/Penilai).
9. Buat isinya komprehensif, berbobot, dan jangan terpotong.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'Anda adalah asisten AI ahli tata naskah dinas Kementerian Agama RI dan konsultan Penilaian Kinerja Kepala Madrasah (PKKM) 2026. Anda mahir menyusun dokumen administrasi madrasah yang legal, kredibel, formal, terperinci, dan sesuai implementasi Kurikulum Berbasis Cinta (KBC).',
            temperature: 0.7,
          },
        });

        const content = response.text || '';
        if (content) {
          return res.json({
            content,
            source: 'gemini-3.8-flash',
            generatedAt: new Date().toISOString(),
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered an issue, falling back to standard official template:', geminiError.message);
        return res.json({
          content: null,
          source: 'template-fallback',
          message: 'Model Gemini sedang mengalami lonjakan trafik sementara. Dokumen dibuat otomatis menggunakan template resmi standar Kemenag.',
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return res.json({
      content: null,
      source: 'template-fallback',
      message: 'Mode template aktif.',
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error generating document:', err);
    return res.json({
      content: null,
      source: 'template-fallback',
      message: 'Menggunakan template resmi standar.',
    });
  }
});

// Batch Generation Outlines endpoint
app.post('/api/batch-plan', async (req: Request, res: Response) => {
  try {
    const { componentId, profile } = req.body;
    if (!ai) {
      return res.json({ message: 'Mode template aktif' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buatkan ringkasan panduan prioritas penyusunan bukti fisik PKKM 2026 untuk Komponen ${componentId} pada ${profile?.namaMadrasah || 'Madrasah'} beserta tips lolos audit pengawas Kemenag dalam 5 butir ringkas.`,
    });

    res.json({ outline: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server PKKM 2026 running at http://localhost:${port}`);
});
