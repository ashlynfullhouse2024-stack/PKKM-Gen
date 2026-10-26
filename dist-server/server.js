// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// server/auth.ts
import crypto from "crypto";
var JWT_SECRET = process.env.APPLET_SECRET || "pkkm2026-secret-salt-kbc-independent-app";
function hashPassword(password) {
  return crypto.createHmac("sha256", JWT_SECRET).update(password.trim()).digest("hex");
}
var SERVER_ACCOUNTS = /* @__PURE__ */ new Map();
function initServerAccounts() {
  const adminPass = process.env.ADMIN_PASSWORD || "sellerpkkm2026";
  SERVER_ACCOUNTS.set("admin_lynk", {
    id: "admin_master",
    username: "admin_lynk",
    passwordHash: hashPassword(adminPass),
    licenseKey: "LIC-ADMIN-MASTER-2026",
    namaLengkap: "Admin / Penjual Lynk.id",
    role: "penjual",
    namaMadrasah: "Pusat Distribusi Lisensi PKKM",
    statusAktif: true,
    tanggalDibuat: "2026-01-01",
    kuotaDokumen: "Akses Master Tanpa Batas",
    kuotaLimit: 999999
  });
  const defaultBuyerCredentials = [
    { username: "madrasah_c7a9", initialPass: "Kemenag#8412", lic: "LIC-PKKM-C7A9-2026", role: "guru" },
    { username: "pkkm_guru_4k2x", initialPass: "Berkah!9103", lic: "LIC-PKKM-4K2X-2026", role: "guru" },
    { username: "kamad_m8e3", initialPass: "PancaCinta*772", lic: "LIC-PKKM-M8E3-2026", role: "kepala_madrasah" },
    { username: "madrasah_r5t8", initialPass: "Sukses@6381", lic: "LIC-PKKM-R5T8-2026", role: "guru" },
    { username: "pkkm_vip_9p4w", initialPass: "Madrasah$5294", lic: "LIC-PKKM-9P4W-2026", role: "guru" },
    { username: "guru_kbc_2h7q", initialPass: "Bermutu#3815", lic: "LIC-PKKM-2H7Q-2026", role: "guru" },
    { username: "madrasah_x6b1", initialPass: "Amanah!4729", lic: "LIC-PKKM-X6B1-2026", role: "guru" },
    { username: "pkkm_user_3m8k", initialPass: "Unggul*9042", lic: "LIC-PKKM-3M8K-2026", role: "guru" },
    { username: "madrasah_y4d5", initialPass: "Kinerja@7163", lic: "LIC-PKKM-Y4D5-2026", role: "guru" },
    { username: "pkkm_pro_8j2z", initialPass: "Hebat$8530", lic: "LIC-PKKM-8J2Z-2026", role: "guru" }
  ];
  defaultBuyerCredentials.forEach((b, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    SERVER_ACCOUNTS.set(b.username, {
      id: `buyer_${num}`,
      username: b.username,
      passwordHash: hashPassword(b.initialPass),
      licenseKey: b.lic,
      namaLengkap: `Pembeli Lisensi #${num}`,
      role: b.role,
      namaMadrasah: `Madrasah Pengguna Lisensi #${num}`,
      statusAktif: true,
      tanggalDibuat: "2026-01-10",
      kuotaDokumen: "Akses Penuh 205 Instrumen (60 AI/hari)",
      kuotaLimit: 60
    });
  });
}
initServerAccounts();
var ACTIVE_SESSIONS = /* @__PURE__ */ new Map();
var IP_RATE_LIMITS = /* @__PURE__ */ new Map();
var USER_COOLDOWNS = /* @__PURE__ */ new Map();
var DAILY_USAGE = /* @__PURE__ */ new Map();
var MAX_LOGS = 1e3;
var USAGE_LOGS = [];
function recordUsageLog(entry) {
  const fullEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...entry
  };
  USAGE_LOGS.unshift(fullEntry);
  if (USAGE_LOGS.length > MAX_LOGS) {
    USAGE_LOGS.pop();
  }
}
function createSessionToken(user) {
  const payload = {
    u: user.username,
    r: user.role,
    t: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(body).digest("base64url");
  const token = `${body}.${sig}`;
  ACTIVE_SESSIONS.set(token, {
    username: user.username,
    role: user.role,
    expiresAt: payload.exp
  });
  return token;
}
function verifySessionToken(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(body).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp < Date.now()) {
      ACTIVE_SESSIONS.delete(token);
      return null;
    }
    const account = SERVER_ACCOUNTS.get(payload.u);
    if (!account || !account.statusAktif) return null;
    const { passwordHash, licenseKey, ...safeUser } = account;
    return safeUser;
  } catch {
    return null;
  }
}
function serverLogin(credential, passwordOrLicense) {
  const trimmedCred = credential.trim().toLowerCase();
  const trimmedSecret = passwordOrLicense.trim();
  if (!trimmedCred || !trimmedSecret) {
    return { success: false, error: "Username dan Password/Lisensi wajib diisi." };
  }
  let matched = SERVER_ACCOUNTS.get(trimmedCred);
  if (!matched) {
    for (const acc of SERVER_ACCOUNTS.values()) {
      if (acc.licenseKey.toLowerCase() === trimmedCred) {
        matched = acc;
        break;
      }
    }
  }
  if (!matched) {
    return { success: false, error: "Kredensial atau lisensi tidak ditemukan di sistem." };
  }
  if (!matched.statusAktif) {
    return { success: false, error: "Lisensi ini saat ini berstatus non-aktif. Silakan hubungi penjual lynk.id." };
  }
  const inputHash = hashPassword(trimmedSecret);
  const isPassValid = matched.passwordHash === inputHash;
  const isLicValid = matched.licenseKey === trimmedSecret;
  if (!isPassValid && !isLicValid) {
    return { success: false, error: "Password atau Kode Lisensi tidak cocok." };
  }
  const { passwordHash, licenseKey, ...safeUser } = matched;
  const token = createSessionToken(safeUser);
  recordUsageLog({
    username: safeUser.username,
    role: safeUser.role,
    ip: "internal",
    status: "sukses",
    message: "User logged in successfully"
  });
  return { success: true, user: safeUser, token };
}
function checkRateLimit(ip, username) {
  const now = Date.now();
  const lastCall = USER_COOLDOWNS.get(username) || 0;
  if (now - lastCall < 3e3) {
    const wait = Math.ceil((3e3 - (now - lastCall)) / 1e3);
    return {
      allowed: false,
      retryAfterSeconds: wait,
      reason: `Harap tunggu ${wait} detik sebelum memicu pembuatan dokumen berikutnya.`
    };
  }
  const ipRecord = IP_RATE_LIMITS.get(ip);
  if (!ipRecord || now - ipRecord.windowStart > 6e4) {
    IP_RATE_LIMITS.set(ip, { count: 1, windowStart: now });
  } else {
    if (ipRecord.count >= 20) {
      const wait = Math.ceil((6e4 - (now - ipRecord.windowStart)) / 1e3);
      return {
        allowed: false,
        retryAfterSeconds: wait,
        reason: `Batas frekuensi IP terlampaui (maks 20 req/menit). Tunggu ${wait} detik.`
      };
    }
    ipRecord.count++;
  }
  USER_COOLDOWNS.set(username, now);
  return { allowed: true };
}
function checkAndConsumeQuota(user) {
  if (user.role === "penjual") {
    return { allowed: true, used: 0, limit: 999999, remaining: 999999 };
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const record = DAILY_USAGE.get(user.username);
  let currentUsed = 0;
  if (record && record.date === todayStr) {
    currentUsed = record.used;
  } else {
    DAILY_USAGE.set(user.username, { date: todayStr, used: 0 });
  }
  const limit = user.kuotaLimit || 60;
  if (currentUsed >= limit) {
    return {
      allowed: false,
      used: currentUsed,
      limit,
      remaining: 0
    };
  }
  currentUsed++;
  DAILY_USAGE.set(user.username, { date: todayStr, used: currentUsed });
  return {
    allowed: true,
    used: currentUsed,
    limit,
    remaining: Math.max(0, limit - currentUsed)
  };
}
function createNewLicense(params) {
  const username = params.username.trim().toLowerCase();
  if (SERVER_ACCOUNTS.has(username)) {
    return { success: false, error: `Username '${username}' sudah digunakan.` };
  }
  const lic = `LIC-PKKM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
  const newRecord = {
    id: `usr_${Date.now()}`,
    username,
    passwordHash: hashPassword(params.initialPassword),
    licenseKey: lic,
    namaLengkap: params.namaLengkap.trim() || "Pembeli Lisensi Tambahan",
    role: params.role || "guru",
    namaMadrasah: params.namaMadrasah?.trim() || "Madrasah Pengguna Lisensi",
    statusAktif: true,
    tanggalDibuat: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    kuotaDokumen: `Akses Penuh 205 Item (${params.kuotaLimit || 60} AI/hari)`,
    kuotaLimit: params.kuotaLimit || 60
  };
  SERVER_ACCOUNTS.set(username, newRecord);
  const { passwordHash, licenseKey, ...safeUser } = newRecord;
  return { success: true, account: safeUser, licenseKey: lic };
}
function listAllLicenses() {
  return Array.from(SERVER_ACCOUNTS.values()).map((acc) => ({
    id: acc.id,
    username: acc.username,
    namaLengkap: acc.namaLengkap,
    role: acc.role,
    namaMadrasah: acc.namaMadrasah,
    statusAktif: acc.statusAktif,
    licenseKey: acc.licenseKey,
    kuotaLimit: acc.kuotaLimit
  }));
}
function getUsageStatsSummary() {
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let todayTotal = 0;
  DAILY_USAGE.forEach((val) => {
    if (val.date === todayStr) todayTotal += val.used;
  });
  return {
    totalAccounts: SERVER_ACCOUNTS.size,
    todayAiGenerations: todayTotal,
    activeSessionsCount: ACTIVE_SESSIONS.size,
    recentLogs: USAGE_LOGS.slice(0, 50)
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "10mb" }));
var apiKey = process.env.GEMINI_API_KEY;
var ai = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "127.0.0.1";
}
function getAuthUser(req) {
  const authHeader = req.headers["authorization"];
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (typeof req.headers["x-pkkm-auth-token"] === "string") {
    token = req.headers["x-pkkm-auth-token"];
  }
  return verifySessionToken(token);
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    app: "Asisten Mandiri Bukti Fisik PKKM 2026 (Berbasis Referensi PKKM)",
    version: "2.5.0-protected",
    security: {
      authRequired: true,
      rateLimitActive: true,
      quotaEnforced: true
    }
  });
});
app.post("/api/auth/login", (req, res) => {
  const { username, password, licenseKey } = req.body;
  const credential = username || licenseKey || "";
  const secret = password || licenseKey || "";
  const result = serverLogin(credential, secret);
  if (!result.success) {
    recordUsageLog({
      username: credential || "anon",
      role: "guest",
      ip: getClientIp(req),
      status: "gagal",
      message: result.error || "Login gagal"
    });
    return res.status(401).json({ error: result.error });
  }
  return res.json({
    success: true,
    user: result.user,
    token: result.token
  });
});
app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali." });
  }
  return res.json({ user });
});
app.get("/api/auth/licenses", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "penjual") {
    return res.status(403).json({ error: "Akses terbatas untuk akun Penjual / Admin." });
  }
  const licenses = listAllLicenses();
  return res.json({ licenses });
});
app.post("/api/auth/licenses", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "penjual") {
    return res.status(403).json({ error: "Akses terbatas untuk akun Penjual / Admin." });
  }
  const { username, initialPassword, namaLengkap, namaMadrasah, role, kuotaLimit } = req.body;
  if (!username || !initialPassword) {
    return res.status(400).json({ error: "Username dan Password awal wajib diisi." });
  }
  const result = createNewLicense({
    username,
    initialPassword,
    namaLengkap,
    namaMadrasah,
    role,
    kuotaLimit: Number(kuotaLimit) || 60
  });
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({
    success: true,
    account: result.account,
    licenseKey: result.licenseKey
  });
});
app.get("/api/usage-stats", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "penjual") {
    return res.status(403).json({ error: "Akses terbatas untuk akun Penjual / Admin." });
  }
  const summary = getUsageStatsSummary();
  return res.json(summary);
});
app.post("/api/generate-document", async (req, res) => {
  const startTime = Date.now();
  const clientIp = getClientIp(req);
  const user = getAuthUser(req);
  if (!user) {
    recordUsageLog({
      username: "unauthorized",
      role: "guest",
      ip: clientIp,
      status: "gagal",
      message: "Unauthorized access attempt to /api/generate-document"
    });
    return res.status(401).json({
      error: "Akses ditolak. Endpoint AI hanya dapat diakses dengan lisensi login yang aktif dan sah.",
      code: "UNAUTHORIZED"
    });
  }
  const rateLimitResult = checkRateLimit(clientIp, user.username);
  if (!rateLimitResult.allowed) {
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      status: "rate_limited",
      message: rateLimitResult.reason
    });
    res.setHeader("Retry-After", String(rateLimitResult.retryAfterSeconds || 5));
    return res.status(429).json({
      error: rateLimitResult.reason,
      retryAfterSeconds: rateLimitResult.retryAfterSeconds,
      code: "RATE_LIMITED"
    });
  }
  const { item, profile, customPrompt } = req.body;
  if (!item || typeof item !== "object" || typeof item.id !== "number" || item.id < 1 || item.id > 205) {
    return res.status(400).json({
      error: "Parameter item tidak valid. Item ID wajib berupa angka antara 1 sampai 205.",
      code: "INVALID_ITEM"
    });
  }
  if (!item.title || typeof item.title !== "string" || item.title.trim().length === 0) {
    return res.status(400).json({
      error: "Judul instrumen item wajib disertakan.",
      code: "INVALID_TITLE"
    });
  }
  if (!profile || typeof profile !== "object" || !profile.namaMadrasah) {
    return res.status(400).json({
      error: "Data profil madrasah wajib diisi sebelum membuat dokumen.",
      code: "INVALID_PROFILE"
    });
  }
  const sanitizedPrompt = typeof customPrompt === "string" ? customPrompt.trim().slice(0, 1500) : "";
  const quotaCheck = checkAndConsumeQuota(user);
  if (!quotaCheck.allowed) {
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      itemId: item.id,
      itemTitle: item.title,
      componentId: item.componentId,
      status: "quota_exceeded",
      message: `Batas kuota harian (${quotaCheck.limit}) telah tercapai`
    });
    return res.status(429).json({
      error: `Batas kuota generate AI harian untuk akun Anda telah tercapai (${quotaCheck.used}/${quotaCheck.limit}). Anda tetap dapat menggunakan 'Template Cepat (Instan)' tanpa batas secara gratis.`,
      quota: quotaCheck,
      code: "QUOTA_EXCEEDED"
    });
  }
  res.setHeader("X-Quota-Limit", String(quotaCheck.limit));
  res.setHeader("X-Quota-Used", String(quotaCheck.used));
  res.setHeader("X-Quota-Remaining", String(quotaCheck.remaining));
  try {
    if (ai) {
      try {
        const isLandscapeExpected = item.title.toLowerCase().includes("jadwal") || item.title.toLowerCase().includes("matriks") || item.title.toLowerCase().includes("inventaris") || item.title.toLowerCase().includes("rekapitulasi") || item.title.toLowerCase().includes("buku kas") || item.title.toLowerCase().includes("bku") || item.title.toLowerCase().includes("rkam") || item.title.toLowerCase().includes("edm") || item.title.toLowerCase().includes("rkjm") || item.title.toLowerCase().includes("rkt") || item.title.toLowerCase().includes("7 kaih") || item.title.toLowerCase().includes("pengolahan nilai") || item.title.toLowerCase().includes("rapor") || item.title.toLowerCase().includes("remedial") || item.title.toLowerCase().includes("prestasi") || item.category === "Data & Rekapitulasi";
        const prompt = `Buatkan draf naskah dokumen administrasi fisik PKKM Tahun 2026 yang lengkap, sangat detail, otentik, dan siap cetak untuk instrumen berikut:

INFORMASI INSTRUMEN PKKM:
- Nomor Item: #${item.id} (dari total 205 item PKKM 2026)
- Komponen: Komponen ${item.componentId} (${item.folderName})
- Judul Dokumen: ${item.title}
- Kategori Dokumen: ${item.category}
- Deskripsi Item: ${item.description}
- Mengandung Unsur KBC/Panca Cinta: ${item.kbcTag ? "Ya (Kurikulum Berbasis Cinta / Deep Learning / 7 KAIH / Panca Cinta)" : "Tidak"}
- Format Orientasi Halaman: ${isLandscapeExpected ? "LANSKAP (LANDSCAPE / HORIZONTAL) - Sediakan tabel matriks lebar multi-kolom yang sangat rapi dan lengkap" : "POTRET (PORTRAIT / VERTIKAL) - Naskah resmi surat dinas/SK/SOP"}

DATA MADRASAH PENGGUNA:
- Nama Madrasah: ${profile.namaMadrasah} (${profile.jenjang} ${profile.status})
- NSM: ${profile.nsm || "121200000000"} | NPSN: ${profile.npsn || "20000000"}
- Alamat: ${profile.alamat}, Desa/Kel: ${profile.desaKelurahan}, Kec: ${profile.kecamatan}, ${profile.kabupatenKota}, Prov: ${profile.provinsi}
- Kepala Madrasah: ${profile.namaKepala} (NIP: ${profile.nipKepala}, Pangkat: ${profile.pangkatKepala})
- Pengawas / Penilai: ${profile.namaPenilai} (NIP: ${profile.nipPenilai}, Jabatan: ${profile.jabatanPenilai})
- Ketua Komite: ${profile.namaKetuaKomite}
- Tahun Ajaran: ${profile.tahunAjaran} | Periode Penilaian: Tahun ${profile.tahunPenilaian}
- Tanggal Dokumen: ${profile.tanggalPenilaian}

${sanitizedPrompt ? `INSTRUKSI KHUSUS DARI GURU/MADRASAH:
${sanitizedPrompt}
` : ""}

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
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: "Anda adalah asisten AI tata naskah administrasi madrasah berbasis referensi instrumen PKKM Tahun 2026 dan pedoman teknis Ditjen Pendis Kemenag RI. Anda menyusun draf dokumen administrasi madrasah yang rapi, kredibel, formal, terperinci, dan sesuai implementasi Kurikulum Berbasis Cinta (KBC). Seluruh dokumen merupakan sarana bantu mandiri guru/madrasah.",
            temperature: 0.7
          }
        });
        const content = response.text || "";
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
            status: "sukses",
            durationMs
          });
          return res.json({
            content,
            source: "gemini-3.8-flash",
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            quota: quotaCheck
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call encountered an issue, falling back to standard template:", geminiError.message);
        recordUsageLog({
          username: user.username,
          role: user.role,
          ip: clientIp,
          itemId: item.id,
          itemTitle: item.title,
          componentId: item.componentId,
          status: "fallback",
          message: geminiError.message,
          durationMs: Date.now() - startTime
        });
        return res.json({
          content: null,
          source: "template-fallback",
          message: "Layanan AI sedang mengalami antrean trafik sementara. Dokumen dibuat otomatis menggunakan template standar berbasis referensi PKKM.",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          quota: quotaCheck
        });
      }
    }
    return res.json({
      content: null,
      source: "template-fallback",
      message: "Mode template standar aktif.",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      quota: quotaCheck
    });
  } catch (err) {
    console.error("Error generating document:", err);
    recordUsageLog({
      username: user.username,
      role: user.role,
      ip: clientIp,
      itemId: item.id,
      itemTitle: item.title,
      componentId: item.componentId,
      status: "fallback",
      message: err.message,
      durationMs: Date.now() - startTime
    });
    return res.json({
      content: null,
      source: "template-fallback",
      message: "Menggunakan template standar berbasis referensi PKKM.",
      quota: quotaCheck
    });
  }
});
app.post("/api/batch-plan", async (req, res) => {
  const clientIp = getClientIp(req);
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Akses ditolak. Harap login terlebih dahulu." });
  }
  const rateLimitResult = checkRateLimit(clientIp, user.username);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.reason });
  }
  try {
    const { componentId, profile } = req.body;
    if (!ai) {
      return res.json({ message: "Mode template aktif" });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Buatkan ringkasan panduan prioritas penyusunan bukti fisik PKKM 2026 untuk Komponen ${componentId} pada ${profile?.namaMadrasah || "Madrasah"} berbasis referensi instrumen PKKM dalam 5 butir ringkas.`
    });
    res.json({ outline: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}
app.listen(port, "0.0.0.0", () => {
  console.log(`Server PKKM 2026 running at http://0.0.0.0:${port}`);
});
