<div align="center">
  <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" width="100" height="100" style="border-radius: 16px;">
  <h1>SIMPEL-IF (Sistem Informasi Manajemen Pembayaran Elektronik Ihsanul Fikri)</h1>
  <p><strong>Sekolah Tinggi Ilmu Tarbiyah (STIT) Ihsanul Fikri Pagentan Magelang</strong></p>

  <p>
    <a href="https://faqih190501.github.io/keuangan---STIT/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github" alt="Live Demo"></a>
    <img src="https://img.shields.io/badge/Version-2.0.1-emerald?style=for-the-badge" alt="Version">
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

---

## 🌐 Demo Publik (Live Web)

Aplikasi dapat langsung diakses secara publik melalui tautan GitHub Pages berikut:
👉 **[https://faqih190501.github.io/keuangan---STIT/](https://faqih190501.github.io/keuangan---STIT/)**

---

## ✨ Fitur Unggulan Sistem

### 1. 🎓 Portal Mahasiswa & Pembayaran Fleksibel
* **Bebas Tentukan Nominal Pembayaran (*Custom Payment*)**: Mahasiswa dapat membayar dengan nominal berapapun sesuai kemampuan atau saldo rekening tanpa dipaksa membayar lunas satu invoice penuh.
* **Pembayaran Mandiri Tanpa Menunggu Tagihan (*Self-Service Deposit*)**: Mahasiswa dapat berinisiatif melakukan transfer/setoran kapan saja (misal: Cicilan SPP, Tabungan Wisuda, KKN) sebelum invoice semester terbit.
* **Rekening Eksklusif Bank Syariah Indonesia (BSI)**: Pembayaran terpusat pada Rekening/VA resmi **Bank BSI: `1056405743`** an. STIT IHSANUL FIKRI dengan tombol salin instan (*one-click copy*).
* **Unggah Bukti Transfer & Riwayat**: Dilengkapi status verifikasi (*Menunggu Verifikasi*, *Terverifikasi*, *Ditolak*).
* **Edit Profil & Biodata Mandiri**: Mahasiswa dapat mengelola data profil, email, no. HP/WhatsApp, dan alamat domisili.
* **Kwitansi Digital Sah & Cetak**: Download atau cetak bukti pembayaran resmi lengkap dengan tanda tangan digital bendahara institusi dan QR Code.

### 2. 👑 Dashboard Pusat Komando Admin & Bendahara
* **5 Kartu KPI Real-Time**: Realisasi Kas Masuk, Sisa Piutang Berjalan, Total Subsidi Beasiswa, Rasio Kepatuhan SPP, dan Mahasiswa Aktif.
* **Visual Analytics Engine**:
  * **Grafik Batang (*Bar Chart*)**: Komparasi perolehan kas vs tunggakan per Program Studi (**BKPI** vs **PIAUD**).
  * **Grafik Donut (*Donut Chart*)**: Proporsi mahasiswa Reguler vs Penerima Beasiswa.
* **Antrean Verifikasi Kilat (*One-Click Approve/Reject*)**: Notifikasi badge transaksi masuk dengan pratinjau bukti bayar pop-up.
* **Sinkronisasi Realtime Otomatis**: Setiap pembayaran yang disetujui langsung memperbarui saldo dashboard, neraca, rekapitulasi, dan kwitansi mahasiswa tanpa perlu refresh halaman manual.

### 3. ⚙️ Tata Kelola Skema Tarif & Beasiswa
* **Konfigurasi Fleksibel**: Dukungan subsidi berbasis persentase (`%`) maupun nominal tetap (`Rp`).
* **Auto-Recalculate**: Otomatisasi kalkulasi ulang seluruh tagihan semester aktif saat nominal atau persentase beasiswa diperbarui.
* **Auto-Tagging Mahasiswa Baru**: Calon mahasiswa laki-laki di prodi PIAUD secara otomatis mendapatkan afirmasi *Beasiswa PAUD Laki-laki* (Diskon SPP 60%).

### 4. 📅 Kalender Akademik & Jadwal Finansial Terpadu
* **Dual View Mode (Linimasa & Kalender Bulanan)**: Pilihan tampilan antara daftar linimasa kronologis (*Timeline Cards*) dan matriks kalender bulanan interaktif (*Interactive Monthly Grid*).
* **Klasifikasi & Filter Multi-Kategori**: Pengelompokan warna otomatis untuk 💰 *Keuangan & SPP*, 📚 *Perkuliahan & Ujian*, 🎉 *Kegiatan & Wisuda*, serta 🌴 *Hari Libur & Cuti*.
* **Manajemen Penuh untuk Admin**: Fitur tambah, sunting, dan hapus jadwal agenda akademik serta sinkronisasi batas jatuh tempo tagihan.
* **Notifikasi & Hitung Mundur untuk Mahasiswa**: Penghitung sisa hari (*countdown*), penanda status agenda (*Sedang Berlangsung*, *X Hari Lagi*, *Selesai*), dan tombol langsung bayar tagihan.
* **Ekspor & Sinkronisasi Eksternal**: Fitur unduh kalender berformat `.ics` (kompatibel langsung dengan Google Calendar, Apple Calendar, Outlook) serta format cetak resmi.

### 5. 🛡️ Validasi Keabsahan Kwitansi QR Code Publik
* Setiap kwitansi memiliki kode verifikasi unik terenkripsi.
* Pemindai QR Validator bawaan dapat digunakan oleh publik/pihak ketiga untuk memeriksa keaslian bukti bayar tanpa perlu login.

### 6. ↔️ Pengalaman Pengguna (Universal Drag & Swipe)
* Semua tabel data panjang, baris indikator KPI, dan pilihan peran dapat digeser dengan **Mouse Drag** di desktop PC dan **Touch Swipe** di ponsel pintar / tablet.

---

## 🔑 Kredensial Login Demo

Sistem menyediakan akun simulasi langsung pada portal:

| Peran Akun | Username / NIM | Password / PIN | Hak Akses |
| :--- | :--- | :--- | :--- |
| **👑 Admin / Bendahara** | `admin` | `admin123` | Akses penuh dashboard, verifikasi, master data, skema beasiswa, laporan |
| **🎓 Mahasiswa (Contoh 1)** | `202486209012` | `123456` | Portal mahasiswa M. Ihsan Kamil (BKPI - Beasiswa Mitra 50%) |
| **🎓 Mahasiswa (Contoh 2)** | `202486208005` | `123456` | Portal mahasiswa Siti Aisyah (PIAUD - Beasiswa Asrama 100%) |
| **🎓 Mahasiswa (Contoh 3)** | `202386209001` | `123456` | Portal mahasiswa Ahmad Fauzi (BKPI - Reguler) |

> 💬 **Bantuan Akun & Reset PIN:** Hubungi Admin di **`082342307414`** (WhatsApp).

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
Tidak memerlukan Node.js build step, runtime compiler, atau database eksternal — murni menggunakan browser modern dengan dukungan ES Modules.

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

* **Opsi D: Menggunakan VS Code Live Server Extension**
  Klik kanan pada file `index.html` lalu pilih **"Open with Live Server"**.

### 3. Buka di Browser
Akses URL: `http://127.0.0.1:8080/`

---

## 📁 Struktur Direktori

```
SIMPEL-IF/
├── assets/
│   └── images/
│       ├── logo.png             # Logo resmi STIT Ihsanul Fikri
│       └── ttd-bendahara.png    # Tanda tangan & cap resmi kwitansi
├── css/
│   ├── components.css           # Desain tombol, badge, modal, tabel, dan formulir
│   ├── layout.css               # Header, sidebar navigasi, dan layout grid
│   ├── receipt.css              # Standar tata letak kwitansi resmi & print preview
│   ├── responsive.css           # Desain adaptif mobile (<768px), tablet, dan desktop
│   └── variables.css            # Token desain warna Corporate Blue, font, bayangan
├── js/
│   ├── utils/
│   │   ├── chart-engine.js      # Generator grafik interaktif (Bar & Donut Canvas)
│   │   ├── drag-scroll.js       # Universal horizontal drag & touch swipe handler
│   │   ├── export-engine.js     # Engine ekspor data ke Excel (CSV) dan print
│   │   ├── formatters.js        # Formatter mata uang Rupiah, tanggal, dan terbilang
│   │   └── qr-engine.js         # Generator & parser QR Code SVG kriptografis
│   ├── views/
│   │   ├── dashboard-bendahara.js # Pusat komando eksekutif & bendahara
│   │   ├── view-akademik.js       # Manajemen data mahasiswa & program studi
│   │   ├── view-audit-log.js      # Audit trail riwayat seluruh transaksi sistem
│   │   ├── view-kalender.js       # Kalender akademik, linimasa agenda & jadwal SPP
│   │   ├── view-laporan.js        # Laporan arus kas masuk & rekapitulasi piutang
│   │   ├── view-login.js          # Portal login mahasiswa, admin, dan PMB
│   │   ├── view-mahasiswa.js      # Portal tagihan, bayar mandiri, dan profil mhs
│   │   ├── view-pimpinan.js       # Ringkasan analitik pimpinan institusi
│   │   ├── view-qr-validator.js   # Pemindai dan validasi keaslian kwitansi QR
│   │   └── view-skema-tarif.js    # Konfigurasi beasiswa & komponen tarif biaya
│   ├── app.js                   # Inisialisasi router SPA & event listener global
│   ├── auth.js                  # Manajemen sesi dan Role-Based Access Control
│   ├── billing-engine.js        # Algoritma perhitungan tagihan & beasiswa
│   ├── modals.js                # Dialog interaktif (Kwitansi, Bayar, Profil, Edit)
│   ├── models.js                # Definisi skema data, prodi, dan jenis beasiswa
│   └── state.js                 # Reactive global state manager & data awal
├── 404.html                     # Fallback routing untuk GitHub Pages
├── index.html                   # Entry point aplikasi utama
├── LICENSE                      # Lisensi MIT
├── README.md                    # Dokumentasi lengkap sistem
├── server.ps1                   # Web server lokal ringan
└── test-endpoints.ps1           # Script pengujian integritas 31 endpoint
```

---

## 🛠️ Teknologi yang Digunakan

* **Bahasa Utama**: HTML5 Semantik, Vanilla CSS3 (Custom Properties & Responsive Design), Modern JavaScript (ES2022+ Modules).
* **Typography**: Plus Jakarta Sans & JetBrains Mono (Google Fonts).
* **Grafik**: HTML5 Canvas Rendering Engine (tanpa dependensi eksternal).
* **QR Generator**: Custom SVG Cryptographic Matrix Generator.
* **Keamanan & Validasi**: Role-Based Authorization, Cryptographic Token Verification, Cross-Browser Compatibility.

---

## 📞 Kontak & Dukungan Institusi

**Sekolah Tinggi Ilmu Tarbiyah (STIT) Ihsanul Fikri**  
📍 Jl. Pagentan, Pagentan, Kec. Tempuran, Kabupaten Magelang, Jawa Tengah 56161  
📱 **WhatsApp / Hotline Admin Keuangan:** `082342307414`  
🏦 **Rekening Resmi:** Bank BSI `1056405743` a.n. STIT IHSANUL FIKRI  
🌐 **Website:** [https://stit-ihsanulfikri.ac.id](https://stit-ihsanulfikri.ac.id)

---

&copy; 2026 STIT Ihsanul Fikri Pagentan Magelang. All rights reserved.
