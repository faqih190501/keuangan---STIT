# SIMPEL-IF: Sistem Informasi Manajemen Pembayaran Elektronik Ihsanul Fikri
**Sekolah Tinggi Ilmu Tarbiyah (STIT) Ihsanul Fikri Pagentan Magelang**

SIMPEL-IF adalah aplikasi web tata kelola keuangan perguruan tinggi berbasis **Vanilla ES Modules & Responsive Design System** yang dirancang khusus untuk memfasilitasi transparansi tagihan perkuliahan, pengelolaan skema subsidi beasiswa (Asrama, Mitra, PAUD Laki-laki), transaksi Virtual Account perbankan syariah, dan penerbitan kwitansi sah ber-QR Code dengan verifikator digital.

---

## 🌟 Fitur Utama

### 1. 👑 Dashboard Utama Admin (Eksekutif & Keuangan)
- **Pusat Komando Finansial**: 5 Metrik KPI real-time (Realisasi Kas Masuk, Sisa Piutang Berjalan, Subsidi Beasiswa, Rasio Kepatuhan SPP, Total Mahasiswa Aktif).
- **Visual Analytics Canvas**:
  - *Grafik Batang*: Komparasi performa kas & piutang per prodi (**BKPI** vs **PIAUD**).
  - *Grafik Donut*: Distribusi mahasiswa penerima beasiswa vs reguler.
- **Neraca Komparasi Program Studi**: Tabel komparatif pendapatan dan tunggakan institusi dengan fitur ekspor `.csv`.
- **Rekapitulasi Tagihan Mahasiswa**: Pencatatan pelunasan, verifikasi bukti bayar manual, dan penerbitan kwitansi resmi.

### 2. 🎓 Portal Mahasiswa & Pendaftaran PMB Mandiri
- **Rincian Tagihan Transparan**: Rincian SPP/UKT pokok, administrasi daftar ulang, dan potongan subsidi beasiswa.
- **Multi-Bank Virtual Account**: Integrasi simulasi VA Bank Syariah Indonesia (BSI), Bank Muamalat, dan Bank BRI dengan tombol salin instan.
- **Unggah Bukti Transfer Manual**: Verifikasi mandiri pembayaran non-VA.
- **Pendaftaran PMB & Auto-Tagging**: Calon mahasiswa baru dapat mendaftar mandiri dengan deteksi otomatis beasiswa (*Auto-Tagging* afirmasi putra prodi PIAUD diskon SPP 60%).

### 3. ⚙️ Manajemen Skema Beasiswa & Komponen Biaya
- Pengeditan regulasi, nama program, prodi yang berhak, dan persentase (%) / nominal tetap (Rp) subsidi.
- Penambahan program beasiswa baru (Tahfidz, Prestasi, Kader Dai, dll.).
- Otomatisasi hitung ulang (*auto-recalculate*) tagihan berjalan saat skema diubah.

### 4. 🛡️ Kwitansi Sah Digital & Validasi QR Code
- Kwitansi resmi ber-QR Code dengan validasi kriptografis instan untuk mencegah pemalsuan dokumen.
- Audit trail log transaksi lengkap.

### 5. ↔️ Interaksi Horizontal Drag & Swipe
- Seluruh tabel data, baris kartu KPI, dan tombol peran mendukung **klik-dan-geser (*mouse drag-to-scroll*)** pada PC serta **usap/geser (*touch swipe*)** pada HP/Tablet.

---

## 🚀 Cara Menjalankan Aplikasi Secara Lokal

Aplikasi ini dibangun tanpa dependensi runtime yang berat (murni HTML5, CSS3, dan Modern JavaScript ES Modules).

1. Clone repositori ini:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd SIMPEL-IF
   ```

2. Jalankan HTTP server lokal sederhana (misal menggunakan Python, Live Server, atau PowerShell):
   - **Dengan Python**:
     ```bash
     python -m http.server 8080
     ```
   - **Dengan Node.js / npx**:
     ```bash
     npx serve . -p 8080
     ```
   - **Dengan PowerShell**:
     ```powershell
     powershell -ExecutionPolicy Bypass -File scratch/server.ps1
     ```

3. Buka peramban di `http://127.0.0.1:8080/`.

---

## 📂 Struktur Direktori Proyek

```
SIMPEL-IF/
├── assets/
│   └── images/
│       ├── logo.png
│       └── ttd-bendahara.png
├── css/
│   ├── components.css     # Komponen UI, badge, tombol, tabel, dan kartu
│   ├── layout.css         # Struktur layout, sidebar, header, dan banner peran
│   ├── receipt.css        # Format standar kwitansi resmi & layout cetak
│   ├── responsive.css     # Media queries & adaptasi mobile / tablet
│   └── variables.css      # Design tokens (Warna Corporate Blue, Font, Bayangan)
├── js/
│   ├── utils/
│   │   ├── chart-engine.js  # Engine grafik interaktif (Bar & Donut)
│   │   ├── drag-scroll.js   # Universal horizontal drag & touch swipe
│   │   ├── export-engine.js # Ekspor CSV & spreadsheet
│   │   ├── formatters.js    # Pemformat Rupiah, Tanggal, dan Badge
│   │   └── qr-generator.js  # Generator & validator QR Code
│   ├── views/
│   │   ├── dashboard-bendahara.js # Dashboard Utama Admin Terpadu
│   │   ├── view-akademik.js       # Master Data Mahasiswa & BAAK
│   │   ├── view-audit-log.js      # Audit Trail & Log Aktivitas
│   │   ├── view-laporan.js        # Laporan Arus Kas & Piutang
│   │   ├── view-login.js          # Portal Login & Pendaftaran PMB
│   │   ├── view-mahasiswa.js      # Portal Tagihan & VA Mahasiswa
│   │   ├── view-pimpinan.js       # Integrasi Dashboard Eksekutif
│   │   ├── view-qr-validator.js   # Pemindai Validasi QR Kwitansi
│   │   └── view-skema-tarif.js    # Konfigurasi Beasiswa & Tarif
│   ├── app.js             # Router & Inisialisasi Aplikasi
│   ├── auth.js            # Role-Based Access Control (Admin & Mahasiswa)
│   ├── billing-engine.js  # Mesin kalkulasi tagihan & subsidi beasiswa
│   ├── modals.js          # Pengelola dialog interaktif & simulasi
│   ├── models.js          # Definisi model data & enum
│   └── state.js           # Reactive State Manager & Seed Data
├── index.html             # Entry point aplikasi
├── README.md              # Dokumentasi proyek
└── .gitignore             # File yang diabaikan oleh Git
```

---

&copy; 2026 STIT Ihsanul Fikri Pagentan Magelang. All rights reserved.
