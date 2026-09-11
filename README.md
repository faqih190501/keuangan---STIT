<div align="center">
  <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" width="100" height="100" style="border-radius: 16px;">
  <h1>SIMPEL-IF (Sistem Informasi Manajemen Pembayaran Elektronik Ihsanul Fikri)</h1>
  <p><strong>Sekolah Tinggi Ilmu Tarbiyah (STIT) Ihsanul Fikri Pabelan Magelang</strong></p>

  <p>
    <a href="https://faqih190501.github.io/keuangan---STIT/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github" alt="Live Demo"></a>
    <img src="https://img.shields.io/badge/Version-3.0.0_Synced-emerald?style=for-the-badge" alt="Version">
    <img src="https://img.shields.io/badge/Google_Sheets-Live_Sync-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets">
    <img src="https://img.shields.io/badge/Vanilla-ES_Modules-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License">
  </p>

  <p>
    <strong>📞 Hotline & WhatsApp Admin:</strong> <a href="https://wa.me/6282342307414"><code>082342307414</code></a> &bull; 
    <strong>🏦 Rekening / VA Resmi:</strong> Bank BSI <code>1056405743</code> a.n. STIT IHSANUL FIKRI
  </p>
</div>

---

## 📖 Tentang SIMPEL-IF

**SIMPEL-IF** adalah platform aplikasi web tata kelola keuangan perguruan tinggi modern berbasis **Vanilla ES Modules & Pure Responsive CSS** tanpa dependensi framework yang berat. Sistem ini dirancang untuk mewujudkan transparansi penuh dalam penagihan perkuliahan, pengelolaan skema subsidi beasiswa (Asrama, Mitra, PAUD Laki-laki, Prestasi), pembayaran fleksibel mandiri, verifikasi bukti bayar kilat, serta penerbitan kwitansi sah digital ber-QR Code kriptografis.

