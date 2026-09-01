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
    id: 'USR-ADMIN',
    name: 'Ustadzah Siti Fatimah, S.E.',
    role: 'ADMIN',
    email: 'bendahara@stit-if.ac.id',
    phone: '081392817263',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    nip: '19840512 201201 2 003',
    avatarText: 'SF'
  },
  currentUser: {
    id: 'USR-ADMIN',
    name: 'Ustadzah Siti Fatimah, S.E.',
    role: 'ADMIN',
    email: 'bendahara@stit-if.ac.id',
    phone: '081392817263',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    nip: '19840512 201201 2 003',
    avatarText: 'SF',
    prodi: 'Bendahara Penerimaan'
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

  // Academic Calendar Schedule
  academicCalendar: [
    {
      id: 'EVT-01',
      title: 'Pembayaran SPP & Heregistrasi Mahasiswa Lama (Ganjil 2026/2027)',
      category: 'KEUANGAN',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      semester: '2026/2027 Ganjil',
      location: 'Online via SIMPEL-IF / Bank BSI (1056405743)',
      description: 'Periode pelunasan/cicilan SPP dan daftar ulang administrasi akademik semester ganjil.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-02',
      title: 'Masa Pendaftaran & Her-Registrasi Mahasiswa Baru (PMB Gel. III)',
      category: 'KEUANGAN',
      startDate: '2026-08-10',
      endDate: '2026-09-05',
      semester: '2026/2027 Ganjil',
      location: 'Kantor BAAK / Portal PMB Online',
      description: 'Penerbitan NIM dan pembayaran paket awal orientasi & SPP mahasiswa baru.',
      isMandatory: true,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-03',
      title: 'Pengajuan & Verifikasi Afirmasi Beasiswa Semester Ganjil',
      category: 'KEUANGAN',
      startDate: '2026-08-15',
      endDate: '2026-09-10',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Bendahara & BAU STIT Ihsanul Fikri',
      description: 'Batas akhir upload berkas beasiswa Asrama, Mitra Lembaga, dan Prestasi Tahfidz.',
      isMandatory: false,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-04',
      title: 'Pengisian & Validasi Kartu Rencana Studi (KRS Online)',
      category: 'AKADEMIK',
      startDate: '2026-09-01',
      endDate: '2026-09-12',
      semester: '2026/2027 Ganjil',
      location: 'SIAKAD STIT Ihsanul Fikri',
      description: 'Konsultasi Dosen Pembimbing Akademik (DPA) dan entri mata kuliah semester ganjil.',
      isMandatory: true,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-05',
      title: 'Orientasi Studi & Ta\'aruf Mahasiswa Baru (OSPEK / Ta\'aruf)',
      category: 'KEGIATAN',
      startDate: '2026-09-08',
      endDate: '2026-09-10',
      semester: '2026/2027 Ganjil',
      location: 'Auditorium Utama Kampus STIT Ihsanul Fikri',
      description: 'Pengenalan nilai-nilai keislaman, tradisi ilmiah, dan tata tertib perguruan tinggi.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-06',
      title: 'Kuliah Perdana & Awal Perkuliahan Efektif Semester Ganjil',
      category: 'AKADEMIK',
      startDate: '2026-09-14',
      endDate: '2026-11-06',
      semester: '2026/2027 Ganjil',
      location: 'Gedung Perkuliahan BKPI & PIAUD',
      description: 'Masa perkuliahan tatap muka dan blended learning paruh pertama (Pertemuan 1 - 7).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-07',
      title: 'Batas Akhir Perubahan Rencana Studi (KPRS / Drop Matkul)',
      category: 'AKADEMIK',
      startDate: '2026-09-25',
      endDate: '2026-09-26',
      semester: '2026/2027 Ganjil',
      location: 'Biro Administrasi Akademik (BAAK)',
      description: 'Batas terakhir revisi pengambilan mata kuliah yang telah disetujui DPA.',
      isMandatory: false,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-08',
      title: 'Pendaftaran Ujian Munaqasyah & Skripsi Periode I',
      category: 'KEGIATAN',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      semester: '2026/2027 Ganjil',
      location: 'Sekretariat Program Studi BKPI / PIAUD',
      description: 'Penyerahan naskah skripsi lengkap dan bukti bebas administrasi keuangan.',
      isMandatory: false,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-09',
      title: 'Ujian Tengah Semester (UTS) Gasal 2026/2027',
      category: 'AKADEMIK',
      startDate: '2026-11-09',
      endDate: '2026-11-20',
      semester: '2026/2027 Ganjil',
      location: 'Ruang Ujian Kampus STIT IF',
      description: 'Evaluasi tengah semester (Syarat mengikuti ujian: minimal cicilan SPP 50%).',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-10',
      title: 'Masa Perkuliahan Efektif Paruh Kedua (Pertemuan 9 - 16)',
      category: 'AKADEMIK',
      startDate: '2026-11-23',
      endDate: '2027-01-08',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Penyelesaian silabus perkuliahan dan praktikum lapangan.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-11',
      title: 'Wisuda Sarjana & Pelepasan Lulusan Ke-VIII',
      category: 'KEGIATAN',
      startDate: '2026-12-19',
      endDate: '2026-12-19',
      semester: '2026/2027 Ganjil',
      location: 'Grand Ballroom Hotel Atria Magelang',
      description: 'Rapat Senat Terbuka Wisuda Sarjana S1 Prodi BKPI & PIAUD.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-12',
      title: 'Batas Pelunasan SPP & Syarat Kartu Ujian Akhir (UAS)',
      category: 'KEUANGAN',
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      semester: '2026/2027 Ganjil',
      location: 'Sistem SIMPEL-IF',
      description: 'Penerbitan Surat Keterangan Lunas Keuangan untuk cetak kartu UAS.',
      isMandatory: true,
      targetRoles: ['MAHASISWA', 'ADMIN']
    },
    {
      id: 'EVT-13',
      title: 'Ujian Akhir Semester (UAS) Gasal 2026/2027',
      category: 'AKADEMIK',
      startDate: '2027-01-11',
      endDate: '2027-01-22',
      semester: '2026/2027 Ganjil',
      location: 'Kampus STIT Ihsanul Fikri',
      description: 'Evaluasi akhir semester penentu nilai mutu KHS.',
      isMandatory: true,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-14',
      title: 'Batas Akhir Input Nilai & Publikasi KHS Online',
      category: 'AKADEMIK',
      startDate: '2027-01-25',
      endDate: '2027-02-05',
      semester: '2026/2027 Ganjil',
      location: 'Portal SIAKAD Dosen & Mahasiswa',
      description: 'Pengumuman indeks prestasi semester (IPS) dan evaluasi akademik.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-15',
      title: 'Libur Semester Gasal & Masa Riset / Pengabdian',
      category: 'LIBUR',
      startDate: '2027-01-25',
      endDate: '2027-02-19',
      semester: '2026/2027 Ganjil',
      location: '-',
      description: 'Masa jeda akademik semester gasal menuju semester genap.',
      isMandatory: false,
      targetRoles: ['ALL']
    },
    {
      id: 'EVT-16',
      title: 'Heregistrasi & Pembayaran SPP Semester Genap 2026/2027',
      category: 'KEUANGAN',
      startDate: '2027-02-01',
      endDate: '2027-02-20',
      semester: '2026/2027 Genap',
      location: 'SIMPEL-IF / Bank BSI (1056405743)',
      description: 'Aktivasi status mahasiswa dan validasi KRS semester genap.',
      isMandatory: true,
      targetRoles: ['ALL']
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
        if (!this.state.adminProfile) {
          this.state.adminProfile = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminProfile));
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
        if (!this.state.academicCalendar || this.state.academicCalendar.length === 0) {
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
      const adminData = this.state.adminProfile || INITIAL_SEED_DATA.adminProfile;
      this.state.currentUser = {
        ...adminData,
        role: 'ADMIN'
      };
    }

    this.notify();
  }

  // Action: Update Admin Profile
  updateAdminProfile(updatedFields) {
    if (!this.state.adminProfile) {
      this.state.adminProfile = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.adminProfile));
    }

    this.state.adminProfile = { ...this.state.adminProfile, ...updatedFields };

    // Auto-generate avatarText if name changed and not explicitly set
    if (updatedFields.name && !updatedFields.avatarText) {
      const cleanWords = updatedFields.name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(Boolean);
      this.state.adminProfile.avatarText = cleanWords.slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'AD';
    }

    if (this.state.currentRole === 'ADMIN') {
      this.state.currentUser = {
        ...this.state.adminProfile,
        role: 'ADMIN'
      };
    }

    this.addAuditLog(
      'EDIT_ADMIN_PROFILE',
      this.state.adminProfile.name,
      `Pembaruan profil data identitas Bendahara / Admin institusi STIT-IF.`
    );

    this.notify();
    return { success: true, message: 'Profil Admin & Bendahara berhasil diperbarui.' };
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

  // Student Data Mutations
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
