import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  serverLogin,
  verifySessionToken,
  checkRateLimit,
  checkAndConsumeQuota,
  recordUsageLog,
  createNewLicense,
  listAllLicenses,
  getUsageStatsSummary,
  SafeUser,
} from './server/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

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

// Helper to extract client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Helper to extract authenticated user from Request
function getAuthUser(req: Request): SafeUser | null {
  const authHeader = req.headers['authorization'];
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.headers['x-pkkm-auth-token'] === 'string') {
    token = req.headers['x-pkkm-auth-token'];
  }
  return verifySessionToken(token);
}

// 1. Health check endpoint with platform status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    app: 'Asisten Mandiri Bukti Fisik PKKM 2026 (Berbasis Referensi PKKM)',
    version: '2.5.0-protected',
    security: {
      authRequired: true,
      rateLimitActive: true,
      quotaEnforced: true,
    },
  });
});

// 2. Server-side Authentication Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password, licenseKey } = req.body;
  const credential = username || licenseKey || '';
  const secret = password || licenseKey || '';

  const result = serverLogin(credential, secret);
  if (!result.success) {
    recordUsageLog({
      username: credential || 'anon',
      role: 'guest',
      ip: getClientIp(req),
      status: 'gagal',
      message: result.error || 'Login gagal',
    });
    return res.status(401).json({ error: result.error });
  }

  return res.json({
    success: true,
    user: result.user,
    token: result.token,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.' });
  }
  return res.json({ user });
});

// 3. Admin / Seller License Management Endpoints
app.get('/api/auth/licenses', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'penjual') {
    return res.status(403).json({ error: 'Akses terbatas untuk akun Penjual / Admin.' });
  }
  const licenses = listAllLicenses();
  return res.json({ licenses });
});

app.post('/api/auth/licenses', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'penjual') {
    return res.status(403).json({ error: 'Akses terbatas untuk akun Penjual / Admin.' });
  }

  const { username, initialPassword, namaLengkap, namaMadrasah, role, kuotaLimit } = req.body;
  if (!username || !initialPassword) {
    return res.status(400).json({ error: 'Username dan Password awal wajib diisi.' });
  }

  const result = createNewLicense({
    username,
    initialPassword,
    namaLengkap,
    namaMadrasah,
    role,
    kuotaLimit: Number(kuotaLimit) || 60,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({
    success: true,
    account: result.account,
    licenseKey: result.licenseKey,
  });
});

// 4. Admin Usage & Audit Stats Endpoint
app.get('/api/usage-stats', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'penjual') {
    return res.status(403).json({ error: 'Akses terbatas untuk akun Penjual / Admin.' });
  }
  const summary = getUsageStatsSummary();
  return res.json(summary);
});

