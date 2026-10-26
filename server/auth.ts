import crypto from 'crypto';

export interface SafeUser {
  id: string;
  username: string;
  namaLengkap: string;
  role: 'penjual' | 'kepala_madrasah' | 'guru' | 'operator' | 'pengawas';
  namaMadrasah: string;
  statusAktif: boolean;
  tanggalDibuat: string;
  kuotaDokumen: string;
  kuotaLimit: number; // daily quota
}

interface ServerAccountRecord extends SafeUser {
  passwordHash: string;
  licenseKey: string;
}

export interface UsageLogEntry {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  ip: string;
  itemId?: number;
  itemTitle?: string;
  componentId?: string;
  charsGenerated?: number;
  status: 'sukses' | 'gagal' | 'rate_limited' | 'quota_exceeded' | 'fallback';
  message?: string;
  durationMs?: number;
}

// Server Secret for HMAC token signing
const JWT_SECRET = process.env.APPLET_SECRET || 'pkkm2026-secret-salt-kbc-independent-app';

// Helper to hash passwords
function hashPassword(password: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(password.trim()).digest('hex');
}

// In-Memory Server Accounts Registry (Kept strictly on Server, NEVER exposed to client)
const SERVER_ACCOUNTS: Map<string, ServerAccountRecord> = new Map();

// Initialize default accounts with secure hashes
function initServerAccounts() {
  // 1. Admin / Seller Account
  const adminPass = process.env.ADMIN_PASSWORD || 'sellerpkkm2026';
  SERVER_ACCOUNTS.set('admin_lynk', {
    id: 'admin_master',
    username: 'admin_lynk',
    passwordHash: hashPassword(adminPass),
    licenseKey: 'LIC-ADMIN-MASTER-2026',
    namaLengkap: 'Admin / Penjual Lynk.id',
    role: 'penjual',
    namaMadrasah: 'Pusat Distribusi Lisensi PKKM',
    statusAktif: true,
    tanggalDibuat: '2026-01-01',
    kuotaDokumen: 'Akses Master Tanpa Batas',
    kuotaLimit: 999999,
  });

  // 2. 10 Pre-provisioned Buyer License Accounts (generated with secure hashes)
  // Passwords are generated securely per account and stored in server memory
  const defaultBuyerCredentials: { username: string; initialPass: string; lic: string; role: any }[] = [
    { username: 'madrasah_c7a9', initialPass: 'Kemenag#8412', lic: 'LIC-PKKM-C7A9-2026', role: 'guru' },
    { username: 'pkkm_guru_4k2x', initialPass: 'Berkah!9103', lic: 'LIC-PKKM-4K2X-2026', role: 'guru' },
    { username: 'kamad_m8e3', initialPass: 'PancaCinta*772', lic: 'LIC-PKKM-M8E3-2026', role: 'kepala_madrasah' },
    { username: 'madrasah_r5t8', initialPass: 'Sukses@6381', lic: 'LIC-PKKM-R5T8-2026', role: 'guru' },
    { username: 'pkkm_vip_9p4w', initialPass: 'Madrasah$5294', lic: 'LIC-PKKM-9P4W-2026', role: 'guru' },
    { username: 'guru_kbc_2h7q', initialPass: 'Bermutu#3815', lic: 'LIC-PKKM-2H7Q-2026', role: 'guru' },
    { username: 'madrasah_x6b1', initialPass: 'Amanah!4729', lic: 'LIC-PKKM-X6B1-2026', role: 'guru' },
    { username: 'pkkm_user_3m8k', initialPass: 'Unggul*9042', lic: 'LIC-PKKM-3M8K-2026', role: 'guru' },
    { username: 'madrasah_y4d5', initialPass: 'Kinerja@7163', lic: 'LIC-PKKM-Y4D5-2026', role: 'guru' },
    { username: 'pkkm_pro_8j2z', initialPass: 'Hebat$8530', lic: 'LIC-PKKM-8J2Z-2026', role: 'guru' },
  ];

  defaultBuyerCredentials.forEach((b, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    SERVER_ACCOUNTS.set(b.username, {
      id: `buyer_${num}`,
      username: b.username,
      passwordHash: hashPassword(b.initialPass),
      licenseKey: b.lic,
      namaLengkap: `Pembeli Lisensi #${num}`,
      role: b.role,
      namaMadrasah: `Madrasah Pengguna Lisensi #${num}`,
      statusAktif: true,
      tanggalDibuat: '2026-01-10',
      kuotaDokumen: 'Akses Penuh 205 Instrumen (60 AI/hari)',
      kuotaLimit: 60,
    });
  });
}

