/**
 * SIMPEL-IF Audit Trail Log View with Search, Filters & Export
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatDateTime } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-engine.js';

export function renderAuditLogView(container) {
  const state = appState.getState();
  const logs = state.auditLogs || [];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark);">🛡️ Audit Trail & Log Aktivitas Finansial</h2>
        <p style="font-size: 0.8rem; color: var(--text-light);">Pencatatan riwayat perubahan skema beasiswa, tarif komponen, pendaftaran mahasiswa, override dispensasi, dan verifikasi kas masuk.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" id="btn-export-audit-log">
          📥 Ekspor Audit Log (.csv)
        </button>
        <button class="btn btn-outline" id="btn-refresh-logs">
          🔄 Refresh Log
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="card" style="margin-bottom: 20px; padding: 18px 22px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; align-items: center;">
        <div class="search-box-wrapper" style="width: 100%;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="search-audit-input" placeholder="Cari aksi, nama user, entitas, atau kata kunci...">
        </div>

        <div style="display: flex; gap: 10px;">
          <select class="filter-select" id="filter-audit-category" style="width: 100%;">
            <option value="ALL">Semua Kategori Aksi</option>
            <option value="ADMIN">👑 Akun Admin & Pengelola</option>
            <option value="PAYMENT">💳 Pembayaran & Virtual Account</option>
            <option value="VERIFY">🔍 Verifikasi Transfer Manual</option>
            <option value="STUDENT">🎓 Data Mahasiswa & Akun</option>
            <option value="SKEMA">⚙️ Skema Beasiswa & Tarif</option>
            <option value="OVERRIDE">✍️ Override & Dispensasi</option>
            <option value="ACADEMIC">📅 Kalender Akademik</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Audit Log List -->
    <div class="card">
      <div class="audit-timeline" id="audit-timeline-container">
        ${renderAuditLogItems(logs)}
      </div>
    </div>
  `;

  function getActionIcon(action) {
    if (action.includes('ADMIN')) return '👑';
    if (action.includes('PAYMENT')) return '💳';
    if (action.includes('VERIFY_TRANSFER_APPROVE')) return '✅';
    if (action.includes('VERIFY_TRANSFER_REJECT')) return '❌';
    if (action.includes('REGISTRASI') || action.includes('STUDENT')) return '🎓';
    if (action.includes('OVERRIDE')) return '✍️';
    if (action.includes('SKEMA') || action.includes('TARIF')) return '⚙️';
    if (action.includes('ACADEMIC') || action.includes('EVENT')) return '📅';
    return '📜';
  }

  function renderAuditLogItems(items) {
    if (items.length === 0) {
      return `
        <div class="table-empty-state" style="padding: 40px 20px; text-align: center;">
          <div class="table-empty-icon" style="font-size: 2.5rem; margin-bottom: 8px;">📜</div>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Tidak ditemukan rekaman log yang sesuai dengan filter.</p>
        </div>
      `;
    }

    return items.map(log => {
      const icon = getActionIcon(log.action);
      return `
        <div class="audit-item" style="display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border-light);">
          <div class="audit-icon" style="width: 40px; height: 40px; border-radius: var(--radius-md); background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
            ${icon}
          </div>
          <div class="audit-details" style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
              <span class="audit-action-title" style="font-weight: 800; font-size: 0.88rem; color: var(--text-dark);">
                ${log.action} — <span style="color: var(--primary-700);">${log.entity}</span>
              </span>
              <span style="font-size: 0.72rem; color: var(--text-light); font-family: var(--font-mono);">
                ${formatDateTime(log.timestamp)}
              </span>
            </div>
            <div class="audit-meta" style="font-size: 0.74rem; color: var(--text-muted); margin: 4px 0 6px;">
              Oleh: <strong>${log.userName}</strong> (${log.role}) &bull; Log ID: <span style="font-family: var(--font-mono); font-weight: 700;">${log.id}</span>
            </div>
            <div class="audit-changes-box" style="font-size: 0.78rem; color: var(--text-main); background: #f8fafc; padding: 10px 14px; border-radius: var(--radius-md); border-left: 3px solid var(--primary-600); line-height: 1.45;">
              ${log.details}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Filter & Search handling
  const searchInput = container.querySelector('#search-audit-input');
  const catFilter = container.querySelector('#filter-audit-category');
  const timelineContainer = container.querySelector('#audit-timeline-container');

  function filterLogs() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const cat = catFilter.value;

    const filtered = (state.auditLogs || []).filter(log => {
      const matchQ = log.action.toLowerCase().includes(q) ||
                     log.entity.toLowerCase().includes(q) ||
                     log.details.toLowerCase().includes(q) ||
                     log.userName.toLowerCase().includes(q) ||
                     log.id.toLowerCase().includes(q);

      let matchCat = true;
      if (cat !== 'ALL') {
        matchCat = log.action.includes(cat);
      }

      return matchQ && matchCat;
    });

    if (timelineContainer) {
      timelineContainer.innerHTML = renderAuditLogItems(filtered);
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterLogs);
  if (catFilter) catFilter.addEventListener('change', filterLogs);

  // Refresh Button
  const btnRefresh = container.querySelector('#btn-refresh-logs');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      renderAuditLogView(container);
      window.simpelToast.show('Log Diperbarui', 'Data audit trail mutakhir telah dimuat.', 'info');
    });
  }

  // Export Button
  const btnExport = container.querySelector('#btn-export-audit-log');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const q = (searchInput.value || '').toLowerCase().trim();
      const cat = catFilter.value;

      const filtered = (state.auditLogs || []).filter(log => {
        const matchQ = log.action.toLowerCase().includes(q) ||
                       log.entity.toLowerCase().includes(q) ||
                       log.details.toLowerCase().includes(q) ||
                       log.userName.toLowerCase().includes(q) ||
                       log.id.toLowerCase().includes(q);

        let matchCat = true;
        if (cat !== 'ALL') matchCat = log.action.includes(cat);
        return matchQ && matchCat;
      });

      const headers = ['Log ID', 'Waktu Timestamp', 'Nama Pengguna', 'Peran / Role', 'Aksi', 'Entitas Terkait', 'Rincian Log'];
      const rows = filtered.map(log => [
        log.id,
        log.timestamp,
        log.userName,
        log.role,
        log.action,
        log.entity,
        log.details.replace(/(\r\n|\n|\r)/gm, ' ')
      ]);

      exportToCSV(`Audit_Log_SIMPEL_IF_${new Date().toISOString().slice(0, 10)}`, headers, rows);
      window.simpelToast.show('Ekspor Berhasil', `${filtered.length} rekaman audit log berhasil diekspor ke CSV.`, 'success');
    });
  }
}