// 5. Protected AI Document Generation Endpoint
app.post('/api/generate-document', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const clientIp = getClientIp(req);

  // A. Autentikasi Server Wajib
  const user = getAuthUser(req);
  if (!user) {
    recordUsageLog({
      username: 'unauthorized',
      role: 'guest',
      ip: clientIp,
      status: 'gagal',
      message: 'Unauthorized access attempt to /api/generate-document',
    });
    return res.status(401).json({
      error: 'Akses ditolak. Endpoint AI hanya dapat diakses dengan lisensi login yang aktif dan sah.',
      code: 'UNAUTHORIZED',
    });
  }

  // B. Rate Limiting Check
  const rateLimitResult = checkRateLimit(clientIp, user.username);
  if (!rateLimitResult.allowed) {
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      status: 'rate_limited',
      message: rateLimitResult.reason,
    });
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds || 5));
    return res.status(429).json({
      error: rateLimitResult.reason,
      retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      code: 'RATE_LIMITED',
    });
  }

  // C. Validasi Input Ketat
  const { item, profile, customPrompt } = req.body;

  if (!item || typeof item !== 'object' || typeof item.id !== 'number' || item.id < 1 || item.id > 205) {
    return res.status(400).json({
      error: 'Parameter item tidak valid. Item ID wajib berupa angka antara 1 sampai 205.',
      code: 'INVALID_ITEM',
    });
  }

  if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
    return res.status(400).json({
      error: 'Judul instrumen item wajib disertakan.',
      code: 'INVALID_TITLE',
    });
  }

  if (!profile || typeof profile !== 'object' || !profile.namaMadrasah) {
    return res.status(400).json({
      error: 'Data profil madrasah wajib diisi sebelum membuat dokumen.',
      code: 'INVALID_PROFILE',
    });
  }

  // Sanitasi & pembatasan panjang customPrompt (mencegah prompt injection/bloat)
  const sanitizedPrompt = typeof customPrompt === 'string'
    ? customPrompt.trim().slice(0, 1500)
    : '';

  // D. Pembatasan Kuota Berdasarkan Akun / Lisensi
  const quotaCheck = checkAndConsumeQuota(user);
  if (!quotaCheck.allowed) {
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      itemId: item.id,
      itemTitle: item.title,
      componentId: item.componentId,
      status: 'quota_exceeded',
      message: `Batas kuota harian (${quotaCheck.limit}) telah tercapai`,
    });
    return res.status(429).json({
      error: `Batas kuota generate AI harian untuk akun Anda telah tercapai (${quotaCheck.used}/${quotaCheck.limit}). Anda tetap dapat menggunakan 'Template Cepat (Instan)' tanpa batas secara gratis.`,
      quota: quotaCheck,
      code: 'QUOTA_EXCEEDED',
    });
  }

  // Set Quota Headers
  res.setHeader('X-Quota-Limit', String(quotaCheck.limit));
  res.setHeader('X-Quota-Used', String(quotaCheck.used));
  res.setHeader('X-Quota-Remaining', String(quotaCheck.remaining));

  // E. Pembuatan Dokumen via Gemini AI
  try {
    if (ai) {
      try {
        const isLandscapeExpected = 
          item.title.toLowerCase().includes('jadwal') ||
          item.title.toLowerCase().includes('matriks') ||
          item.title.toLowerCase().includes('inventaris') ||
          item.title.toLowerCase().includes('rekapitulasi') ||
          item.title.toLowerCase().includes('buku kas') ||
          item.title.toLowerCase().includes('bku') ||
          item.title.toLowerCase().includes('rkam') ||
          item.title.toLowerCase().includes('edm') ||
          item.title.toLowerCase().includes('rkjm') ||
          item.title.toLowerCase().includes('rkt') ||
          item.title.toLowerCase().includes('7 kaih') ||
          item.title.toLowerCase().includes('pengolahan nilai') ||
          item.title.toLowerCase().includes('rapor') ||
          item.title.toLowerCase().includes('remedial') ||
          item.title.toLowerCase().includes('prestasi') ||
          item.category === 'Data & Rekapitulasi';

        const prompt = `Buatkan draf naskah dokumen administrasi fisik PKKM Tahun 2026 yang lengkap, sangat detail, otentik, dan siap cetak untuk instrumen berikut:

INFORMASI INSTRUMEN PKKM:
- Nomor Item: #${item.id} (dari total 205 item PKKM 2026)
- Komponen: Komponen ${item.componentId} (${item.folderName})
- Judul Dokumen: ${item.title}
- Kategori Dokumen: ${item.category}
- Deskripsi Item: ${item.description}
- Mengandung Unsur KBC/Panca Cinta: ${item.kbcTag ? 'Ya (Kurikulum Berbasis Cinta / Deep Learning / 7 KAIH / Panca Cinta)' : 'Tidak'}
- Format Orientasi Halaman: ${isLandscapeExpected ? 'LANSKAP (LANDSCAPE / HORIZONTAL) - Sediakan tabel matriks lebar multi-kolom yang sangat rapi dan lengkap' : 'POTRET (PORTRAIT / VERTIKAL) - Naskah resmi surat dinas/SK/SOP'}

DATA MADRASAH PENGGUNA:
- Nama Madrasah: ${profile.namaMadrasah} (${profile.jenjang} ${profile.status})
- NSM: ${profile.nsm || '121200000000'} | NPSN: ${profile.npsn || '20000000'}
- Alamat: ${profile.alamat}, Desa/Kel: ${profile.desaKelurahan}, Kec: ${profile.kecamatan}, ${profile.kabupatenKota}, Prov: ${profile.provinsi}
- Kepala Madrasah: ${profile.namaKepala} (NIP: ${profile.nipKepala}, Pangkat: ${profile.pangkatKepala})
- Pengawas / Penilai: ${profile.namaPenilai} (NIP: ${profile.nipPenilai}, Jabatan: ${profile.jabatanPenilai})
- Ketua Komite: ${profile.namaKetuaKomite}
- Tahun Ajaran: ${profile.tahunAjaran} | Periode Penilaian: Tahun ${profile.tahunPenilaian}
- Tanggal Dokumen: ${profile.tanggalPenilaian}

${sanitizedPrompt ? `INSTRUKSI KHUSUS DARI GURU/MADRASAH:\n${sanitizedPrompt}\n` : ''}

PANDUAN FORMAT & KONTEN SPESIFIK (JANGAN MEMBUAT TEMPLATE GENERIK YANG SAMA!):
1. Format output dalam Markdown yang terstruktur sangat rapi.
2. Cantumkan KOP MADRASAH (Kementerian Agama RI, Kantor Kemenag Kabupaten/Kota, Nama Madrasah, Alamat & NSM).
3. Untuk Dokumen Bertabel Lebar / Matriks (Jadwal Supervisi, Inventaris Sarpras, Buku Kas BOS/BKU, Rekap Nilai RDM, Matriks EDM, Rekap Prestasi):
   - Wajib sajikan tabel matriks multi-kolom komprehensif (6-10 kolom) dengan data contoh riil yang logis dan relevan, bukan tabel placeholder kosong.
   - Contoh Jadwal Supervisi: Kolom No, Nama Guru & NIP, Gol/Pangkat, Mapel, Kelas/Jam, Hari/Tgl, Fokus Pengamatan KBC, Supervisor, Paraf.
   - Contoh Inventaris Sarpras: Kolom No, Kode Barang, Nama Sarpras, Merek/Tipe, Th Pengadaan, Jumlah, Kondisi (Baik/RR/RB), Lokasi Ruang, Sumber Dana.
   - Contoh Keuangan BOS: Kolom No, Tanggal, No Bukti, Kode e-RKAM, Uraian Belanja, Penerimaan, Pengeluaran, Saldo Kas.
4. Untuk Surat Keputusan (SK): Sesuaikan konsideran Menimbang & Mengingat dengan topik SK (misal SK TPPK menyebut Permendikbudristek 46/2023; SK BOS menyebut Juknis BOS Kemenag; SK Kurikulum menyebut KMA 450/2024), Diktum KESATU-KEEMPAT, dan Lampiran struktur tim berbentuk tabel.
5. Untuk SOP: Buat format resmi (Tujuan, Ruang Lingkup, Dasar Hukum, Definisi, Tabel Flowchart 5 Tahapan Kerja, Pengesahan).
6. Untuk Modul Ajar / CP-TP: Buat sintaks Deep Learning (Mindful, Meaningful, Joyful), Insersi 5 Nilai Panca Cinta KBC, Langkah KBM, dan Rubrik Asesmen KKTP.
7. Selalu akhiri dengan Tempat, Tanggal, dan Lembar Tanda Tangan (Kepala Madrasah & Pengawas/Penilai).
8. Buat naskah berbobot, otentik, spesifik, dan jangan terpotong.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'Anda adalah asisten AI tata naskah administrasi madrasah berbasis referensi instrumen PKKM Tahun 2026 dan pedoman teknis Ditjen Pendis Kemenag RI. Anda menyusun draf dokumen administrasi madrasah yang rapi, kredibel, formal, terperinci, dan sesuai implementasi Kurikulum Berbasis Cinta (KBC). Seluruh dokumen merupakan sarana bantu mandiri guru/madrasah.',
            temperature: 0.7,
          },
        });

        const content = response.text || '';
        if (content) {
          const durationMs = Date.now() - startTime;
          recordUsageLog({
            username: user.username,
            role: user.role,
            ip: clientIp,
            itemId: item.id,
            itemTitle: item.title,
            componentId: item.componentId,
            charsGenerated: content.length,
            status: 'sukses',
            durationMs,
          });

          return res.json({
            content,
            source: 'gemini-3.8-flash',
            generatedAt: new Date().toISOString(),
            quota: quotaCheck,
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered an issue, falling back to standard template:', geminiError.message);
        recordUsageLog({
          username: user.username,
          role: user.role,
          ip: clientIp,
          itemId: item.id,
          itemTitle: item.title,
          componentId: item.componentId,
          status: 'fallback',
          message: geminiError.message,
          durationMs: Date.now() - startTime,
        });

        return res.json({
          content: null,
          source: 'template-fallback',
          message: 'Layanan AI sedang mengalami antrean trafik sementara. Dokumen dibuat otomatis menggunakan template standar berbasis referensi PKKM.',
          generatedAt: new Date().toISOString(),
          quota: quotaCheck,
        });
      }
    }

    return res.json({
      content: null,
      source: 'template-fallback',
      message: 'Mode template standar aktif.',
      generatedAt: new Date().toISOString(),
      quota: quotaCheck,
    });
  } catch (err: any) {
    console.error('Error generating document:', err);
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      itemId: item.id,
      itemTitle: item.title,
      componentId: item.componentId,
      status: 'fallback',
      message: err.message,
      durationMs: Date.now() - startTime,
    });

    return res.json({
      content: null,
      source: 'template-fallback',
      message: 'Menggunakan template standar berbasis referensi PKKM.',
      quota: quotaCheck,
    });
  }
});

// 6. Protected Batch Plan Outline Endpoint
app.post('/api/batch-plan', async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const user = getAuthUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Akses ditolak. Harap login terlebih dahulu.' });
  }

  const rateLimitResult = checkRateLimit(clientIp, user.username);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.reason });
  }

  try {
    const { componentId, profile } = req.body;
    if (!ai) {
      return res.json({ message: 'Mode template aktif' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Buatkan ringkasan panduan prioritas penyusunan bukti fisik PKKM 2026 untuk Komponen ${componentId} pada ${profile?.namaMadrasah || 'Madrasah'} berbasis referensi instrumen PKKM dalam 5 butir ringkas.`,
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

app.listen(port, '0.0.0.0', () => {
  console.log(`Server PKKM 2026 running at http://0.0.0.0:${port}`);
});