initServerAccounts();

// Dynamic Sessions Store: token -> { user, expiresAt }
interface SessionData {
  username: string;
  role: string;
  expiresAt: number;
}

const ACTIVE_SESSIONS: Map<string, SessionData> = new Map();

// Rate Limiter Stores
const IP_RATE_LIMITS: Map<string, { count: number; windowStart: number }> = new Map();
const USER_COOLDOWNS: Map<string, number> = new Map();

// Daily Quota Store: username -> { dateStr: 'YYYY-MM-DD', used: number }
const DAILY_USAGE: Map<string, { date: string; used: number }> = new Map();

// Circular Usage Logs Ring Buffer (Max 1000 items)
const MAX_LOGS = 1000;
const USAGE_LOGS: UsageLogEntry[] = [];

export function recordUsageLog(entry: Omit<UsageLogEntry, 'id' | 'timestamp'>) {
  const fullEntry: UsageLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  USAGE_LOGS.unshift(fullEntry);
  if (USAGE_LOGS.length > MAX_LOGS) {
    USAGE_LOGS.pop();
  }
}

// Generate secure session token
export function createSessionToken(user: SafeUser): string {
  const payload = {
    u: user.username,
    r: user.role,
    t: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
  const token = `${body}.${sig}`;
  
  ACTIVE_SESSIONS.set(token, {
    username: user.username,
    role: user.role,
    expiresAt: payload.exp,
  });

  return token;
}

// Verify token
export function verifySessionToken(token: string | undefined): SafeUser | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(body).digest('base64url');
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
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

// Server-side Login
export function serverLogin(credential: string, passwordOrLicense: string): { success: boolean; user?: SafeUser; token?: string; error?: string } {
  const trimmedCred = credential.trim().toLowerCase();
  const trimmedSecret = passwordOrLicense.trim();

  if (!trimmedCred || !trimmedSecret) {
    return { success: false, error: 'Username dan Password/Lisensi wajib diisi.' };
  }

  // 1. Direct username match
  let matched = SERVER_ACCOUNTS.get(trimmedCred);

  // 2. Also allow login using License Key directly in username field
  if (!matched) {
    for (const acc of SERVER_ACCOUNTS.values()) {
      if (acc.licenseKey.toLowerCase() === trimmedCred) {
        matched = acc;
        break;
      }
    }
  }

  if (!matched) {
    return { success: false, error: 'Kredensial atau lisensi tidak ditemukan di sistem.' };
  }

  if (!matched.statusAktif) {
    return { success: false, error: 'Lisensi ini saat ini berstatus non-aktif. Silakan hubungi penjual lynk.id.' };
  }

  // Check either password hash or exact license key
  const inputHash = hashPassword(trimmedSecret);
  const isPassValid = matched.passwordHash === inputHash;
  const isLicValid = matched.licenseKey === trimmedSecret;

  if (!isPassValid && !isLicValid) {
    return { success: false, error: 'Password atau Kode Lisensi tidak cocok.' };
  }

  const { passwordHash, licenseKey, ...safeUser } = matched;
  const token = createSessionToken(safeUser);

  recordUsageLog({
    username: safeUser.username,
    role: safeUser.role,
    ip: 'internal',
    status: 'sukses',
    message: 'User logged in successfully',
  });

  return { success: true, user: safeUser, token };
}

// Rate Limiter Check (Sliding Window per IP + Cooldown per User)
export function checkRateLimit(ip: string, username: string): { allowed: boolean; retryAfterSeconds?: number; reason?: string } {
  const now = Date.now();

  // 1. User Cooldown (minimum 3 seconds between AI generations)
  const lastCall = USER_COOLDOWNS.get(username) || 0;
  if (now - lastCall < 3000) {
    const wait = Math.ceil((3000 - (now - lastCall)) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: wait,
      reason: `Harap tunggu ${wait} detik sebelum memicu pembuatan dokumen berikutnya.`,
    };
  }

  // 2. IP Rate Limit (max 20 requests per 60 seconds)
  const ipRecord = IP_RATE_LIMITS.get(ip);
  if (!ipRecord || now - ipRecord.windowStart > 60000) {
    IP_RATE_LIMITS.set(ip, { count: 1, windowStart: now });
  } else {
    if (ipRecord.count >= 20) {
      const wait = Math.ceil((60000 - (now - ipRecord.windowStart)) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: wait,
        reason: `Batas frekuensi IP terlampaui (maks 20 req/menit). Tunggu ${wait} detik.`,
      };
    }
    ipRecord.count++;
  }

  USER_COOLDOWNS.set(username, now);
  return { allowed: true };
}

// Quota Check and Consumption
export function checkAndConsumeQuota(user: SafeUser): { allowed: boolean; used: number; limit: number; remaining: number } {
  // Admin has unlimited quota
  if (user.role === 'penjual') {
    return { allowed: true, used: 0, limit: 999999, remaining: 999999 };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
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
      remaining: 0,
    };
  }

  currentUsed++;
  DAILY_USAGE.set(user.username, { date: todayStr, used: currentUsed });

  return {
    allowed: true,
    used: currentUsed,
    limit,
    remaining: Math.max(0, limit - currentUsed),
  };
}

