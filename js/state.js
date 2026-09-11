/**
 * SIMPEL-IF Reactive State Manager & Master Data Store
 * STIT Ihsanul Fikri Pabelan Magelang
 * Sinkronisasi Resmi Google Spreadsheet: "REKAP ADMINISTRASI STITIF"
 * BKPI 2026 (gid: 814809663) & PIAUD 2026 (gid: 1770791775)
 */

import { PRODI, STATUS_AKADEMIK, STATUS_TAGIHAN, SCHOLARSHIP_TYPES, USER_ROLES, STANDARD_FEES } from './models.js';

const STORAGE_KEY = 'SIMPEL_IF_STATE_V7_SHEETS_PROD';

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
      studentNim: '2601003',
      semester: '2026/2027 Ganjil',
      overrideType: 'ADDITIONAL_DISCOUNT',
      discountAmount: 240000,
      reason: 'Dispensasi Prestasi Santri Mukim Asrama Terbaik',
      status: 'ACTIVE',
      approvedBy: 'Ustadzah Siti Fatimah, S.E.'
    }
  ],

  googleSheetsMatrix: {
    spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1nqh4jksle3r95PlupTIKve11iUxmg3hSdYOB3NTKp3U/edit?pli=1&gid=814809663#gid=814809663',
    lastSyncTime: '2026-09-11 09:50:00',
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
        "status":  "DAFTAR_ULANG_LUNAS"
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
],
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
],
    seniorRekap: [
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001001",
        "semester6":  "1.200.000",
        "nama":  "Abdullah Azam Robbani",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001002",
        "semester6":  "1.200.000",
        "nama":  "Ahmad Razif Ilham Baihaqi",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001014",
        "semester6":  "1.200.000",
        "nama":  "Fajar Setiyawan",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001015",
        "semester6":  "1.200.000",
        "nama":  "Fazri Fadillah Iskandar",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001018",
        "semester6":  "1.200.000",
        "nama":  "Muhammad Faqih Rabbani",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001019",
        "semester6":  "1.200.000",
        "nama":  "Muhammad Ibadurrahman",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001020",
        "semester6":  "1.200.000",
        "nama":  "Nadya Arifa",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001024",
        "semester6":  "1.200.000",
        "nama":  "Shibaa Mawaddah Shiddiiqoh",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001030",
        "semester6":  "1.200.000",
        "nama":  "Aisyah Shidiqoh",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001033",
        "semester6":  "1.200.000",
        "nama":  "Fauzan Azhima Ramadhan",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "Reguler",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001032",
        "semester6":  "1.200.000",
        "nama":  "Eko Purwanto",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001043",
        "semester6":  "1.200.000",
        "nama":  "Dhiaus Suroya",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "1.500.000",
        "jalur":  "MITRA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "2001029",
        "semester6":  "1.200.000",
        "nama":  "Dwi Anisa Lestari",
        "status":  "LUNAS_WISUDA",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "PIAUD",
        "wisuda":  "-",
        "jalur":  "PAUD_LAKI",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "202486209012",
        "semester6":  "1.200.000",
        "nama":  "Ahmad Fauzi",
        "status":  "AKTIF_BERJALAN",
        "semester3":  "1.200.000"
    },
    {
        "semester5":  "1.200.000",
        "semester2":  "1.200.000",
        "semester8":  "1.200.000",
        "semester4":  "1.200.000",
        "prodi":  "BKPI",
        "wisuda":  "-",
        "jalur":  "ASRAMA",
        "semester7":  "1.200.000",
        "semester1":  "1.200.000",
        "nim":  "202386208005",
        "semester6":  "1.200.000",
        "nama":  "Siti Nurhaliza",
        "status":  "AKTIF_BERJALAN",
        "semester3":  "1.200.000"
    }
]
  },

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
        "phone":  "0823-4540-1032",
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
        "phone":  "0823-4540-4071",
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
        "phone":  "0823-4540-9437",
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
        "phone":  "0823-4540-5147",
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
        "phone":  "0823-4540-2783",
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
        "phone":  "0823-4540-9136",
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
        "phone":  "0823-4540-4730",
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
        "phone":  "0823-4540-8978",
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
        "phone":  "0823-4540-5015",
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
        "phone":  "0823-4540-7437",
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
        "phone":  "0823-4540-5391",
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
        "phone":  "0823-4540-6676",
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
        "phone":  "0823-4540-5022",
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
        "phone":  "0823-4540-3224",
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
        "phone":  "0823-4540-4492",
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
        "phone":  "0823-4540-4051",
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
        "phone":  "0823-4540-4793",
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
        "phone":  "0823-4540-6322",
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
        "phone":  "0823-4540-6914",
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
        "phone":  "0823-4540-5165",
        "email":  "amalia.nur.saadah@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-1929",
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
        "phone":  "0823-4540-5040",
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
        "phone":  "0823-4540-1299",
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
        "phone":  "0823-4540-9825",
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
        "phone":  "0823-4540-2518",
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
        "phone":  "0823-4540-8888",
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
        "phone":  "0823-4540-6038",
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
        "phone":  "0823-4540-9876",
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
        "phone":  "0823-4540-3522",
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
        "phone":  "0823-4540-2070",
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
        "phone":  "0823-4540-3533",
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
        "phone":  "0823-4540-5558",
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
        "phone":  "0823-4540-6169",
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
        "phone":  "0823-4540-5456",
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
        "phone":  "0823-4540-1185",
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
        "phone":  "0823-4540-1654",
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
        "phone":  "0823-4540-8988",
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
        "phone":  "0823-4540-9322",
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
        "phone":  "0823-4540-1134",
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
        "phone":  "0823-4540-6516",
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
        "phone":  "0823-4540-9773",
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
        "phone":  "0823-4540-9576",
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
        "phone":  "0823-4540-5652",
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
        "phone":  "0823-4540-9594",
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
        "phone":  "0823-4540-3201",
        "email":  "zaam.tsafiq.al.azmi@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-2481",
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
        "phone":  "0823-4540-7393",
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
        "phone":  "0823-4540-3893",
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
        "phone":  "0823-4540-2395",
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
        "phone":  "0823-4540-6428",
        "email":  "ruqoyyah.salsabila.daeng.kenang@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-3145",
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
        "phone":  "0823-4540-3360",
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
        "phone":  "0823-4540-1199",
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
        "phone":  "0823-4540-2764",
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
        "phone":  "0823-4540-7713",
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
        "phone":  "0823-4540-3936",
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
        "phone":  "0823-4540-5715",
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
        "phone":  "0823-4540-8682",
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
        "phone":  "0823-4540-6652",
        "email":  "ade.vina.hanituzzulva@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-3376",
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
        "phone":  "0823-4540-9282",
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
        "phone":  "0823-4540-2524",
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
        "phone":  "0823-4540-3561",
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
        "phone":  "0823-4540-5862",
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
        "phone":  "0823-4540-9016",
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
        "phone":  "0823-4540-3453",
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
        "phone":  "0823-4540-4965",
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
        "phone":  "0823-4540-9805",
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
        "phone":  "0823-4540-3842",
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
        "phone":  "0823-4540-4765",
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
        "phone":  "0823-4540-7352",
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
        "phone":  "0823-4540-9979",
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
        "phone":  "0823-4540-1383",
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
        "phone":  "0823-4540-9370",
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
        "phone":  "0823-4540-8846",
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
        "phone":  "0823-4540-2963",
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
        "phone":  "0823-4540-9774",
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
        "phone":  "0823-4540-3711",
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
        "phone":  "0823-4540-5310",
        "email":  "pompi.hartiwi@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-9017",
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
        "phone":  "0823-4540-1120",
        "email":  "ulya.dwi.kurniawati@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2602040",
        "name":  "Arif Fradina",
        "gender":  "P",
        "prodi":  "PIAUD",
        "semester":  1,
        "classYear":  "2026",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "Kerjasama Mitra",
        "phone":  "0823-4540-1787",
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
        "phone":  "0823-4540-1636",
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
        "phone":  "0823-4540-8566",
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
        "phone":  "0823-4540-5551",
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
        "phone":  "0823-4540-7093",
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
        "phone":  "0823-4540-8694",
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
        "phone":  "0823-4540-9714",
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
        "phone":  "0823-4540-6138",
        "email":  "fatimah.rahmawati@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-8425",
        "email":  "garwita.felda.nabiha@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-5966",
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
        "phone":  "0823-4540-5029",
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
        "phone":  "0823-4540-2551",
        "email":  "rizqi.machfirotun.nimah@mahasiswa.stit-ihsanulfikri.ac.id"
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
        "phone":  "0823-4540-8799",
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
        "phone":  "0823-4540-7797",
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
        "phone":  "0823-4540-1011",
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
        "phone":  "0823-4540-6139",
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
        "phone":  "0823-4540-5052",
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
        "phone":  "0823-4540-2730",
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
        "phone":  "0823-4540-6507",
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
        "phone":  "0823-4540-4900",
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
        "phone":  "0823-4540-2362",
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
        "phone":  "0823-4540-4030",
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
        "phone":  "0823-4540-7227",
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
        "phone":  "0823-4540-9718",
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
        "phone":  "0823-4540-5952",
        "email":  "gita.gustiani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001001",
        "name":  "Abdullah Azam Robbani",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-2802",
        "email":  "abdullah.azam.robbani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001002",
        "name":  "Ahmad Razif Ilham Baihaqi",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-8473",
        "email":  "ahmad.razif.ilham.baihaqi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001014",
        "name":  "Fajar Setiyawan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-1600",
        "email":  "fajar.setiyawan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001015",
        "name":  "Fazri Fadillah Iskandar",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-8775",
        "email":  "fazri.fadillah.iskandar@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001018",
        "name":  "Muhammad Faqih Rabbani",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-8274",
        "email":  "muhammad.faqih.rabbani@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001019",
        "name":  "Muhammad Ibadurrahman",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-6072",
        "email":  "muhammad.ibadurrahman@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001020",
        "name":  "Nadya Arifa",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-1371",
        "email":  "nadya.arifa@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001024",
        "name":  "Shibaa Mawaddah Shiddiiqoh",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-7536",
        "email":  "shibaa.mawaddah.shiddiiqoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001030",
        "name":  "Aisyah Shidiqoh",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-5432",
        "email":  "aisyah.shidiqoh@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001033",
        "name":  "Fauzan Azhima Ramadhan",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-7504",
        "email":  "fauzan.azhima.ramadhan@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001032",
        "name":  "Eko Purwanto",
        "gender":  "L",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "Reguler",
        "phone":  "0812-3456-7084",
        "email":  "eko.purwanto@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001043",
        "name":  "Dhiaus Suroya",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-4302",
        "email":  "dhiaus.suroya@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "2001029",
        "name":  "Dwi Anisa Lestari",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "MITRA",
        "jalurOriginal":  "MITRA",
        "phone":  "0812-3456-9719",
        "email":  "dwi.anisa.lestari@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202486209012",
        "name":  "Ahmad Fauzi",
        "gender":  "L",
        "prodi":  "PIAUD",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "PAUD_LAKI",
        "phone":  "0812-3456-8602",
        "email":  "ahmad.fauzi@mahasiswa.stit-ihsanulfikri.ac.id"
    },
    {
        "nim":  "202386208005",
        "name":  "Siti Nurhaliza",
        "gender":  "P",
        "prodi":  "BKPI",
        "semester":  8,
        "classYear":  "2020",
        "statusAkademik":  "Aktif",
        "scholarshipId":  "REGULER",
        "jalurOriginal":  "ASRAMA",
        "phone":  "0812-3456-3411",
        "email":  "siti.nurhaliza@mahasiswa.stit-ihsanulfikri.ac.id"
    }
],
  invoices: [
    {
        "id":  "INV-2026-BKPI-1001",
        "studentNim":  "2601001",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1001",
        "paymentDate":  "02/02/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Alumni ponpes)"
    },
    {
        "id":  "INV-2026-BKPI-1002",
        "studentNim":  "2601002",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1002",
        "paymentDate":  "31/03/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Guru TPA)"
    },
    {
        "id":  "INV-2026-BKPI-1003",
        "studentNim":  "2601003",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1003",
        "paymentDate":  "17/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1004",
        "studentNim":  "2601004",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1004",
        "paymentDate":  "18/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Guru TPA)"
    },
    {
        "id":  "INV-2026-BKPI-1005",
        "studentNim":  "2601005",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1005",
        "paymentDate":  "19/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Guru TPA)"
    },
    {
        "id":  "INV-2026-BKPI-1006",
        "studentNim":  "2601006",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Alumni ponpes)"
    },
    {
        "id":  "INV-2026-BKPI-1007",
        "studentNim":  "2601007",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1007",
        "paymentDate":  "25/02/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1008",
        "studentNim":  "2601008",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1009",
        "studentNim":  "2601009",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1010",
        "studentNim":  "2601010",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1010",
        "paymentDate":  "27/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1011",
        "studentNim":  "2601011",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1011",
        "paymentDate":  "24/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1012",
        "studentNim":  "2601012",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1013",
        "studentNim":  "2601013",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Reguler)"
    },
    {
        "id":  "INV-2026-BKPI-1014",
        "studentNim":  "2601014",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1015",
        "studentNim":  "2601015",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1015",
        "paymentDate":  "01/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1016",
        "studentNim":  "2601016",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1016",
        "paymentDate":  "29/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1017",
        "studentNim":  "2601017",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1017",
        "paymentDate":  "01/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-BKPI-1018",
        "studentNim":  "2601018",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-BKPI-1019",
        "studentNim":  "2601019",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1019",
        "paymentDate":  "06/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Guru TPA)"
    },
    {
        "id":  "INV-2026-BKPI-1020",
        "studentNim":  "2601020",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1020",
        "paymentDate":  "23/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1021",
        "studentNim":  "2601021",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1022",
        "studentNim":  "2601022",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1022",
        "paymentDate":  "13/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1023",
        "studentNim":  "2601023",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1024",
        "studentNim":  "2601024",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1024",
        "paymentDate":  "30/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1025",
        "studentNim":  "2601025",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1025",
        "paymentDate":  "08/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1026",
        "studentNim":  "2601026",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1026",
        "paymentDate":  "08/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjamasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1027",
        "studentNim":  "2601027",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1028",
        "studentNim":  "2601028",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1028",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1029",
        "studentNim":  "2601029",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1029",
        "paymentDate":  "30/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1030",
        "studentNim":  "2601030",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1030",
        "paymentDate":  "03/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1031",
        "studentNim":  "2601031",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1032",
        "studentNim":  "2601032",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Reguler)"
    },
    {
        "id":  "INV-2026-BKPI-1033",
        "studentNim":  "2601033",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1033",
        "paymentDate":  "08/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Reguler)"
    },
    {
        "id":  "INV-2026-BKPI-1034",
        "studentNim":  "2601034",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-BKPI-1035",
        "studentNim":  "2601035",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1038",
        "studentNim":  "2601038",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1038",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1039",
        "studentNim":  "2601039",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1039",
        "paymentDate":  "28/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1040",
        "studentNim":  "2601040",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/1040",
        "paymentDate":  "03/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-2036",
        "studentNim":  "2602036",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2036",
        "paymentDate":  "18/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-2037",
        "studentNim":  "2602037",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-BKPI-1041",
        "studentNim":  "2601041",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1042",
        "studentNim":  "2601042",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-BKPI-1043",
        "studentNim":  "2601043",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-BKPI-1044",
        "studentNim":  "2601044",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Beasiswa 50%)"
    },
    {
        "id":  "INV-2026-BKPI-1045",
        "studentNim":  "2601045",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 BKPI (Siswa Berprestasi)"
    },
    {
        "id":  "INV-2026-PIAUD-2001",
        "studentNim":  "2602001",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2001",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2002",
        "studentNim":  "2602002",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2002",
        "paymentDate":  "30/03/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2003",
        "studentNim":  "2602003",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2003",
        "paymentDate":  "21/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2004",
        "studentNim":  "2602004",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2004",
        "paymentDate":  "27/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Alumni Ponpes)"
    },
    {
        "id":  "INV-2026-PIAUD-2005",
        "studentNim":  "2602005",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2005",
        "paymentDate":  "29/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (musrif lembaga/ guru tpa)"
    },
    {
        "id":  "INV-2026-PIAUD-2006",
        "studentNim":  "2602006",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2006",
        "paymentDate":  "17/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2007",
        "studentNim":  "2602007",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2007",
        "paymentDate":  "07/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2008",
        "studentNim":  "2602008",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2008",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Guru TPA)"
    },
    {
        "id":  "INV-2026-PIAUD-2009",
        "studentNim":  "2602009",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2009",
        "paymentDate":  "08/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Guru TPA)"
    },
    {
        "id":  "INV-2026-PIAUD-2010",
        "studentNim":  "2602010",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Alumni Ponpes)"
    },
    {
        "id":  "INV-2026-PIAUD-2011",
        "studentNim":  "2602011",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2011",
        "paymentDate":  "20/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (guru TPA)"
    },
    {
        "id":  "INV-2026-PIAUD-2012",
        "studentNim":  "2602012",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2012",
        "paymentDate":  "31/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2013",
        "studentNim":  "2602013",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2013",
        "paymentDate":  "31/07/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2014",
        "studentNim":  "2602014",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2014",
        "paymentDate":  "31/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2016",
        "studentNim":  "2602016",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2016",
        "paymentDate":  "02/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2017",
        "studentNim":  "2602017",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2017",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2018",
        "studentNim":  "2602018",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2018",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2019",
        "studentNim":  "2602019",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2020",
        "studentNim":  "2602020",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2020",
        "paymentDate":  "09/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2021",
        "studentNim":  "2602021",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2021",
        "paymentDate":  "21/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2022",
        "studentNim":  "2602022",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2022",
        "paymentDate":  "01/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2023",
        "studentNim":  "2602023",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2023",
        "paymentDate":  "20/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2024",
        "studentNim":  "2602024",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2024",
        "paymentDate":  "21/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2025",
        "studentNim":  "2602025",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2026",
        "studentNim":  "2602026",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2026",
        "paymentDate":  "13/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2027",
        "studentNim":  "2602027",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2027",
        "paymentDate":  "17/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2028",
        "studentNim":  "2602028",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2028",
        "paymentDate":  "07/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2029",
        "studentNim":  "2602029",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2029",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2030",
        "studentNim":  "2602030",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2030",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2031",
        "studentNim":  "2602031",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2031",
        "paymentDate":  "27/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2032",
        "studentNim":  "2602032",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2032",
        "paymentDate":  "25/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2033",
        "studentNim":  "2602033",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2033",
        "paymentDate":  "24/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2034",
        "studentNim":  "2602034",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2034",
        "paymentDate":  "22/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2035",
        "studentNim":  "2602035",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2035",
        "paymentDate":  "22/8/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2038",
        "studentNim":  "2602038",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2038",
        "paymentDate":  "15/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Reguler)"
    },
    {
        "id":  "INV-2026-PIAUD-2039",
        "studentNim":  "2602039",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2040",
        "studentNim":  "2602040",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2040",
        "paymentDate":  "29/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2041",
        "studentNim":  "2602041",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2041",
        "paymentDate":  "24/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2042",
        "studentNim":  "2602042",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2042",
        "paymentDate":  "29/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2043",
        "studentNim":  "2602043",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2043",
        "paymentDate":  "01/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2044",
        "studentNim":  "2602044",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2045",
        "studentNim":  "2602045",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Paud Laki-laki)"
    },
    {
        "id":  "INV-2026-PIAUD-2046",
        "studentNim":  "2602046",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2047",
        "studentNim":  "2602047",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2015",
        "studentNim":  "2602015",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2015",
        "paymentDate":  "29/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Beasiswa Asrama)"
    },
    {
        "id":  "INV-2026-PIAUD-2048",
        "studentNim":  "2602048",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2049",
        "studentNim":  "2602049",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2050",
        "studentNim":  "2602050",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2051",
        "studentNim":  "2602051",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2051",
        "paymentDate":  "01/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra  (Pabelan) Gratis)"
    },
    {
        "id":  "INV-2026-PIAUD-2052",
        "studentNim":  "2602052",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2053",
        "studentNim":  "2602053",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2053",
        "paymentDate":  "02/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2054",
        "studentNim":  "2602054",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2054",
        "paymentDate":  "31/08/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Paud Laki-laki)"
    },
    {
        "id":  "INV-2026-PIAUD-2055",
        "studentNim":  "2602055",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "receiptNumber":  "KW-IF/2026/08/2055",
        "paymentDate":  "02/09/26",
        "virtualAccount":  "1056405743",
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2056",
        "studentNim":  "2602056",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2057",
        "studentNim":  "2602057",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2058",
        "studentNim":  "2602058",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2059",
        "studentNim":  "2602059",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2060",
        "studentNim":  "2602060",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2061",
        "studentNim":  "2602061",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2062",
        "studentNim":  "2602062",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Kerjasama Mitra)"
    },
    {
        "id":  "INV-2026-PIAUD-2063",
        "studentNim":  "2602063",
        "semester":  "2026/2027 Ganjil",
        "createdDate":  "2026-08-01",
        "dueDate":  "2026-09-30",
        "items":  [
                      {
                          "discount":  0,
                          "baseAmount":  200000,
                          "name":  "Biaya Pendaftaran \u0026 Formulir PMB 2026",
                          "finalAmount":  200000,
                          "componentId":  "PENDAFTARAN"
                      },
                      {
                          "discount":  0,
                          "baseAmount":  450000,
                          "name":  "Biaya Daftar Ulang / Heregistrasi PMB",
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
        "notes":  "Pendaftaran PMB 2026 PIAUD (Reguler)"
    }
],
  paymentVerifications: [
    {
        "id":  "VER-BKPI-2601001",
        "invoiceId":  "INV-2026-BKPI-1001",
        "studentNim":  "2601001",
        "studentName":  "Miftahul Jannah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1001",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601002",
        "invoiceId":  "INV-2026-BKPI-1002",
        "studentNim":  "2601002",
        "studentName":  "Aifah Ruslan",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1002",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601003",
        "invoiceId":  "INV-2026-BKPI-1003",
        "studentNim":  "2601003",
        "studentName":  "Hamzah Habiburrohman",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1003",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601004",
        "invoiceId":  "INV-2026-BKPI-1004",
        "studentNim":  "2601004",
        "studentName":  "Faza Ainaya Abqariyah",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1004",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601005",
        "invoiceId":  "INV-2026-BKPI-1005",
        "studentNim":  "2601005",
        "studentName":  "Aisyi Saadah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1005",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601007",
        "invoiceId":  "INV-2026-BKPI-1007",
        "studentNim":  "2601007",
        "studentName":  "Aldi Baitur Rahman",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1007",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601010",
        "invoiceId":  "INV-2026-BKPI-1010",
        "studentNim":  "2601010",
        "studentName":  "Naila Azkiya",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1010",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601011",
        "invoiceId":  "INV-2026-BKPI-1011",
        "studentNim":  "2601011",
        "studentName":  "Darwati",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1011",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601015",
        "invoiceId":  "INV-2026-BKPI-1015",
        "studentNim":  "2601015",
        "studentName":  "Yuly Hermawan Susilo",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1015",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601016",
        "invoiceId":  "INV-2026-BKPI-1016",
        "studentNim":  "2601016",
        "studentName":  "Ngarifatun Thoyibah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1016",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601017",
        "invoiceId":  "INV-2026-BKPI-1017",
        "studentNim":  "2601017",
        "studentName":  "Eva Fitriyaningsih",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1017",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601019",
        "invoiceId":  "INV-2026-BKPI-1019",
        "studentNim":  "2601019",
        "studentName":  "Pramundari",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1019",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601020",
        "invoiceId":  "INV-2026-BKPI-1020",
        "studentNim":  "2601020",
        "studentName":  "Amalia Nur Sa\u0027adah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1020",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601022",
        "invoiceId":  "INV-2026-BKPI-1022",
        "studentNim":  "2601022",
        "studentName":  "Haning Pramesti",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1022",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601024",
        "invoiceId":  "INV-2026-BKPI-1024",
        "studentNim":  "2601024",
        "studentName":  "Niken Wahyu Ningsih",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1024",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601025",
        "invoiceId":  "INV-2026-BKPI-1025",
        "studentNim":  "2601025",
        "studentName":  "Hamidah",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1025",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601026",
        "invoiceId":  "INV-2026-BKPI-1026",
        "studentNim":  "2601026",
        "studentName":  "Samsul Sutopo Slamet",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1026",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601028",
        "invoiceId":  "INV-2026-BKPI-1028",
        "studentNim":  "2601028",
        "studentName":  "Arif Wibowo",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1028",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601029",
        "invoiceId":  "INV-2026-BKPI-1029",
        "studentNim":  "2601029",
        "studentName":  "Nensy Anggriani Ningsih",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1029",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601030",
        "invoiceId":  "INV-2026-BKPI-1030",
        "studentNim":  "2601030",
        "studentName":  "Khusnul Khotimah",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1030",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601033",
        "invoiceId":  "INV-2026-BKPI-1033",
        "studentNim":  "2601033",
        "studentName":  "Khoiru Zidan",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1033",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601038",
        "invoiceId":  "INV-2026-BKPI-1038",
        "studentNim":  "2601038",
        "studentName":  "Habibah Rasyidah",
        "prodi":  "BKPI",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1038",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601039",
        "invoiceId":  "INV-2026-BKPI-1039",
        "studentNim":  "2601039",
        "studentName":  "Sri Yani",
        "prodi":  "BKPI",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1039",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2601040",
        "invoiceId":  "INV-2026-BKPI-1040",
        "studentNim":  "2601040",
        "studentName":  "Ayu Rosmaidah",
        "prodi":  "BKPI",
        "amount":  450000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/1040",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-BKPI-2602036",
        "invoiceId":  "INV-2026-BKPI-2036",
        "studentNim":  "2602036",
        "studentName":  "Fina Margaria",
        "prodi":  "BKPI",
        "amount":  1850000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2036",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602001",
        "invoiceId":  "INV-2026-PIAUD-2001",
        "studentNim":  "2602001",
        "studentName":  "Erlisa Rita Novika",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2001",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602002",
        "invoiceId":  "INV-2026-PIAUD-2002",
        "studentNim":  "2602002",
        "studentName":  "Choiriyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2002",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602003",
        "invoiceId":  "INV-2026-PIAUD-2003",
        "studentNim":  "2602003",
        "studentName":  "Dian Kartika Sari",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2003",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602004",
        "invoiceId":  "INV-2026-PIAUD-2004",
        "studentNim":  "2602004",
        "studentName":  "Rana Fauziyyah",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2004",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602005",
        "invoiceId":  "INV-2026-PIAUD-2005",
        "studentNim":  "2602005",
        "studentName":  "Ruqoyyah Salsabila Daeng Ke\u0027nang",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2005",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602006",
        "invoiceId":  "INV-2026-PIAUD-2006",
        "studentNim":  "2602006",
        "studentName":  "Fatimah Nur Islamiah",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2006",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602007",
        "invoiceId":  "INV-2026-PIAUD-2007",
        "studentNim":  "2602007",
        "studentName":  "Mustofiah",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2007",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602008",
        "invoiceId":  "INV-2026-PIAUD-2008",
        "studentNim":  "2602008",
        "studentName":  "Iriani",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2008",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602009",
        "invoiceId":  "INV-2026-PIAUD-2009",
        "studentNim":  "2602009",
        "studentName":  "Suyani",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2009",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602011",
        "invoiceId":  "INV-2026-PIAUD-2011",
        "studentNim":  "2602011",
        "studentName":  "Izazah Zulaikha",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2011",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602012",
        "invoiceId":  "INV-2026-PIAUD-2012",
        "studentNim":  "2602012",
        "studentName":  "Siti Anifah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2012",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602013",
        "invoiceId":  "INV-2026-PIAUD-2013",
        "studentNim":  "2602013",
        "studentName":  "Tria Annisa Nurjanah",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2013",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602014",
        "invoiceId":  "INV-2026-PIAUD-2014",
        "studentNim":  "2602014",
        "studentName":  "Ade Vina Hanituzzulva",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2014",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602016",
        "invoiceId":  "INV-2026-PIAUD-2016",
        "studentNim":  "2602016",
        "studentName":  "Mei Lestiyana",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2016",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602017",
        "invoiceId":  "INV-2026-PIAUD-2017",
        "studentNim":  "2602017",
        "studentName":  "Nabila Nurlia Sari",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2017",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602018",
        "invoiceId":  "INV-2026-PIAUD-2018",
        "studentNim":  "2602018",
        "studentName":  "Inda Laila Sari",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2018",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602020",
        "invoiceId":  "INV-2026-PIAUD-2020",
        "studentNim":  "2602020",
        "studentName":  "Yuliantun",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2020",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602021",
        "invoiceId":  "INV-2026-PIAUD-2021",
        "studentNim":  "2602021",
        "studentName":  "Siti Puniah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2021",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602022",
        "invoiceId":  "INV-2026-PIAUD-2022",
        "studentNim":  "2602022",
        "studentName":  "Atika Mardiyanti Putri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2022",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602023",
        "invoiceId":  "INV-2026-PIAUD-2023",
        "studentNim":  "2602023",
        "studentName":  "Nginayatul Khabibah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2023",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602024",
        "invoiceId":  "INV-2026-PIAUD-2024",
        "studentNim":  "2602024",
        "studentName":  "Umi Mintarti Amilatun",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2024",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602026",
        "invoiceId":  "INV-2026-PIAUD-2026",
        "studentNim":  "2602026",
        "studentName":  "Risma Pradesta Suradiyanto",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2026",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602027",
        "invoiceId":  "INV-2026-PIAUD-2027",
        "studentNim":  "2602027",
        "studentName":  "Siti Rokhaniyah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2027",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602028",
        "invoiceId":  "INV-2026-PIAUD-2028",
        "studentNim":  "2602028",
        "studentName":  "Umi Farida",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2028",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602029",
        "invoiceId":  "INV-2026-PIAUD-2029",
        "studentNim":  "2602029",
        "studentName":  "Salafiyah",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2029",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602030",
        "invoiceId":  "INV-2026-PIAUD-2030",
        "studentNim":  "2602030",
        "studentName":  "Alvia Musayyida",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2030",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602031",
        "invoiceId":  "INV-2026-PIAUD-2031",
        "studentNim":  "2602031",
        "studentName":  "Yasmina Syahriza",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2031",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602032",
        "invoiceId":  "INV-2026-PIAUD-2032",
        "studentNim":  "2602032",
        "studentName":  "Jeklynda May Sarah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2032",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602033",
        "invoiceId":  "INV-2026-PIAUD-2033",
        "studentNim":  "2602033",
        "studentName":  "Nuryanti",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2033",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602034",
        "invoiceId":  "INV-2026-PIAUD-2034",
        "studentNim":  "2602034",
        "studentName":  "Slamet Kholifah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2034",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602035",
        "invoiceId":  "INV-2026-PIAUD-2035",
        "studentNim":  "2602035",
        "studentName":  "Pompi Hartiwi",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2035",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602038",
        "invoiceId":  "INV-2026-PIAUD-2038",
        "studentNim":  "2602038",
        "studentName":  "Rahma Lestari",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2038",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602040",
        "invoiceId":  "INV-2026-PIAUD-2040",
        "studentNim":  "2602040",
        "studentName":  "Arif Fradina",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2040",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602041",
        "invoiceId":  "INV-2026-PIAUD-2041",
        "studentNim":  "2602041",
        "studentName":  "Warsidah",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2041",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602042",
        "invoiceId":  "INV-2026-PIAUD-2042",
        "studentNim":  "2602042",
        "studentName":  "Winda Apriliani Putri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2042",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602043",
        "invoiceId":  "INV-2026-PIAUD-2043",
        "studentNim":  "2602043",
        "studentName":  "Hikmatul Fitroh",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2043",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602015",
        "invoiceId":  "INV-2026-PIAUD-2015",
        "studentNim":  "2602015",
        "studentName":  "Garwita Felda Nabiha",
        "prodi":  "PIAUD",
        "amount":  650000,
        "paymentType":  "DAFTAR_ULANG",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2015",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602051",
        "invoiceId":  "INV-2026-PIAUD-2051",
        "studentNim":  "2602051",
        "studentName":  "Hanifah Rahmawati",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2051",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602053",
        "invoiceId":  "INV-2026-PIAUD-2053",
        "studentNim":  "2602053",
        "studentName":  "Endang Elyana",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2053",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602054",
        "invoiceId":  "INV-2026-PIAUD-2054",
        "studentNim":  "2602054",
        "studentName":  "Muhammad Nanang Nasikin",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2054",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    },
    {
        "id":  "VER-PIAUD-2602055",
        "invoiceId":  "INV-2026-PIAUD-2055",
        "studentNim":  "2602055",
        "studentName":  "Prapti Budi Sulastri",
        "prodi":  "PIAUD",
        "amount":  200000,
        "paymentType":  "PENDAFTARAN",
        "paymentMethod":  "TRANSFER_BANK_BSI",
        "bankDestination":  "Bank BSI 1056405743 an. STIT IHSANUL FIKRI",
        "proofImageUrl":  null,
        "submittedAt":  "2026-08-25 10:00:00",
        "verifiedAt":  "2026-08-25 14:00:00",
        "verifiedBy":  "Ustadzah Siti Fatimah, S.E.",
        "status":  "APPROVED",
        "receiptNumber":  "KW-IF/2026/08/2055",
        "notes":  "Verifikasi Rekap Bank BSI STIT-IF"
    }
],

  academicCalendar: [
    {
      id: 'EVT-001',
      title: 'Penerimaan Mahasiswa Baru (PMB) Gelombang Utama',
      category: 'PMB',
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT-IF & Online Portal',
      description: 'Pendaftaran mahasiswa baru prodi BKPI dan PIAUD serta verifikasi berkas beasiswa.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-002',
      title: 'Batas Akhir Heregistrasi & Daftar Ulang (Rp 450.000)',
      category: 'FINANSIAL',
      startDate: '2026-09-01',
      endDate: '2026-09-15',
      semester: '2026/2027 Ganjil',
      location: 'Bank BSI 1056405743 / Bendahara',
      description: 'Pelunasan biaya heregistrasi mahasiswa baru dan pengisian KRS.',
      isMandatory: true,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-003',
      title: 'Kuliah Perdana & Taaruf Kampus (OSPEK)',
      category: 'AKADEMIK',
      startDate: '2026-09-21',
      endDate: '2026-09-23',
      semester: '2026/2027 Ganjil',
      location: 'Auditorium Kampus STIT Ihsanul Fikri',
      description: 'Pembukaan tahun akademik baru 2026/2027 dan stadium generale.',
      isMandatory: true,
      targetRoles: ['MAHASISWA']
    },
    {
      id: 'EVT-004',
      title: 'Batas Pelunasan SPP Tahap 1 (50%)',
      category: 'FINANSIAL',
      startDate: '2026-10-15',
      endDate: '2026-10-15',
      semester: '2026/2027 Ganjil',
      location: 'Sistem Pembayaran SIMPEL-IF',
      description: 'Batas akhir pembayaran SPP tahap pertama sebelum UTS.',
      isMandatory: true,
      targetRoles: ['MAHASISWA', 'ADMIN']
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
      // Clear legacy storage keys to prevent stale or corrupted data
      ['simpel_if_state', 'SIMPEL_IF_STATE_V1', 'SIMPEL_IF_STATE_V2', 'SIMPEL_IF_STATE_V3', 'SIMPEL_IF_STATE_V4', 'SIMPEL_IF_STATE_V5', 'SIMPEL_IF_STATE_V6_PROD'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        // Ensure student records and sheets matrix are complete
        if (!this.state.students || this.state.students.length < 100 || !this.state.googleSheetsMatrix || !this.state.googleSheetsMatrix.bkpi2026 || !this.state.scholarshipSchemes) {
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
      const targetNim = customStudentNim || (this.state.students && this.state.students[0] ? this.state.students[0].nim : '202602001');
      const student = (this.state.students && this.state.students.find(s => s.nim === targetNim)) || (this.state.students && this.state.students[0]);
      if (student) {
        this.state.currentUser = {
          id: `MHS-${student.nim}`,
          name: student.name,
          role: 'MAHASISWA',
          email: student.email,
          avatarText: student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
          prodi: student.prodi,
          nim: student.nim,
          scholarshipId: student.scholarshipId,
          semester: student.semester
        };
      }
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
      id: `ADM-${String(this.state.adminUsers.length + 1).padStart(3, '0')}`,
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
    return { success: true, message: `Admin "${newAdmin.name}" berhasil ditambahkan!`, admin: newAdmin };
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

    const prodiCode = studentData.prodi === 'PIAUD' ? '01' : '02';
    const prodiStudents = (this.state.students || []).filter(s => s.prodi === (studentData.prodi || 'BKPI') && s.nim && String(s.nim).startsWith('2026'));
    const nextSeq = String(prodiStudents.length + 1).padStart(3, '0');
    const nim = studentData.nim || `2026${prodiCode}${nextSeq}`;

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

    const invId = `INV-2026-${newStudent.prodi}-${String(newStudent.nim).slice(-4)}`;
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
    const invId = `INV-2026-${student.prodi || 'BKPI'}-${String(student.nim).slice(-4)}`;
    const isMitra = ['MITRA', 'GURU_TPA', 'ALUMNI_PONPES', 'BEASISWA_50', 'PRESTASI'].includes(student.scholarshipId);
    const isFree = ['PAUD_LAKI', 'MITRA_GRATIS'].includes(student.scholarshipId);
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
      notes: `Tagihan Mahasiswa Baru (${student.prodi || 'STIT-IF'})`
    };
    this.state.invoices.unshift(newInv);

    this.addAuditLog('ADD_STUDENT', `${student.name} (${student.nim})`, `Penambahan mahasiswa baru prodi ${student.prodi || 'BKPI'}.`);
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
      verif.receiptNumber = `KW-IF/2026/09/${String(verif.studentNim).slice(-4)}`;
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

    this.addAuditLog('VERIFY_PAYMENT', `Rp ${verif.amount} (${verif.studentNim})`, 'Persetujuan bukti bayar & penerbitan kwitansi sah.');
    this.notify();
    return { success: true, message: `Pembayaran sebesar Rp ${verif.amount} disetujui.` };
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
    const verifId = `VER-MANDIRI-${Date.now()}`;
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
    this.addAuditLog('UPLOAD_PAYMENT', `Rp ${newVerif.amount} (${newVerif.studentNim})`, 'Unggah bukti bayar transfer baru.');
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
