/**
 * SIMPEL-IF Modul Rekapitulasi & Pelaporan Keuangan
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, formatDate, getProdiBadge, getScholarshipBadge, getStatusBadge } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-engine.js';

export function renderLaporanView(container) {
  const state = appState.getState();
  let currentFiltered = [...state.invoices];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark);">📊 Rekapitulasi & Laporan Keuangan Kuliah</h2>
        <p style="font-size: 0.8rem; color: var(--text-light);">Laporan penyerapan dana beasiswa, realisasi kas, dan audit piutang per prodi STIT Ihsanul Fikri.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" id="btn-export-laporan-excel">
          📥 Ekspor ke Excel (.csv)
        </button>
        <button class="btn btn-outline" id="btn-print-laporan">
          🖨️ Cetak Laporan Resmi
        </button>
      </div>
    </div>

    <!-- Filter Multi-Dimensi -->
    <div class="card" style="margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Program Studi</label>
          <select class="filter-select" id="rep-filter-prodi" style="width: 100%;">
            <option value="ALL">Semua Program Studi</option>
            <option value="BKPI">Bimbingan Konseling (BKPI)</option>
            <option value="PIAUD">PAUD Islam (PIAUD)</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Kategori Skema Beasiswa</label>
          <select class="filter-select" id="rep-filter-scholarship" style="width: 100%;">
            <option value="ALL">Semua Skema Pembiayaan</option>
            ${state.scholarshipSchemes.map(sc => `
              <option value="${sc.id}">${sc.name}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Status Pembayaran</label>
          <select class="filter-select" id="rep-filter-status" style="width: 100%;">
            <option value="ALL">Semua Status</option>
            <option value="LUNAS">Lunas</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="BELUM_BAYAR">Belum Bayar</option>
            <option value="DICICIL">Dicicil / Dispensasi</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Semester</label>
          <select class="filter-select" id="rep-filter-semester" style="width: 100%;">
            <option value="ALL">Semua Semester</option>
            <option value="${state.activeSemester}" selected>${state.activeSemester}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Laporan Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <h3 class="card-title">📑 Tabel Rekapitulasi Tagihan, Subsidi & Kas</h3>
          <p class="card-subtitle" id="rep-summary-text">Memuat seluruh data transaksi semester ${state.activeSemester}</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="laporan-table">
          <thead>
            <tr>
              <th>No</th>
              <th>NIM & Mahasiswa</th>
              <th>Prodi & Sem</th>
              <th>Skema Beasiswa</th>
              <th>Tarif Bruto (Rp)</th>
              <th>Subsidi Beasiswa (Rp)</th>
              <th>Wajib Bayar (Rp)</th>
              <th>Terbayar (Rp)</th>
              <th>Sisa Tunggakan (Rp)</th>
              <th>Status</th>
              <th>No. Kwitansi</th>
            </tr>
          </thead>
          <tbody>
            ${renderLaporanRows(currentFiltered, state)}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid var(--border-color);" id="laporan-tfoot">
              ${renderLaporanFoot(currentFiltered)}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;

  // Attach filters
  const fProdi = container.querySelector('#rep-filter-prodi');
  const fSch = container.querySelector('#rep-filter-scholarship');
  const fStatus = container.querySelector('#rep-filter-status');
  const fSem = container.querySelector('#rep-filter-semester');
  const summaryText = container.querySelector('#rep-summary-text');

  function updateLaporan() {
    const pVal = fProdi.value;
    const schVal = fSch.value;
    const stVal = fStatus.value;
    const semVal = fSem.value;

    currentFiltered = state.invoices.filter(inv => {
      const student = state.students.find(s => s.nim === inv.studentNim);
      if (!student) return false;

      const matchP = pVal === 'ALL' || student.prodi === pVal;
      const matchSch = schVal === 'ALL' || student.scholarshipId === schVal;
      const matchSt = stVal === 'ALL' || inv.status === stVal;
      const matchSem = semVal === 'ALL' || inv.semester === semVal;

      return matchP && matchSch && matchSt && matchSem;
    });

    if (summaryText) {
      summaryText.textContent = `Menampilkan ${currentFiltered.length} data transaksi sesuai filter`;
    }

    const tbody = container.querySelector('#laporan-table tbody');
    const tfoot = container.querySelector('#laporan-tfoot');
    if (tbody) tbody.innerHTML = renderLaporanRows(currentFiltered, state);
    if (tfoot) tfoot.innerHTML = renderLaporanFoot(currentFiltered);
  }

  if (fProdi) fProdi.addEventListener('change', updateLaporan);
  if (fSch) fSch.addEventListener('change', updateLaporan);
  if (fStatus) fStatus.addEventListener('change', updateLaporan);
  if (fSem) fSem.addEventListener('change', updateLaporan);

  // Attach Export
  const btnExport = container.querySelector('#btn-export-laporan-excel');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Prodi', 'Semester', 'Skema Beasiswa', 'Tarif Bruto (Rp)', 'Subsidi Beasiswa (Rp)', 'Wajib Bayar (Rp)', 'Terbayar (Rp)', 'Sisa Piutang (Rp)', 'Status', 'No. Kwitansi'];
      
      const rows = currentFiltered.map((inv, idx) => {
        const student = state.students.find(s => s.nim === inv.studentNim) || { name: '-', nim: inv.studentNim, prodi: '-', semester: '-', scholarshipId: 'REGULER' };
        const sch = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId);
        const sisa = inv.netAmount - inv.paidAmount;

        return [
          idx + 1,
          student.nim,
          student.name,
          student.prodi,
          student.semester,
          sch ? sch.name : 'Reguler',
          inv.grossAmount,
          inv.totalDiscount,
          inv.netAmount,
          inv.paidAmount,
          sisa,
          inv.status,
          inv.receiptNumber || '-'
        ];
      });

      exportToCSV(`Rekapitulasi_Keuangan_STIT_Ihsanul_Fikri_${state.activeSemester.replace(/[\/\s]/g, '_')}`, headers, rows);
      window.simpelToast.show('Ekspor Berhasil', `${currentFiltered.length} data laporan berhasil diekspor.`, 'success');
    });
  }

  const btnPrint = container.querySelector('#btn-print-laporan');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

function renderLaporanRows(invoices, state) {
  if (invoices.length === 0) {
    return `
      <tr>
        <td colspan="11" class="table-empty-state">
          <div class="table-empty-icon">📊</div>
          <p>Tidak ada data laporan yang memenuhi kriteria filter.</p>
        </td>
      </tr>
    `;
  }

  return invoices.map((inv, idx) => {
    const student = state.students.find(s => s.nim === inv.studentNim) || { name: 'Mahasiswa', nim: inv.studentNim, prodi: 'BKPI', semester: 1, scholarshipId: 'REGULER' };
    const sisa = inv.netAmount - inv.paidAmount;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-dark);">${student.name}</div>
          <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-light);">${student.nim}</div>
        </td>
        <td>
          ${getProdiBadge(student.prodi)}
          <span style="font-size: 0.74rem; font-weight: 600; color: var(--text-muted); margin-left: 4px;">Sem ${student.semester}</span>
        </td>
        <td>
          ${getScholarshipBadge(student.scholarshipId)}
        </td>
        <td>${formatRupiah(inv.grossAmount)}</td>
        <td style="color: #0284c7; font-weight: 700;">-${formatRupiah(inv.totalDiscount)}</td>
        <td style="font-weight: 700;">${formatRupiah(inv.netAmount)}</td>
        <td style="font-weight: 800; color: #15803d;">${formatRupiah(inv.paidAmount)}</td>
        <td style="font-weight: 700; color: ${sisa > 0 ? '#b91c1c' : '#64748b'};">${formatRupiah(sisa)}</td>
        <td>${getStatusBadge(inv.status)}</td>
        <td style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700;">${inv.receiptNumber || '-'}</td>
      </tr>
    `;
  }).join('');
}

function renderLaporanFoot(invoices) {
  let sumGross = 0, sumDisc = 0, sumNet = 0, sumPaid = 0;
  invoices.forEach(i => {
    sumGross += i.grossAmount;
    sumDisc += i.totalDiscount;
    sumNet += i.netAmount;
    sumPaid += i.paidAmount;
  });
  const sumSisa = sumNet - sumPaid;

  return `
    <td colspan="4" style="text-align: right; padding-right: 16px;">TOTAL REKAPITULASI:</td>
    <td>${formatRupiah(sumGross)}</td>
    <td style="color: #0284c7;">-${formatRupiah(sumDisc)}</td>
    <td>${formatRupiah(sumNet)}</td>
    <td style="color: #15803d;">${formatRupiah(sumPaid)}</td>
    <td style="color: #b91c1c;">${formatRupiah(sumSisa)}</td>
    <td colspan="2"></td>
  `;
}
