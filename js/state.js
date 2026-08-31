/**
 * SIMPEL-IF Reactive State Manager & Seed Data Store
 * STIT Ihsanul Fikri
 */

import { PRODI, STATUS_AKADEMIK, STATUS_TAGIHAN, SCHOLARSHIP_TYPES, USER_ROLES } from './models.js';

const STORAGE_KEY = 'SIMPEL_IF_STATE_V3';

const INITIAL_SEED_DATA = {
  activeSemester: '2026/2027 Ganjil',
  currentRole: 'ADMIN',
  currentUser: {
    id: 'USR-ADMIN',
    name: 'Admin SIMPEL-IF',
    role: 'ADMIN',
    email: 'admin@stit-ihsanulfikri.ac.id',
    avatarText: 'AD',
    prodi: 'Pusat Keuangan & Akademik'
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
      virtualAccount: '988886209012001',
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
      virtualAccount: '988886208005002',
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
      virtualAccount: '988886208001003',
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
      virtualAccount: '988886209002004',
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
      paymentMethod: 'VA_MANDIRI',
      receiptNumber: 'KW-IF/2026/08/0015',
      paymentDate: '2026-08-18 16:30:00',
      virtualAccount: '899986209008005',
      notes: 'Lunas via Mandiri Virtual Account'
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
      virtualAccount: '988886208014006',
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
      virtualAccount: '988886208007007',
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
      virtualAccount: '988886208011008',
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
  ]
};

class StateManager {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
        if (!this.state.scholarshipSchemes || this.state.scholarshipSchemes.length === 0) {
          this.state.scholarshipSchemes = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.scholarshipSchemes));
        }
        if (!this.state.feeComponents) this.state.feeComponents = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.feeComponents));
        if (!this.state.students) this.state.students = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.students));
        if (!this.state.invoices) this.state.invoices = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.invoices));
        if (!this.state.paymentVerifications) this.state.paymentVerifications = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.paymentVerifications));
        if (!this.state.individualOverrides) this.state.individualOverrides = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.individualOverrides));
        if (!this.state.auditLogs) this.state.auditLogs = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.auditLogs));
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

  notify() {
    this.saveState();
    this.listeners.forEach(listener => listener(this.state));
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
      this.state.currentUser = {
        id: `USR-ADMIN`,
        name: roleDef.defaultUser,
        role: 'ADMIN',
        email: 'admin@stit-ihsanulfikri.ac.id',
        avatarText: roleDef.avatarText,
        prodi: roleDef.shortTitle
      };
    }

    this.notify();
  }

  // Action: Add Audit Log
  addAuditLog(action, entity, details) {
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userName: this.state.currentUser.name,
      role: this.state.currentRole,
      action,
      entity,
      details
    };
    this.state.auditLogs.unshift(newLog);
    this.notify();
  }

  // Reset to default seed data
  resetAllData() {
    this.state = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this.notify();
  }
}

export const appState = new StateManager();
