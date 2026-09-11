/**
 * SIMPEL-IF Data Models & Constants
 * STIT Ihsanul Fikri
 */

export const PRODI = {
  BKPI: {
    id: 'BKPI',
    name: 'Bimbingan Konseling Pendidikan Islam',
    shortName: 'BKPI',
    code: '86208',
    color: '#1e40af',
    badgeClass: 'badge-prodi-bkpi'
  },
  PIAUD: {
    id: 'PIAUD',
    name: 'Pendidikan Islam Anak Usia Dini',
    shortName: 'PIAUD',
    code: '86209',
    color: '#be185d',
    badgeClass: 'badge-prodi-piaud'
  }
};

export const STATUS_AKADEMIK = {
  AKTIF: 'Aktif',
  CUTI: 'Cuti',
  LULUS: 'Lulus',
  NON_AKTIF: 'Non-Aktif'
};

export const STATUS_TAGIHAN = {
  LUNAS: 'LUNAS',
  BELUM_BAYAR: 'BELUM_BAYAR',
  MENUNGGU_VERIFIKASI: 'MENUNGGU_VERIFIKASI',
  DICICIL: 'DICICIL'
};

export const SCHOLARSHIP_TYPES = {
  REGULER: {
    id: 'REGULER',
    name: 'Reguler (Tarif Standar)',
    shortName: 'Reguler',
    description: 'Tarif standar penuh tanpa potongan subsidi beasiswa (SPP Rp 2.400.000).',
    badgeClass: 'badge-unpaid',
    discountType: 'PERCENT',
    discountValue: 0
  },
  MITRA: {
    id: 'MITRA',
    name: 'Beasiswa Kerjasama Mitra',
    shortName: 'Kerjasama Mitra',
    description: 'Penyesuaian tarif berbasis subsidi MoU instansi mitra dan yayasan (Potongan SPP 50% / Menjadi Rp 1.200.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 50 // 50% discount (Rp 1.200.000)
  },
  ASRAMA: {
    id: 'ASRAMA',
    name: 'Beasiswa Asrama Pesantren',
    shortName: 'Beasiswa Asrama',
    description: 'Potongan biaya SPP sesuai regulasi mukim asrama pesantren (Diskon 40% SPP / Menjadi Rp 1.440.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 40 // 40% discount
  },
  PAUD_LAKI: {
    id: 'PAUD_LAKI',
    name: 'Beasiswa PAUD Laki-laki',
    shortName: 'PAUD Laki-laki',
    description: 'Skema afirmasi khusus mahasiswa putra prodi PIAUD untuk kader pendidik PAUD pria (Gratis SPP 100% / Biaya Rp 0).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 100 // 100% discount (Gratis SPP)
  },
  GURU_TPA: {
    id: 'GURU_TPA',
    name: 'Afirmasi Guru TPA / Musrif Lembaga',
    shortName: 'Guru TPA / Musrif',
    description: 'Afirmasi pengabdian pendidik TPA dan musrif lembaga mitra (Potongan SPP 50% / Rp 1.200.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 50
  },
  ALUMNI_PONPES: {
    id: 'ALUMNI_PONPES',
    name: 'Afirmasi Alumni Pondok Pesantren',
    shortName: 'Alumni Ponpes',
    description: 'Afirmasi beasiswa untuk santri lulusan pondok pesantren (Potongan SPP 50% / Rp 1.200.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 50
  },
  BEASISWA_50: {
    id: 'BEASISWA_50',
    name: 'Beasiswa Subsidi 50%',
    shortName: 'Beasiswa 50%',
    description: 'Skema subsidi pendidikan 50% (Potongan SPP 50% / Rp 1.200.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 50
  },
  PRESTASI: {
    id: 'PRESTASI',
    name: 'Beasiswa Siswa Berprestasi',
    shortName: 'Siswa Berprestasi',
    description: 'Apresiasi akademik & non-akademik siswa berprestasi (Potongan SPP 50% / Rp 1.200.000).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 50
  },
  MITRA_GRATIS: {
    id: 'MITRA_GRATIS',
    name: 'Beasiswa Mitra Pabelan Gratis 100%',
    shortName: 'Mitra Pabelan Gratis',
    description: 'Skema beasiswa penuh program kemitraan Pabelan (Gratis SPP 100% / Biaya Rp 0).',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 100
  }
};

export const SCHOLARSHIP_SCHEMES = Object.values(SCHOLARSHIP_TYPES);

export const STANDARD_FEES = {
  PENDAFTARAN: 200000,
  DAFTAR_ULANG: 450000,
  SPP_STANDARD: 2400000,
  WISUDA: 1500000
};

export const USER_ROLES = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Admin',
    shortTitle: 'Admin Keuangan & Institusi',
    defaultUser: 'Admin SIMPEL-IF STIT-IF',
    avatarText: 'AD',
    icon: '👑'
  },
  MAHASISWA: {
    id: 'MAHASISWA',
    name: 'Mahasiswa',
    shortTitle: 'Portal Mahasiswa',
    defaultUser: 'Miftahul Jannah (NIM: 2601001)',
    avatarText: 'MJ',
    icon: '🎓'
  }
};

// Aliases for backward compatibility
USER_ROLES.BENDAHARA = USER_ROLES.ADMIN;
USER_ROLES.PIMPINAN = USER_ROLES.ADMIN;
USER_ROLES.AKADEMIK = USER_ROLES.ADMIN;
