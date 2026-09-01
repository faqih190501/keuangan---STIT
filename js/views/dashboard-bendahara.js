/**
 * SIMPEL-IF Dashboard Terpadu: Eksekutif Pimpinan & Operasional Keuangan
 * STIT Ihsanul Fikri
 * Menggabungkan analisis visual tingkat pimpinan, neraca komparasi prodi,
 * distribusi subsidi beasiswa, serta tata kelola operasional tagihan mahasiswa.
 */

import { appState } from '../state.js';
import { AuthManager } from '../auth.js';
import { formatRupiah, formatDate, formatDateTime, getStatusBadge, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { STATUS_TAGIHAN } from '../models.js';
import { BillingEngine } from '../billing-engine.js';
import { ChartEngine } from '../utils/chart-engine.js';
import { exportToCSV } from '../utils/export-engine.js';

export function renderDashboardBendahara(container) {
  const state = appState.getState();
  const invoices = state.invoices;
  const students = state.students;
  const pendingVerifs = state.paymentVerifications.filter(v => v.status === 'PENDING');

  // Breakdown Calculations
  const bkpiStudents = students.filter(s => s.prodi === 'BKPI');
  const piaudStudents = students.filter(s => s.prodi === 'PIAUD');

  let bkpiPaid = 0, bkpiReceivable = 0, bkpiDiscount = 0;
  let piaudPaid = 0, piaudReceivable = 0, piaudDiscount = 0;
  let totalGross = 0;
  let totalDiscount = 0;
  let totalPaid = 0;
  let totalReceivable = 0;

  invoices.forEach(inv => {
    totalGross += inv.grossAmount;
    totalDiscount += inv.totalDiscount;

    const student = students.find(s => s.nim === inv.studentNim);
    const isBkpi = student ? student.prodi === 'BKPI' : true;

    if (inv.status === STATUS_TAGIHAN.LUNAS) {
      totalPaid += inv.paidAmount;
      if (isBkpi) {
        bkpiPaid += inv.paidAmount;
      } else {
        piaudPaid += inv.paidAmount;
      }
    } else if (inv.status === STATUS_TAGIHAN.DICICIL) {
      totalPaid += inv.paidAmount;
      const sisa = inv.netAmount - inv.paidAmount;
      totalReceivable += sisa;
      if (isBkpi) {
        bkpiPaid += inv.paidAmount;
        bkpiReceivable += sisa;
      } else {
        piaudPaid += inv.paidAmount;
        piaudReceivable += sisa;
      }
    } else {
      totalReceivable += inv.netAmount;
      if (isBkpi) {
        bkpiReceivable += inv.netAmount;
      } else {
        piaudReceivable += inv.netAmount;
      }
    }

    if (isBkpi) {
      bkpiDiscount += inv.totalDiscount;
    } else {
      piaudDiscount += inv.totalDiscount;
    }
  });

  const totalTarget = totalPaid + totalReceivable;
  const paidRate = totalTarget > 0 ? ((totalPaid / totalTarget) * 100).toFixed(1) : '0.0';

  const bkpiTarget = bkpiPaid + bkpiReceivable;
  const bkpiRate = bkpiTarget > 0 ? ((bkpiPaid / bkpiTarget) * 100).toFixed(1) : '0.0';

  const piaudTarget = piaudPaid + piaudReceivable;
  const piaudRate = piaudTarget > 0 ? ((piaudPaid / piaudTarget) * 100).toFixed(1) : '0.0';

  const admin = state.adminProfile || {
    name: 'Ustadzah Siti Fatimah, S.E.',
    title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
    department: 'Biro Keuangan & Administrasi Umum (BAU)',
    email: 'bendahara@stit-if.ac.id',
    phone: '081392817263',
    nip: '19840512 201201 2 003',
    avatarText: 'SF'
  };

  container.innerHTML = `
    <!-- Top Header: Executive Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 style="font-size: 1.28rem; font-weight: 800; color: var(--text-dark); margin: 0;">👑 Dashboard Utama Admin</h2>
          <span class="badge badge-scholarship" style="font-size: 0.72rem;">Semester ${state.activeSemester}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">Pusat komando tata kelola finansial, analisis neraca prodi BKPI & PIAUD, serapan beasiswa, dan operasional tagihan mahasiswa STIT Ihsanul Fikri.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-outline" id="btn-admin-open-profile" style="font-weight: 700;">
          👤 Profil Saya
        </button>
        <button class="btn btn-outline" id="btn-goto-akademik" style="font-weight: 700;">
          👥 Data Mahasiswa (${students.length})
        </button>
        <button class="btn btn-outline" id="btn-goto-kalender" style="font-weight: 700;">
          📅 Kalender Akademik
        </button>
        <button class="btn btn-outline" id="btn-export-exec-summary">
          📊 Ekspor Neraca (.csv)
        </button>
        <button class="btn btn-outline" id="btn-print-dashboard">
          🖨️ Cetak Ringkasan
        </button>
        <button class="btn btn-primary" id="btn-quick-new-invoice">
          + Terbitkan Tagihan Baru
        </button>
        <button class="btn btn-outline" id="btn-admin-logout" style="border-color: #fca5a5; color: #b91c1c; background: #fff1f2; font-weight: 700;">
          🚪 Keluar / Logout
        </button>
      </div>
    </div>

    <!-- Admin Profile Identity Banner -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: var(--radius-xl); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #ffffff; color: #1e40af; font-weight: 900; font-size: 1.35rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.18); flex-shrink: 0;">
          ${admin.avatarText || 'SF'}
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h3 style="font-size: 1.08rem; font-weight: 900; margin: 0; color: #ffffff;">${admin.name}</h3>
            <span class="badge" style="background: #3b82f6; color: #ffffff; font-weight: 800; font-size: 0.7rem; padding: 2px 8px;">${admin.nip ? `NIP: ${admin.nip}` : 'Bendahara'}</span>
          </div>
          <div style="font-size: 0.78rem; opacity: 0.92; margin-top: 3px;">
            ${admin.title} &bull; <span style="opacity: 0.85;">${admin.department}</span>
          </div>
          <div style="font-size: 0.72rem; opacity: 0.8; margin-top: 2px;">
            📧 ${admin.email} &bull; 📱 ${admin.phone}
          </div>
        </div>
      </div>
      <button class="btn btn-sm" id="btn-banner-edit-admin-profile" style="background: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); font-weight: 800; font-size: 0.78rem; padding: 8px 16px; border-radius: var(--radius-md); backdrop-filter: blur(4px); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;">
        ✏️ Edit Profil Saya
      </button>
    </div>

    <!-- Alert for Pending Verifications (if any) -->
    ${pendingVerifs.length > 0 ? `
      <div style="background: linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-left: 5px solid #f59e0b; padding: 16px 20px; border-radius: var(--radius-lg); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: var(--shadow-sm); flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 1.6rem;">⚠️</div>
          <div>
            <h4 style="font-size: 0.94rem; font-weight: 700; color: #92400e; margin: 0;">Terdapat ${pendingVerifs.length} Bukti Pembayaran Manual Menunggu Verifikasi</h4>
            <p style="font-size: 0.78rem; color: #b45309; margin: 2px 0 0;">Mahasiswa telah mengunggah bukti transfer manual. Harap verifikasi untuk menerbitkan kwitansi sah QR Code.</p>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" id="btn-goto-verif" style="background: #d97706; border-color: #b45309;">
          Periksa Antrean Verifikasi (${pendingVerifs.length}) &rarr;
        </button>
      </div>
    ` : ''}

    <!-- 1. Executive & Operations KPI Stats Grid -->
    <div class="stats-grid">
      <!-- Card 1: Realisasi Kas Masuk -->
      <div class="stat-card stat-blue">
        <div class="stat-content">
          <span class="stat-label">Realisasi Kas Masuk (Lunas)</span>
          <span class="stat-value">${formatRupiah(totalPaid)}</span>
          <span class="stat-subtext" style="color: #15803d; font-weight: 700;">
            ✓ ${paidRate}% tercapai dari target semester
          </span>
        </div>
        <div class="stat-icon-wrapper">🏦</div>
      </div>

      <!-- Card 2: Piutang Berjalan -->
      <div class="stat-card stat-amber">
        <div class="stat-content">
          <span class="stat-label">Sisa Piutang Berjalan</span>
          <span class="stat-value">${formatRupiah(totalReceivable)}</span>
          <span class="stat-subtext" style="color: #b45309;">
            Tunggakan belum lunas & cicilan aktif
          </span>
        </div>
        <div class="stat-icon-wrapper">⏳</div>
      </div>

      <!-- Card 3: Total Subsidi Beasiswa Kampus -->
      <div class="stat-card stat-sky">
        <div class="stat-content">
          <span class="stat-label">Total Subsidi Beasiswa</span>
          <span class="stat-value">${formatRupiah(totalDiscount)}</span>
          <span class="stat-subtext" style="color: #0284c7; font-weight: 600;">
            Disalurkan oleh STIT Ihsanul Fikri
          </span>
        </div>
        <div class="stat-icon-wrapper">🌟</div>
      </div>

      <!-- Card 4: Rasio Kepatuhan Pembayaran -->
      <div class="stat-card stat-green">
        <div class="stat-content">
          <span class="stat-label">Rasio Kepatuhan SPP</span>
          <span class="stat-value">${paidRate}%</span>
          <span class="stat-subtext" style="color: #15803d;">
            ${Number(paidRate) >= 60 ? 'Status Kolektibilitas Baik' : 'Perlu Monitoring Penagihan'}
          </span>
        </div>
        <div class="stat-icon-wrapper">📈</div>
      </div>

      <!-- Card 5: Total Mahasiswa Terdaftar (Clickable) -->
      <div class="stat-card stat-purple" id="card-goto-akademik" style="cursor: pointer; transition: transform 0.2s;" title="Klik untuk membuka Direktori Lengkap Mahasiswa & Pengguna Terdaftar">
        <div class="stat-content">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="stat-label">Total Mahasiswa Terdaftar</span>
            <span style="font-size: 0.68rem; color: #7c3aed; font-weight: 800; text-decoration: underline;">Buka Data ➔</span>
          </div>
          <span class="stat-value">${students.length} <span style="font-size: 1rem; font-weight: 600;">Org</span></span>
          <span class="stat-subtext">
            BKPI: ${bkpiStudents.length} | PIAUD: ${piaudStudents.length}
          </span>
        </div>
        <div class="stat-icon-wrapper">👥</div>
      </div>
    </div>

    <!-- 2. Visual Analytics Charts Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 24px; margin-bottom: 28px;">
      
      <!-- Chart 1: Bar Chart Perbandingan Keuangan Prodi -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="card-title">📊 Komparasi Performa Finansial per Prodi</h3>
            <p class="card-subtitle">Bimbingan Konseling (BKPI) vs PAUD Islam (PIAUD)</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; padding: 10px 0;">
          <canvas id="dashboard-chart-prodi"></canvas>
        </div>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px; font-size: 0.78rem; font-weight: 700; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 12px; height: 12px; background: #1e40af; border-radius: 2px;"></span>
            <span>BKPI: Kas ${formatRupiah(bkpiPaid)} (${bkpiRate}%)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 12px; height: 12px; background: #be185d; border-radius: 2px;"></span>
            <span>PIAUD: Kas ${formatRupiah(piaudPaid)} (${piaudRate}%)</span>
          </div>
        </div>
      </div>

      <!-- Chart 2: Donut Chart Distribusi Beasiswa -->
      <div class="card">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="card-title">🎯 Diagram Distribusi Skema Beasiswa Institusi</h3>
            <p class="card-subtitle">Sebaran mahasiswa penerima beasiswa & mahasiswa reguler</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; padding: 10px 0;">
          <canvas id="dashboard-chart-scholarship"></canvas>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; font-size: 0.76rem; font-weight: 600; padding: 0 10px;">
          ${state.scholarshipSchemes.map((sc, idx) => {
            const count = state.students.filter(s => s.scholarshipId === sc.id).length;
            const colors = ['#64748b', '#1e40af', '#0284c7', '#be185d', '#10b981', '#f59e0b', '#8b5cf6'];
            const color = colors[idx % colors.length];
            return `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 10px; height: 10px; background: ${color}; border-radius: 2px; flex-shrink: 0;"></span>
                <span>${sc.name.split('(')[0]}: <strong>${count} mhs</strong></span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>

    <!-- 3. Executive Comparative Balance Sheet Table -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header">
        <div class="card-title-group">
          <h3 class="card-title">📑 Rincian Neraca Komparasi Finansial Program Studi</h3>
          <p class="card-subtitle">Laporan ringkas efektivitas penagihan dan subsidi beasiswa STIT Ihsanul Fikri</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Program Studi</th>
              <th>Total Mahasiswa</th>
              <th>Total Tagihan Bruto</th>
              <th>Total Subsidi Beasiswa</th>
              <th>Realisasi Kas Masuk</th>
              <th>Sisa Tunggakan (Piutang)</th>
              <th>Kepatuhan (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 800; color: #1e40af;">Bimbingan Konseling Pendidikan Islam (BKPI)</div>
                <div style="font-size: 0.72rem; color: var(--text-light);">Jenjang Sarjana (S1)</div>
              </td>
              <td style="font-weight: 700;">${bkpiStudents.length} Mahasiswa</td>
              <td>${formatRupiah(bkpiPaid + bkpiReceivable + bkpiDiscount)}</td>
              <td style="color: #0284c7; font-weight: 700;">${formatRupiah(bkpiDiscount)}</td>
              <td style="font-weight: 800; color: #15803d;">${formatRupiah(bkpiPaid)}</td>
              <td style="font-weight: 700; color: #b91c1c;">${formatRupiah(bkpiReceivable)}</td>
              <td>
                <span class="badge ${Number(bkpiRate) >= 60 ? 'badge-paid' : 'badge-pending'}">
                  ${bkpiRate}%
                </span>
              </td>
            </tr>
            <tr>
              <td>
                <div style="font-weight: 800; color: #be185d;">Pendidikan Islam Anak Usia Dini (PIAUD)</div>
                <div style="font-size: 0.72rem; color: var(--text-light);">Jenjang Sarjana (S1)</div>
              </td>
              <td style="font-weight: 700;">${piaudStudents.length} Mahasiswa</td>
              <td>${formatRupiah(piaudPaid + piaudReceivable + piaudDiscount)}</td>
              <td style="color: #0284c7; font-weight: 700;">${formatRupiah(piaudDiscount)}</td>
              <td style="font-weight: 800; color: #15803d;">${formatRupiah(piaudPaid)}</td>
              <td style="font-weight: 700; color: #b91c1c;">${formatRupiah(piaudReceivable)}</td>
              <td>
                <span class="badge ${Number(piaudRate) >= 60 ? 'badge-paid' : 'badge-pending'}">
                  ${piaudRate}%
                </span>
              </td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 800;">
              <td>TOTAL INSTITUSI</td>
              <td>${students.length} Mahasiswa</td>
              <td>${formatRupiah(totalGross)}</td>
              <td style="color: #0284c7;">${formatRupiah(totalDiscount)}</td>
              <td style="color: #15803d;">${formatRupiah(totalPaid)}</td>
              <td style="color: #b91c1c;">${formatRupiah(totalReceivable)}</td>
              <td>
                <span class="badge badge-scholarship">${paidRate}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Operational Invoices Management Table -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 14px;">
        <div class="card-title-group">
          <h3 class="card-title">📑 Rekapitulasi Tagihan & Tata Kelola Pembayaran Mahasiswa</h3>
          <p class="card-subtitle">Daftar transaksi per mahasiswa, penerbitan kwitansi sah QR Code, dan verifikasi</p>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="filter-prodi-select">
            <option value="ALL">Semua Program Studi</option>
            <option value="BKPI">Bimbingan Konseling (BKPI)</option>
            <option value="PIAUD">PAUD Islam (PIAUD)</option>
          </select>
          <select class="filter-select" id="filter-status-select">
            <option value="ALL">Semua Status Bayar</option>
            <option value="LUNAS">Lunas</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="BELUM_BAYAR">Belum Bayar</option>
            <option value="DICICIL">Dicicil / Dispensasi</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="invoices-data-table">
          <thead>
            <tr>
              <th>No. Tagihan</th>
              <th>Mahasiswa</th>
              <th>Prodi & Sem</th>
              <th>Skema Beasiswa</th>
              <th>Tarif Dasar</th>
              <th>Subsidi Beasiswa</th>
              <th>Nominal Bayar</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${renderInvoicesTableRows(invoices, state)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Render Charts after DOM injection
  setTimeout(() => {
    const canvasBar = container.querySelector('#dashboard-chart-prodi');
    if (canvasBar) {
      ChartEngine.renderBarChart(canvasBar, {
        categories: ['Realisasi Kas', 'Tunggakan Piutang', 'Subsidi Beasiswa'],
        series1: { name: 'BKPI', values: [bkpiPaid, bkpiReceivable, bkpiDiscount] },
        series2: { name: 'PIAUD', values: [piaudPaid, piaudReceivable, piaudDiscount] }
      });
    }

    const canvasDonut = container.querySelector('#dashboard-chart-scholarship');
    if (canvasDonut) {
      const colors = ['#64748b', '#1e40af', '#0284c7', '#be185d', '#10b981', '#f59e0b', '#8b5cf6'];
      const donutData = state.scholarshipSchemes.map((sc, idx) => ({
        label: sc.name.split('(')[0],
        value: state.students.filter(s => s.scholarshipId === sc.id).length,
        color: colors[idx % colors.length]
      }));
      ChartEngine.renderDonutChart(canvasDonut, donutData);
    }
  }, 60);

  // Attach Event Listeners
  const btnGotoVerif = container.querySelector('#btn-goto-verif');
  if (btnGotoVerif) {
    btnGotoVerif.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-verifikasi');
    });
  }

  const btnAdminProfile = container.querySelector('#btn-admin-open-profile');
  if (btnAdminProfile) {
    btnAdminProfile.addEventListener('click', () => {
      window.simpelModals.openAdminSelfProfileModal();
    });
  }

  const btnBannerAdminProfile = container.querySelector('#btn-banner-edit-admin-profile');
  if (btnBannerAdminProfile) {
    btnBannerAdminProfile.addEventListener('click', () => {
      window.simpelModals.openAdminSelfProfileModal();
    });
  }

  const btnGotoCal = container.querySelector('#btn-goto-kalender');
  if (btnGotoCal) {
    btnGotoCal.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-kalender');
    });
  }

  const btnGotoAkademik = container.querySelector('#btn-goto-akademik');
  if (btnGotoAkademik) {
    btnGotoAkademik.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-akademik');
    });
  }

  const cardGotoAkademik = container.querySelector('#card-goto-akademik');
  if (cardGotoAkademik) {
    cardGotoAkademik.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-akademik');
    });
  }

  const btnNewInv = container.querySelector('#btn-quick-new-invoice');
  if (btnNewInv) {
    btnNewInv.addEventListener('click', () => {
      window.simpelModals.openAddStudentModal();
    });
  }

  const btnPrint = container.querySelector('#btn-print-dashboard');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  const btnAdminLogout = container.querySelector('#btn-admin-logout');
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      AuthManager.logout();
    });
  }

  const btnExport = container.querySelector('#btn-export-exec-summary');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const rows = [
        {
          'Program Studi': 'Bimbingan Konseling Pendidikan Islam (BKPI)',
          'Total Mahasiswa': bkpiStudents.length,
          'Total Tagihan Bruto': bkpiPaid + bkpiReceivable + bkpiDiscount,
          'Subsidi Beasiswa': bkpiDiscount,
          'Realisasi Kas Masuk': bkpiPaid,
          'Sisa Tunggakan': bkpiReceivable,
          'Kepatuhan (%)': `${bkpiRate}%`
        },
        {
          'Program Studi': 'Pendidikan Islam Anak Usia Dini (PIAUD)',
          'Total Mahasiswa': piaudStudents.length,
          'Total Tagihan Bruto': piaudPaid + piaudReceivable + piaudDiscount,
          'Subsidi Beasiswa': piaudDiscount,
          'Realisasi Kas Masuk': piaudPaid,
          'Sisa Tunggakan': piaudReceivable,
          'Kepatuhan (%)': `${piaudRate}%`
        },
        {
          'Program Studi': 'TOTAL INSTITUSI STIT IHSANUL FIKRI',
          'Total Mahasiswa': students.length,
          'Total Tagihan Bruto': totalGross,
          'Subsidi Beasiswa': totalDiscount,
          'Realisasi Kas Masuk': totalPaid,
          'Sisa Tunggakan': totalReceivable,
          'Kepatuhan (%)': `${paidRate}%`
        }
      ];
      exportToCSV(rows, `Neraca_Eksekutif_Keuangan_STIT_IF_${state.activeSemester.replace(/[\/\s]/g, '_')}`);
      window.simpelToast.show('Ekspor Berhasil', 'Ringkasan neraca eksekutif berhasil diunduh.', 'success');
    });
  }

  // Filter Listeners
  const filterProdi = container.querySelector('#filter-prodi-select');
  const filterStatus = container.querySelector('#filter-status-select');
  const tbody = container.querySelector('#invoices-data-table tbody');

  function applyFilters() {
    const selectedProdi = filterProdi.value;
    const selectedStatus = filterStatus.value;

    const filtered = invoices.filter(inv => {
      const student = students.find(s => s.nim === inv.studentNim);
      if (!student) return false;

      const matchProdi = selectedProdi === 'ALL' || student.prodi === selectedProdi;
      const matchStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;

      return matchProdi && matchStatus;
    });

    tbody.innerHTML = renderInvoicesTableRows(filtered, state);
    attachTableActionListeners(tbody, state);
  }

  if (filterProdi) filterProdi.addEventListener('change', applyFilters);
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);

  attachTableActionListeners(tbody, state);
}