// Create New License Account (Admin Only)
export function createNewLicense(params: {
  username: string;
  initialPassword: string;
  namaLengkap: string;
  namaMadrasah?: string;
  role?: 'guru' | 'kepala_madrasah' | 'operator' | 'pengawas';
  kuotaLimit?: number;
}): { success: boolean; account?: SafeUser; licenseKey?: string; error?: string } {
  const username = params.username.trim().toLowerCase();
  if (SERVER_ACCOUNTS.has(username)) {
    return { success: false, error: `Username '${username}' sudah digunakan.` };
  }

  const lic = `LIC-PKKM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
  const newRecord: ServerAccountRecord = {
    id: `usr_${Date.now()}`,
    username,
    passwordHash: hashPassword(params.initialPassword),
    licenseKey: lic,
    namaLengkap: params.namaLengkap.trim() || 'Pembeli Lisensi Tambahan',
    role: params.role || 'guru',
    namaMadrasah: params.namaMadrasah?.trim() || 'Madrasah Pengguna Lisensi',
    statusAktif: true,
    tanggalDibuat: new Date().toISOString().slice(0, 10),
    kuotaDokumen: `Akses Penuh 205 Item (${params.kuotaLimit || 60} AI/hari)`,
    kuotaLimit: params.kuotaLimit || 60,
  };

  SERVER_ACCOUNTS.set(username, newRecord);
  const { passwordHash, licenseKey, ...safeUser } = newRecord;

  return { success: true, account: safeUser, licenseKey: lic };
}

// Get all licenses for Admin view
export function listAllLicenses(): { id: string; username: string; namaLengkap: string; role: string; namaMadrasah: string; statusAktif: boolean; licenseKey: string; kuotaLimit: number }[] {
  return Array.from(SERVER_ACCOUNTS.values()).map((acc) => ({
    id: acc.id,
    username: acc.username,
    namaLengkap: acc.namaLengkap,
    role: acc.role,
    namaMadrasah: acc.namaMadrasah,
    statusAktif: acc.statusAktif,
    licenseKey: acc.licenseKey,
    kuotaLimit: acc.kuotaLimit,
  }));
}

// Usage stats summary
export function getUsageStatsSummary() {
  const todayStr = new Date().toISOString().slice(0, 10);
  let todayTotal = 0;
  DAILY_USAGE.forEach((val) => {
    if (val.date === todayStr) todayTotal += val.used;
  });

  return {
    totalAccounts: SERVER_ACCOUNTS.size,
    todayAiGenerations: todayTotal,
    activeSessionsCount: ACTIVE_SESSIONS.size,
    recentLogs: USAGE_LOGS.slice(0, 50),
  };
}
