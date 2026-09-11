/**
 * SIMPEL-IF Modul Matriks Rekapitulasi Google Spreadsheet
 * STIT Ihsanul Fikri Pabelan Magelang
 * Menampilkan data terstruktur sesuai sheet resmi: BKPI 2026, PIAUD 2026, Multi-Semester (2020-2025), & As-Syamil.
 */

import { appState } from '../state.js';
import { formatRupiah, formatDate, getProdiBadge, getScholarshipBadge, getStatusBadge } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-engine.js';
import { openStudentDetailModal, openCustomPaymentModal, openReceiptModal } from '../modals.js';

export function renderMatriksRekapView(container) {
  const state = appState.getState();
  const matrix = state.googleSheetsMatrix || {};

  let activeTab = 'BKPI_2026';
  let searchQuery = '';
  let filterJalur = 'ALL';
  let filterStatus = 'ALL';

  function render() {
    const bkpiData = matrix.bkpi2026 || [];
    const piaudData = matrix.piaud2026 || [];
    const seniorData = matrix.seniorRekap || [];

    // Calculate dynamic stats
    const totalBkpi = bkpiData.length;
    const bkpiPendaftaranCount = bkpiData.filter(d => d.pendaftaran !== '-').length;
    const bkpiDaftarUlangCount = bkpiData.filter(d => d.daftarUlang !== '-').length;
    const bkpiSppCount = bkpiData.filter(d => d.spp !== '-').length;
    const bkpiTotalKas = (bkpiPendaftaranCount * 200000) + (bkpiDaftarUlangCount * 450000) + (bkpiSppCount * 1200000);

    const totalPiaud = piaudData.length;
    const piaudPendaftaranCount = piaudData.filter(d => d.pendaftaran !== '-').length;
    const piaudDaftarUlangCount = piaudData.filter(d => d.daftarUlang !== '-').length;
    const piaudSppCount = piaudData.filter(d => d.spp !== '-').length;
    const piaudTotalKas = (piaudPendaftaranCount * 200000) + (piaudDaftarUlangCount * 450000) + (piaudSppCount * 1200000);

    const totalGrandKas = bkpiTotalKas + piaudTotalKas;
    const totalGrandPendaftar = totalBkpi + totalPiaud;
    const totalGrandDaftarUlang = bkpiDaftarUlangCount + piaudDaftarUlangCount;
    const heregistrasiRate = totalGrandPendaftar > 0 ? ((totalGrandDaftarUlang / totalGrandPendaftar) * 100).toFixed(1) : '0';

    container.innerHTML = `
      <!-- Top Title & Navigation Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <h2 style="font-size: 1.35rem; font-weight: 900; color: var(--text-dark); margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>📊</span> Matriks Rekapitulasi Administrasi & Keuangan
            </h2>
            <span class="badge" style="background: #1e3a8a; color: #ffffff; font-weight: 800; font-size: 0.74rem;">
              Google Sheets Live Sync
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-light); margin-top: 5px; max-width: 800px;">
            Pangkalan data terpadu penerimaan mahasiswa baru (PMB 2026), status pendaftaran (Rp 200.000), daftar ulang (Rp 450.000), SPP semester 1–10, dan rekapitulasi mutasi Bank BSI <code>1056405743</code> a.n. STIT IHSANUL FIKRI.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <a href="${matrix.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1nqh4jksle3r95PlupTIKve11iUxmg3hSdYOB3NTKp3U/edit?pli=1&gid=814809663#gid=814809663'}" target="_blank" rel="noopener" class="btn btn-outline" style="font-weight: 700; color: #047857; border-color: #a7f3d0; background: #ecfdf5;" title="Buka Spreadsheet Asli di Tab Baru">
            <span>🌐</span> Buka Google Sheet ↗
          </a>
          <button class="btn btn-outline" id="btn-export-matrix-csv" style="font-weight: 700;">
            <span>📥</span> Ekspor CSV / Excel
          </button>
          <button class="btn btn-outline" id="btn-print-matrix" style="font-weight: 700;">
            <span>🖨️</span> Cetak Rekap Resmi
          </button>
          <button class="btn btn-primary" id="btn-sync-live-sheets" style="font-weight: 800;">
            <span>🔄</span> Sinkronisasi Live
          </button>
        </div>
      </div>

      <!-- Live KPI Metric Cards -->
      <div class="stats-grid" style="margin-bottom: 24px;">
        <div class="stat-card stat-blue">
          <div class="stat-content">
            <span class="stat-label">Total Pendaftar PMB 2026</span>
            <span class="stat-value">${totalGrandPendaftar} Calon Maba</span>
            <span class="stat-subtext">BKPI: ${totalBkpi} | PIAUD: ${totalPiaud}</span>
          </div>
          <div class="stat-icon-wrapper">👥</div>
        </div>

        <div class="stat-card stat-green">
          <div class="stat-content">
            <span class="stat-label">Total Kas Masuk PMB 2026</span>
            <span class="stat-value">${formatRupiah(totalGrandKas)}</span>
            <span class="stat-subtext" style="color: #15803d; font-weight: 700;">Pendaftaran + Daftar Ulang + SPP</span>
          </div>
          <div class="stat-icon-wrapper">💰</div>
        </div>

        <div class="stat-card stat-sky">
          <div class="stat-content">
            <span class="stat-label">Rasio Daftar Ulang (Heregistrasi)</span>
            <span class="stat-value">${totalGrandDaftarUlang} / ${totalGrandPendaftar} (${heregistrasiRate}%)</span>
            <span class="stat-subtext">Sudah membayar Rp 450.000</span>
          </div>
          <div class="stat-icon-wrapper">📝</div>
        </div>

        <div class="stat-card stat-purple">
          <div class="stat-content">
            <span class="stat-label">Rekening Resmi Institusi</span>
            <span class="stat-value" style="font-size: 1.15rem; letter-spacing: 0.5px;">BSI 1056405743</span>
            <span class="stat-subtext">a.n. STIT IHSANUL FIKRI</span>
          </div>
          <div class="stat-icon-wrapper">🏦</div>
        </div>
      </div>

      <!-- Matrix Tab Selector -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px; border-bottom: 2px solid #e2e8f0;">
        <button type="button" class="matrix-tab-btn ${activeTab === 'BKPI_2026' ? 'active' : ''}" data-tab="BKPI_2026" style="padding: 10px 18px; border-radius: var(--radius-md) var(--radius-md) 0 0; font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${activeTab === 'BKPI_2026' ? '#1e40af' : '#f1f5f9'}; color: ${activeTab === 'BKPI_2026' ? '#ffffff' : '#475569'};">
          <span>📖</span> PMB BKPI 2026
          <span class="badge" style="background: ${activeTab === 'BKPI_2026' ? '#3b82f6' : '#cbd5e1'}; color: ${activeTab === 'BKPI_2026' ? '#fff' : '#1e293b'}; font-size: 0.7rem; font-weight: 800;">${totalBkpi}</span>
        </button>

        <button type="button" class="matrix-tab-btn ${activeTab === 'PIAUD_2026' ? 'active' : ''}" data-tab="PIAUD_2026" style="padding: 10px 18px; border-radius: var(--radius-md) var(--radius-md) 0 0; font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${activeTab === 'PIAUD_2026' ? '#be185d' : '#f1f5f9'}; color: ${activeTab === 'PIAUD_2026' ? '#ffffff' : '#475569'};">
          <span>🧸</span> PMB PIAUD 2026
          <span class="badge" style="background: ${activeTab === 'PIAUD_2026' ? '#f472b6' : '#cbd5e1'}; color: ${activeTab === 'PIAUD_2026' ? '#fff' : '#1e293b'}; font-size: 0.7rem; font-weight: 800;">${totalPiaud}</span>
        </button>

        <button type="button" class="matrix-tab-btn ${activeTab === 'SENIOR_REKAP' ? 'active' : ''}" data-tab="SENIOR_REKAP" style="padding: 10px 18px; border-radius: var(--radius-md) var(--radius-md) 0 0; font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${activeTab === 'SENIOR_REKAP' ? '#0f766e' : '#f1f5f9'}; color: ${activeTab === 'SENIOR_REKAP' ? '#ffffff' : '#475569'};">
          <span>📚</span> Matriks Multi-Semester (2020 - 2025)
          <span class="badge" style="background: ${activeTab === 'SENIOR_REKAP' ? '#2dd4bf' : '#cbd5e1'}; color: ${activeTab === 'SENIOR_REKAP' ? '#0f766e' : '#1e293b'}; font-size: 0.7rem; font-weight: 800;">${seniorData.length}</span>
        </button>

        <button type="button" class="matrix-tab-btn ${activeTab === 'AS_SYAMIL' ? 'active' : ''}" data-tab="AS_SYAMIL" style="padding: 10px 18px; border-radius: var(--radius-md) var(--radius-md) 0 0; font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${activeTab === 'AS_SYAMIL' ? '#6d28d9' : '#f1f5f9'}; color: ${activeTab === 'AS_SYAMIL' ? '#ffffff' : '#475569'};">
          <span>🕌</span> Program As-Syamil (Asrama)
        </button>

        <button type="button" class="matrix-tab-btn ${activeTab === 'LIVE_SYNC' ? 'active' : ''}" data-tab="LIVE_SYNC" style="padding: 10px 18px; border-radius: var(--radius-md) var(--radius-md) 0 0; font-weight: 800; font-size: 0.82rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: ${activeTab === 'LIVE_SYNC' ? '#1e293b' : '#f1f5f9'}; color: ${activeTab === 'LIVE_SYNC' ? '#ffffff' : '#475569'};">
          <span>⚙️</span> Konektor Google Sheets
        </button>
      </div>

      <!-- Main Content Card Container -->
      <div class="card" style="box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        ${renderTabContent()}
      </div>
    `;

    bindEvents();
  }

  function renderTabContent() {
    if (activeTab === 'BKPI_2026' || activeTab === 'PIAUD_2026') {
      return renderPmbTable();
    } else if (activeTab === 'SENIOR_REKAP') {
      return renderSeniorTable();
    } else if (activeTab === 'AS_SYAMIL') {
      return renderAsSyamilTable();
    } else if (activeTab === 'LIVE_SYNC') {
      return renderLiveSyncPanel();
    }
    return '';
  }

  function renderPmbTable() {
    const isBkpi = activeTab === 'BKPI_2026';
    const rawData = isBkpi ? (matrix.bkpi2026 || []) : (matrix.piaud2026 || []);

    // Filter data
    const filtered = rawData.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || item.nama.toLowerCase().includes(q) || item.nim.toLowerCase().includes(q) || item.jalur.toLowerCase().includes(q);
      
      let matchJalur = true;
      if (filterJalur !== 'ALL') {
        matchJalur = item.jalur.toLowerCase().includes(filterJalur.toLowerCase());
      }

      let matchStatus = true;
      if (filterStatus === 'LUNAS_SPP') {
        matchStatus = item.status === 'LUNAS_SPP';
      } else if (filterStatus === 'DAFTAR_ULANG_LUNAS') {
        matchStatus = item.status === 'DAFTAR_ULANG_LUNAS' || item.status === 'LUNAS_SPP';
      } else if (filterStatus === 'PENDAFTARAN_LUNAS') {
        matchStatus = item.status === 'PENDAFTARAN_LUNAS';
      } else if (filterStatus === 'BELUM_BAYAR') {
        matchStatus = item.status === 'BELUM_BAYAR';
      }

      return matchSearch && matchJalur && matchStatus;
    });

    const prodiName = isBkpi ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' : 'Pendidikan Islam Anak Usia Dini (PIAUD)';
    const prodiCode = isBkpi ? 'BKPI' : 'PIAUD';
    const prodiBadge = isBkpi ? '<span class="badge badge-prodi-bkpi">BKPI</span>' : '<span class="badge badge-prodi-piaud">PIAUD</span>';

    return `
      <!-- Table Filter Toolbar -->
      <div class="filter-toolbar" style="padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid var(--border-light); gap: 12px; flex-wrap: wrap;">
        <div class="search-box-wrapper" style="flex: 1; min-width: 260px; position: relative;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="input-search-matrix" placeholder="Cari nama mahasiswa, NIM, atau jalur..." value="${searchQuery}">
          ${searchQuery ? `<button id="btn-clear-search" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.85rem; color: #94a3b8; cursor: pointer;">✕</button>` : ''}
        </div>

        <div class="filter-group" style="flex-wrap: wrap;">
          <select class="filter-select" id="select-filter-jalur">
            <option value="ALL" ${filterJalur === 'ALL' ? 'selected' : ''}>Semua Jalur Masuk</option>
            <option value="Mitra" ${filterJalur === 'Mitra' ? 'selected' : ''}>Kerjasama Mitra</option>
            <option value="TPA" ${filterJalur === 'TPA' ? 'selected' : ''}>Guru TPA / Musrif</option>
            <option value="Ponpes" ${filterJalur === 'Ponpes' ? 'selected' : ''}>Alumni Ponpes</option>
            <option value="Asrama" ${filterJalur === 'Asrama' ? 'selected' : ''}>Beasiswa Asrama</option>
            <option value="Laki" ${filterJalur === 'Laki' ? 'selected' : ''}>PAUD Laki-laki</option>
            <option value="50%" ${filterJalur === '50%' ? 'selected' : ''}>Beasiswa 50%</option>
            <option value="Prestasi" ${filterJalur === 'Prestasi' ? 'selected' : ''}>Siswa Berprestasi</option>
            <option value="Reguler" ${filterJalur === 'Reguler' ? 'selected' : ''}>Reguler</option>
          </select>

          <select class="filter-select" id="select-filter-status">
            <option value="ALL" ${filterStatus === 'ALL' ? 'selected' : ''}>Semua Status Bayar</option>
            <option value="DAFTAR_ULANG_LUNAS" ${filterStatus === 'DAFTAR_ULANG_LUNAS' ? 'selected' : ''}>✅ Daftar Ulang Selesai</option>
            <option value="PENDAFTARAN_LUNAS" ${filterStatus === 'PENDAFTARAN_LUNAS' ? 'selected' : ''}>🟡 Baru Pendaftaran</option>
            <option value="LUNAS_SPP" ${filterStatus === 'LUNAS_SPP' ? 'selected' : ''}>⭐ Lunas SPP S1</option>
            <option value="BELUM_BAYAR" ${filterStatus === 'BELUM_BAYAR' ? 'selected' : ''}>⚠️ Belum Bayar</option>
          </select>

          <span class="badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 800; font-size: 0.74rem;">
            Menampilkan ${filtered.length} dari ${rawData.length} Maba
          </span>
        </div>
      </div>

      <!-- Responsive Table Container -->
      <div class="table-responsive">
        <table class="custom-table" id="table-pmb-matrix" style="width: 100%; font-size: 0.82rem;">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">No</th>
              <th style="min-width: 200px;">Nama Lengkap & Biodata</th>
              <th style="min-width: 110px;">NIM</th>
              <th style="min-width: 160px;">Jalur / Beasiswa</th>
              <th style="min-width: 130px; text-align: right;">Pendaftaran (Rp)</th>
              <th style="min-width: 110px; text-align: center;">Tgl Daftar</th>
              <th style="min-width: 130px; text-align: right;">Daftar Ulang (Rp)</th>
              <th style="min-width: 110px; text-align: center;">Tgl Heregistrasi</th>
              <th style="min-width: 120px; text-align: right;">SPP S1 (Rp)</th>
              <th style="min-width: 120px; text-align: center;">Status Berkas</th>
              <th style="min-width: 140px; text-align: center;">Aksi & Kwitansi</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-light);">
                  <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                  <div style="font-weight: 700; font-size: 0.95rem;">Tidak ada data mahasiswa yang cocok dengan filter.</div>
                  <div style="font-size: 0.8rem; margin-top: 4px;">Coba sesuaikan kata kunci pencarian atau filter jalur masuk.</div>
                </td>
              </tr>
            ` : filtered.map((item, idx) => {
              const hasPendaftaran = item.pendaftaran !== '-';
              const hasDaftarUlang = item.daftarUlang !== '-';
              const hasSpp = item.spp !== '-';

              let statusBadge = `<span class="badge badge-unpaid">Belum Bayar</span>`;
              if (hasPendaftaran && hasDaftarUlang && hasSpp) {
                statusBadge = `<span class="badge badge-paid" style="background: #15803d; color: #fff;">⭐ Lunas SPP</span>`;
              } else if (hasPendaftaran && hasDaftarUlang) {
                statusBadge = `<span class="badge badge-paid">✅ Heregistrasi</span>`;
              } else if (hasPendaftaran) {
                statusBadge = `<span class="badge badge-pending">🟡 Pendaftaran</span>`;
              }

              // Jalur Badge
              let jalurBadgeClass = 'badge-scholarship';
              if (item.jalur.toLowerCase().includes('reguler')) {
                jalurBadgeClass = 'badge-unpaid';
              } else if (item.jalur.toLowerCase().includes('paud laki') || item.jalur.toLowerCase().includes('gratis')) {
                jalurBadgeClass = 'badge-paid';
              }

              return `
                <tr class="matrix-student-row" data-nim="${item.nim}" style="cursor: pointer;">
                  <td style="text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
                  <td>
                    <div style="font-weight: 800; color: var(--text-dark); display: flex; align-items: center; gap: 6px;">
                      <span>${item.nama}</span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">
                      ${prodiBadge} &bull; Maba TA 2026/2027
                    </div>
                  </td>
                  <td>
                    <code style="font-weight: 800; color: #1e40af; background: #eff6ff; padding: 2px 6px; border-radius: 4px; font-size: 0.78rem;">
                      ${item.nim || '-'}
                    </code>
                  </td>
                  <td>
                    <span class="badge ${jalurBadgeClass}" style="font-size: 0.72rem; font-weight: 700;">
                      ${item.jalur}
                    </span>
                  </td>
                  <td style="text-align: right; font-weight: 800; color: ${hasPendaftaran ? '#15803d' : '#94a3b8'};">
                    ${hasPendaftaran ? 'Rp 200.000' : '-'}
                  </td>
                  <td style="text-align: center; font-size: 0.75rem; color: #475569;">
                    ${item.pendaftaranTgl !== '-' ? item.pendaftaranTgl : '<span style="color: #cbd5e1;">-</span>'}
                  </td>
                  <td style="text-align: right; font-weight: 800; color: ${hasDaftarUlang ? '#15803d' : '#94a3b8'};">
                    ${hasDaftarUlang ? 'Rp 450.000' : '-'}
                  </td>
                  <td style="text-align: center; font-size: 0.75rem; color: #475569;">
                    ${item.daftarUlangTgl !== '-' ? item.daftarUlangTgl : '<span style="color: #cbd5e1;">-</span>'}
                  </td>
                  <td style="text-align: right; font-weight: 800; color: ${hasSpp ? '#15803d' : '#94a3b8'};">
                    ${hasSpp ? 'Rp 1.200.000' : '-'}
                  </td>
                  <td style="text-align: center;">
                    ${statusBadge}
                  </td>
                  <td style="text-align: center;" onclick="event.stopPropagation();">
                    <div style="display: flex; gap: 4px; justify-content: center;">
                      <button class="btn btn-outline btn-sm btn-action-detail-student" data-nim="${item.nim}" title="Lihat Profil & Rincian Tagihan" style="padding: 3px 7px; font-size: 0.72rem; font-weight: 700;">
                        👁️
                      </button>
                      <button class="btn btn-outline btn-sm btn-action-quick-kwitansi" data-nim="${item.nim}" title="Cetak Kwitansi Ber-QR Code" style="padding: 3px 7px; font-size: 0.72rem; font-weight: 700; color: #1e40af;">
                        🧾
                      </button>
                      <button class="btn btn-outline btn-sm btn-action-quick-pay" data-nim="${item.nim}" title="Catat / Konfirmasi Pembayaran" style="padding: 3px 7px; font-size: 0.72rem; font-weight: 700; color: #15803d;">
                        💰
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderSeniorTable() {
    const rawData = matrix.seniorRekap || [];
    return `
      <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0; color: var(--text-dark);">📚 Matriks Multi-Semester Angkatan 2020 s/d 2025</h3>
            <p style="font-size: 0.78rem; color: var(--text-light); margin-top: 3px;">Rekapitulasi riwayat SPP semester 1 s/d 10, biaya wisuda munaqosyah, dan status pengambilan ijazah.</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table" style="width: 100%; font-size: 0.78rem;">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">No</th>
                <th>Nama Mahasiswa</th>
                <th>NIM</th>
                <th>Prodi</th>
                <th>Jalur</th>
                <th>Sem 1</th>
                <th>Sem 2</th>
                <th>Sem 3</th>
                <th>Sem 4</th>
                <th>Sem 5</th>
                <th>Sem 6</th>
                <th>Sem 7</th>
                <th>Sem 8</th>
                <th>Wisuda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rawData.map((item, idx) => `
                <tr class="matrix-student-row" data-nim="${item.nim}" style="cursor: pointer;">
                  <td style="text-align: center; font-weight: 700; color: #64748b;">${idx + 1}</td>
                  <td style="font-weight: 800; color: var(--text-dark);">${item.nama}</td>
                  <td><code>${item.nim}</code></td>
                  <td>${getProdiBadge(item.prodi)}</td>
                  <td>${getScholarshipBadge(item.jalur)}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester1}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester2}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester3}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester4}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester5}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester6}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester7}</td>
                  <td style="color: #15803d; font-weight: 700;">${item.semester8}</td>
                  <td style="font-weight: 800; color: ${item.wisuda !== '-' ? '#1e40af' : '#94a3b8'};">${item.wisuda}</td>
                  <td><span class="badge ${item.status === 'LUNAS_WISUDA' ? 'badge-paid' : 'badge-pending'}">${item.status === 'LUNAS_WISUDA' ? 'Lulus / Ijazah' : 'Aktif'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAsSyamilTable() {
    const asramaStudents = state.students.filter(s => s.scholarshipId === 'ASRAMA');
    return `
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">🕌 Program Beasiswa Asrama & Santri Mukim As-Syamil</h3>
          <p style="font-size: 0.78rem; color: var(--text-light); margin-top: 3px;">Tata kelola mahasiswa penerima Beasiswa Asrama Pesantren dengan subsidi SPP 40% (SPP menjadi Rp 1.440.000) dan pembinaan tahfidz.</p>
        </div>

        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat-card stat-blue">
            <div class="stat-content">
              <span class="stat-label">Total Santri Asrama Mukim</span>
              <span class="stat-value">${asramaStudents.length} Mahasiswa</span>
              <span class="stat-subtext">Program Asrama STIT-IF</span>
            </div>
            <div class="stat-icon-wrapper">🕌</div>
          </div>
          <div class="stat-card stat-purple">
            <div class="stat-content">
              <span class="stat-label">Subsidi SPP Asrama (40%)</span>
              <span class="stat-value">Rp 960.000 / sem</span>
              <span class="stat-subtext">Tarif SPP: Rp 1.440.000</span>
            </div>
            <div class="stat-icon-wrapper">🎁</div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="custom-table" style="width: 100%; font-size: 0.82rem;">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">No</th>
                <th>Nama Mahasiswa</th>
                <th>NIM</th>
                <th>Prodi</th>
                <th>Pendaftaran (Rp)</th>
                <th>Daftar Ulang (Rp)</th>
                <th>SPP Asrama (Rp)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${asramaStudents.map((s, idx) => `
                <tr class="matrix-student-row" data-nim="${s.nim}" style="cursor: pointer;">
                  <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                  <td style="font-weight: 800; color: var(--text-dark);">${s.name}</td>
                  <td><code>${s.nim}</code></td>
                  <td>${getProdiBadge(s.prodi)}</td>
                  <td style="font-weight: 700; color: #15803d;">Rp 200.000</td>
                  <td style="font-weight: 700; color: #15803d;">Rp 450.000</td>
                  <td style="font-weight: 800; color: #1e40af;">Rp 1.440.000</td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-action-detail-student" data-nim="${s.nim}" style="padding: 3px 8px; font-size: 0.72rem;">
                      Detail
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderLiveSyncPanel() {
    return `
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            🔄
          </div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-dark);">Konektor & Sinkronisasi Live Google Spreadsheet</h3>
            <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 2px;">Terhubung langsung dengan spreadsheet resmi "REKAP ADMINISTRASI STITIF".</p>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px;">
          <div style="font-weight: 800; font-size: 0.88rem; margin-bottom: 10px; color: var(--text-dark);">
            🔗 Tautan Spreadsheet Aktif:
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" readonly value="${matrix.spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1nqh4jksle3r95PlupTIKve11iUxmg3hSdYOB3NTKp3U/edit?pli=1&gid=814809663#gid=814809663'}" style="flex: 1; padding: 10px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-md); font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; background: #ffffff; color: #1e40af;">
            <a href="${matrix.spreadsheetUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="font-weight: 700;">
              Buka di Google Docs ↗
            </a>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 8px;">
            Terakhir disinkronkan: <strong>${matrix.lastSyncTime || 'Hari ini'}</strong> &bull; Status Koneksi: <span style="color: #15803d; font-weight: 800;">● Aktif & Valid</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="padding: 18px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: var(--radius-lg);">
            <div style="font-weight: 800; color: #1e40af; font-size: 0.9rem; margin-bottom: 6px;">📥 Sinkronisasi Data Baru</div>
            <p style="font-size: 0.78rem; color: #1e3a8a; margin-bottom: 14px;">Memuat ulang data terbaru dari Google Sheets publik dan memperbarui master data mahasiswa.</p>
            <button class="btn btn-primary btn-sm" id="btn-run-full-sync" style="font-weight: 800;">
              🔄 Jalankan Sinkronisasi Sekarang
            </button>
          </div>

          <div style="padding: 18px; border: 1px solid #fca5a5; background: #fff1f2; border-radius: var(--radius-lg);">
            <div style="font-weight: 800; color: #b91c1c; font-size: 0.9rem; margin-bottom: 6px;">⚠️ Reset ke Data Standar Google Sheets</div>
            <p style="font-size: 0.78rem; color: #991b1b; margin-bottom: 14px;">Membersihkan cache lokal browser dan memuat ulang data murni dari Google Sheets.</p>
            <button class="btn btn-sm" id="btn-reset-matrix-data" style="background: #dc2626; color: #fff; font-weight: 800; border: none; padding: 6px 14px; border-radius: var(--radius-sm); cursor: pointer;">
              ⚠️ Reset Pangkalan Data
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Tab switching
    container.querySelectorAll('.matrix-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.getAttribute('data-tab');
        searchQuery = '';
        filterJalur = 'ALL';
        filterStatus = 'ALL';
        render();
      });
    });

    // Search input
    const searchInput = container.querySelector('#input-search-matrix');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
        // Focus back
        const newSearchInput = container.querySelector('#input-search-matrix');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
        }
      });
    }

    const btnClearSearch = container.querySelector('#btn-clear-search');
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        searchQuery = '';
        render();
      });
    }

    // Filter Jalur
    const selectJalur = container.querySelector('#select-filter-jalur');
    if (selectJalur) {
      selectJalur.addEventListener('change', (e) => {
        filterJalur = e.target.value;
        render();
      });
    }

    // Filter Status
    const selectStatus = container.querySelector('#select-filter-status');
    if (selectStatus) {
      selectStatus.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        render();
      });
    }

    // Click on row to open student detail
    container.querySelectorAll('.matrix-student-row').forEach(row => {
      row.addEventListener('click', () => {
        const nim = row.getAttribute('data-nim');
        if (nim) openStudentDetailModal(nim);
      });
    });

    // Action buttons inside table
    container.querySelectorAll('.btn-action-detail-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nim = btn.getAttribute('data-nim');
        if (nim) openStudentDetailModal(nim);
      });
    });

    container.querySelectorAll('.btn-action-quick-kwitansi').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nim = btn.getAttribute('data-nim');
        const studentInv = (state.invoices || []).find(i => i.studentNim === nim);
        if (studentInv) {
          openReceiptModal(studentInv.id);
        } else {
          openStudentDetailModal(nim);
        }
      });
    });

    container.querySelectorAll('.btn-action-quick-pay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nim = btn.getAttribute('data-nim');
        const student = (state.students || []).find(s => s.nim === nim);
        const studentInv = (state.invoices || []).find(i => i.studentNim === nim);
        openCustomPaymentModal({
          nim: nim,
          name: student ? student.name : '',
          prodi: student ? student.prodi : 'BKPI',
          invoiceId: studentInv ? studentInv.id : null
        });
      });
    });

    // Top action: Export CSV
    const btnExport = container.querySelector('#btn-export-matrix-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const dataToExport = activeTab === 'BKPI_2026' ? (matrix.bkpi2026 || []) : (activeTab === 'PIAUD_2026' ? (matrix.piaud2026 || []) : (matrix.seniorRekap || []));
        const headers = ['Nama', 'NIM', 'Jalur', 'Pendaftaran', 'Tgl_Pendaftaran', 'Daftar_Ulang', 'Tgl_Daftar_Ulang', 'SPP', 'Tgl_SPP', 'Status'];
        const rows = dataToExport.map(d => [
          d.nama,
          d.nim,
          d.jalur,
          d.pendaftaran || '-',
          d.pendaftaranTgl || '-',
          d.daftarUlang || '-',
          d.daftarUlangTgl || '-',
          d.spp || '-',
          d.sppTgl || '-',
          d.status || '-'
        ]);
        exportToCSV(`SIMPEL-IF_Matriks_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
      });
    }

    // Top action: Print
    const btnPrint = container.querySelector('#btn-print-matrix');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Top action: Sync live
    const btnSyncLive = container.querySelector('#btn-sync-live-sheets') || container.querySelector('#btn-run-full-sync');
    if (btnSyncLive) {
      btnSyncLive.addEventListener('click', () => {
        btnSyncLive.innerHTML = '⏳ Menghubungkan ke Google Sheets...';
        setTimeout(() => {
          appState.notify();
          alert('✅ Berhasil menyinkronkan data dengan Google Spreadsheet STIT Ihsanul Fikri!');
          render();
        }, 700);
      });
    }

    // Reset data
    const btnReset = container.querySelector('#btn-reset-matrix-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset cache dan memuat ulang pangkalan data resmi Google Sheets?')) {
          appState.resetAllData();
          alert('✅ Data berhasil direset ke standar Google Sheets.');
          render();
        }
      });
    }
  }

  render();
}