function renderInvoicesTableRows(invoicesList, state) {
  if (!invoicesList || invoicesList.length === 0) {
    return `
      <tr>
        <td colspan="9" class="table-empty-state">
          <div class="table-empty-icon">📂</div>
          <p>Tidak ada data tagihan yang sesuai dengan kriteria filter.</p>
        </td>
      </tr>
    `;
  }

  return invoicesList.map(inv => {
    const student = state.students.find(s => s.nim === inv.studentNim) || {
      name: 'Mahasiswa',
      nim: inv.studentNim,
      prodi: 'BKPI',
      semester: 1,
      scholarshipId: 'REGULER'
    };

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; font-size: 0.78rem; color: var(--primary-700);">
          ${inv.id}
        </td>
        <td>
          <div class="table-student-name">${student.name}</div>
          <div class="table-student-nim">NIM: ${student.nim}</div>
        </td>
        <td>
          <div>${getProdiBadge(student.prodi)}</div>
          <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">Semester ${student.semester}</div>
        </td>
        <td>
          ${getScholarshipBadge(student.scholarshipId)}
        </td>
        <td style="font-size: 0.84rem; color: var(--text-muted);">
          ${formatRupiah(inv.grossAmount)}
        </td>
        <td style="font-size: 0.84rem; color: #0284c7; font-weight: 600;">
          ${inv.totalDiscount > 0 ? `-${formatRupiah(inv.totalDiscount)}` : 'Rp 0'}
        </td>
        <td style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">
          ${formatRupiah(inv.netAmount)}
        </td>
        <td>
          ${getStatusBadge(inv.status)}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${inv.status === STATUS_TAGIHAN.LUNAS ? `
              <button class="btn btn-outline btn-sm btn-action-receipt" data-inv-id="${inv.id}" title="Lihat Kwitansi Resmi">
                🧾 Kwitansi
              </button>
            ` : `
              <button class="btn btn-primary btn-sm btn-action-pay" data-inv-id="${inv.id}" title="Input Pembayaran">
                💳 Bayar
              </button>
            `}
            <button class="btn btn-outline btn-sm btn-action-detail" data-inv-id="${inv.id}" title="Detail Rincian">
              👁️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function attachTableActionListeners(tbody, state) {
  if (!tbody) return;

  tbody.querySelectorAll('.btn-action-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-inv-id');
      window.simpelModals.openReceiptModal(invId);
    });
  });

  tbody.querySelectorAll('.btn-action-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-inv-id');
      const inv = state.invoices.find(i => i.id === invId);
      if (!inv) return;
      window.simpelModals.openReceiptModal(invId);
    });
  });

  tbody.querySelectorAll('.btn-action-pay').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-inv-id');
      const inv = state.invoices.find(i => i.id === invId);
      if (!inv) return;

      const student = state.students.find(s => s.nim === inv.studentNim);
      const studentName = student ? student.name : inv.studentNim;

      const isInstallment = inv.status === STATUS_TAGIHAN.DICICIL;
      const sisaBayar = isInstallment ? (inv.netAmount - (inv.paidAmount || 0)) : inv.netAmount;

      if (confirm(`Konfirmasi Penerimaan Pembayaran Kasir / Bank:\n\n• Mahasiswa: ${studentName}\n• Tagihan: ${inv.id}\n• Sisa Wajib Bayar: ${formatRupiah(sisaBayar)}\n\nLanjutkan pelunasan kasir dan terbitkan kwitansi resmi sekarang?`)) {
        const res = BillingEngine.processManualPayment({
          invoiceId: inv.id,
          amount: sisaBayar,
          method: 'KASIR_TUNAI',
          verifiedBy: state.currentUser.name || 'Admin Bendahara',
          notes: 'Pelunasan langsung kasir kampus STIT Ihsanul Fikri'
        });

        if (res.success) {
          window.simpelToast.show('Pembayaran Berhasil Dilunasi', `Kwitansi resmi ${res.receiptNumber} telah diterbitkan.`, 'success');
          if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
          window.simpelModals.openReceiptModal(res.invoice.id);
        }
      }
    });
  });
}
