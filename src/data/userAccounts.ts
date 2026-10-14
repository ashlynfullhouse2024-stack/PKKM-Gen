import { UserAccount } from '../types';

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  // Akun Admin / Penjual (Pemilik Produk lynk.id)
  {
    id: 'admin_master',
    username: 'admin_lynk',
    password: 'sellerpkkm2026',
    namaLengkap: 'Admin / Penjual lynk.id',
    role: 'penjual',
    namaMadrasah: 'Pusat Distribusi Lisensi PKKM',
    statusAktif: true,
    tanggalDibuat: '2026-01-01',
    kuotaDokumen: 'Unlimited Master Access',
  },
  // 10 Akun Rahasia untuk Dibagikan ke Pembeli lynk.id:
  {
    id: 'buyer_01',
    username: 'madrasah_c7a9',
    password: 'Kemenag#8412',
    namaLengkap: 'Pembeli Lisensi #01',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #01',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_02',
    username: 'pkkm_guru_4k2x',
    password: 'Berkah!9103',
    namaLengkap: 'Pembeli Lisensi #02',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #02',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_03',
    username: 'kamad_m8e3',
    password: 'PancaCinta*772',
    namaLengkap: 'Pembeli Lisensi #03',
    role: 'kepala_madrasah',
    namaMadrasah: 'Madrasah Pengguna Lisensi #03',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_04',
    username: 'madrasah_r5t8',
    password: 'Sukses@6381',
    namaLengkap: 'Pembeli Lisensi #04',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #04',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_05',
    username: 'pkkm_vip_9p4w',
    password: 'Madrasah$5294',
    namaLengkap: 'Pembeli Lisensi #05',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #05',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_06',
    username: 'guru_kbc_2h7q',
    password: 'Bermutu#3815',
    namaLengkap: 'Pembeli Lisensi #06',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #06',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_07',
    username: 'madrasah_x6b1',
    password: 'Amanah!4729',
    namaLengkap: 'Pembeli Lisensi #07',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #07',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_08',
    username: 'pkkm_user_3m8k',
    password: 'Unggul*9042',
    namaLengkap: 'Pembeli Lisensi #08',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #08',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_09',
    username: 'madrasah_y4d5',
    password: 'Kinerja@7163',
    namaLengkap: 'Pembeli Lisensi #09',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #09',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
  {
    id: 'buyer_10',
    username: 'pkkm_pro_8j2z',
    password: 'Hebat$8530',
    namaLengkap: 'Pembeli Lisensi #10',
    role: 'guru',
    namaMadrasah: 'Madrasah Pengguna Lisensi #10',
    statusAktif: true,
    tanggalDibuat: '2026-01-10',
    kuotaDokumen: 'Akses Penuh 205 Item PKKM 2026',
  },
];

const STORAGE_USERS_KEY = 'pkkm_seller_users_list_v2';

export function getStoredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored accounts', e);
  }
  return DEFAULT_ACCOUNTS;
}

export function saveStoredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Error saving accounts', e);
  }
}
