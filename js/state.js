/**
 * SIMPEL-IF Reactive State Manager & Seed Data Store
 * STIT Ihsanul Fikri
 */

import { PRODI, STATUS_AKADEMIK, STATUS_TAGIHAN, SCHOLARSHIP_TYPES, USER_ROLES } from './models.js';

const STORAGE_KEY = 'SIMPEL_IF_STATE_V3';

const INITIAL_SEED_DATA = {
  activeSemester: '2026/2027 Ganjil',
  currentRole: 'ADMIN',
  adminProfile: {
    id: 'ADM-001',
    username: 'admin',
    name: 'Ustadzah Siti Fatimah, S.E.',
    role: 'ADMIN',
    email: 'bendahara@stit-if.ac.id',
    phone: '081392817263',
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
      phone: '081392817263',
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
    phone: '081392817263',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    nip: '19840512 201201 2 003',
    avatarText: 'SF',
    prodi: 'Bendahara Penerimaan',
    status: 'AKTIF',
    isSuperAdmin: true
  },

  // Fee Components Configuration
  feeComponents: [
    {
      id: 'SPP',
      name: 'SPP / UKT Pokok Semester',
      category: 'SEMESTER',
      defaultAmount: 2500000,
      description: 'Biaya penyelenggaraan pendidikan reguler per semester',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: true
    },
    {
      id: 'DAFTAR_ULANG',
      name: 'Daftar Ulang / Heregistrasi',
      category: 'SEMESTER',
      defaultAmount: 300000,
      description: 'Administrasi registrasi ulang dan validasi KRS semester aktif',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: false
    },
    {
      id: 'PENDAFTARAN',
      name: 'Biaya Formulir & Orientasi Maba',
      category: 'INITIAL',
      defaultAmount: 350000,
      description: 'Dikenakan sekali saat pertama kali masuk (Semester 1)',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: false
    },
    {
      id: 'WISUDA',
      name: 'Biaya Munaqosyah & Wisuda',
      category: 'FINAL',
      defaultAmount: 2000000,
      description: 'Bimbingan skripsi, ujian munaqosyah, toga, dan ijazah (Semester 7-8)',
      applicableProdi: ['BKPI', 'PIAUD'],
      allowScholarshipDiscount: true
    }
  ],

  // 4 Scholarship Schemes configured by Bendahara
  scholarshipSchemes: [
    {
      id: 'REGULER',
      name: 'Reguler (Tarif Penuh)',
      description: 'Skema reguler penuh tanpa potongan subsidi beasiswa.',
      discountType: 'PERCENT',
      discountValue: 0,
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 4
    },
    {
      id: 'ASRAMA',
      name: 'Beasiswa Asrama Pesantren',
      description: 'Potongan biaya SPP sesuai regulasi mukim santri asrama pesantren Ihsanul Fikri.',
      discountType: 'PERCENT',
      discountValue: 40, // 40% discount on SPP
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 3
    },
    {
      id: 'MITRA',
      name: 'Beasiswa Kerjasama Mitra & Yayasan',
      description: 'Penyesuaian tarif berbasis subsidi MoU instansi mitra dan ormas pembina.',
      discountType: 'FIXED',
      discountValue: 1200000, // Rp 1.200.000 flat subsidy
      targetComponents: ['SPP'],
      eligibleProdi: ['BKPI', 'PIAUD'],
      activeStudentsCount: 3
    },
    {
      id: 'PAUD_LAKI',
      name: 'Beasiswa PAUD Laki-laki (Afirmasi Khusus)',
      description: 'Skema afirmasi khusus putra prodi PIAUD untuk percepatan kader pendidik PAUD pria unggul.',
      discountType: 'PERCENT',
      discountValue: 60, // 60% discount on SPP
      targetComponents: ['SPP'],
      eligibleProdi: ['PIAUD'],
      activeStudentsCount: 3
    }
  ],

  // Individual Overrides & Dispensasi
  individualOverrides: [
    {
      id: 'OVR-001',
      studentNim: '202386208007', // Zaid Al-Faruq
      semester: '2026/2027 Ganjil',
      overrideType: 'ADDITIONAL_DISCOUNT',
      discountAmount: 500000,
      reason: 'Dispensasi Prestasi Tahfidz 15 Juz Tingkat Provinsi',
      status: 'ACTIVE',
      approvedBy: 'Ustadzah Siti Fatimah, S.E.'
    },
    {
      id: 'OVR-002',
      studentNim: '202486208011', // Bilal Al-Habasyi
      semester: '2026/2027 Ganjil',
      overrideType: 'INSTALLMENT_PLAN',
      installmentCount: 2,
      installmentSchedule: [
        { term: 1, amount: 800000, dueDate: '2026-09-15', status: 'PAID' },
        { term: 2, amount: 800000, dueDate: '2026-11-15', status: 'UNPAID' }
      ],
      reason: 'Dispensasi Angsuran 2x Semester Ganjil',
      status: 'ACTIVE',
      approvedBy: 'Ustadzah Siti Fatimah, S.E.'
    }
  ],

  // Master Data Mahasiswa STIT Ihsanul Fikri
  students: [
    {
      nim: '202486209012',
      name: 'Ahmad Fauzi',
      gender: 'L',
      prodi: 'PIAUD',
      semester: 3,
      classYear: '2024',
      statusAkademik: 'Aktif',
      scholarshipId: 'PAUD_LAKI',
      phone: '0812-7389-1029',
      email: 'ahmad.fauzi@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202386208005',
      name: 'Siti Nurhaliza',
      gender: 'P',
      prodi: 'BKPI',
      semester: 5,
      classYear: '2023',
      statusAkademik: 'Aktif',
      scholarshipId: 'ASRAMA',
      phone: '0813-8821-4432',
      email: 'siti.nurhaliza@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202686208001',
      name: 'Muhammad Ihsan Pratama',
      gender: 'L',
      prodi: 'BKPI',
      semester: 1,
      classYear: '2026',
      statusAkademik: 'Aktif',
      scholarshipId: 'REGULER',
      phone: '0852-6712-9901',
      email: 'm.ihsan@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202686209002',
      name: 'Rahmat Hidayatullah',
      gender: 'L',
      prodi: 'PIAUD',
      semester: 1,
      classYear: '2026',
      statusAkademik: 'Aktif',
      scholarshipId: 'PAUD_LAKI',
      phone: '0821-9988-1243',
      email: 'rahmat.h@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202486209008',
      name: 'Fatimah Az-Zahra',
      gender: 'P',
      prodi: 'PIAUD',
      semester: 5,
      classYear: '2024',
      statusAkademik: 'Aktif',
      scholarshipId: 'MITRA',
      phone: '0813-6671-8890',
      email: 'fatimah.az@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202586208014',
      name: 'Aisyah Putri Rahmadani',
      gender: 'P',
      prodi: 'BKPI',
      semester: 3,
      classYear: '2025',
      statusAkademik: 'Aktif',
      scholarshipId: 'REGULER',
      phone: '0857-8823-1144',
      email: 'aisyah.putri@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202386208007',
      name: 'Zaid Al-Faruq',
      gender: 'L',
      prodi: 'BKPI',
      semester: 7,
      classYear: '2023',
      statusAkademik: 'Aktif',
      scholarshipId: 'ASRAMA',
      phone: '0812-3344-5566',
      email: 'zaid.alfaruq@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202386209003',
      name: 'Nurul Hidayati',
      gender: 'P',
      prodi: 'PIAUD',
      semester: 7,
      classYear: '2023',
      statusAkademik: 'Aktif',
      scholarshipId: 'ASRAMA',
      phone: '0852-7711-2299',
      email: 'nurul.h@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202486209015',
      name: 'Muhammad Yusuf Al-Khattab',
      gender: 'L',
      prodi: 'PIAUD',
      semester: 3,
      classYear: '2024',
      statusAkademik: 'Aktif',
      scholarshipId: 'PAUD_LAKI',
      phone: '0813-1122-3344',
      email: 'm.yusuf@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202686208003',
      name: 'Khadijah Humaira',
      gender: 'P',
      prodi: 'BKPI',
      semester: 1,
      classYear: '2026',
      statusAkademik: 'Aktif',
      scholarshipId: 'MITRA',
      phone: '0858-9900-1122',
      email: 'khadijah.h@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202486208011',
      name: 'Bilal Al-Habasyi',
      gender: 'L',
      prodi: 'BKPI',
      semester: 5,
      classYear: '2024',
      statusAkademik: 'Aktif',
      scholarshipId: 'MITRA',
      phone: '0821-4455-6677',
      email: 'bilal.h@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202686209004',
      name: 'Maryam Qonita',
      gender: 'P',
      prodi: 'PIAUD',
      semester: 1,
      classYear: '2026',
      statusAkademik: 'Aktif',
      scholarshipId: 'REGULER',
      phone: '0813-5566-7788',
      email: 'maryam.q@mahasiswa.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202286208002',
      name: 'Fikri Haikal',
      gender: 'L',
      prodi: 'BKPI',
      semester: 8,
      classYear: '2022',
      statusAkademik: 'Lulus',
      scholarshipId: 'REGULER',
      phone: '0812-9988-7766',
      email: 'fikri.haikal@alumni.stit-ihsanulfikri.ac.id'
    },
    {
      nim: '202486208019',
      name: 'Hafizhah Al-Anshori',
      gender: 'P',
      prodi: 'BKPI',
      semester: 3,
      classYear: '2024',
      statusAkademik: 'Cuti',
      scholarshipId: 'REGULER',
      phone: '0852-1144-7700',
      email: 'hafizhah.anshori@mahasiswa.stit-ihsanulfikri.ac.id'
    }
  ],

  // Active Semester Invoices (Tagihan)
  invoices: [
    {
      id: 'INV-2026-001',
      studentNim: '202486209012', // Ahmad Fauzi (PIAUD - PAUD Laki-laki)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1500000, finalAmount: 1000000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 }
      ],
      grossAmount: 2800000,
      totalDiscount: 1500000,
      netAmount: 1300000,
      paidAmount: 1300000,
      status: 'LUNAS',
      paymentMethod: 'VA_BSI',
      receiptNumber: 'KW-IF/2026/08/0012',
      paymentDate: '2026-08-15 10:24:00',
      virtualAccount: '1056405743',
      notes: 'Lunas via Virtual Account Bank Syariah Indonesia (Auto-Reconciled)'
    },
    {
      id: 'INV-2026-002',
      studentNim: '202386208005', // Siti Nurhaliza (BKPI - ASRAMA)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1000000, finalAmount: 1500000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 }
      ],
      grossAmount: 2800000,
      totalDiscount: 1000000,
      netAmount: 1800000,
      paidAmount: 0,
      status: 'MENUNGGU_VERIFIKASI',
      paymentMethod: 'TRANSFER_MANUAL',
      receiptNumber: null,
      paymentDate: '2026-08-28 14:10:00',
      virtualAccount: '1056405743',
      notes: 'Bukti transfer manual diunggah oleh mahasiswa, menunggu konfirmasi Bendahara'
    },
    {
      id: 'INV-2026-003',
      studentNim: '202686208001', // Muhammad Ihsan (BKPI Maba - REGULER)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 0, finalAmount: 2500000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 },
        { componentId: 'PENDAFTARAN', name: 'Biaya Formulir & Orientasi Maba', baseAmount: 350000, discount: 0, finalAmount: 350000 }
      ],
      grossAmount: 3150000,
      totalDiscount: 0,
      netAmount: 3150000,
      paidAmount: 0,
      status: 'BELUM_BAYAR',
      paymentMethod: null,
      receiptNumber: null,
      paymentDate: null,
      virtualAccount: '1056405743',
      notes: 'Tagihan semester awal diterbitkan'
    },
    {
      id: 'INV-2026-004',
      studentNim: '202686209002', // Rahmat Hidayatullah (PIAUD Maba - PAUD Laki-laki)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1500000, finalAmount: 1000000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 },
        { componentId: 'PENDAFTARAN', name: 'Biaya Formulir & Orientasi Maba', baseAmount: 350000, discount: 0, finalAmount: 350000 }
      ],
      grossAmount: 3150000,
      totalDiscount: 1500000,
      netAmount: 1650000,
      paidAmount: 1650000,
      status: 'LUNAS',
      paymentMethod: 'VA_BSI',
      receiptNumber: 'KW-IF/2026/08/0014',
      paymentDate: '2026-08-20 09:15:00',
      virtualAccount: '1056405743',
      notes: 'Lunas via Virtual Account Bank Syariah Indonesia'
    },
    {
      id: 'INV-2026-005',
      studentNim: '202486209008', // Fatimah Az-Zahra (PIAUD - MITRA)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1200000, finalAmount: 1300000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 }
      ],
      grossAmount: 2800000,
      totalDiscount: 1200000,
      netAmount: 1600000,
      paidAmount: 1600000,
      status: 'LUNAS',
      paymentMethod: 'VA_BSI',
      receiptNumber: 'KW-IF/2026/08/0015',
      paymentDate: '2026-08-18 16:30:00',
      virtualAccount: '1056405743',
      notes: 'Lunas via BSI Virtual Account'
    },
    {
      id: 'INV-2026-006',
      studentNim: '202586208014', // Aisyah Putri Rahmadani (BKPI - REGULER)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 0, finalAmount: 2500000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 }
      ],
      grossAmount: 2800000,
      totalDiscount: 0,
      netAmount: 2800000,
      paidAmount: 0,
      status: 'BELUM_BAYAR',
      paymentMethod: null,
      receiptNumber: null,
      paymentDate: null,
      virtualAccount: '1056405743',
      notes: 'Menunggu pembayaran'
    },
    {
      id: 'INV-2026-007',
      studentNim: '202386208007', // Zaid Al-Faruq (BKPI - ASRAMA + OVERRIDE TAHFIDZ)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1500000, finalAmount: 1000000 }, // 1.000.000 (Asrama) + 500.000 (Override)
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 },
        { componentId: 'WISUDA', name: 'Biaya Munaqosyah & Wisuda', baseAmount: 2000000, discount: 0, finalAmount: 2000000 }
      ],
      grossAmount: 4800000,
      totalDiscount: 1500000,
      netAmount: 3300000,
      paidAmount: 3300000,
      status: 'LUNAS',
      paymentMethod: 'VA_BSI',
      receiptNumber: 'KW-IF/2026/08/0017',
      paymentDate: '2026-08-25 11:00:00',
      virtualAccount: '1056405743',
      notes: 'Lunas via Virtual Account BSI (Termasuk Override Beasiswa Tahfidz)'
    },
    {
      id: 'INV-2026-008',
      studentNim: '202486208011', // Bilal Al-Habasyi (BKPI - MITRA + DISPENSASI CICILAN)
      semester: '2026/2027 Ganjil',
      createdDate: '2026-08-01',
      dueDate: '2026-09-10',
      items: [
        { componentId: 'SPP', name: 'SPP / UKT Pokok Semester', baseAmount: 2500000, discount: 1200000, finalAmount: 1300000 },
        { componentId: 'DAFTAR_ULANG', name: 'Daftar Ulang / Heregistrasi', baseAmount: 300000, discount: 0, finalAmount: 300000 }
      ],
      grossAmount: 2800000,
      totalDiscount: 1200000,
      netAmount: 1600000,
      paidAmount: 800000,
      status: 'DICICIL',
      paymentMethod: 'TRANSFER_MANUAL',
      receiptNumber: 'KW-IF/2026/08/0018-T1',
      paymentDate: '2026-08-22 13:45:00',
      virtualAccount: '1056405743',
      notes: 'Telah membayar cicilan Termin 1 (Rp 800.000). Sisa Termin 2 (Rp 800.000) jatuh tempo 15 Nov 2026.'
    }
  ],

  // Manual Transfer Verification Queue
  paymentVerifications: [
    {
      id: 'VERIF-001',
      invoiceId: 'INV-2026-002',
      studentNim: '202386208005',
      studentName: 'Siti Nurhaliza',
      prodi: 'BKPI',
      semester: 5,
      scholarshipName: 'Beasiswa Asrama Pesantren',
      amount: 1800000,
      transferDate: '2026-08-28 13:40',
      senderBank: 'Bank BSI (Bank Syariah Indonesia)',
      senderAccountName: 'SITI NURHALIZA',
      senderAccountNumber: '7198293812',
      destinationBank: 'Bank BSI - STIT Ihsanul Fikri (No. Rek 1009827361)',
      proofImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      status: 'PENDING',
      notes: 'Pembayaran SPP + Daftar Ulang Semester 5 (Potongan Asrama 40%)',
      submittedAt: '2026-08-28 14:10:00'
    },
    {
      id: 'VERIF-002',
      invoiceId: 'INV-2026-008',
      studentNim: '202486208011',
      studentName: 'Bilal Al-Habasyi',
      prodi: 'BKPI',
      semester: 5,
      scholarshipName: 'Beasiswa Kerjasama Mitra',
      amount: 800000,
      transferDate: '2026-08-22 12:30',
      senderBank: 'Bank Mandiri',
      senderAccountName: 'BILAL AL HABASYI',
      senderAccountNumber: '1420019283741',
      destinationBank: 'Bank Mandiri - STIT Ihsanul Fikri (No. Rek 1370018273645)',
      proofImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
      status: 'APPROVED',
      notes: 'Pembayaran Termin 1 Dispensasi Cicilan disetujui.',
      submittedAt: '2026-08-22 13:00:00',
      processedAt: '2026-08-22 13:45:00',
      processedBy: 'Ustadzah Siti Fatimah, S.E.'
    }
  ],

  // Comprehensive Audit Trail Log
  auditLogs: [
    {
      id: 'LOG-001',
      timestamp: '2026-08-01 08:30:00',
      userName: 'Ustadz Ridwan Hakim, M.Pd.',
      role: 'AKADEMIK',
      action: 'GENERATE_TAGIHAN_MASSAL',
      entity: 'Tagihan Semester 2026/2027 Ganjil',
      details: 'Penerbitan otomatis tagihan semester baru untuk 12 mahasiswa aktif (BKPI & PIAUD).'
    },
    {
      id: 'LOG-002',
      timestamp: '2026-08-10 10:15:00',
      userName: 'Ustadzah Siti Fatimah, S.E.',
      role: 'BENDAHARA',
      action: 'UPDATE_SKEMA_BEASISWA',
      entity: 'Beasiswa PAUD Laki-laki',
      details: 'Penyesuaian persentase diskon SPP afirmasi khusus putra prodi PIAUD menjadi 60%.'
    },
    {
      id: 'LOG-003',
      timestamp: '2026-08-15 10:24:00',
      userName: 'System Payment Gateway',
      role: 'SYSTEM',
      action: 'PAYMENT_VA_SUCCESS',
      entity: 'INV-2026-001 (Ahmad Fauzi)',
      details: 'Pelunasan tagihan Rp 1.300.000 via BSI Virtual Account #988886209012001. Kwitansi KW-IF/2026/08/0012 diterbitkan.'
    },
    {
      id: 'LOG-004',
      timestamp: '2026-08-18 14:00:00',
      userName: 'Ustadzah Siti Fatimah, S.E.',
      role: 'BENDAHARA',
      action: 'CREATE_OVERRIDE',
      entity: 'Zaid Al-Faruq (NIM: 202386208007)',
      details: 'Penetapan override beasiswa prestasi tahfidz tambahan Rp 500.000 per semester.'
    },
    {
      id: 'LOG-005',
      timestamp: '2026-08-22 13:45:00',
      userName: 'Ustadzah Siti Fatimah, S.E.',
      role: 'BENDAHARA',
      action: 'VERIFY_TRANSFER_APPROVE',
      entity: 'VERIF-002 (Bilal Al-Habasyi)',
      details: 'Persetujuan bukti bayar manual transfer Termin 1 cicilan sebesar Rp 800.000.'
    }
  ],

  // Official Academic Calendar Schedule based on SK.01/051/STIT-IF/VIII/2026 (21 Agustus 2026)
  academicCalendar: [
    // --- SEMESTER GASAL 2026/2027 ---
    {
      id: 'EVT-2026-01',
      title: 'Pembayaran SPP & Heregistrasi Mahasiswa Lama Gasal',
      category: 'KEUANGAN',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      semester: '2026/2027 Ganjil',
      location: 'Online via SIMPEL-IF / Bank BSI (1056405743)',
      description: 'Periode pelunasan/cicilan SPP dan daftar ulang administrasi akademik semester gasal 2026/2027.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-02',
      title: 'Workshop RPS dan Persiapan Mengajar',
      category: 'AKADEMIK',
      startDate: '2026-08-09',
      endDate: '2026-08-09',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Dosen STIT Ihsanul Fikri',
      description: 'Penyelarasan rencana pembelajaran semester dan persiapan materi perkuliahan dosen pengampu.',
      isMandatory: true,
      targetRoles: ['ADMIN']
    },
    {
      id: 'EVT-2026-03',
      title: 'Penyusunan RPS dan Modul',
      category: 'AKADEMIK',
      startDate: '2026-08-10',
      endDate: '2026-08-29',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Penyusunan modul ajar, rubrik asesmen, dan silabus kurikulum program studi BKPI dan PIAUD.',
      isMandatory: false,
      targetRoles: ['ADMIN']
    },
    {
      id: 'EVT-2026-04',
      title: 'Masa Pendaftaran & Her-Registrasi Mahasiswa Baru (PMB)',
      category: 'KEUANGAN',
      startDate: '2026-08-10',
      endDate: '2026-09-05',
      semester: '2026/2027 Ganjil',
      location: 'Kantor BAAK / Portal PMB Online',
      description: 'Penerbitan NIM dan pembayaran paket awal orientasi & SPP mahasiswa baru angkatan 2026.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-05',
      title: 'Pengajuan & Verifikasi Afirmasi Beasiswa Semester Gasal',
      category: 'KEUANGAN',
      startDate: '2026-08-15',
      endDate: '2026-09-10',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Bendahara & BAU STIT Ihsanul Fikri',
      description: 'Batas akhir upload berkas beasiswa Asrama Pesantren, Mitra Lembaga, dan Prestasi Tahfidz.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-06',
      title: 'Hari Kemerdekaan Republik Indonesia Ke-81',
      category: 'LIBUR',
      startDate: '2026-08-17',
      endDate: '2026-08-17',
      semester: '2026/2027 Ganjil',
      location: 'Nasional',
      description: 'Hari libur nasional peringatan Hari Kemerdekaan Republik Indonesia.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-07',
      title: 'Pembekalan PLP dan KKN',
      category: 'KEGIATAN',
      startDate: '2026-08-21',
      endDate: '2026-08-21',
      semester: '2026/2027 Ganjil',
      location: 'Auditorium Utama STIT Ihsanul Fikri',
      description: 'Pengarahan teknis pelaksanaan Pengenalan Lapangan Persekolahan (PLP) & Kuliah Kerja Nyata (KKN).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-08',
      title: 'Maulid Nabi Muhammad SAW',
      category: 'LIBUR',
      startDate: '2026-08-25',
      endDate: '2026-08-25',
      semester: '2026/2027 Ganjil',
      location: 'Nasional / Islam',
      description: 'Hari libur keagamaan peringatan Maulid Nabi Muhammad SAW 1448 H.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-09',
      title: 'Sosialisasi PLP kepada Instansi Mitra',
      category: 'AKADEMIK',
      startDate: '2026-08-28',
      endDate: '2026-08-28',
      semester: '2026/2027 Ganjil',
      location: 'Sekolah & Instansi Mitra',
      description: 'Koordinasi pimpinan prodi dengan pimpinan sekolah mitra magang PLP BKPI dan PIAUD.',
      isMandatory: false,
      targetRoles: ['ADMIN']
    },
    {
      id: 'EVT-2026-10',
      title: 'KRS Online Mahasiswa Lama (Semester Gasal)',
      category: 'AKADEMIK',
      startDate: '2026-08-31',
      endDate: '2026-09-05',
      semester: '2026/2027 Ganjil',
      location: 'SIAKAD STIT Ihsanul Fikri',
      description: 'Pengisian Kartu Rencana Studi (KRS) online dan bimbingan DPA bagi mahasiswa lama semester 3, 5, dan 7.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-11',
      title: 'Penerjunan PLP',
      category: 'AKADEMIK',
      startDate: '2026-09-01',
      endDate: '2026-09-01',
      semester: '2026/2027 Ganjil',
      location: 'Lokasi Sekolah Mitra',
      description: 'Pemberangkatan resmi mahasiswa ke sekolah laboratorium dan mitra magang kependidikan.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-12',
      title: 'PBAK (Pengenalan Budaya Akademik dan Kemahasiswaan)',
      category: 'KEGIATAN',
      startDate: '2026-09-04',
      endDate: '2026-09-05',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Orientasi studi, ta\'aruf sivitas akademika, dan wawasan keislaman bagi mahasiswa baru 2026/2027.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-13',
      title: 'KRS Online Mahasiswa Baru (Semester Gasal)',
      category: 'AKADEMIK',
      startDate: '2026-09-07',
      endDate: '2026-09-12',
      semester: '2026/2027 Ganjil',
      location: 'SIAKAD STIT Ihsanul Fikri',
      description: 'Pengisian KRS perdana dan validasi kartu studi mahasiswa baru angkatan 2026.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-14',
      title: 'Perkuliahan Tahap I Semester Gasal',
      category: 'AKADEMIK',
      startDate: '2026-09-09',
      endDate: '2026-10-24',
      semester: '2026/2027 Ganjil',
      location: 'Gedung Perkuliahan BKPI & PIAUD',
      description: 'Masa perkuliahan tatap muka dan blended learning paruh pertama semester gasal (Pertemuan 1 s.d. 7).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-15',
      title: 'Ujian Tengah Semester (UTS) Gasal',
      category: 'AKADEMIK',
      startDate: '2026-10-28',
      endDate: '2026-11-07',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Ujian Kampus STIT IF',
      description: 'Evaluasi tengah semester gasal (Syarat mengikuti ujian: minimal cicilan SPP 50%).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-16',
      title: 'Penarikan PLP',
      category: 'AKADEMIK',
      startDate: '2026-10-30',
      endDate: '2026-10-30',
      semester: '2026/2027 Ganjil',
      location: 'Sekolah Mitra & Kampus',
      description: 'Penutupan program magang dan penarikan mahasiswa praktikan dari sekolah mitra.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-17',
      title: 'Penerjunan KKN',
      category: 'KEGIATAN',
      startDate: '2026-11-02',
      endDate: '2026-11-02',
      semester: '2026/2027 Ganjil',
      location: 'Lokasi Pengabdian Desa Binaan',
      description: 'Pemberangkatan mahasiswa peserta Kuliah Kerja Nyata (KKN) STIT Ihsanul Fikri.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-18',
      title: 'Perkuliahan Tahap II Semester Gasal',
      category: 'AKADEMIK',
      startDate: '2026-11-11',
      endDate: '2026-12-26',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Masa perkuliahan efektif paruh kedua semester gasal (Pertemuan 9 s.d. 16).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-19',
      title: 'Penarikan / Penutupan KKN',
      category: 'KEGIATAN',
      startDate: '2026-12-11',
      endDate: '2026-12-11',
      semester: '2026/2027 Ganjil',
      location: 'Lokasi KKN / Kampus STIT-IF',
      description: 'Penutupan resmi kegiatan pengabdian masyarakat KKN dan penarikan peserta.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-20',
      title: 'Batas Pelunasan SPP & Syarat Kartu UAS Gasal',
      category: 'KEUANGAN',
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      semester: '2026/2027 Ganjil',
      location: 'Sistem SIMPEL-IF',
      description: 'Penerbitan Surat Keterangan Lunas Keuangan untuk cetak kartu Ujian Akhir Semester.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-21',
      title: 'Wisuda Akademik Ke-3 STIT Ihsanul Fikri',
      category: 'KEGIATAN',
      startDate: '2026-12-26',
      endDate: '2026-12-26',
      semester: '2026/2027 Ganjil',
      location: 'Grand Ballroom / Auditorium Utama',
      description: 'Rapat Senat Terbuka Wisuda Sarjana S1 Program Studi BKPI & PIAUD Ke-3.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-22',
      title: 'Ujian Akhir Semester (UAS) Gasal',
      category: 'AKADEMIK',
      startDate: '2026-12-30',
      endDate: '2027-01-09',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Evaluasi akhir semester penentu kelulusan mata kuliah (Syarat: Kartu Ujian Lunas SPP).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-23',
      title: 'Isra\' Mi\'raj Nabi Muhammad SAW',
      category: 'LIBUR',
      startDate: '2027-01-05',
      endDate: '2027-01-05',
      semester: '2026/2027 Ganjil',
      location: 'Nasional / Islam',
      description: 'Hari libur nasional peringatan Isra\' Mi\'raj Nabi Muhammad SAW 1448 H.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-24',
      title: 'Remedial Mahasiswa Semester Gasal',
      category: 'AKADEMIK',
      startDate: '2027-01-11',
      endDate: '2027-01-16',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Masa ujian perbaikan dan pemenuhan tugas remedial nilai mata kuliah semester gasal.',
      isMandatory: false,
      targetRoles: ['MAHASISWA']
    },
    {
      id: 'EVT-2026-25',
      title: 'Libur Mahasiswa Semester Gasal',
      category: 'LIBUR',
      startDate: '2027-01-18',
      endDate: '2027-02-20',
      semester: '2026/2027 Ganjil',
      location: '-',
      description: 'Masa libur perkuliahan jeda semester gasal menuju semester genap.',
      isMandatory: false,
      targetRoles: ['MAHASISWA']
    },
    {
      id: 'EVT-2026-26',
      title: 'Batas Akhir Pengumpulan Nilai Semester Gasal',
      category: 'AKADEMIK',
      startDate: '2027-01-30',
      endDate: '2027-01-30',
      semester: '2026/2027 Ganjil',
      location: 'Portal SIAKAD Dosen',
      description: 'Batas akhir pengunggahan nilai oleh dosen dan penerbitan KHS online semester gasal.',
      isMandatory: true,
      targetRoles: ['ADMIN']
    },

    // --- SEMESTER GENAP 2026/2027 ---
    {
      id: 'EVT-2026-27',
      title: 'Heregistrasi & Pembayaran SPP Semester Genap 2026/2027',
      category: 'KEUANGAN',
      startDate: '2027-02-01',
      endDate: '2027-02-20',
      semester: '2026/2027 Genap',
      location: 'SIMPEL-IF / Bank BSI (1056405743)',
      description: 'Aktivasi status akademik dan pembayaran SPP semester genap via Virtual Account.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-28',
      title: 'Koordinasi Persiapan Mengajar Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-02-05',
      endDate: '2027-02-05',
      semester: '2026/2027 Genap',
      location: 'Ruang Rapat Dosen STIT-IF',
      description: 'Rapat koordinasi dosen pengampu mata kuliah semester genap tahun akademik 2026/2027.',
      isMandatory: true,
      targetRoles: ['ADMIN']
    },
    {
      id: 'EVT-2026-29',
      title: 'Serasi (Semarak Ramadhan & Silaturahmi)',
      category: 'KEGIATAN',
      startDate: '2027-02-07',
      endDate: '2027-03-06',
      semester: '2026/2027 Genap',
      location: 'Kampus & Masjid STIT-IF',
      description: 'Rangkaian kegiatan dakwah kemahasiswaan, kajian Islam, dan bakti sosial menyambut Ramadhan 1448 H.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-30',
      title: 'Penyusunan RPS dan Modul Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-02-08',
      endDate: '2027-02-27',
      semester: '2026/2027 Genap',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Penyusunan modul ajar dan silabus perkuliahan semester genap prodi BKPI & PIAUD.',
      isMandatory: false,
      targetRoles: ['ADMIN']
    },
    {
      id: 'EVT-2026-31',
      title: 'Perkuliahan Tahap I Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-02-18',
      endDate: '2027-04-24',
      semester: '2026/2027 Genap',
      location: 'Gedung Perkuliahan BKPI & PIAUD',
      description: 'Masa perkuliahan efektif paruh pertama semester genap (Pertemuan 1 s.d. 7).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-32',
      title: 'KRS Online Mahasiswa (Semester Genap)',
      category: 'AKADEMIK',
      startDate: '2027-02-22',
      endDate: '2027-02-27',
      semester: '2026/2027 Genap',
      location: 'SIAKAD STIT Ihsanul Fikri',
      description: 'Pengisian Kartu Rencana Studi (KRS) online dan konsultasi DPA semester genap.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-33',
      title: 'Libur Hari Raya Idul Fitri 1448 H',
      category: 'LIBUR',
      startDate: '2027-03-01',
      endDate: '2027-03-20',
      semester: '2026/2027 Genap',
      location: 'Nasional',
      description: 'Cuti bersama dan libur perkuliahan Hari Raya Idul Fitri 1448 H.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-34',
      title: 'Hari Raya Idul Fitri 1448 H (1 Syawal 1448 H)',
      category: 'LIBUR',
      startDate: '2027-03-10',
      endDate: '2027-03-10',
      semester: '2026/2027 Genap',
      location: 'Nasional / Islam',
      description: 'Hari Raya Idul Fitri 1 Syawal 1448 Hijriyah.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-35',
      title: 'Ujian Tengah Semester (UTS) Genap',
      category: 'AKADEMIK',
      startDate: '2027-04-28',
      endDate: '2027-05-08',
      semester: '2026/2027 Genap',
      location: 'Ruang Ujian Kampus STIT IF',
      description: 'Evaluasi tengah semester genap 2026/2027 bagi mahasiswa prodi BKPI dan PIAUD.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-36',
      title: 'Kegiatan Qur\'an Mahasiswa',
      category: 'KEGIATAN',
      startDate: '2027-05-09',
      endDate: '2027-05-15',
      semester: '2026/2027 Genap',
      location: 'Masjid & Pesantren STIT-IF',
      description: 'Pekan pembinaan Al-Qur\'an, tahsin, tahfidz bersanad, dan halaqah intensif mahasiswa.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-37',
      title: 'Perkuliahan Tahap II Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-05-12',
      endDate: '2027-06-19',
      semester: '2026/2027 Genap',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Masa perkuliahan efektif paruh kedua semester genap (Pertemuan 9 s.d. 16).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-38',
      title: 'Hari Raya Idul Adha 1448 H',
      category: 'LIBUR',
      startDate: '2027-05-16',
      endDate: '2027-05-16',
      semester: '2026/2027 Genap',
      location: 'Nasional / Islam',
      description: 'Hari Raya Idul Adha 10 Dzulhijjah 1448 Hijriyah.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-39',
      title: 'Tahun Baru Hijriyah 1449 H',
      category: 'LIBUR',
      startDate: '2027-06-06',
      endDate: '2027-06-06',
      semester: '2026/2027 Genap',
      location: 'Nasional / Islam',
      description: 'Hari libur tahun baru Islam 1 Muharram 1449 Hijriyah.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-40',
      title: 'Remedial Mahasiswa Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-06-14',
      endDate: '2027-06-19',
      semester: '2026/2027 Genap',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Masa ujian perbaikan nilai dan pemenuhan tugas remedial semester genap.',
      isMandatory: false,
      targetRoles: ['MAHASISWA']
    },
    {
      id: 'EVT-2026-41',
      title: 'Libur Mahasiswa Semester Genap',
      category: 'LIBUR',
      startDate: '2027-06-21',
      endDate: '2027-08-30',
      semester: '2026/2027 Genap',
      location: '-',
      description: 'Libur panjang akhir tahun akademik 2026/2027.',
      isMandatory: false,
      targetRoles: ['MAHASISWA']
    },
    {
      id: 'EVT-2026-42',
      title: 'Ujian Akhir Semester (UAS) Genap',
      category: 'AKADEMIK',
      startDate: '2027-06-30',
      endDate: '2027-07-10',
      semester: '2026/2027 Genap',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Evaluasi akhir semester genap penentu nilai mutu KHS dan kelulusan mata kuliah.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-2026-43',
      title: 'Batas Pengumpulan Nilai Semester Genap',
      category: 'AKADEMIK',
      startDate: '2027-07-31',
      endDate: '2027-07-31',
      semester: '2026/2027 Genap',
      location: 'Portal SIAKAD Dosen',
      description: 'Batas akhir pengumpulan nilai semester genap oleh dosen pengampu mata kuliah.',
      isMandatory: true,
      targetRoles: ['ADMIN']
    }
  ]
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.loadState();

    // Cross-tab / cross-window realtime synchronization
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadState();
          this.notifyListeners({ crossTab: true });
        }
      });
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        if (!this.state.adminUsers || !Array.isArray(this.state.adminUsers) || this.state.adminUsers.length === 0) {
          this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));
          if (this.state.adminProfile) {
            this.state.adminUsers[0] = {
              ...this.state.adminUsers[0],
              ...this.state.adminProfile,
              id: this.state.adminUsers[0].id || 'ADM-001',
              username: this.state.adminUsers[0].username || 'admin',
              password: this.state.adminUsers[0].password || 'admin123',
              isSuperAdmin: true,
              status: 'AKTIF'
            };
          }
        } else {
          // Normalize admin users
          this.state.adminUsers.forEach((adm, idx) => {
            if (!adm.id) adm.id = `ADM-${String(idx + 1).padStart(3, '0')}`;
            if (!adm.status) adm.status = 'AKTIF';
            if (!adm.password) adm.password = 'admin123';
            if (idx === 0) adm.isSuperAdmin = true;
          });
        }
        if (!this.state.adminProfile) {
          this.state.adminProfile = JSON.parse(JSON.stringify(this.state.adminUsers[0]));
        }
        if (!this.state.scholarshipSchemes || this.state.scholarshipSchemes.length === 0) {
          this.state.scholarshipSchemes = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.scholarshipSchemes));
        }
        if (!this.state.feeComponents) this.state.feeComponents = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.feeComponents));
        if (!this.state.students) {
          this.state.students = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.students));
        } else {
          // Normalize student credentials
          this.state.students.forEach(s => {
            if (!s.username) s.username = s.nim;
            if (!s.password) s.password = '123456';
          });
        }
        if (!this.state.invoices) {
          this.state.invoices = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.invoices));
        } else {
          // Normalize VA to Bank BSI 1056405743
          this.state.invoices.forEach(inv => {
            if (!inv.virtualAccount || inv.virtualAccount !== '1056405743') {
              inv.virtualAccount = '1056405743';
            }
          });
        }
        if (!this.state.paymentVerifications) this.state.paymentVerifications = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.paymentVerifications));
        if (!this.state.individualOverrides) this.state.individualOverrides = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.individualOverrides));
        if (!this.state.auditLogs) this.state.auditLogs = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.auditLogs));
        
        // Auto-update to official SK Academic Calendar if missing or from old seed
        if (!this.state.academicCalendar || this.state.academicCalendar.length < 35) {
          this.state.academicCalendar = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.academicCalendar));
        }
      } else {
        this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
        this.saveState();
      }
    } catch (e) {
      console.warn('Error loading state from localStorage, using initial seed:', e);
      this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
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
        console.error('Error in state subscriber:', err);
      }
    });
  }

  // Action: Switch Active Role
  setRole(roleKey, customStudentNim = null) {
    const targetRole = roleKey === 'MAHASISWA' ? 'MAHASISWA' : 'ADMIN';
    const roleDef = USER_ROLES[targetRole] || USER_ROLES.ADMIN;

    this.state.currentRole = targetRole;

    if (targetRole === 'MAHASISWA') {
      const targetNim = customStudentNim || '202486209012'; // Default Ahmad Fauzi
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
      const activeAdmin = (this.state.adminUsers && this.state.adminUsers.find(a => a.id === this.state.adminProfile?.id && a.status === 'AKTIF')) ||
                          (this.state.adminUsers && this.state.adminUsers.find(a => a.status === 'AKTIF')) ||
                          this.state.adminProfile ||
                          INITIAL_SEED_DATA.adminProfile;
      this.state.adminProfile = { ...activeAdmin };
      this.state.currentUser = {
        ...activeAdmin,
        role: 'ADMIN'
      };
    }

    this.notify();
  }

  // Action: Set Active Admin User Session
  setActiveAdmin(adminId) {
    if (!this.state.adminUsers) this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));
    const admin = this.state.adminUsers.find(a => a.id === adminId);
    if (!admin) return { success: false, message: 'Data admin tidak ditemukan.' };
    if (admin.status === 'NON_AKTIF') return { success: false, message: 'Akun admin ini non-aktif.' };

    this.state.currentRole = 'ADMIN';
    this.state.adminProfile = { ...admin };
    this.state.currentUser = {
      ...admin,
      role: 'ADMIN'
    };

    this.addAuditLog(
      'SWITCH_ADMIN_SESSION',
      admin.name,
      `Beralih sesi aktif ke Admin: ${admin.name} (${admin.title || 'Admin'}).`
    );

    this.notify();
    return { success: true, message: `Beralih ke akun ${admin.name}.`, admin };
  }

  // Action: Add New Admin User
  addAdminUser(adminData) {
    if (!this.state.adminUsers) this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));

    const username = (adminData.username || '').trim().toLowerCase();
    const name = (adminData.name || '').trim();
    const password = (adminData.password || 'admin123').trim();
    const email = (adminData.email || '').trim().toLowerCase();

    if (!name) return { success: false, message: 'Nama lengkap admin wajib diisi.' };
    if (!username) return { success: false, message: 'Username login admin wajib diisi.' };
    if (!password) return { success: false, message: 'Password admin wajib diisi.' };

    // Check duplicate username
    const exists = this.state.adminUsers.some(a => a.username.toLowerCase() === username);
    if (exists) {
      return { success: false, message: `Username "${username}" sudah digunakan oleh admin lain.` };
    }

    // Auto-generate avatarText
    let avatarText = (adminData.avatarText || '').trim().toUpperCase();
    if (!avatarText) {
      const words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(Boolean);
      avatarText = words.slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'AD';
    }

    const newId = `ADM-${Date.now().toString().slice(-4)}`;
    const newAdmin = {
      id: newId,
      username,
      password,
      name,
      role: 'ADMIN',
      email: email || `${username}@stit-if.ac.id`,
      phone: (adminData.phone || '').trim() || '082342307414',
      title: (adminData.title || 'Staf Pengelola & Administrasi').trim(),
      department: (adminData.department || 'Biro Keuangan & Administrasi Umum (BAU)').trim(),
      nip: (adminData.nip || '-').trim(),
      avatarText,
      status: adminData.status === 'NON_AKTIF' ? 'NON_AKTIF' : 'AKTIF',
      isSuperAdmin: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    this.state.adminUsers.push(newAdmin);

    this.addAuditLog(
      'ADD_ADMIN_USER',
      `${newAdmin.name} (@${newAdmin.username})`,
      `Penambahan akun admin baru oleh ${this.state.currentUser?.name || 'Admin'}: ${newAdmin.title} (${newAdmin.department}).`
    );

    this.notify();
    return { success: true, message: `Admin baru "${newAdmin.name}" berhasil ditambahkan ke sistem!`, admin: newAdmin };
  }

  // Action: Update Admin User
  updateAdminUser(adminId, updatedFields) {
    if (!this.state.adminUsers) this.state.adminUsers = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminUsers));
    const idx = this.state.adminUsers.findIndex(a => a.id === adminId);
    if (idx === -1) return { success: false, message: 'Data admin tidak ditemukan.' };

    const targetAdmin = this.state.adminUsers[idx];

    // Check username uniqueness if changed
    if (updatedFields.username) {
      const newUsername = updatedFields.username.trim().toLowerCase();
      if (newUsername !== targetAdmin.username.toLowerCase()) {
        const duplicate = this.state.adminUsers.some((a, i) => i !== idx && a.username.toLowerCase() === newUsername);
        if (duplicate) {
          return { success: false, message: `Username "${newUsername}" sudah digunakan oleh admin lain.` };
        }
        updatedFields.username = newUsername;
      }
    }

    // Auto-generate avatar if name changed
    if (updatedFields.name && !updatedFields.avatarText) {
      const cleanWords = updatedFields.name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(Boolean);
      updatedFields.avatarText = cleanWords.slice(0, 2).map(w => w[0].toUpperCase()).join('') || targetAdmin.avatarText || 'AD';
    }

    // Protect super admin flag and prevent deactivation of active session
    if (targetAdmin.isSuperAdmin) {
      delete updatedFields.isSuperAdmin;
      delete updatedFields.status; // Super admin cannot be deactivated
    }

    this.state.adminUsers[idx] = { ...targetAdmin, ...updatedFields };

    // If updating current active admin profile, sync state.adminProfile and state.currentUser
    if (this.state.adminProfile && this.state.adminProfile.id === adminId) {
      this.state.adminProfile = { ...this.state.adminUsers[idx] };
      if (this.state.currentRole === 'ADMIN') {
        this.state.currentUser = {
          ...this.state.adminUsers[idx],
          role: 'ADMIN'
        };
      }
    }

    this.addAuditLog(
      'UPDATE_ADMIN_USER',
      `${this.state.adminUsers[idx].name} (@${this.state.adminUsers[idx].username})`,
      `Pembaruan profil/kredensial admin oleh ${this.state.currentUser?.name || 'Admin'}.`
    );

    this.notify();
    return { success: true, message: `Data admin "${this.state.adminUsers[idx].name}" berhasil diperbarui.`, admin: this.state.adminUsers[idx] };
  }

  // Action: Delete Admin User
  deleteAdminUser(adminId) {
    if (!this.state.adminUsers) return { success: false, message: 'Data admin tidak ditemukan.' };
    const admin = this.state.adminUsers.find(a => a.id === adminId);
    if (!admin) return { success: false, message: 'Data admin tidak ditemukan.' };

    if (admin.isSuperAdmin) {
      return { success: false, message: 'Akun Super Admin Utama tidak dapat dihapus demi keamanan sistem.' };
    }

    if (this.state.currentUser && this.state.currentUser.id === adminId) {
      return { success: false, message: 'Anda tidak dapat menghapus akun admin yang sedang Anda gunakan untuk login saat ini.' };
    }

    if (this.state.adminUsers.length <= 1) {
      return { success: false, message: 'Sistem harus memiliki setidaknya satu akun admin aktif.' };
    }

    const adminName = admin.name;
    const adminUsername = admin.username;
    this.state.adminUsers = this.state.adminUsers.filter(a => a.id !== adminId);

    this.addAuditLog(
      'DELETE_ADMIN_USER',
      `${adminName} (@${adminUsername})`,
      `Penghapusan akun admin "${adminName}" oleh ${this.state.currentUser?.name || 'Admin'}.`
    );

    this.notify();
    return { success: true, message: `Akun admin "${adminName}" berhasil dihapus dari sistem.` };
  }

  // Action: Toggle Admin Active Status
  toggleAdminUserStatus(adminId) {
    if (!this.state.adminUsers) return { success: false, message: 'Data admin tidak ditemukan.' };
    const admin = this.state.adminUsers.find(a => a.id === adminId);
    if (!admin) return { success: false, message: 'Data admin tidak ditemukan.' };

    if (admin.isSuperAdmin) {
      return { success: false, message: 'Status akun Super Admin Utama selalu aktif dan tidak dapat dinonaktifkan.' };
    }

    if (this.state.currentUser && this.state.currentUser.id === adminId) {
      return { success: false, message: 'Anda tidak dapat menonaktifkan akun admin yang sedang Anda gunakan saat ini.' };
    }

    const newStatus = admin.status === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF';
    admin.status = newStatus;

    this.addAuditLog(
      'TOGGLE_ADMIN_STATUS',
      `${admin.name} (@${admin.username})`,
      `Status akun admin diubah menjadi ${newStatus}.`
    );

    this.notify();
    return { success: true, message: `Status admin "${admin.name}" berhasil diubah menjadi ${newStatus}.`, newStatus };
  }

  // Action: Update Admin Profile (Backward-compatible for self profile modal)
  updateAdminProfile(updatedFields) {
    if (!this.state.adminProfile) {
      this.state.adminProfile = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminProfile));
    }

    const currentId = this.state.adminProfile.id || 'ADM-001';
    return this.updateAdminUser(currentId, updatedFields);
  }

  // Action: Add Audit Log
  addAuditLog(action, entity, details) {
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName: this.state.currentUser ? this.state.currentUser.name : 'Sistem Admin',
      role: this.state.currentRole || 'ADMIN',
      action,
      entity,
      details
    };
    this.state.auditLogs.unshift(newLog);
    this.notify();
  }

  // Student Data Mutations & Self-Registration
  registerStudent(studentData) {
    const rawNim = (studentData.nim || '').trim();
    const rawName = (studentData.name || '').trim();
    const rawUsername = (studentData.username || rawNim).trim();
    const rawPassword = studentData.password || '123456';

    if (!rawNim) {
      return { success: false, message: 'NIM / Nomor Pendaftaran wajib diisi.' };
    }
    if (!rawName) {
      return { success: false, message: 'Nama lengkap calon mahasiswa wajib diisi.' };
    }

    // Check NIM collision
    const existingNim = this.state.students.find(s => s.nim.toLowerCase() === rawNim.toLowerCase());
    if (existingNim) {
      return { success: false, message: `NIM ${rawNim} sudah terdaftar atas nama "${existingNim.name}". Silakan gunakan NIM lain atau login langsung.` };
    }

    // Check Username collision
    if (rawUsername) {
      const existingUser = this.state.students.find(s => s.username && s.username.toLowerCase() === rawUsername.toLowerCase());
      if (existingUser) {
        return { success: false, message: `Username "${rawUsername}" sudah digunakan oleh akun mahasiswa lain. Silakan pilih username lain.` };
      }
    }

    const prodi = studentData.prodi || 'BKPI';
    const semester = parseInt(studentData.semester, 10) || 1;
    const angkatan = studentData.angkatan || '2026';
    const gender = studentData.gender || 'L';
    const scholarshipId = studentData.scholarshipId || 'REGULER';
    const phone = (studentData.phone || '').trim();
    const email = (studentData.email || '').trim();

    // Create student object
    const newStudent = {
      id: `MHS-${String(this.state.students.length + 1).padStart(3, '0')}`,
      nim: rawNim,
      name: rawName,
      username: rawUsername,
      password: rawPassword,
      prodi: prodi,
      angkatan: angkatan,
      semester: semester,
      gender: gender,
      scholarshipId: scholarshipId,
      email: email || `${rawUsername.toLowerCase()}@mahasiswa.stit-ihsanulfikri.ac.id`,
      phone: phone || '082342307414',
      status: 'AKTIF',
      virtualAccount: '1056405743',
      registeredAt: new Date().toISOString().replace('T', ' ').split('.')[0]
    };

    // Add to students collection
    this.state.students.unshift(newStudent);

    // Calculate invoice items based on fee components and scholarship scheme
    const feeComponents = this.state.feeComponents || [];
    const scholarship = (this.state.scholarshipSchemes || []).find(sc => sc.id === scholarshipId) || { id: 'REGULER', discountValue: 0, discountType: 'NONE' };

    const items = [];
    let grossAmount = 0;
    let totalDiscount = 0;

    // 1. SPP / UKT Pokok
    const sppComp = feeComponents.find(c => c.id === 'SPP') || { name: 'SPP / UKT Pokok Semester', defaultAmount: 1800000 };
    let sppDiscount = 0;
    if (scholarship.id !== 'REGULER') {
      if (scholarship.discountType === 'PERCENT') {
        sppDiscount = (sppComp.defaultAmount * scholarship.discountValue) / 100;
      } else if (scholarship.discountType === 'FIXED') {
        sppDiscount = Math.min(scholarship.discountValue, sppComp.defaultAmount);
      }
    }
    sppDiscount = Math.min(sppDiscount, sppComp.defaultAmount);
    const sppFinal = sppComp.defaultAmount - sppDiscount;

    items.push({
      componentId: 'SPP',
      name: sppComp.name,
      baseAmount: sppComp.defaultAmount,
      discount: sppDiscount,
      finalAmount: sppFinal
    });
    grossAmount += sppComp.defaultAmount;
    totalDiscount += sppDiscount;

    // 2. Daftar Ulang / Heregistrasi
    const duComp = feeComponents.find(c => c.id === 'DAFTAR_ULANG') || { name: 'Heregistrasi & Administrasi', defaultAmount: 150000 };
    items.push({
      componentId: 'DAFTAR_ULANG',
      name: duComp.name,
      baseAmount: duComp.defaultAmount,
      discount: 0,
      finalAmount: duComp.defaultAmount
    });
    grossAmount += duComp.defaultAmount;

    // 3. Pendaftaran Maba jika Semester 1
    if (semester === 1) {
      const pendComp = feeComponents.find(c => c.id === 'PENDAFTARAN') || { name: 'Paket Orientasi & Jas Almamater Maba', defaultAmount: 350000 };
      items.push({
        componentId: 'PENDAFTARAN',
        name: pendComp.name,
        baseAmount: pendComp.defaultAmount,
        discount: 0,
        finalAmount: pendComp.defaultAmount
      });
      grossAmount += pendComp.defaultAmount;
    }

    const netAmount = grossAmount - totalDiscount;

    // Generate initial invoice
    const newInvoice = {
      id: `INV-2026-${String(this.state.invoices.length + 1).padStart(3, '0')}`,
      studentNim: rawNim,
      semester: this.state.activeSemester || '2026/2027 Ganjil',
      grossAmount: grossAmount,
      discountAmount: totalDiscount,
      netAmount: netAmount,
      paidAmount: 0,
      remainingAmount: netAmount,
      status: 'PENDING',
      dueDate: '2026-09-12',
      virtualAccount: '1056405743',
      items: items,
      payments: []
    };

    this.state.invoices.unshift(newInvoice);

    // Audit Trail
    this.addAuditLog(
      'REGISTER_STUDENT_SELF',
      `${newStudent.name} (NIM: ${newStudent.nim})`,
      `Registrasi mandiri mahasiswa baru prodi ${newStudent.prodi} jalur ${scholarship.name || scholarshipId}. Tagihan perdana ${newInvoice.id} sebesar Rp ${netAmount.toLocaleString('id-ID')} diterbitkan.`
    );

    this.notify();

    return {
      success: true,
      student: newStudent,
      invoice: newInvoice,
      message: `Selamat datang, ${newStudent.name}! Akun mahasiswa Anda berhasil dibuat.`
    };
  }

  addStudent(student) {
    this.state.students.unshift(student);
    this.addAuditLog(
      'ADD_STUDENT',
      `${student.name} (NIM: ${student.nim})`,
      `Penambahan data induk mahasiswa baru prodi ${student.prodi}.`
    );
    this.notify();
    return { success: true, message: `Mahasiswa ${student.name} berhasil ditambahkan.` };
  }

  updateStudent(nim, updatedFields) {
    const idx = this.state.students.findIndex(s => s.nim === nim);
    if (idx === -1) return { success: false, message: 'Data mahasiswa tidak ditemukan.' };

    this.state.students[idx] = { ...this.state.students[idx], ...updatedFields };
    this.addAuditLog(
      'EDIT_STUDENT',
      `${this.state.students[idx].name} (NIM: ${nim})`,
      `Pembaruan profil data mahasiswa.`
    );
    this.notify();
    return { success: true, message: 'Data mahasiswa berhasil diperbarui.' };
  }

  deleteStudent(studentNim) {
    const student = this.state.students.find(s => s.nim === studentNim);
    if (!student) return { success: false, message: 'Data mahasiswa tidak ditemukan.' };

    const studentName = student.name;
    const studentProdi = student.prodi;

    // 1. Remove from students list
    this.state.students = this.state.students.filter(s => s.nim !== studentNim);

    // 2. Remove corresponding invoices
    this.state.invoices = this.state.invoices.filter(i => i.studentNim !== studentNim);

    // 3. Remove corresponding payment verifications
    this.state.paymentVerifications = this.state.paymentVerifications.filter(v => v.studentNim !== studentNim);

    // 4. Remove individual overrides
    this.state.individualOverrides = this.state.individualOverrides.filter(o => o.studentNim !== studentNim);

    // 5. If current active user was this student, fallback to another student or Admin
    if (this.state.currentUser && this.state.currentUser.nim === studentNim) {
      if (this.state.students.length > 0) {
        this.setRole('MAHASISWA', this.state.students[0].nim);
      } else {
        this.setRole('ADMIN');
      }
    }

    // 6. Log Audit Trail
    this.addAuditLog(
      'DELETE_STUDENT',
      `${studentName} (NIM: ${studentNim})`,
      `Penghapusan data induk mahasiswa prodi ${studentProdi} beserta seluruh data tagihan & riwayat transaksi terkait.`
    );

    this.notify();
    return { success: true, message: `Data mahasiswa ${studentName} (${studentNim}) berhasil dihapus dari sistem.` };
  }

  // Update Student Account Credentials (Username, NIM, Password) & Biodata
  updateStudentCredentials(oldNim, updatedFields) {
    const student = this.state.students.find(s => s.nim === oldNim);
    if (!student) return { success: false, message: 'Data mahasiswa tidak ditemukan.' };

    const newNim = updatedFields.nim ? updatedFields.nim.trim() : oldNim;
    const newUsername = updatedFields.username ? updatedFields.username.trim().toLowerCase() : (student.username || student.nim);
    const newPassword = updatedFields.password !== undefined && updatedFields.password !== '' ? updatedFields.password.trim() : (student.password || '123456');

    // Check NIM collision
    if (newNim !== oldNim && this.state.students.some(s => s.nim === newNim)) {
      return { success: false, message: `NIM ${newNim} sudah digunakan oleh mahasiswa lain.` };
    }

    // Apply updates
    student.nim = newNim;
    student.username = newUsername;
    student.password = newPassword;
    if (updatedFields.name) student.name = updatedFields.name.trim();
    if (updatedFields.prodi) student.prodi = updatedFields.prodi;
    if (updatedFields.semester !== undefined) student.semester = Number(updatedFields.semester) || student.semester;
    if (updatedFields.statusAkademik) student.statusAkademik = updatedFields.statusAkademik;
    if (updatedFields.scholarshipId) student.scholarshipId = updatedFields.scholarshipId;
    if (updatedFields.phone) student.phone = updatedFields.phone.trim();
    if (updatedFields.email) student.email = updatedFields.email.trim();

    // If NIM changed, cascade update to all related documents
    if (newNim !== oldNim) {
      (this.state.invoices || []).forEach(inv => {
        if (inv.studentNim === oldNim) inv.studentNim = newNim;
      });
      (this.state.paymentVerifications || []).forEach(v => {
        if (v.studentNim === oldNim) v.studentNim = newNim;
      });
      (this.state.individualOverrides || []).forEach(o => {
        if (o.studentNim === oldNim) o.studentNim = newNim;
      });
      if (this.state.currentUser && this.state.currentUser.nim === oldNim) {
        this.state.currentUser = student;
      }
    }

    // Audit Log
    this.addAuditLog(
      'UPDATE_STUDENT_CREDENTIALS',
      `${student.name} (${student.nim})`,
      `Pembaruan akun mahasiswa oleh Admin: Username [${newUsername}], NIM [${newNim}], Password/PIN diperbarui.`
    );

    this.notify();
    return { success: true, message: `Akun & Kredensial ${student.name} (${student.nim}) berhasil diperbarui.` };
  }

  // Invoice Data Mutations
  addInvoice(invoice) {
    this.state.invoices.unshift(invoice);
    this.notify();
  }

  // Academic Calendar Mutations
  addAcademicEvent(eventData) {
    const id = eventData.id || `EVT-${Date.now().toString().slice(-4)}`;
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

    this.addAuditLog(
      'CREATE_ACADEMIC_EVENT',
      newEvent.title,
      `Penambahan agenda akademik "${newEvent.title}" (${newEvent.startDate} s/d ${newEvent.endDate}) pada semester ${newEvent.semester}.`
    );

    this.notify();
    return newEvent;
  }

  updateAcademicEvent(id, updatedFields) {
    if (!this.state.academicCalendar) return null;
    const index = this.state.academicCalendar.findIndex(e => e.id === id);
    if (index === -1) return null;

    const oldEvent = this.state.academicCalendar[index];
    this.state.academicCalendar[index] = {
      ...oldEvent,
      ...updatedFields
    };

    this.state.academicCalendar.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    this.addAuditLog(
      'UPDATE_ACADEMIC_EVENT',
      this.state.academicCalendar[index].title,
      `Pembaruan data agenda akademik "${this.state.academicCalendar[index].title}".`
    );

    this.notify();
    return this.state.academicCalendar[index];
  }

  deleteAcademicEvent(id) {
    if (!this.state.academicCalendar) return false;
    const eventToDelete = this.state.academicCalendar.find(e => e.id === id);
    if (!eventToDelete) return false;

    this.state.academicCalendar = this.state.academicCalendar.filter(e => e.id !== id);

    this.addAuditLog(
      'DELETE_ACADEMIC_EVENT',
      eventToDelete.title,
      `Penghapusan agenda akademik "${eventToDelete.title}" dari kalender akademik.`
    );

    this.notify();
    return true;
  }

  resetAcademicCalendar() {
    this.state.academicCalendar = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.academicCalendar));
    this.notify();
  }

  // Reset to default seed data
  resetAllData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.notify();
  }
}

export const appState = new StateManager();
