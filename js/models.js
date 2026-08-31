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
    name: 'Reguler',
    description: 'Tarif standar penuh tanpa potongan subsidi beasiswa.',
    badgeClass: 'badge-unpaid',
    discountType: 'PERCENT',
    discountValue: 0
  },
  ASRAMA: {
    id: 'ASRAMA',
    name: 'Beasiswa Asrama Pesantren',
    description: 'Potongan biaya SPP/Akomodasi sesuai regulasi mukim asrama pesantren.',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 40 // 40% discount
  },
  MITRA: {
    id: 'MITRA',
    name: 'Beasiswa Kerjasama Mitra',
    description: 'Penyesuaian tarif berbasis subsidi MoU instansi mitra dan yayasan.',
    badgeClass: 'badge-scholarship',
    discountType: 'FIXED',
    discountValue: 1200000 // Rp 1.200.000 subsidy
  },
  PAUD_LAKI: {
    id: 'PAUD_LAKI',
    name: 'Beasiswa PAUD Laki-laki',
    description: 'Skema afirmasi khusus mahasiswa putra prodi PIAUD untuk penguatan pendidik PAUD pria.',
    badgeClass: 'badge-scholarship',
    discountType: 'PERCENT',
    discountValue: 60 // 60% discount
  }
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
    defaultUser: 'Ahmad Fauzi (NIM: 202486209012)',
    avatarText: 'AF',
    icon: '🎓'
  }
};

// Aliases for backward compatibility
USER_ROLES.BENDAHARA = USER_ROLES.ADMIN;
USER_ROLES.PIMPINAN = USER_ROLES.ADMIN;
USER_ROLES.AKADEMIK = USER_ROLES.ADMIN;