Sistem telah **disinkronkan 1:1** dengan dokumen resmi Google Spreadsheet: [REKAP ADMINISTRASI STITIF](https://docs.google.com/spreadsheets/d/1nqh4jksle3r95PlupTIKve11iUxmg3hSdYOB3NTKp3U/edit?pli=1&gid=814809663#gid=814809663).

---

## 🌐 Demo Publik (Live Web)

Aplikasi dapat langsung diakses secara publik melalui tautan GitHub Pages berikut:
👉 **[https://faqih190501.github.io/keuangan---STIT/](https://faqih190501.github.io/keuangan---STIT/)**

---

## 📊 Integrasi Pangkalan Data Google Spreadsheet

Sistem memuat pangkalan data resmi STIT Ihsanul Fikri dengan rincian:

| Program Studi / Angkatan | Sheet Sumber | Jumlah Mahasiswa | Komponen Biaya Utama |
| :--- | :--- | :---: | :--- |
| **Bimbingan & Konseling Pendidikan Islam (BKPI 2026)** | `gid=814809663` | **45 Mahasiswa** | Pendaftaran (Rp 200rb), Daftar Ulang (Rp 450rb), SPP Smt 1 (9 Skema Tarif) |
| **Pendidikan Islam Anak Usia Dini (PIAUD 2026)** | `gid=1770791775` | **63 Mahasiswa** | Pendaftaran (Rp 200rb), Daftar Ulang (Rp 450rb), SPP Smt 1 (9 Skema Tarif) |
| **Mahasiswa Senior / Lanjutan** | Cohort Angkatan Sebelumnya | **13 Mahasiswa** | SPP Semester Berjalan & Asrama As-Syamil |
| **TOTAL DATA SISTEM** | Seluruh Angkatan | **121 Mahasiswa** | **106 Tagihan & 66 Log Pembayaran Sah** |

---

## ✨ Fitur Unggulan Sistem

### 1. 📊 Matriks Rekapitulasi Google Sheets (`#matriks-rekap`)
* **Tampilan Tabel Spreadsheet Interaktif**: Menyajikan data persis 1:1 seperti Google Sheets dengan tab navigasi **BKPI 2026**, **PIAUD 2026**, **Multi-Semester Senior**, dan **Asrama As-Syamil**.
* **Kalkulasi Otomatis Keuangan**: Kolom No, NIM, Nama, Skema Beasiswa, Biaya Pendaftaran, Daftar Ulang, SPP Smt 1, Total Bayar, Sisa Tagihan, dan Status Pembayaran.
* **Export CSV / Excel Langsung**: Ekspor data matriks ke format `.csv` dengan satu klik.

### 2. 🎓 Portal Mahasiswa & Pembayaran Fleksibel
* **Bebas Tentukan Nominal Pembayaran (*Custom Payment*)**: Mahasiswa dapat membayar dengan nominal berapapun sesuai kemampuan atau saldo rekening tanpa dipaksa membayar lunas satu invoice penuh.
* **Pembayaran Mandiri Tanpa Menunggu Tagihan (*Self-Service Deposit*)**: Mahasiswa dapat berinisiatif melakukan transfer/setoran kapan saja sebelum invoice semester terbit.
* **Rekening Eksklusif Bank Syariah Indonesia (BSI)**: Pembayaran terpusat pada Rekening resmi **Bank BSI: `1056405743`** an. STIT IHSANUL FIKRI.
* **Unggah Bukti Transfer & Riwayat**: Dilengkapi status verifikasi (*Menunggu Verifikasi*, *Terverifikasi*, *Ditolak*).
* **Kwitansi Digital Sah & Cetak**: Download atau cetak bukti pembayaran resmi ber-QR Code dan tanda tangan digital bendahara.

### 3. 👑 Dashboard Pusat Komando Admin & Bendahara
* **5 Kartu KPI Real-Time**: Realisasi Kas Masuk, Sisa Piutang Berjalan, Total Subsidi Beasiswa, Rasio Kepatuhan SPP, dan Mahasiswa Aktif.
* **Visual Analytics Engine**: Grafik batang komparasi kas vs tunggakan per Prodi dan grafik donut distribusi skema beasiswa.
* **Antrean Verifikasi Kilat (*One-Click Approve/Reject*)**: Notifikasi badge transaksi masuk dengan pratinjau bukti bayar pop-up.

### 4. ⚙️ Tata Kelola 9 Skema Tarif & Beasiswa
* 🎓 **SPP Reguler**: Rp 2.400.000 / semester.
* 🤝 **Kerjasama Mitra / Yayasan**: Rp 1.200.000 / semester (Subsidi 50%).
* 📖 **Guru TPA**: Rp 1.200.000 / semester (Subsidi 50%).
* 🕌 **Alumni Pondok Pesantren**: Rp 1.200.000 / semester (Subsidi 50%).
* 🏠 **Asrama As-Syamil**: Rp 1.440.000 / semester (Subsidi 40%).
* 🌟 **Prestasi Akademik / Non-Akademik**: Rp 1.200.000 / semester (Subsidi 50%).
* 👦 **PAUD Laki-laki**: Gratis SPP Rp 0 (Subsidi 100%).
* 🎁 **Mitra Khusus 100%**: Gratis SPP Rp 0 (Subsidi 100%).
* 🏷️ **Beasiswa Potongan 50%**: Rp 1.200.000 / semester.

### 5. 📅 Kalender Akademik & Jadwal Finansial Terpadu
* Dual View Mode (Linimasa & Kalender Bulanan Interaktif).
* Manajemen agenda akademik, jatuh tempo SPP, dan ekspor format `.ics` (Google / Apple Calendar).

### 6. 🛡️ Validasi Keabsahan Kwitansi QR Code Publik
* Pemindai QR Validator bawaan untuk verifikasi keaslian kwitansi pembayaran secara publik tanpa login.

---

## 🔑 Kredensial Login Demo

Sistem menyediakan akun siap pakai:

| Peran Akun | Username / NIM | Password / PIN | Keterangan |
| :--- | :--- | :--- | :--- |
| **👑 Admin / Bendahara** | `admin` | `admin123` | Akses penuh dashboard, verifikasi, master data, skema beasiswa, laporan |
| **🎓 Mahasiswa BKPI 2026** | `202602001` | `123456` | Za'am Tsafiq Al Azmi (BKPI 2026 - Reguler) |
| **🎓 Mahasiswa PIAUD 2026** | `202601001` | `123456` | Garwita Felda Nabiha (PIAUD 2026 - Reguler) |
| **🎓 Mahasiswa Beasiswa** | `202601002` | `123456` | Muhammad Nanang Nasikin (PIAUD 2026 - Beasiswa PAUD Laki-laki) |

> 💬 **Bantuan Akun & Reset PIN:** Hubungi Admin di **`082342307414`** (WhatsApp).

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
Tidak memerlukan build tool atau database eksternal — murni menggunakan browser modern dengan ES Modules.

### 1. Clone Repositori
```bash
git clone https://github.com/faqih190501/keuangan---STIT.git
cd keuangan---STIT
```

### 2. Jalankan HTTP Server Lokal
Jalankan salah satu opsi web server lokal berikut:

* **Opsi A: Menggunakan PowerShell bawaan (Windows)**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\server.ps1
  ```

* **Opsi B: Menggunakan Python 3**
  ```bash
  python -m http.server 8080
  ```

* **Opsi C: Menggunakan Node.js / NPX**
  ```bash
  npx serve . -p 8080
  ```

Buka peramban pada tautan: **[http://localhost:8080/](http://localhost:8080/)**

---

## 🏛️ Struktur Berkas Proyek

```text
SIMPEL-IF/
├── index.html                  # Halaman Utama Web Application (Single Page App)
├── 404.html                    # Fallback SPA Routing untuk GitHub Pages
├── README.md                   # Dokumentasi Lengkap Proyek
├── server.ps1                  # HTTP Server Ringan PowerShell Bawaan
├── test-all-integrity.ps1      # Skrip Uji Integritas Komprehensif (50 Uji Validasi)
├── assets/
│   └── images/
│       └── logo.png            # Logo Resmi STIT Ihsanul Fikri
├── css/
│   ├── variables.css           # Design Tokens & Skema Warna
│   ├── layout.css              # Tata Letak Grid, Sidebar & Header
│   ├── components.css          # Komponen UI (Card, Table, Modal, Button)
│   ├── receipt.css             # Desain Kwitansi Sah & Template Cetak
│   └── responsive.css          # Penyesuaian Responsif Mobile & Tablet
└── js/
    ├── app.js                  # Core Application Router & Lifecycle Manager
    ├── auth.js                 # Authentication & Role Authorization Manager
    ├── models.js               # Definisi Model Data, Enum & Skema Tarif
    ├── state.js                # Reactive State Store & Pangkalan Data Riil Sheets V7
    ├── billing-engine.js       # Kalkulator Tagihan & Mesin Beasiswa
    ├── modals.js               # Handler Dialog & Modal Interaktif
    ├── utils/
    │   ├── formatters.js       # Formatter Rupiah, Tanggal, Terbilang & Badge
    │   ├── qr-engine.js        # Generator & Validasi QR Code Digital
    │   ├── chart-engine.js     # Rendering Grafik Analitik SVG
    │   ├── export-engine.js    # Mesin Ekspor CSV & Laporan
    │   └── drag-scroll.js      # Universal Mouse/Touch Drag Scroller
    └── views/
        ├── dashboard-bendahara.js  # Dashboard Utama Bendahara & KPI
        ├── view-login.js           # Portal Login & Registrasi Mahasiswa
        ├── view-mahasiswa.js       # Portal Mahasiswa & Pembayaran Fleksibel
        ├── view-matriks-rekap.js   # Tampilan Matriks Google Sheets 1:1
        ├── view-verifikasi.js      # Antrean Verifikasi Bukti Bayar
        ├── view-skema-tarif.js     # Konfigurasi Skema Tarif & Beasiswa
        ├── view-laporan.js         # Laporan Keuangan & Neraca
        ├── view-kalender.js        # Kalender Akademik & Finansial
        ├── view-audit-log.js       # Log Audit Transaksi & Keamanan
        ├── view-akademik.js        # Rekap Mahasiswa & Riwayat Tagihan
        └── view-qr-validator.js    # Pemindai & Validator Kwitansi Publik
```

---

<div align="center">
  <p>© 2026 <strong>STIT Ihsanul Fikri Pabelan Magelang</strong> &bull; Hak Cipta Dilindungi Undang-Undang.</p>
</div>
