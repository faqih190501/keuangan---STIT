/**
 * SIMPEL-IF Reactive State Manager & Master Data Store
 * STIT Ihsanul Fikri Pabelan Magelang
 * Sinkronisasi Resmi Google Spreadsheet: "REKAP ADMINISTRASI STITIF"
 */

import { PRODI, STATUS_AKADEMIK, STATUS_TAGIHAN, SCHOLARSHIP_TYPES, USER_ROLES, STANDARD_FEES } from './models.js';

const STORAGE_KEY = 'SIMPEL_IF_STATE_V6_PROD';

const INITIAL_SEED_DATA = {
  activeSemester: '2026/2027 Ganjil',
  currentRole: 'ADMIN',
  adminProfile: {
    id: 'ADM-001',
    username: 'admin',
    name: 'Ustadzah Siti Fatimah, S.E.',
    role: 'ADMIN',
    email: 'bendahara@stit-if.ac.id',
    phone: '082342307414',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    nip: '19840512 201201 2 003',
    avatarText: 'SF',
    status: 'AKTIF',
    isSuperAdmin: true
  },
  adminUsers: [
    {
      id: 'ADM-001',
      username: 'admin',
      password: 'admin123',
      name: 'Ustadzah Siti Fatimah, S.E.',
      role: 'ADMIN',
      email: 'bendahara@stit-if.ac.id',
      phone: '082342307414',
      title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
      department: 'Biro Keuangan & Administrasi Umum (BAU)',
      nip: '19840512 201201 2 003',
      avatarText: 'SF',
      status: 'AKTIF',
      isSuperAdmin: true,
      createdAt: '2026-08-01 08:00:00'
    },
    {
      id: 'ADM-002',
      username: 'ridwan.hakim',
      password: 'admin123',
      name: 'Ustadz Ridwan Hakim, M.Pd.',
      role: 'ADMIN',
      email: 'baak@stit-if.ac.id',
      phone: '081298765432',
      title: 'Kepala Biro Administrasi Akademik & Kemahasiswaan (BAAK)',
      department: 'Biro Administrasi Akademik (BAAK)',
      nip: '19820315 201001 1 002',
      avatarText: 'RH',
      status: 'AKTIF',
      isSuperAdmin: false,
      createdAt: '2026-08-01 08:00:00'
    },
    {
      id: 'ADM-003',
      username: 'bendahara',
      password: 'admin123',
      name: 'Ustadzah Nurul Hidayah, S.Ak.',
      role: 'ADMIN',
      email: 'keuangan@stit-if.ac.id',
      phone: '085712345678',
      title: 'Staf Administrasi Keuangan & Kasir Kampus',
      department: 'Biro Keuangan & Administrasi Umum (BAU)',
      nip: '19901020 201802 2 005',
      avatarText: 'NH',
      status: 'AKTIF',
      isSuperAdmin: false,
      createdAt: '2026-08-05 09:00:00'
    }
  ],
  currentUser: {
    id: 'ADM-001',
    username: 'admin',
    name: 'Ustadzah Siti Fatimah, S.E.',
    role: 'ADMIN',
    email: 'bendahara@stit-if.ac.id',
    phone: '082342307414',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    nip: '19840512 201201 2 003',
    avatarText: 'SF',
    prodi: 'Bendahara Penerimaan',
    status: 'AKTIF',
    isSuperAdmin: true
  },

  // Komponen Biaya Pokok Standar (Berdasarkan Google Spreadsheet & Regulasi Institusi)
  feeComponents: [
    {
      id: 'PENDAFTARAN',
      name: 'Biaya Pendaftaran & Formulir PMB',
      category: 'INITIAL',
      defaultAmount: 200000,
      description: 'Biaya pendaftaran awal calon mahasiswa baru (Sekali bayar)',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: false
    },
    {
      id: 'DAFTAR_ULANG',
      name: 'Biaya Daftar Ulang / Heregistrasi',
      category: 'SEMESTER',
      defaultAmount: 450000,
      description: 'Administrasi registrasi ulang, jas almamater, dan validasi KRS',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: false
    },
    {
      id: 'SPP',
      name: 'SPP / UKT Pokok Semester',
      category: 'SEMESTER',
      defaultAmount: 2400000,
      description: 'Biaya penyelenggaraan pendidikan reguler per semester (Dapat disubsidi skema beasiswa)',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: true
    },
    {
      id: 'WISUDA',
      name: 'Biaya Munaqosyah & Wisuda',
      category: 'FINAL',
      defaultAmount: 1500000,
      description: 'Bimbingan skripsi, ujian munaqosyah, toga, dan ijazah sarjana',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: true
    }
  ],

  // 9 Skema Beasiswa & Jalur Pendaftaran Terpadu STIT Ihsanul Fikri
  scholarshipSchemes: [
    {
      id: 'REGULER',
      name: 'Reguler (Tarif Penuh)',
      shortName: 'Reguler',
      description: 'Skema reguler penuh tanpa potongan subsidi beasiswa (SPP Rp 2.400.000).',
      discountType: 'PERCENT',
      discountValue: 0,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 15
    },
    {
      id: 'MITRA',
      name: 'Beasiswa Kerjasama Mitra & Yayasan',
      shortName: 'Kerjasama Mitra',
      description: 'Subsidi MoU instansi mitra dan yayasan (Potongan SPP 50% / Biaya Rp 1.200.000).',
      discountType: 'PERCENT',
      discountValue: 50,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 65
    },
    {
      id: 'ASRAMA',
      name: 'Beasiswa Asrama Pesantren',
      shortName: 'Beasiswa Asrama',
      description: 'Potongan biaya SPP santri mukim asrama pesantren Ihsanul Fikri (Diskon 40% SPP / Menjadi Rp 1.440.000).',
      discountType: 'PERCENT',
      discountValue: 40,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 12
    },
    {
      id: 'PAUD_LAKI',
      name: 'Beasiswa PAUD Laki-laki (Gratis SPP 100%)',
      shortName: 'PAUD Laki-laki',
      description: 'Afirmasi khusus putra prodi PIAUD untuk kader pendidik PAUD pria (Gratis SPP 100% / Biaya SPP Rp 0).',
      discountType: 'PERCENT',
      discountValue: 100,
      targetComponents: ['SPP'],
      eligibleProdi: ['PIAUD'],
      activeStudentsCount: 6
    },
    {
      id: 'GURU_TPA',
      name: 'Afirmasi Guru TPA & Musrif Lembaga',
      shortName: 'Guru TPA / Musrif',
      description: 'Apresiasi pengabdian pendidik TPA & musrif lembaga (Potongan SPP 50% / Rp 1.200.000).',
      discountType: 'PERCENT',
      discountValue: 50,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 10
    },
    {
      id: 'ALUMNI_PONPES',
      name: 'Afirmasi Alumni Pondok Pesantren',
      shortName: 'Alumni Ponpes',
      description: 'Afirmasi santri lulusan pondok pesantren (Potongan SPP 50% / Rp 1.200.000).',
      discountType: 'PERCENT',
      discountValue: 50,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 8
    },
    {
      id: 'BEASISWA_50',
      name: 'Beasiswa Subsidi 50%',
      shortName: 'Beasiswa 50%',
      description: 'Skema subsidi yayasan 50% (Potongan SPP 50% / Rp 1.200.000).',
      discountType: 'PERCENT',
      discountValue: 50,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 7
    },
    {
      id: 'PRESTASI',
      name: 'Beasiswa Siswa Berprestasi',
      shortName: 'Siswa Berprestasi',
      description: 'Apresiasi prestasi akademik & tahfidz (Potongan SPP 50% / Rp 1.200.000).',
      discountType: 'PERCENT',
      discountValue: 50,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 4
    },
    {
      id: 'MITRA_GRATIS',
      name: 'Beasiswa Mitra Pabelan Gratis 100%',
      shortName: 'Mitra Pabelan Gratis',
      description: 'Skema beasiswa penuh program kemitraan Pabelan (Gratis SPP 100% / Biaya Rp 0).',
      discountType: 'PERCENT',
      discountValue: 100,
      targetComponents: ['SPP'],
      eligibleProdi: ['PIAUD'],
      activeStudentsCount: 2
    }
  ],

  individualOverrides: [
    {
      id: 'OVR-001',
      studentNim: '2601003', // Hamzah Habiburrohman
      semester: '2026/2027 Ganjil',
      overrideType: 'ADDITIONAL_DISCOUNT',
      discountAmount: 240000,
      reason: 'Dispensasi Prestasi Santri Mukim Asrama Terbaik',
      status: 'ACTIVE',
      approvedBy: 'Ustadzah Siti Fatimah, S.E.'
    }
  ],

  // Data Mentah Google Sheets Matrix untuk Tampilan Khusus & Live Sync
  googleSheetsMatrix: {
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1nqh4jksle3r95PlupTIKve11iUxmg3hSdYOB3NTKp3U/edit?pli=1&gid=814809663#gid=814809663',
    lastSyncTime: '2026-09-11 09:00:00',
    institution: 'STIT Ihsanul Fikri Pabelan Magelang',
    bankInfo: {
      bankName: 'Bank Syariah Indonesia (BSI)',
      accountNumber: '1056405743',
      accountName: 'STIT IHSANUL FIKRI',
      helpdeskWa: '082342307414'
    },
    bkpi2026: [
    {
        "nama":  "Miftahul Jannah",
        "nim":  "2601001",
        "jalur":  "Alumni ponpes",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "02/02/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Aifah Ruslan",
        "nim":  "2601002",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "31/03/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Hamzah Habiburrohman",
        "nim":  "2601003",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/06/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "17/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Faza Ainaya Abqariyah",
        "nim":  "2601004",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "17/06/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "18/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Aisyi Saadah",
        "nim":  "2601005",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "19/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Kuncahyani",
        "nim":  "2601006",
        "jalur":  "Alumni ponpes",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Aldi Baitur Rahman",
        "nim":  "2601007",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "25/02/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "25/02/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Abira Husniyah",
        "nim":  "2601008",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Lidya Meilani Putri",
        "nim":  "2601009",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Naila Azkiya",
        "nim":  "2601010",
        "jalur":  "Kerjama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Darwati",
        "nim":  "2601011",
        "jalur":  "Kerjama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "24/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Solahudin Akhmad",
        "nim":  "2601012",
        "jalur":  "Kerjama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Yusron Rumongga",
        "nim":  "2601013",
        "jalur":  "Reguler",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Zulfa Choirunnisa",
        "nim":  "2601014",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Yuly Hermawan Susilo",
        "nim":  "2601015",
        "jalur":  "Kerjama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "28/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "01/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Ngarifatun Thoyibah",
        "nim":  "2601016",
        "jalur":  "Kerjama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "29/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Eva Fitriyaningsih",
        "nim":  "2601017",
        "jalur":  "Beasiswa 50%",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "12/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "01/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Mutsanna Abdussalam Al Hawari",
        "nim":  "2601018",
        "jalur":  "Beasiswa 50%",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Pramundari",
        "nim":  "2601019",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "06/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Amalia Nur Sa\u0027adah",
        "nim":  "2601020",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "23/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Hartanti Handayani",
        "nim":  "2601021",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Haning Pramesti",
        "nim":  "2601022",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "01/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "13/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Titik Umaiyah",
        "nim":  "2601023",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Niken Wahyu Ningsih",
        "nim":  "2601024",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "30/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Hamidah",
        "nim":  "2601025",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "08/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Samsul Sutopo Slamet",
        "nim":  "2601026",
        "jalur":  "Kerjamasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "08/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Rohmah Indarti",
        "nim":  "2601027",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Arif Wibowo",
        "nim":  "2601028",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Nensy Anggriani Ningsih",
        "nim":  "2601029",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "30/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Khusnul Khotimah",
        "nim":  "2601030",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "03/09/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "03/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Ainur Rofik Fajri",
        "nim":  "2601031",
        "jalur":  "kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Safira Faddah",
        "nim":  "2601032",
        "jalur":  "Reguler",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Khoiru Zidan",
        "nim":  "2601033",
        "jalur":  "Reguler",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "08/09/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "08/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Aida Lestari",
        "nim":  "2601034",
        "jalur":  "Beasiswa 50%",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "M Arifudin Yusuf",
        "nim":  "2601035",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Habibah Rasyidah",
        "nim":  "2601038",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Sri Yani",
        "nim":  "2601039",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "28/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Ayu Rosmaidah",
        "nim":  "2601040",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "03/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Fina Margaria",
        "nim":  "2602036",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "18/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "18/07/26",
        "spp":  "1.200.000",
        "sppTgl":  "18/07/26",
        "status":  "LUNAS_SPP"
    },
    {
        "nama":  "Siti Mutoharoh",
        "nim":  "2602037",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Ahmad Fajri",
        "nim":  "2601041",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Muhammad Ihsan",
        "nim":  "2601042",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Pipi Yuliana",
        "nim":  "2601043",
        "jalur":  "Beasiswa 50%",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Umi Fadlilah",
        "nim":  "2601044",
        "jalur":  "Beasiswa 50%",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Za\u0027am Tsafiq Al Azmi",
        "nim":  "2601045",
        "jalur":  "Siswa Berprestasi",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    }
]
,
    piaud2026: [
    {
        "nama":  "Erlisa Rita Novika",
        "nim":  "2602001",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "23/02/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Choiriyah",
        "nim":  "2602002",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "30/03/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Dian Kartika Sari",
        "nim":  "2602003",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "15/04/2026",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "21/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Rana Fauziyyah",
        "nim":  "2602004",
        "jalur":  "Alumni Ponpes",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "29/06/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Ruqoyyah Salsabila Daeng Ke\u0027nang",
        "nim":  "2602005",
        "jalur":  "musrif lembaga/ guru tpa",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "09/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "29/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Fatimah Nur Islamiah",
        "nim":  "2602006",
        "jalur":  "kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "15/04/2026",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "17/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Mustofiah",
        "nim":  "2602007",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "14/02/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "07/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Iriani",
        "nim":  "2602008",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "18/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Suyani",
        "nim":  "2602009",
        "jalur":  "Guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "08/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Aulia Awwal Syafiiqoh",
        "nim":  "2602010",
        "jalur":  "Alumni Ponpes",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Izazah Zulaikha",
        "nim":  "2602011",
        "jalur":  "guru TPA",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "20/07/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Siti Anifah",
        "nim":  "2602012",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "31/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Tria Annisa Nurjanah",
        "nim":  "2602013",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "31/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "31/07/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Ade Vina Hanituzzulva",
        "nim":  "2602014",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "16/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "31/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Garwita Felda Nabiha",
        "nim":  "2602015",
        "jalur":  "Beasiswa Asrama",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "28/07/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "29/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Mei Lestiyana",
        "nim":  "2602016",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "02/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Nabila Nurlia Sari",
        "nim":  "2602017",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Inda Laila Sari",
        "nim":  "2602018",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Ani Ariastuti",
        "nim":  "2602019",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Yuliantun",
        "nim":  "2602020",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "09/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Siti Puniah",
        "nim":  "2602021",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Atika Mardiyanti Putri",
        "nim":  "2602022",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "01/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Nginayatul Khabibah",
        "nim":  "2602023",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "20/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Umi Mintarti Amilatun",
        "nim":  "2602024",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "21/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Septiana Anggraeni",
        "nim":  "2602025",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Risma Pradesta Suradiyanto",
        "nim":  "2602026",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "13/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Siti Rokhaniyah",
        "nim":  "2602027",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "17/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Umi Farida",
        "nim":  "2602028",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "07/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Salafiyah",
        "nim":  "2602029",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Alvia Musayyida",
        "nim":  "2602030",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "27/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Yasmina Syahriza",
        "nim":  "2602031",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "27/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Jeklynda May Sarah",
        "nim":  "2602032",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "25/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Nuryanti",
        "nim":  "2602033",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "24/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Slamet Kholifah",
        "nim":  "2602034",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "22/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Pompi Hartiwi",
        "nim":  "2602035",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "22/8/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Siti Musarofah",
        "nim":  "2602036",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Meisita Rosalina",
        "nim":  "2602037",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "09/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Rahma Lestari",
        "nim":  "2602038",
        "jalur":  "Reguler",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "15/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Ulya Dwi Kurniawati",
        "nim":  "2602039",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Arif Fradina",
        "nim":  "2602040",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "21/08/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "29/08/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Warsidah",
        "nim":  "2602041",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "24/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Winda Apriliani Putri",
        "nim":  "2602042",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "29/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Hikmatul Fitroh",
        "nim":  "2602043",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "01/09/26",
        "daftarUlang":  "450.000",
        "daftarUlangTgl":  "01/09/26",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "DAFTAR_ULANG_LUNAS"
    },
    {
        "nama":  "Herlina Intan Kurniasih",
        "nim":  "2602044",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Fajar Rochmat",
        "nim":  "2602045",
        "jalur":  "Paud Laki-laki",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Nur Azizah Desi Novita",
        "nim":  "2602046",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Fatimah Rahmawati",
        "nim":  "2602047",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Dewi Tri Ambodo",
        "nim":  "2602048",
        "jalur":  "Kerjasama mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Nur Kirana Anggista Safitri",
        "nim":  "2602049",
        "jalur":  "Kerjasama mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Rizqi Machfirotun Ni\u0027mah",
        "nim":  "2602050",
        "jalur":  "Kerjasama mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Hanifah Rahmawati",
        "nim":  "2602051",
        "jalur":  "Kerjasama mitra  (Pabelan) Gratis",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "01/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Nani Suryani",
        "nim":  "2602052",
        "jalur":  "Kerjasama mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Endang Elyana",
        "nim":  "2602053",
        "jalur":  "Kerjasama mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "02/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Muhammad Nanang Nasikin",
        "nim":  "2602054",
        "jalur":  "Paud Laki-laki",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "31/08/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Prapti Budi Sulastri",
        "nim":  "2602055",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "200.000",
        "pendaftaranTgl":  "02/09/26",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "PENDAFTARAN_LUNAS"
    },
    {
        "nama":  "Navisatul Ula Ulya",
        "nim":  "2602056",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Vera Andriani",
        "nim":  "2602057",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Nuraeni",
        "nim":  "2602058",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Wahyu Kurnia Sari",
        "nim":  "2602059",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Nisa Nindya Hasna Kamilia",
        "nim":  "2602060",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Sekar Purba Kinasih",
        "nim":  "2602061",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Nailia Asma",
        "nim":  "2602062",
        "jalur":  "Kerjasama Mitra",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    },
    {
        "nama":  "Gita Gustiani",
        "nim":  "2602063",
        "jalur":  "Reguler",
        "pendaftaran":  "-",
        "pendaftaranTgl":  "-",
        "daftarUlang":  "-",
        "daftarUlangTgl":  "-",
        "spp":  "-",
        "sppTgl":  "-",
        "status":  "BELUM_BAYAR"
    }
]
,
    seniorRekap: [
    {
        "nama":  "Abdullah Azam Robbani",
        "nim":  "2001001",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Ahmad Razif Ilham Baihaqi",
        "nim":  "2001002",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Fajar Setiyawan",
        "nim":  "2001014",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Fazri Fadillah Iskandar",
        "nim":  "2001015",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Muhammad Faqih Rabbani",
        "nim":  "2001018",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Muhammad Ibadurrahman",
        "nim":  "2001019",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Nadya Arifa",
        "nim":  "2001020",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Shibaa Mawaddah Shiddiiqoh",
        "nim":  "2001024",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Aisyah Shidiqoh",
        "nim":  "2001030",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Fauzan Azhima Ramadhan",
        "nim":  "2001033",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Eko Purwanto",
        "nim":  "2001032",
        "prodi":  "BKPI",
        "jalur":  "Reguler",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Dhiaus Suroya",
        "nim":  "2001043",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Dwi Anisa Lestari",
        "nim":  "2001029",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "1.500.000",
        "status":  "LUNAS_WISUDA"
    },
    {
        "nama":  "Ahmad Fauzi",
        "nim":  "202486209012",
        "prodi":  "PIAUD",
        "jalur":  "PAUD_LAKI",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Siti Nurhaliza",
        "nim":  "202386208005",
        "prodi":  "BKPI",
        "jalur":  "ASRAMA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Muhammad Ihsan Pratama",
        "nim":  "202686208001",
        "prodi":  "BKPI",
        "jalur":  "REGULER",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Rahmat Hidayatullah",
        "nim":  "202686209002",
        "prodi":  "PIAUD",
        "jalur":  "PAUD_LAKI",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Fatimah Az-Zahra",
        "nim":  "202486209008",
        "prodi":  "PIAUD",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Aisyah Putri Rahmadani",
        "nim":  "202586208014",
        "prodi":  "BKPI",
        "jalur":  "REGULER",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Zaid Al-Faruq",
        "nim":  "202386208007",
        "prodi":  "BKPI",
        "jalur":  "ASRAMA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Nurul Hidayati",
        "nim":  "202386209003",
        "prodi":  "PIAUD",
        "jalur":  "ASRAMA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Muhammad Yusuf Al-Khattab",
        "nim":  "202486209015",
        "prodi":  "PIAUD",
        "jalur":  "PAUD_LAKI",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Khadijah Humaira",
        "nim":  "202686208003",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Bilal Al-Habasyi",
        "nim":  "202486208011",
        "prodi":  "BKPI",
        "jalur":  "MITRA",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    },
    {
        "nama":  "Maryam Qonita",
        "nim":  "202686209004",
        "prodi":  "PIAUD",
        "jalur":  "REGULER",
        "semester1":  "1.200.000",
        "semester2":  "1.200.000",
        "semester3":  "1.200.000",
        "semester4":  "1.200.000",
        "semester5":  "1.200.000",
        "semester6":  "1.200.000",
        "semester7":  "1.200.000",
        "semester8":  "1.200.000",
        "wisuda":  "-",
        "status":  "AKTIF_BERJALAN"
    }
]

  },

  // Master Data Mahasiswa STIT Ihsanul Fikri (Riil dari Google Sheets)
  students: [
    {
        "nim":  "2601001",
        "name":  "Miftahul Jannah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ALUMNI_PONPES",
        "jalurOriginal":  "Alumni ponpes",
        "phone":  "0823-4540-8916",
        "email":  "miftahul.jannah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601002",
        "name":  "Aifah Ruslan",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-2704-9479",
        "email":  "aifah.ruslan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601003",
        "name":  "Hamzah Habiburrohman",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-5518-9829",
        "email":  "hamzah.habiburrohman@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601004",
        "name":  "Faza Ainaya Abqariyah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-4000-2569",
        "email":  "faza.ainaya.abqariyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601005",
        "name":  "Aisyi Saadah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-1349-2095",
        "email":  "aisyi.saadah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601006",
        "name":  "Kuncahyani",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ALUMNI_PONPES",
        "jalurOriginal":  "Alumni ponpes",
        "phone":  "0823-5922-7636",
        "email":  "kuncahyani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601007",
        "name":  "Aldi Baitur Rahman",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-8083-8879",
        "email":  "aldi.baitur.rahman@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601008",
        "name":  "Abira Husniyah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-8426-4468",
        "email":  "abira.husniyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601009",
        "name":  "Lidya Meilani Putri",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-9832-3060",
        "email":  "lidya.meilani.putri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601010",
        "name":  "Naila Azkiya",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjama Mitra",
        "phone":  "0823-4047-1817",
        "email":  "naila.azkiya@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601011",
        "name":  "Darwati",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjama Mitra",
        "phone":  "0823-9583-4805",
        "email":  "darwati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601012",
        "name":  "Solahudin Akhmad",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjama Mitra",
        "phone":  "0823-1875-4629",
        "email":  "solahudin.akhmad@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601013",
        "name":  "Yusron Rumongga",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-3467-2634",
        "email":  "yusron.rumongga@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601014",
        "name":  "Zulfa Choirunnisa",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2635-2811",
        "email":  "zulfa.choirunnisa@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601015",
        "name":  "Yuly Hermawan Susilo",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjama Mitra",
        "phone":  "0823-6626-5821",
        "email":  "yuly.hermawan.susilo@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601016",
        "name":  "Ngarifatun Thoyibah",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjama Mitra",
        "phone":  "0823-8886-6312",
        "email":  "ngarifatun.thoyibah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601017",
        "name":  "Eva Fitriyaningsih",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "BEASISWA_50",
        "jalurOriginal":  "Beasiswa 50%",
        "phone":  "0823-2736-6893",
        "email":  "eva.fitriyaningsih@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601018",
        "name":  "Mutsanna Abdussalam Al Hawari",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "BEASISWA_50",
        "jalurOriginal":  "Beasiswa 50%",
        "phone":  "0823-8940-7467",
        "email":  "mutsanna.abdussalam.al.hawari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601019",
        "name":  "Pramundari",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-9053-2885",
        "email":  "pramundari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601020",
        "name":  "Amalia Nur Sa\u0027adah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-9873-9738",
        "email":  "amalia.nur.sa.adah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601021",
        "name":  "Hartanti Handayani",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3359-1265",
        "email":  "hartanti.handayani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601022",
        "name":  "Haning Pramesti",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9489-2215",
        "email":  "haning.pramesti@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601023",
        "name":  "Titik Umaiyah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2694-6820",
        "email":  "titik.umaiyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601024",
        "name":  "Niken Wahyu Ningsih",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6850-7679",
        "email":  "niken.wahyu.ningsih@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601025",
        "name":  "Hamidah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6975-6866",
        "email":  "hamidah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601026",
        "name":  "Samsul Sutopo Slamet",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjamasama Mitra",
        "phone":  "0823-4145-2092",
        "email":  "samsul.sutopo.slamet@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601027",
        "name":  "Rohmah Indarti",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5407-1171",
        "email":  "rohmah.indarti@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601028",
        "name":  "Arif Wibowo",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5557-6049",
        "email":  "arif.wibowo@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601029",
        "name":  "Nensy Anggriani Ningsih",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6257-1915",
        "email":  "nensy.anggriani.ningsih@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601030",
        "name":  "Khusnul Khotimah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-7917-5244",
        "email":  "khusnul.khotimah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601031",
        "name":  "Ainur Rofik Fajri",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "kerjasama Mitra",
        "phone":  "0823-4842-6872",
        "email":  "ainur.rofik.fajri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601032",
        "name":  "Safira Faddah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-2416-1037",
        "email":  "safira.faddah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601033",
        "name":  "Khoiru Zidan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-8978-7110",
        "email":  "khoiru.zidan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601034",
        "name":  "Aida Lestari",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "BEASISWA_50",
        "jalurOriginal":  "Beasiswa 50%",
        "phone":  "0823-4534-5193",
        "email":  "aida.lestari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601035",
        "name":  "M Arifudin Yusuf",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-7105-6367",
        "email":  "m.arifudin.yusuf@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601038",
        "name":  "Habibah Rasyidah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4944-9906",
        "email":  "habibah.rasyidah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601039",
        "name":  "Sri Yani",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9472-5766",
        "email":  "sri.yani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601040",
        "name":  "Ayu Rosmaidah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6242-2980",
        "email":  "ayu.rosmaidah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602036",
        "name":  "Fina Margaria",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9941-8535",
        "email":  "fina.margaria@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602037",
        "name":  "Siti Mutoharoh",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-7928-6274",
        "email":  "siti.mutoharoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601041",
        "name":  "Ahmad Fajri",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6683-9247",
        "email":  "ahmad.fajri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601042",
        "name":  "Muhammad Ihsan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9938-8364",
        "email":  "muhammad.ihsan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601043",
        "name":  "Pipi Yuliana",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "BEASISWA_50",
        "jalurOriginal":  "Beasiswa 50%",
        "phone":  "0823-9056-4301",
        "email":  "pipi.yuliana@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601044",
        "name":  "Umi Fadlilah",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "BEASISWA_50",
        "jalurOriginal":  "Beasiswa 50%",
        "phone":  "0823-3441-9713",
        "email":  "umi.fadlilah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2601045",
        "name":  "Za\u0027am Tsafiq Al Azmi",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PRESTASI",
        "jalurOriginal":  "Siswa Berprestasi",
        "phone":  "0823-7272-4731",
        "email":  "za.am.tsafiq.al.azmi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602001",
        "name":  "Erlisa Rita Novika",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4778-3611",
        "email":  "erlisa.rita.novika@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602002",
        "name":  "Choiriyah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-1176-8495",
        "email":  "choiriyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602003",
        "name":  "Dian Kartika Sari",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9432-5247",
        "email":  "dian.kartika.sari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602004",
        "name":  "Rana Fauziyyah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ALUMNI_PONPES",
        "jalurOriginal":  "Alumni Ponpes",
        "phone":  "0823-4534-5599",
        "email":  "rana.fauziyyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602005",
        "name":  "Ruqoyyah Salsabila Daeng Ke\u0027nang",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "musrif lembaga/ guru tpa",
        "phone":  "0823-1382-5978",
        "email":  "ruqoyyah.salsabila.daeng.ke.nang@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602006",
        "name":  "Fatimah Nur Islamiah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "kerjasama Mitra",
        "phone":  "0823-1552-4143",
        "email":  "fatimah.nur.islamiah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602007",
        "name":  "Mustofiah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-7036-8124",
        "email":  "mustofiah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602008",
        "name":  "Iriani",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-1596-5797",
        "email":  "iriani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602009",
        "name":  "Suyani",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "Guru TPA",
        "phone":  "0823-5288-8784",
        "email":  "suyani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602010",
        "name":  "Aulia Awwal Syafiiqoh",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ALUMNI_PONPES",
        "jalurOriginal":  "Alumni Ponpes",
        "phone":  "0823-1796-4126",
        "email":  "aulia.awwal.syafiiqoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602011",
        "name":  "Izazah Zulaikha",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "GURU_TPA",
        "jalurOriginal":  "guru TPA",
        "phone":  "0823-4216-2756",
        "email":  "izazah.zulaikha@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602012",
        "name":  "Siti Anifah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3040-1359",
        "email":  "siti.anifah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602013",
        "name":  "Tria Annisa Nurjanah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4829-2726",
        "email":  "tria.annisa.nurjanah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602014",
        "name":  "Ade Vina Hanituzzulva",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6293-4249",
        "email":  "ade.vina.hanituzzulva@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602015",
        "name":  "Garwita Felda Nabiha",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "Beasiswa Asrama",
        "phone":  "0823-4281-9350",
        "email":  "garwita.felda.nabiha@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602016",
        "name":  "Mei Lestiyana",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2094-9082",
        "email":  "mei.lestiyana@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602017",
        "name":  "Nabila Nurlia Sari",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4095-8424",
        "email":  "nabila.nurlia.sari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602018",
        "name":  "Inda Laila Sari",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6222-4276",
        "email":  "inda.laila.sari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602019",
        "name":  "Ani Ariastuti",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9087-5000",
        "email":  "ani.ariastuti@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602020",
        "name":  "Yuliantun",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2791-1670",
        "email":  "yuliantun@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602021",
        "name":  "Siti Puniah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9536-9962",
        "email":  "siti.puniah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602022",
        "name":  "Atika Mardiyanti Putri",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9953-7537",
        "email":  "atika.mardiyanti.putri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602023",
        "name":  "Nginayatul Khabibah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2534-1195",
        "email":  "nginayatul.khabibah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602024",
        "name":  "Umi Mintarti Amilatun",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9501-8251",
        "email":  "umi.mintarti.amilatun@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602025",
        "name":  "Septiana Anggraeni",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9986-8406",
        "email":  "septiana.anggraeni@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602026",
        "name":  "Risma Pradesta Suradiyanto",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3224-2476",
        "email":  "risma.pradesta.suradiyanto@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602027",
        "name":  "Siti Rokhaniyah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-7009-4513",
        "email":  "siti.rokhaniyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602028",
        "name":  "Umi Farida",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5833-3386",
        "email":  "umi.farida@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602029",
        "name":  "Salafiyah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6014-2706",
        "email":  "salafiyah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602030",
        "name":  "Alvia Musayyida",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3788-3963",
        "email":  "alvia.musayyida@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602031",
        "name":  "Yasmina Syahriza",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9152-5497",
        "email":  "yasmina.syahriza@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602032",
        "name":  "Jeklynda May Sarah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-8885-1056",
        "email":  "jeklynda.may.sarah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602033",
        "name":  "Nuryanti",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2836-9313",
        "email":  "nuryanti@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602034",
        "name":  "Slamet Kholifah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-7433-7885",
        "email":  "slamet.kholifah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602035",
        "name":  "Pompi Hartiwi",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9222-5359",
        "email":  "pompi.hartiwi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602036",
        "name":  "Siti Musarofah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6532-2767",
        "email":  "siti.musarofah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602037",
        "name":  "Meisita Rosalina",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4189-7234",
        "email":  "meisita.rosalina@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602038",
        "name":  "Rahma Lestari",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-4934-1111",
        "email":  "rahma.lestari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602039",
        "name":  "Ulya Dwi Kurniawati",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5792-4133",
        "email":  "ulya.dwi.kurniawati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602040",
        "name":  "Arif Fradina",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5325-6689",
        "email":  "arif.fradina@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602041",
        "name":  "Warsidah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-1585-1145",
        "email":  "warsidah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602042",
        "name":  "Winda Apriliani Putri",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-8764-6415",
        "email":  "winda.apriliani.putri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602043",
        "name":  "Hikmatul Fitroh",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-6762-2348",
        "email":  "hikmatul.fitroh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602044",
        "name":  "Herlina Intan Kurniasih",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-1472-5160",
        "email":  "herlina.intan.kurniasih@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602045",
        "name":  "Fajar Rochmat",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PAUD_LAKI",
        "jalurOriginal":  "Paud Laki-laki",
        "phone":  "0823-3654-7685",
        "email":  "fajar.rochmat@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602046",
        "name":  "Nur Azizah Desi Novita",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-2521-3958",
        "email":  "nur.azizah.desi.novita@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602047",
        "name":  "Fatimah Rahmawati",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4828-9600",
        "email":  "fatimah.rahmawati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602048",
        "name":  "Dewi Tri Ambodo",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama mitra",
        "phone":  "0823-9132-4558",
        "email":  "dewi.tri.ambodo@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602049",
        "name":  "Nur Kirana Anggista Safitri",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama mitra",
        "phone":  "0823-3532-7885",
        "email":  "nur.kirana.anggista.safitri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602050",
        "name":  "Rizqi Machfirotun Ni\u0027mah",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama mitra",
        "phone":  "0823-2898-8108",
        "email":  "rizqi.machfirotun.ni.mah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602051",
        "name":  "Hanifah Rahmawati",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA_GRATIS",
        "jalurOriginal":  "Kerjasama mitra  (Pabelan) Gratis",
        "phone":  "0823-3674-8782",
        "email":  "hanifah.rahmawati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602052",
        "name":  "Nani Suryani",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama mitra",
        "phone":  "0823-4494-4367",
        "email":  "nani.suryani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602053",
        "name":  "Endang Elyana",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama mitra",
        "phone":  "0823-4914-9679",
        "email":  "endang.elyana@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602054",
        "name":  "Muhammad Nanang Nasikin",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PAUD_LAKI",
        "jalurOriginal":  "Paud Laki-laki",
        "phone":  "0823-6184-4234",
        "email":  "muhammad.nanang.nasikin@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602055",
        "name":  "Prapti Budi Sulastri",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-1709-7375",
        "email":  "prapti.budi.sulastri@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602056",
        "name":  "Navisatul Ula Ulya",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-5759-8849",
        "email":  "navisatul.ula.ulya@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602057",
        "name":  "Vera Andriani",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4962-2765",
        "email":  "vera.andriani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602058",
        "name":  "Nuraeni",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-9441-3398",
        "email":  "nuraeni@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602059",
        "name":  "Wahyu Kurnia Sari",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-8831-7981",
        "email":  "wahyu.kurnia.sari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602060",
        "name":  "Nisa Nindya Hasna Kamilia",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3816-3306",
        "email":  "nisa.nindya.hasna.kamilia@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602061",
        "name":  "Sekar Purba Kinasih",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-8617-1958",
        "email":  "sekar.purba.kinasih@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602062",
        "name":  "Nailia Asma",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-3023-2934",
        "email":  "nailia.asma@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602063",
        "name":  "Gita Gustiani",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-9855-3199",
        "email":  "gita.gustiani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001001",
        "name":  "Abdullah Azam Robbani",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-1747-1426",
        "email":  "abdullah.azam.robbani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001002",
        "name":  "Ahmad Razif Ilham Baihaqi",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-7758-4151",
        "email":  "ahmad.razif.ilham.baihaqi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001014",
        "name":  "Fajar Setiyawan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-6745-8494",
        "email":  "fajar.setiyawan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001015",
        "name":  "Fazri Fadillah Iskandar",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-8970-2753",
        "email":  "fazri.fadillah.iskandar@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001018",
        "name":  "Muhammad Faqih Rabbani",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-4200-5028",
        "email":  "muhammad.faqih.rabbani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001019",
        "name":  "Muhammad Ibadurrahman",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-7303-4609",
        "email":  "muhammad.ibadurrahman@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001020",
        "name":  "Nadya Arifa",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-1295-4236",
        "email":  "nadya.arifa@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001024",
        "name":  "Shibaa Mawaddah Shiddiiqoh",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-3055-3864",
        "email":  "shibaa.mawaddah.shiddiiqoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001030",
        "name":  "Aisyah Shidiqoh",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-8877-1748",
        "email":  "aisyah.shidiqoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001033",
        "name":  "Fauzan Azhima Ramadhan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-8532-4066",
        "email":  "fauzan.azhima.ramadhan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001032",
        "name":  "Eko Purwanto",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "Reguler",
        "jalurOriginal":  "Reguler",
        "phone":  "0823-4329-9142",
        "email":  "eko.purwanto@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001043",
        "name":  "Dhiaus Suroya",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-7038-2899",
        "email":  "dhiaus.suroya@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001029",
        "name":  "Dwi Anisa Lestari",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Lulus",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-9816-4605",
        "email":  "dwi.anisa.lestari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202486209012",
        "name":  "Ahmad Fauzi",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PAUD_LAKI",
        "jalurOriginal":  "PAUD_LAKI",
        "phone":  "0823-9822-8279",
        "email":  "ahmad.fauzi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202386208005",
        "name":  "Siti Nurhaliza",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "ASRAMA",
        "phone":  "0823-8634-3110",
        "email":  "siti.nurhaliza@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202686208001",
        "name":  "Muhammad Ihsan Pratama",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "REGULER",
        "phone":  "0823-5190-6576",
        "email":  "muhammad.ihsan.pratama@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202686209002",
        "name":  "Rahmat Hidayatullah",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PAUD_LAKI",
        "jalurOriginal":  "PAUD_LAKI",
        "phone":  "0823-5922-4703",
        "email":  "rahmat.hidayatullah@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202486209008",
        "name":  "Fatimah Az-Zahra",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-2408-3039",
        "email":  "fatimah.az.zahra@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202586208014",
        "name":  "Aisyah Putri Rahmadani",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "REGULER",
        "phone":  "0823-8876-8601",
        "email":  "aisyah.putri.rahmadani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202386208007",
        "name":  "Zaid Al-Faruq",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "ASRAMA",
        "phone":  "0823-8216-7918",
        "email":  "zaid.al.faruq@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202386209003",
        "name":  "Nurul Hidayati",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "ASRAMA",
        "jalurOriginal":  "ASRAMA",
        "phone":  "0823-9169-6292",
        "email":  "nurul.hidayati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202486209015",
        "name":  "Muhammad Yusuf Al-Khattab",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "PAUD_LAKI",
        "jalurOriginal":  "PAUD_LAKI",
        "phone":  "0823-5722-6230",
        "email":  "muhammad.yusuf.al.khattab@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202686208003",
        "name":  "Khadijah Humaira",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-6780-1503",
        "email":  "khadijah.humaira@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202486208011",
        "name":  "Bilal Al-Habasyi",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0823-5348-6441",
        "email":  "bilal.al.habasyi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202686209004",
        "name":  "Maryam Qonita",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  5,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "REGULER",
        "phone":  "0823-4045-6156",
        "email":  "maryam.qonita@mahasiswa.stit-ihsanulfikri.ac.id"
    }
]
,

  // Tagihan Mahasiswa Aktif
  invoices: [
    {
        "id":  "INV-2026-100",
        "studentNim":  "2601001",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1001",
        "paymentDate":  "2026-02-02 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Alumni ponpes)"
    },
    {
        "id":  "INV-2026-101",
        "studentNim":  "2601002",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1002",
        "paymentDate":  "2026-03-31 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-102",
        "studentNim":  "2601003",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1003",
        "paymentDate":  "2026-08-17 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-103",
        "studentNim":  "2601004",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1004",
        "paymentDate":  "2026-07-18 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-104",
        "studentNim":  "2601005",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1005",
        "paymentDate":  "2026-07-19 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-105",
        "studentNim":  "2601006",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Alumni ponpes)"
    },
    {
        "id":  "INV-2026-106",
        "studentNim":  "2601007",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1007",
        "paymentDate":  "2026-02-25 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-107",
        "studentNim":  "2601008",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-108",
        "studentNim":  "2601009",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-109",
        "studentNim":  "2601010",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1010",
        "paymentDate":  "2026-07-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-110",
        "studentNim":  "2601011",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1011",
        "paymentDate":  "2026-07-24 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-111",
        "studentNim":  "2601012",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-112",
        "studentNim":  "2601013",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  2400000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  0,
        "netAmount":  3050000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Reguler)"
    },
    {
        "id":  "INV-2026-113",
        "studentNim":  "2601014",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-114",
        "studentNim":  "2601015",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1015",
        "paymentDate":  "2026-09-01 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-115",
        "studentNim":  "2601016",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1016",
        "paymentDate":  "2026-07-29 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-116",
        "studentNim":  "2601017",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1017",
        "paymentDate":  "2026-09-01 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-117",
        "studentNim":  "2601018",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-118",
        "studentNim":  "2601019",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1019",
        "paymentDate":  "2026-08-06 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-119",
        "studentNim":  "2601020",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1020",
        "paymentDate":  "2026-08-23 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-120",
        "studentNim":  "2601021",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-121",
        "studentNim":  "2601022",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1022",
        "paymentDate":  "2026-08-13 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-122",
        "studentNim":  "2601023",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-123",
        "studentNim":  "2601024",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1024",
        "paymentDate":  "2026-07-30 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-124",
        "studentNim":  "2601025",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1025",
        "paymentDate":  "2026-08-08 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-125",
        "studentNim":  "2601026",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1026",
        "paymentDate":  "2026-08-08 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjamasama Mitra)"
    },
    {
        "id":  "INV-2026-126",
        "studentNim":  "2601027",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-127",
        "studentNim":  "2601028",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1028",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-128",
        "studentNim":  "2601029",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1029",
        "paymentDate":  "2026-08-30 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-129",
        "studentNim":  "2601030",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1030",
        "paymentDate":  "2026-09-03 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-130",
        "studentNim":  "2601031",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-131",
        "studentNim":  "2601032",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  2400000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  0,
        "netAmount":  3050000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Reguler)"
    },
    {
        "id":  "INV-2026-132",
        "studentNim":  "2601033",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  2400000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  0,
        "netAmount":  3050000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1033",
        "paymentDate":  "2026-09-08 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Reguler)"
    },
    {
        "id":  "INV-2026-133",
        "studentNim":  "2601034",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-134",
        "studentNim":  "2601035",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-135",
        "studentNim":  "2601038",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1038",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-136",
        "studentNim":  "2601039",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1039",
        "paymentDate":  "2026-08-28 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-137",
        "studentNim":  "2601040",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  450000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/1040",
        "paymentDate":  "2026-09-03 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-138",
        "studentNim":  "2602036",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  1850000,
        "status":  "LUNAS",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2036",
        "paymentDate":  "2026-07-18 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-139",
        "studentNim":  "2602037",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-140",
        "studentNim":  "2601041",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-141",
        "studentNim":  "2601042",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-142",
        "studentNim":  "2601043",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-143",
        "studentNim":  "2601044",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-144",
        "studentNim":  "2601045",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Siswa Berprestasi)"
    },
    {
        "id":  "INV-2026-145",
        "studentNim":  "2602001",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2001",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-146",
        "studentNim":  "2602002",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2002",
        "paymentDate":  "2026-03-30 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-147",
        "studentNim":  "2602003",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2003",
        "paymentDate":  "2026-07-21 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-148",
        "studentNim":  "2602004",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2004",
        "paymentDate":  "2026-07-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Alumni Ponpes)"
    },
    {
        "id":  "INV-2026-149",
        "studentNim":  "2602005",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2005",
        "paymentDate":  "2026-07-29 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (musrif lembaga/ guru tpa)"
    },
    {
        "id":  "INV-2026-150",
        "studentNim":  "2602006",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2006",
        "paymentDate":  "2026-07-17 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-151",
        "studentNim":  "2602007",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2007",
        "paymentDate":  "2026-09-07 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-152",
        "studentNim":  "2602008",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2008",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-153",
        "studentNim":  "2602009",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2009",
        "paymentDate":  "2026-07-08 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Guru TPA)"
    },
    {
        "id":  "INV-2026-154",
        "studentNim":  "2602010",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Alumni Ponpes)"
    },
    {
        "id":  "INV-2026-155",
        "studentNim":  "2602011",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2011",
        "paymentDate":  "2026-07-20 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (guru TPA)"
    },
    {
        "id":  "INV-2026-156",
        "studentNim":  "2602012",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2012",
        "paymentDate":  "2026-08-31 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-157",
        "studentNim":  "2602013",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2013",
        "paymentDate":  "2026-07-31 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-158",
        "studentNim":  "2602014",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2014",
        "paymentDate":  "2026-08-31 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-159",
        "studentNim":  "2602015",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  960000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1440000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  960000,
        "netAmount":  2090000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2015",
        "paymentDate":  "2026-09-29 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-160",
        "studentNim":  "2602016",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2016",
        "paymentDate":  "2026-09-02 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-161",
        "studentNim":  "2602017",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2017",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-162",
        "studentNim":  "2602018",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2018",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-163",
        "studentNim":  "2602019",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-164",
        "studentNim":  "2602020",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2020",
        "paymentDate":  "2026-09-09 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-165",
        "studentNim":  "2602021",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2021",
        "paymentDate":  "2026-08-21 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-166",
        "studentNim":  "2602022",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2022",
        "paymentDate":  "2026-09-01 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-167",
        "studentNim":  "2602023",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2023",
        "paymentDate":  "2026-08-20 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-168",
        "studentNim":  "2602024",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2024",
        "paymentDate":  "2026-08-21 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-169",
        "studentNim":  "2602025",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-170",
        "studentNim":  "2602026",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2026",
        "paymentDate":  "2026-08-13 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-171",
        "studentNim":  "2602027",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2027",
        "paymentDate":  "2026-08-17 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-172",
        "studentNim":  "2602028",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2028",
        "paymentDate":  "2026-09-07 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-173",
        "studentNim":  "2602029",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2029",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-174",
        "studentNim":  "2602030",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2030",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-175",
        "studentNim":  "2602031",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2031",
        "paymentDate":  "2026-08-27 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-176",
        "studentNim":  "2602032",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2032",
        "paymentDate":  "2026-08-25 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-177",
        "studentNim":  "2602033",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2033",
        "paymentDate":  "2026-08-24 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-178",
        "studentNim":  "2602034",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2034",
        "paymentDate":  "2026-08-22 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-179",
        "studentNim":  "2602035",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2035",
        "paymentDate":  "2026-08-22 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-180",
        "studentNim":  "2602036",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-181",
        "studentNim":  "2602037",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2037",
        "paymentDate":  "2026-09-09 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-182",
        "studentNim":  "2602038",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  2400000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  0,
        "netAmount":  3050000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2038",
        "paymentDate":  "2026-08-15 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Reguler)"
    },
    {
        "id":  "INV-2026-183",
        "studentNim":  "2602039",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-184",
        "studentNim":  "2602040",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2040",
        "paymentDate":  "2026-08-29 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-185",
        "studentNim":  "2602041",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2041",
        "paymentDate":  "2026-08-24 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-186",
        "studentNim":  "2602042",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2042",
        "paymentDate":  "2026-08-29 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-187",
        "studentNim":  "2602043",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  650000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2043",
        "paymentDate":  "2026-09-01 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-188",
        "studentNim":  "2602044",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-189",
        "studentNim":  "2602045",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  2400000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  0,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  2400000,
        "netAmount":  650000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Paud Laki-laki)"
    },
    {
        "id":  "INV-2026-190",
        "studentNim":  "2602046",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-191",
        "studentNim":  "2602047",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-192",
        "studentNim":  "2602048",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-193",
        "studentNim":  "2602049",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-194",
        "studentNim":  "2602050",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-195",
        "studentNim":  "2602051",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  2400000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  0,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  2400000,
        "netAmount":  650000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2051",
        "paymentDate":  "2026-09-01 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra  (Pabelan) Gratis)"
    },
    {
        "id":  "INV-2026-196",
        "studentNim":  "2602052",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-197",
        "studentNim":  "2602053",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2053",
        "paymentDate":  "2026-09-02 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-198",
        "studentNim":  "2602054",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  2400000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  0,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  2400000,
        "netAmount":  650000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2054",
        "paymentDate":  "2026-08-31 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Paud Laki-laki)"
    },
    {
        "id":  "INV-2026-199",
        "studentNim":  "2602055",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  200000,
        "status":  "DICICIL",
        "paymentMethod":  "VA_BSI",
        "receiptNumber":  "KW-IF/2026/08/2055",
        "paymentDate":  "2026-09-02 10:00:00",
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-200",
        "studentNim":  "2602056",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-201",
        "studentNim":  "2602057",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-202",
        "studentNim":  "2602058",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-203",
        "studentNim":  "2602059",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-204",
        "studentNim":  "2602060",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-205",
        "studentNim":  "2602061",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-206",
        "studentNim":  "2602062",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  1200000,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  1200000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  1200000,
        "netAmount":  1850000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-207",
        "studentNim":  "2602063",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-15",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi",
                          "finalAmount":  450000,
                          "componentId":  "DAFTAR_ULANG"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  2400000,
                          "name":  "SPP / UKT Pokok Semester 1",
                          "finalAmount":  2400000,
                          "componentId":  "SPP"
                      }
                  ],
        "grossAmount":  3050000,
        "totalDiscount":  0,
        "netAmount":  3050000,
        "paidAmount":  0,
        "status":  "BELUM_BAYAR",
        "paymentMethod":  null,
        "receiptNumber":  null,
        "paymentDate":  null,
        "virtualAccount":  "1056405743",
        "notes":  "Tagihan PMB \u0026 Semester 1 Tahun Akademik 2026/2027 (Reguler)"
    }
]
,

  // Antrean Verifikasi & Transaksi Pembayaran Sah
  paymentVerifications: [
    {
        "id":  "VER-100",
        "invoiceId":  "INV-2026-100",
        "studentNim":  "2601001",
        "studentName":  "Miftahul Jannah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-02-02 08:30:00",
        "verifiedAt":  "2026-02-02 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601001",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-101",
        "invoiceId":  "INV-2026-101",
        "studentNim":  "2601002",
        "studentName":  "Aifah Ruslan",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-03-31 08:30:00",
        "verifiedAt":  "2026-03-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601002",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-102",
        "invoiceId":  "INV-2026-102",
        "studentNim":  "2601003",
        "studentName":  "Hamzah Habiburrohman",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-06-21 08:30:00",
        "verifiedAt":  "2026-06-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601003",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-103",
        "invoiceId":  "INV-2026-102",
        "studentNim":  "2601003",
        "studentName":  "Hamzah Habiburrohman",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-17 08:30:00",
        "verifiedAt":  "2026-08-17 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601003",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-104",
        "invoiceId":  "INV-2026-103",
        "studentNim":  "2601004",
        "studentName":  "Faza Ainaya Abqariyah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-06-17 08:30:00",
        "verifiedAt":  "2026-06-17 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601004",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-105",
        "invoiceId":  "INV-2026-103",
        "studentNim":  "2601004",
        "studentName":  "Faza Ainaya Abqariyah",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-18 08:30:00",
        "verifiedAt":  "2026-07-18 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601004",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-106",
        "invoiceId":  "INV-2026-104",
        "studentNim":  "2601005",
        "studentName":  "Aisyi Saadah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-19 08:30:00",
        "verifiedAt":  "2026-07-19 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601005",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-107",
        "invoiceId":  "INV-2026-106",
        "studentNim":  "2601007",
        "studentName":  "Aldi Baitur Rahman",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-02-25 08:30:00",
        "verifiedAt":  "2026-02-25 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601007",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-108",
        "invoiceId":  "INV-2026-106",
        "studentNim":  "2601007",
        "studentName":  "Aldi Baitur Rahman",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-02-25 08:30:00",
        "verifiedAt":  "2026-02-25 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601007",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-109",
        "invoiceId":  "INV-2026-109",
        "studentNim":  "2601010",
        "studentName":  "Naila Azkiya",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-27 08:30:00",
        "verifiedAt":  "2026-07-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601010",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-110",
        "invoiceId":  "INV-2026-110",
        "studentNim":  "2601011",
        "studentName":  "Darwati",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-24 08:30:00",
        "verifiedAt":  "2026-07-24 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601011",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-111",
        "invoiceId":  "INV-2026-114",
        "studentNim":  "2601015",
        "studentName":  "Yuly Hermawan Susilo",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-28 08:30:00",
        "verifiedAt":  "2026-07-28 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601015",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-112",
        "invoiceId":  "INV-2026-114",
        "studentNim":  "2601015",
        "studentName":  "Yuly Hermawan Susilo",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601015",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-113",
        "invoiceId":  "INV-2026-115",
        "studentNim":  "2601016",
        "studentName":  "Ngarifatun Thoyibah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-29 08:30:00",
        "verifiedAt":  "2026-07-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601016",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-114",
        "invoiceId":  "INV-2026-116",
        "studentNim":  "2601017",
        "studentName":  "Eva Fitriyaningsih",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-12 08:30:00",
        "verifiedAt":  "2026-08-12 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601017",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-115",
        "invoiceId":  "INV-2026-116",
        "studentNim":  "2601017",
        "studentName":  "Eva Fitriyaningsih",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601017",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-116",
        "invoiceId":  "INV-2026-118",
        "studentNim":  "2601019",
        "studentName":  "Pramundari",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-06 08:30:00",
        "verifiedAt":  "2026-08-06 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601019",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-117",
        "invoiceId":  "INV-2026-119",
        "studentNim":  "2601020",
        "studentName":  "Amalia Nur Sa\u0027adah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-23 08:30:00",
        "verifiedAt":  "2026-08-23 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601020",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-118",
        "invoiceId":  "INV-2026-121",
        "studentNim":  "2601022",
        "studentName":  "Haning Pramesti",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-01 08:30:00",
        "verifiedAt":  "2026-08-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601022",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-119",
        "invoiceId":  "INV-2026-121",
        "studentNim":  "2601022",
        "studentName":  "Haning Pramesti",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-13 08:30:00",
        "verifiedAt":  "2026-08-13 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601022",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-120",
        "invoiceId":  "INV-2026-123",
        "studentNim":  "2601024",
        "studentName":  "Niken Wahyu Ningsih",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-30 08:30:00",
        "verifiedAt":  "2026-07-30 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601024",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-121",
        "invoiceId":  "INV-2026-124",
        "studentNim":  "2601025",
        "studentName":  "Hamidah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-08 08:30:00",
        "verifiedAt":  "2026-08-08 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601025",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-122",
        "invoiceId":  "INV-2026-125",
        "studentNim":  "2601026",
        "studentName":  "Samsul Sutopo Slamet",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-08 08:30:00",
        "verifiedAt":  "2026-08-08 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601026",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-123",
        "invoiceId":  "INV-2026-127",
        "studentNim":  "2601028",
        "studentName":  "Arif Wibowo",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601028",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-124",
        "invoiceId":  "INV-2026-128",
        "studentNim":  "2601029",
        "studentName":  "Nensy Anggriani Ningsih",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-30 08:30:00",
        "verifiedAt":  "2026-08-30 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601029",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-125",
        "invoiceId":  "INV-2026-129",
        "studentNim":  "2601030",
        "studentName":  "Khusnul Khotimah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-03 08:30:00",
        "verifiedAt":  "2026-09-03 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601030",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-126",
        "invoiceId":  "INV-2026-129",
        "studentNim":  "2601030",
        "studentName":  "Khusnul Khotimah",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-03 08:30:00",
        "verifiedAt":  "2026-09-03 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601030",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-127",
        "invoiceId":  "INV-2026-132",
        "studentNim":  "2601033",
        "studentName":  "Khoiru Zidan",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-08 08:30:00",
        "verifiedAt":  "2026-09-08 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601033",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-128",
        "invoiceId":  "INV-2026-132",
        "studentNim":  "2601033",
        "studentName":  "Khoiru Zidan",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-08 08:30:00",
        "verifiedAt":  "2026-09-08 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601033",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-129",
        "invoiceId":  "INV-2026-135",
        "studentNim":  "2601038",
        "studentName":  "Habibah Rasyidah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601038",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-130",
        "invoiceId":  "INV-2026-135",
        "studentNim":  "2601038",
        "studentName":  "Habibah Rasyidah",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601038",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-131",
        "invoiceId":  "INV-2026-136",
        "studentNim":  "2601039",
        "studentName":  "Sri Yani",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-28 08:30:00",
        "verifiedAt":  "2026-08-28 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2601039",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-132",
        "invoiceId":  "INV-2026-137",
        "studentNim":  "2601040",
        "studentName":  "Ayu Rosmaidah",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-03 08:30:00",
        "verifiedAt":  "2026-09-03 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2601040",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-133",
        "invoiceId":  "INV-2026-138",
        "studentNim":  "2602036",
        "studentName":  "Fina Margaria",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-18 08:30:00",
        "verifiedAt":  "2026-07-18 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602036",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-134",
        "invoiceId":  "INV-2026-138",
        "studentNim":  "2602036",
        "studentName":  "Fina Margaria",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-18 08:30:00",
        "verifiedAt":  "2026-07-18 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602036",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-135",
        "invoiceId":  "INV-2026-145",
        "studentNim":  "2602001",
        "studentName":  "Erlisa Rita Novika",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-02-23 08:30:00",
        "verifiedAt":  "2026-02-23 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602001",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-136",
        "invoiceId":  "INV-2026-145",
        "studentNim":  "2602001",
        "studentName":  "Erlisa Rita Novika",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602001",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-137",
        "invoiceId":  "INV-2026-146",
        "studentNim":  "2602002",
        "studentName":  "Choiriyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-03-30 08:30:00",
        "verifiedAt":  "2026-03-30 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602002",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-138",
        "invoiceId":  "INV-2026-147",
        "studentNim":  "2602003",
        "studentName":  "Dian Kartika Sari",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-04-15 08:30:00",
        "verifiedAt":  "2026-04-15 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602003",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-139",
        "invoiceId":  "INV-2026-147",
        "studentNim":  "2602003",
        "studentName":  "Dian Kartika Sari",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-21 08:30:00",
        "verifiedAt":  "2026-07-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602003",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-140",
        "invoiceId":  "INV-2026-148",
        "studentNim":  "2602004",
        "studentName":  "Rana Fauziyyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-06-29 08:30:00",
        "verifiedAt":  "2026-06-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602004",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-141",
        "invoiceId":  "INV-2026-148",
        "studentNim":  "2602004",
        "studentName":  "Rana Fauziyyah",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-27 08:30:00",
        "verifiedAt":  "2026-07-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602004",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-142",
        "invoiceId":  "INV-2026-149",
        "studentNim":  "2602005",
        "studentName":  "Ruqoyyah Salsabila Daeng Ke\u0027nang",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-09 08:30:00",
        "verifiedAt":  "2026-07-09 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602005",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-143",
        "invoiceId":  "INV-2026-149",
        "studentNim":  "2602005",
        "studentName":  "Ruqoyyah Salsabila Daeng Ke\u0027nang",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-29 08:30:00",
        "verifiedAt":  "2026-07-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602005",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-144",
        "invoiceId":  "INV-2026-150",
        "studentNim":  "2602006",
        "studentName":  "Fatimah Nur Islamiah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-04-15 08:30:00",
        "verifiedAt":  "2026-04-15 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602006",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-145",
        "invoiceId":  "INV-2026-150",
        "studentNim":  "2602006",
        "studentName":  "Fatimah Nur Islamiah",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-17 08:30:00",
        "verifiedAt":  "2026-07-17 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602006",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-146",
        "invoiceId":  "INV-2026-151",
        "studentNim":  "2602007",
        "studentName":  "Mustofiah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-02-14 08:30:00",
        "verifiedAt":  "2026-02-14 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602007",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-147",
        "invoiceId":  "INV-2026-151",
        "studentNim":  "2602007",
        "studentName":  "Mustofiah",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-07 08:30:00",
        "verifiedAt":  "2026-09-07 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602007",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-148",
        "invoiceId":  "INV-2026-152",
        "studentNim":  "2602008",
        "studentName":  "Iriani",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-18 08:30:00",
        "verifiedAt":  "2026-07-18 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602008",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-149",
        "invoiceId":  "INV-2026-152",
        "studentNim":  "2602008",
        "studentName":  "Iriani",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602008",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-150",
        "invoiceId":  "INV-2026-153",
        "studentNim":  "2602009",
        "studentName":  "Suyani",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-08 08:30:00",
        "verifiedAt":  "2026-07-08 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602009",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-151",
        "invoiceId":  "INV-2026-155",
        "studentNim":  "2602011",
        "studentName":  "Izazah Zulaikha",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-20 08:30:00",
        "verifiedAt":  "2026-07-20 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602011",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-152",
        "invoiceId":  "INV-2026-156",
        "studentNim":  "2602012",
        "studentName":  "Siti Anifah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-31 08:30:00",
        "verifiedAt":  "2026-08-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602012",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-153",
        "invoiceId":  "INV-2026-157",
        "studentNim":  "2602013",
        "studentName":  "Tria Annisa Nurjanah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-31 08:30:00",
        "verifiedAt":  "2026-07-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602013",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-154",
        "invoiceId":  "INV-2026-157",
        "studentNim":  "2602013",
        "studentName":  "Tria Annisa Nurjanah",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-31 08:30:00",
        "verifiedAt":  "2026-07-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602013",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-155",
        "invoiceId":  "INV-2026-158",
        "studentNim":  "2602014",
        "studentName":  "Ade Vina Hanituzzulva",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-16 08:30:00",
        "verifiedAt":  "2026-07-16 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602014",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-156",
        "invoiceId":  "INV-2026-158",
        "studentNim":  "2602014",
        "studentName":  "Ade Vina Hanituzzulva",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-31 08:30:00",
        "verifiedAt":  "2026-08-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602014",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-157",
        "invoiceId":  "INV-2026-159",
        "studentNim":  "2602015",
        "studentName":  "Garwita Felda Nabiha",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-07-28 08:30:00",
        "verifiedAt":  "2026-07-28 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602015",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-158",
        "invoiceId":  "INV-2026-159",
        "studentNim":  "2602015",
        "studentName":  "Garwita Felda Nabiha",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-29 08:30:00",
        "verifiedAt":  "2026-09-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602015",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-159",
        "invoiceId":  "INV-2026-160",
        "studentNim":  "2602016",
        "studentName":  "Mei Lestiyana",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-02 08:30:00",
        "verifiedAt":  "2026-09-02 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602016",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-160",
        "invoiceId":  "INV-2026-161",
        "studentNim":  "2602017",
        "studentName":  "Nabila Nurlia Sari",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602017",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-161",
        "invoiceId":  "INV-2026-161",
        "studentNim":  "2602017",
        "studentName":  "Nabila Nurlia Sari",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602017",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-162",
        "invoiceId":  "INV-2026-162",
        "studentNim":  "2602018",
        "studentName":  "Inda Laila Sari",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602018",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-163",
        "invoiceId":  "INV-2026-162",
        "studentNim":  "2602018",
        "studentName":  "Inda Laila Sari",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602018",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-164",
        "invoiceId":  "INV-2026-164",
        "studentNim":  "2602020",
        "studentName":  "Yuliantun",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-09 08:30:00",
        "verifiedAt":  "2026-09-09 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602020",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-165",
        "invoiceId":  "INV-2026-165",
        "studentNim":  "2602021",
        "studentName":  "Siti Puniah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602021",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-166",
        "invoiceId":  "INV-2026-166",
        "studentNim":  "2602022",
        "studentName":  "Atika Mardiyanti Putri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602022",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-167",
        "invoiceId":  "INV-2026-167",
        "studentNim":  "2602023",
        "studentName":  "Nginayatul Khabibah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-20 08:30:00",
        "verifiedAt":  "2026-08-20 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602023",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-168",
        "invoiceId":  "INV-2026-168",
        "studentNim":  "2602024",
        "studentName":  "Umi Mintarti Amilatun",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602024",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-169",
        "invoiceId":  "INV-2026-168",
        "studentNim":  "2602024",
        "studentName":  "Umi Mintarti Amilatun",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602024",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-170",
        "invoiceId":  "INV-2026-170",
        "studentNim":  "2602026",
        "studentName":  "Risma Pradesta Suradiyanto",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-13 08:30:00",
        "verifiedAt":  "2026-08-13 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602026",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-171",
        "invoiceId":  "INV-2026-171",
        "studentNim":  "2602027",
        "studentName":  "Siti Rokhaniyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-17 08:30:00",
        "verifiedAt":  "2026-08-17 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602027",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-172",
        "invoiceId":  "INV-2026-172",
        "studentNim":  "2602028",
        "studentName":  "Umi Farida",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602028",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-173",
        "invoiceId":  "INV-2026-172",
        "studentNim":  "2602028",
        "studentName":  "Umi Farida",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-07 08:30:00",
        "verifiedAt":  "2026-09-07 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602028",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-174",
        "invoiceId":  "INV-2026-173",
        "studentNim":  "2602029",
        "studentName":  "Salafiyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602029",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-175",
        "invoiceId":  "INV-2026-173",
        "studentNim":  "2602029",
        "studentName":  "Salafiyah",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602029",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-176",
        "invoiceId":  "INV-2026-174",
        "studentNim":  "2602030",
        "studentName":  "Alvia Musayyida",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602030",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-177",
        "invoiceId":  "INV-2026-174",
        "studentNim":  "2602030",
        "studentName":  "Alvia Musayyida",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602030",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-178",
        "invoiceId":  "INV-2026-175",
        "studentNim":  "2602031",
        "studentName":  "Yasmina Syahriza",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-27 08:30:00",
        "verifiedAt":  "2026-08-27 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602031",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-179",
        "invoiceId":  "INV-2026-176",
        "studentNim":  "2602032",
        "studentName":  "Jeklynda May Sarah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-25 08:30:00",
        "verifiedAt":  "2026-08-25 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602032",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-180",
        "invoiceId":  "INV-2026-177",
        "studentNim":  "2602033",
        "studentName":  "Nuryanti",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-24 08:30:00",
        "verifiedAt":  "2026-08-24 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602033",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-181",
        "invoiceId":  "INV-2026-178",
        "studentNim":  "2602034",
        "studentName":  "Slamet Kholifah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-22 08:30:00",
        "verifiedAt":  "2026-08-22 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602034",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-182",
        "invoiceId":  "INV-2026-179",
        "studentNim":  "2602035",
        "studentName":  "Pompi Hartiwi",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-22 08:30:00",
        "verifiedAt":  "2026-08-22 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602035",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-183",
        "invoiceId":  "INV-2026-181",
        "studentNim":  "2602037",
        "studentName":  "Meisita Rosalina",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-09 08:30:00",
        "verifiedAt":  "2026-09-09 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602037",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-184",
        "invoiceId":  "INV-2026-182",
        "studentNim":  "2602038",
        "studentName":  "Rahma Lestari",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-15 08:30:00",
        "verifiedAt":  "2026-08-15 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602038",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-185",
        "invoiceId":  "INV-2026-184",
        "studentNim":  "2602040",
        "studentName":  "Arif Fradina",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-21 08:30:00",
        "verifiedAt":  "2026-08-21 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602040",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-186",
        "invoiceId":  "INV-2026-184",
        "studentNim":  "2602040",
        "studentName":  "Arif Fradina",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-29 08:30:00",
        "verifiedAt":  "2026-08-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602040",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-187",
        "invoiceId":  "INV-2026-185",
        "studentNim":  "2602041",
        "studentName":  "Warsidah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-24 08:30:00",
        "verifiedAt":  "2026-08-24 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602041",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-188",
        "invoiceId":  "INV-2026-186",
        "studentNim":  "2602042",
        "studentName":  "Winda Apriliani Putri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-29 08:30:00",
        "verifiedAt":  "2026-08-29 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602042",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-189",
        "invoiceId":  "INV-2026-187",
        "studentNim":  "2602043",
        "studentName":  "Hikmatul Fitroh",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602043",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-190",
        "invoiceId":  "INV-2026-187",
        "studentNim":  "2602043",
        "studentName":  "Hikmatul Fitroh",
        "prodi":  "PIAUD",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-DAFTARULANG/2026/2602043",
        "notes":  "Heregistrasi \u0026 Daftar Ulang Mahasiswa Baru 2026 sah terverifikasi"
    },
    {
        "id":  "VER-191",
        "invoiceId":  "INV-2026-195",
        "studentNim":  "2602051",
        "studentName":  "Hanifah Rahmawati",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-01 08:30:00",
        "verifiedAt":  "2026-09-01 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602051",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-192",
        "invoiceId":  "INV-2026-197",
        "studentNim":  "2602053",
        "studentName":  "Endang Elyana",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-02 08:30:00",
        "verifiedAt":  "2026-09-02 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602053",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-193",
        "invoiceId":  "INV-2026-198",
        "studentNim":  "2602054",
        "studentName":  "Muhammad Nanang Nasikin",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-08-31 08:30:00",
        "verifiedAt":  "2026-08-31 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602054",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    },
    {
        "id":  "VER-194",
        "invoiceId":  "INV-2026-199",
        "studentNim":  "2602055",
        "studentName":  "Prapti Budi Sulastri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "submittedAt":  "2026-09-02 08:30:00",
        "verifiedAt":  "2026-09-02 09:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-PENDAFTARAN/2026/2602055",
        "notes":  "Pembayaran formulir pendaftaran PMB 2026 sah terverifikasi"
    }
]
,

  // Audit Logs
  auditLogs: [
    {
      id: 'LOG-001',
      action: 'SYSTEM_SYNC',
      target: 'Google Spreadsheet STIT-IF',
      details: 'Sinkronisasi master data mahasiswa baru PMB 2026 (BKPI & PIAUD) dan rekapitulasi semester dari Google Sheets resmi.',
      timestamp: '2026-09-11 08:30:00',
      user: 'Ustadzah Siti Fatimah, S.E.',
      ip: '127.0.0.1'
    },
    {
      id: 'LOG-002',
      action: 'INIT_SEMESTER',
      target: 'Semester 2026/2027 Ganjil',
      details: 'Penerbitan tagihan serentak PMB 2026 dan semester ganjil berjalan.',
      timestamp: '2026-08-01 08:00:00',
      user: 'Ustadzah Siti Fatimah, S.E.',
      ip: '127.0.0.1'
    }
  ],

  // Kalender Akademik Resmi
  academicCalendar: [
    {
      id: 'EVT-001',
      title: 'Pendaftaran & Seleksi Mahasiswa Baru (PMB) Gelombang II',
      category: 'KEUANGAN',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      semester: '2026/2027 Ganjil',
      location: 'Portal PMB & Biro BAU Kampus STIT-IF',
      description: 'Pendaftaran online/offline maba dan pembayaran formulir pendaftaran Rp 200.000 ke BSI 1056405743.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-002',
      title: 'Heregistrasi & Daftar Ulang Mahasiswa Baru 2026',
      category: 'KEUANGAN',
      startDate: '2026-07-15',
      endDate: '2026-09-10',
      semester: '2026/2027 Ganjil',
      location: 'Biro BAU & Bank BSI',
      description: 'Pelunasan biaya daftar ulang Rp 450.000 dan verifikasi berkas PMB.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-003',
      title: 'Batas Akhir Pembayaran SPP Semester Ganjil 2026/2027',
      category: 'KEUANGAN',
      startDate: '2026-08-01',
      endDate: '2026-09-15',
      semester: '2026/2027 Ganjil',
      location: 'Virtual Account Bank BSI: 1056405743',
      description: 'Batas akhir pembayaran SPP/UKT untuk validasi KRS aktif perkuliahan.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-004',
      title: 'Kuliah Perdana & Taruf Mahasiswa Baru (Orientasi)',
      category: 'AKADEMIK',
      startDate: '2026-09-14',
      endDate: '2026-09-16',
      semester: '2026/2027 Ganjil',
      location: 'Auditorium Utama STIT Ihsanul Fikri',
      description: 'Orientasi akademik dan pengenalan kampus untuk seluruh mahasiswa baru angkatan 2026.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-005',
      title: 'Ujian Tengah Semester (UTS) Ganjil',
      category: 'AKADEMIK',
      startDate: '2026-11-02',
      endDate: '2026-11-14',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Ujian Kampus',
      description: 'Pelaksanaan UTS tertulis dan evaluasi tengah semester.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-006',
      title: 'Wisuda Sarjana & Munaqosyah STIT Ihsanul Fikri',
      category: 'KEGIATAN',
      startDate: '2026-12-19',
      endDate: '2026-12-19',
      semester: '2026/2027 Ganjil',
      location: 'Grand Ballroom & Kampus STIT-IF',
      description: 'Wisuda sarjana pendidikan prodi BKPI dan PIAUD.',
      isMandatory: false,
      targetRoles: ['ALL']
    }
  ]
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.loadInitialState();
  }

  loadInitialState() {
    try {
      // Clear legacy storage keys
      ['simpel_if_state', 'SIMPEL_IF_STATE_V1', 'SIMPEL_IF_STATE_V2', 'SIMPEL_IF_STATE_V3', 'SIMPEL_IF_STATE_V4'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        // Ensure student records and sheets matrix are complete
        if (!this.state.students || this.state.students.length < 100 || !this.state.googleSheetsMatrix || !this.state.googleSheetsMatrix.bkpi2026) {
          this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
          this.saveState();
        } else {
          if (!this.state.invoices || this.state.invoices.length < 80) {
            this.state.invoices = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.invoices));
          }
          if (!this.state.paymentVerifications || this.state.paymentVerifications.length < 40) {
            this.state.paymentVerifications = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.paymentVerifications));
          }
          if (!this.state.scholarshipSchemes || this.state.scholarshipSchemes.length < 9) {
            this.state.scholarshipSchemes = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.scholarshipSchemes));
          }
          if (!this.state.feeComponents) {
            this.state.feeComponents = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.feeComponents));
          }
        }
      } else {
        this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
        this.saveState();
      }
    } catch (e) {
      console.warn('Error loading state from localStorage, resetting:', e);
      this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
      this.saveState();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(options = {}) {
    this.saveState();
    this.notifyListeners(options);
  }

  notifyListeners(options = {}) {
    this.listeners.forEach(listener => {
      try {
        listener(this.state, options);
      } catch (err) {
        console.error('Error in listener:', err);
      }
    });
  }

  setRole(roleKey, customStudentNim = null) {
    const targetRole = roleKey === 'MAHASISWA' ? 'MAHASISWA' : 'ADMIN';
    this.state.currentRole = targetRole;

    if (targetRole === 'MAHASISWA') {
      const targetNim = customStudentNim || '2601001'; // Default Miftahul Jannah
      const student = this.state.students.find(s => s.nim === targetNim) || this.state.students[0];
      this.state.currentUser = {
        id: `MHS-${student.nim}`,
        name: student.name,
        role: 'MAHASISWA',
        email: student.email,
        avatarText: student.name.split(' ').map(n => n[0]).slice(0, 2).join(''),
        prodi: student.prodi,
        nim: student.nim,
        scholarshipId: student.scholarshipId,
        semester: student.semester
      };
    } else {
      const activeAdmin = (this.state.adminUsers && this.state.adminUsers.find(a => a.status === 'AKTIF')) ||
                          this.state.adminProfile ||
                          INITIAL_SEED_DATA.adminProfile;
      this.state.adminProfile = { ...activeAdmin };
      this.state.currentUser = { ...activeAdmin, role: 'ADMIN' };
    }

    this.notify();
  }

  setActiveAdmin(adminId) {
    if (!this.state.adminUsers) this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));
    const admin = this.state.adminUsers.find(a => a.id === adminId);
    if (!admin) return { success: false, message: 'Data admin tidak ditemukan.' };
    if (admin.status === 'NON_AKTIF') return { success: false, message: 'Akun admin ini non-aktif.' };

    this.state.currentRole = 'ADMIN';
    this.state.adminProfile = { ...admin };
    this.state.currentUser = { ...admin, role: 'ADMIN' };

    this.addAuditLog('SWITCH_ADMIN', admin.name, `Beralih sesi aktif ke Admin: ${admin.name}.`);
    this.notify();
    return { success: true, message: `Beralih ke akun ${admin.name}.`, admin };
  }

  addAdminUser(adminData) {
    if (!this.state.adminUsers) this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));
    const username = (adminData.username || '').trim().toLowerCase();
    const name = (adminData.name || '').trim();
    const password = (adminData.password || 'admin123').trim();

    if (!name || !username || !password) return { success: false, message: 'Nama, username, dan password wajib diisi.' };
    if (this.state.adminUsers.some(a => a.username.toLowerCase() === username)) {
      return { success: false, message: `Username "${username}" sudah digunakan.` };
    }

    const newAdmin = {
      id: `ADM-${Date.now()}`,
      username,
      password,
      name,
      role: 'ADMIN',
      email: adminData.email || `${username}@stit-if.ac.id`,
      phone: adminData.phone || '082342307414',
      title: adminData.title || 'Staf Administrasi & Keuangan',
      department: adminData.department || 'Biro Keuangan & Administrasi Umum (BAU)',
      nip: adminData.nip || '-',
      avatarText: name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'AD',
      status: 'AKTIF',
      isSuperAdmin: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    this.state.adminUsers.push(newAdmin);
    this.addAuditLog('ADD_ADMIN', newAdmin.name, `Penambahan admin baru: ${newAdmin.name} (@${newAdmin.username}).`);
    this.notify();
    return { success: true, message: `Admin "${name}" berhasil ditambahkan!`, admin: newAdmin };
  }

  updateAdminUser(adminId, updatedFields) {
    const idx = this.state.adminUsers.findIndex(a => a.id === adminId);
    if (idx === -1) return { success: false, message: 'Admin tidak ditemukan.' };
    this.state.adminUsers[idx] = { ...this.state.adminUsers[idx], ...updatedFields };
    if (this.state.adminProfile && this.state.adminProfile.id === adminId) {
      this.state.adminProfile = { ...this.state.adminUsers[idx] };
      this.state.currentUser = { ...this.state.adminUsers[idx], role: 'ADMIN' };
    }
    this.notify();
    return { success: true, message: 'Data admin berhasil diperbarui.' };
  }

  deleteAdminUser(adminId) {
    const target = this.state.adminUsers.find(a => a.id === adminId);
    if (!target) return { success: false, message: 'Admin tidak ditemukan.' };
    if (target.isSuperAdmin) return { success: false, message: 'Super Admin utama tidak dapat dihapus.' };

    this.state.adminUsers = this.state.adminUsers.filter(a => a.id !== adminId);
    if (this.state.adminProfile && this.state.adminProfile.id === adminId) {
      this.setActiveAdmin(this.state.adminUsers[0].id);
    }
    this.notify();
    return { success: true, message: `Admin ${target.name} berhasil dihapus.` };
  }

  registerStudent(studentData) {
    if (!studentData.name) {
      return { success: false, message: 'Nama lengkap wajib diisi.' };
    }
    const existingNim = studentData.nim && this.state.students.find(s => s.nim === studentData.nim);
    if (existingNim) {
      return { success: false, message: `NIM ${studentData.nim} sudah terdaftar di sistem.` };
    }

    const prodiCode = studentData.prodi === 'PIAUD' ? '02' : '01';
    const prodiStudents = this.state.students.filter(s => s.prodi === (studentData.prodi || 'BKPI') && s.nim && s.nim.startsWith('26'));
    const nextSeq = String(prodiStudents.length + 1).padStart(3, '0');
    const nim = studentData.nim || `26${prodiCode}${nextSeq}`;

    const newStudent = {
      nim: nim,
      name: studentData.name.trim(),
      gender: studentData.gender || 'L',
      prodi: studentData.prodi || 'BKPI',
      semester: 1,
      classYear: '2026',
      statusAkademik: 'Aktif',
      scholarshipId: studentData.scholarshipId || 'REGULER',
      jalurOriginal: studentData.jalurOriginal || studentData.scholarshipId || 'Reguler',
      phone: studentData.phone || '-',
      email: studentData.email || `${nim}@mahasiswa.stit-ihsanulfikri.ac.id`,
      username: nim,
      password: studentData.password || '123456'
    };

    this.state.students.unshift(newStudent);

    const invId = `INV-2026-${Date.now().toString().slice(-6)}`;
    const isMitra = ['MITRA', 'GURU_TPA', 'ALUMNI_PONPES', 'BEASISWA_50', 'PRESTASI'].includes(newStudent.scholarshipId);
    const isFree = ['PAUD_LAKI', 'MITRA_GRATIS'].includes(newStudent.scholarshipId);
    const isAsrama = newStudent.scholarshipId === 'ASRAMA';

    const sppDisc = isFree ? 2400000 : (isMitra ? 1200000 : (isAsrama ? 960000 : 0));
    const newInv = {
      id: invId,
      studentNim: newStudent.nim,
      semester: this.state.activeSemester || '2026/2027 Ganjil',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-09-30',
      items: [
        { componentId: 'PENDAFTARAN', name: 'Biaya Pendaftaran PMB 2026', baseAmount: 200000, discount: 0, finalAmount: 200000 },
        { componentId: 'DAFTAR_ULANG', name: 'Biaya Daftar Ulang / Heregistrasi', baseAmount: 450000, discount: 0, finalAmount: 450000 },
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester 1', baseAmount: 2400000, discount: sppDisc, finalAmount: (2400000 - sppDisc) }
      ],
      grossAmount: 3050000,
      totalDiscount: sppDisc,
      netAmount: 3050000 - sppDisc,
      paidAmount: 0,
      status: 'BELUM_BAYAR',
      paymentMethod: null,
      receiptNumber: null,
      paymentDate: null,
      virtualAccount: '1056405743',
      notes: `Tagihan Registrasi Mahasiswa Baru (${newStudent.prodi})`
    };
    this.state.invoices.unshift(newInv);

    this.addAuditLog('REGISTER_STUDENT_SELF', `${newStudent.name} (${newStudent.nim})`, `Registrasi mandiri mahasiswa baru prodi ${newStudent.prodi}.`);
    this.notify();
    return { success: true, message: `Pendaftaran berhasil! NIM Anda: ${newStudent.nim}`, student: newStudent, invoice: newInv };
  }

  addStudent(student) {
    if (!student.nim || !student.name) return { success: false, message: 'NIM dan Nama lengkap wajib diisi.' };
    if (this.state.students.some(s => s.nim === student.nim)) {
      return { success: false, message: `Mahasiswa dengan NIM ${student.nim} sudah terdaftar.` };
    }
    if (!student.username) student.username = student.nim;
    if (!student.password) student.password = '123456';
    if (!student.statusAkademik) student.statusAkademik = 'Aktif';

    this.state.students.unshift(student);

    // Auto create invoice
    const invId = `INV-2026-${Date.now().toString().slice(-6)}`;
    const isMitra = student.scholarshipId === 'MITRA' || student.scholarshipId === 'GURU_TPA' || student.scholarshipId === 'ALUMNI_PONPES' || student.scholarshipId === 'BEASISWA_50' || student.scholarshipId === 'PRESTASI';
    const isFree = student.scholarshipId === 'PAUD_LAKI' || student.scholarshipId === 'MITRA_GRATIS';
    const isAsrama = student.scholarshipId === 'ASRAMA';

    const sppDisc = isFree ? 2400000 : (isMitra ? 1200000 : (isAsrama ? 960000 : 0));
    const newInv = {
      id: invId,
      studentNim: student.nim,
      semester: this.state.activeSemester || '2026/2027 Ganjil',
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-09-15',
      items: [
        { componentId: 'PENDAFTARAN', name: 'Biaya Pendaftaran PMB 2026', baseAmount: 200000, discount: 0, finalAmount: 200000 },
        { componentId: 'DAFTAR_ULANG', name: 'Biaya Daftar Ulang / Heregistrasi', baseAmount: 450000, discount: 0, finalAmount: 450000 },
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2400000, discount: sppDisc, finalAmount: (2400000 - sppDisc) }
      ],
      grossAmount: 3050000,
      totalDiscount: sppDisc,
      netAmount: 3050000 - sppDisc,
      paidAmount: 0,
      status: 'BELUM_BAYAR',
      paymentMethod: null,
      receiptNumber: null,
      paymentDate: null,
      virtualAccount: '1056405743',
      notes: `Tagihan Mahasiswa Baru (${student.prodi})`
    };
    this.state.invoices.unshift(newInv);

    this.addAuditLog('ADD_STUDENT', `${student.name} (${student.nim})`, `Penambahan mahasiswa baru prodi ${student.prodi}.`);
    this.notify();
    return { success: true, message: `Mahasiswa ${student.name} berhasil ditambahkan.` };
  }

  updateStudent(nim, updatedFields) {
    const idx = this.state.students.findIndex(s => s.nim === nim);
    if (idx === -1) return { success: false, message: 'Mahasiswa tidak ditemukan.' };
    this.state.students[idx] = { ...this.state.students[idx], ...updatedFields };
    this.notify();
    return { success: true, message: 'Data mahasiswa berhasil diperbarui.' };
  }

  deleteStudent(nim) {
    const stu = this.state.students.find(s => s.nim === nim);
    if (!stu) return { success: false, message: 'Mahasiswa tidak ditemukan.' };
    this.state.students = this.state.students.filter(s => s.nim !== nim);
    this.state.invoices = this.state.invoices.filter(i => i.studentNim !== nim);
    this.state.paymentVerifications = this.state.paymentVerifications.filter(v => v.studentNim !== nim);
    this.notify();
    return { success: true, message: `Mahasiswa ${stu.name} berhasil dihapus.` };
  }

  updateStudentCredentials(oldNim, fields) {
    const student = this.state.students.find(s => s.nim === oldNim);
    if (!student) return { success: false, message: 'Mahasiswa tidak ditemukan.' };
    const newNim = fields.nim ? fields.nim.trim() : oldNim;
    if (newNim !== oldNim && this.state.students.some(s => s.nim === newNim)) {
      return { success: false, message: `NIM ${newNim} sudah digunakan.` };
    }
    student.nim = newNim;
    student.username = fields.username ? fields.username.trim() : (student.username || newNim);
    if (fields.password) student.password = fields.password.trim();
    if (fields.name) student.name = fields.name.trim();
    if (fields.prodi) student.prodi = fields.prodi;
    if (fields.scholarshipId) student.scholarshipId = fields.scholarshipId;
    if (fields.phone) student.phone = fields.phone.trim();
    if (fields.email) student.email = fields.email.trim();

    if (newNim !== oldNim) {
      this.state.invoices.forEach(i => { if (i.studentNim === oldNim) i.studentNim = newNim; });
      this.state.paymentVerifications.forEach(v => { if (v.studentNim === oldNim) v.studentNim = newNim; });
      if (this.state.currentUser && this.state.currentUser.nim === oldNim) {
        this.state.currentUser.nim = newNim;
      }
    }
    this.notify();
    return { success: true, message: `Kredensial ${student.name} berhasil diperbarui.` };
  }

  // Payment Actions
  verifyPayment(verificationId) {
    const verif = this.state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan.' };

    verif.status = 'APPROVED';
    verif.verifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    verif.verifiedBy = this.state.currentUser?.name || 'Ustadzah Siti Fatimah, S.E.';
    if (!verif.receiptNumber) {
      verif.receiptNumber = `KW-IF/2026/09/${Date.now().toString().slice(-4)}`;
    }

    const inv = this.state.invoices.find(i => i.id === verif.invoiceId || i.studentNim === verif.studentNim);
    if (inv) {
      inv.paidAmount = Math.min(inv.netAmount, (inv.paidAmount || 0) + verif.amount);
      if (inv.paidAmount >= inv.netAmount) {
        inv.status = STATUS_TAGIHAN.LUNAS;
      } else {
        inv.status = STATUS_TAGIHAN.DICICIL;
      }
      inv.receiptNumber = verif.receiptNumber;
      inv.paymentDate = verif.verifiedAt;
    }

    this.addAuditLog('VERIFY_PAYMENT', `Rp ${verif.amount} (${verif.studentNim})`, `Persetujuan bukti bayar & penerbitan kwitansi sah.`);
    this.notify();
    return { success: true, message: `Pembayaran sebesar Rp ${verif.amount.toLocaleString('id-ID')} disetujui.` };
  }

  rejectPayment(verificationId, reason = 'Bukti pembayaran tidak terbaca atau mutasi bank tidak ditemukan.') {
    const verif = this.state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan.' };

    verif.status = 'REJECTED';
    verif.rejectedReason = reason;
    verif.verifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    verif.verifiedBy = this.state.currentUser?.name || 'Ustadzah Siti Fatimah, S.E.';

    this.addAuditLog('REJECT_PAYMENT', `Rp ${verif.amount} (${verif.studentNim})`, `Penolakan bukti bayar: ${reason}`);
    this.notify();
    return { success: true, message: 'Pembayaran ditolak.' };
  }

  createCustomPayment(paymentData) {
    const verifId = `VER-${Date.now().toString().slice(-6)}`;
    const student = this.state.students.find(s => s.nim === paymentData.studentNim);
    const studentName = student ? student.name : (paymentData.studentName || 'Mahasiswa');
    const studentProdi = student ? student.prodi : (paymentData.prodi || 'BKPI');

    const newVerif = {
      id: verifId,
      invoiceId: paymentData.invoiceId || null,
      studentNim: paymentData.studentNim,
      studentName: studentName,
      prodi: studentProdi,
      amount: Number(paymentData.amount) || 0,
      paymentType: paymentData.paymentType || 'SPP',
      paymentMethod: paymentData.paymentMethod || 'TRANSFER_BANK_BSI',
      bankDestination: 'Bank BSI 1056405743 an. STIT IHSANUL FIKRI',
      proofImageUrl: paymentData.proofImageUrl || null,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      verifiedAt: null,
      verifiedBy: null,
      status: 'PENDING',
      receiptNumber: null,
      notes: paymentData.notes || 'Pembayaran mandiri via portal mahasiswa'
    };

    this.state.paymentVerifications.unshift(newVerif);
    this.addAuditLog('UPLOAD_PAYMENT', `Rp ${newVerif.amount} (${newVerif.studentNim})`, `Unggah bukti bayar transfer baru.`);
    this.notify();
    return { success: true, message: 'Bukti pembayaran berhasil dikirim untuk verifikasi.', verification: newVerif };
  }

  addAuditLog(action, target, details) {
    if (!this.state.auditLogs) this.state.auditLogs = [];
    this.state.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      action,
      target,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: this.state.currentUser?.name || 'Admin',
      ip: '127.0.0.1'
    });
  }

  // Academic Calendar Mutations
  addAcademicEvent(eventData) {
    const id = eventData.id || `EVT-${Date.now()}`;
    const newEvent = {
      id,
      title: eventData.title || 'Agenda Baru',
      category: eventData.category || 'AKADEMIK',
      startDate: eventData.startDate || new Date().toISOString().split('T')[0],
      endDate: eventData.endDate || eventData.startDate || new Date().toISOString().split('T')[0],
      semester: eventData.semester || this.state.activeSemester,
      location: eventData.location || 'Kampus STIT Ihsanul Fikri',
      description: eventData.description || '',
      isMandatory: !!eventData.isMandatory,
      targetRoles: eventData.targetRoles || ['ALL']
    };

    if (!this.state.academicCalendar) this.state.academicCalendar = [];
    this.state.academicCalendar.push(newEvent);
    this.state.academicCalendar.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    this.notify();
    return newEvent;
  }

  updateAcademicEvent(id, fields) {
    const idx = (this.state.academicCalendar || []).findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.state.academicCalendar[idx] = { ...this.state.academicCalendar[idx], ...fields };
    this.state.academicCalendar.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    this.notify();
    return this.state.academicCalendar[idx];
  }

  deleteAcademicEvent(id) {
    if (!this.state.academicCalendar) return false;
    this.state.academicCalendar = this.state.academicCalendar.filter(e => e.id !== id);
    this.notify();
    return true;
  }

  resetAllData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.notify();
  }
}

export const appState = new StateManager();
