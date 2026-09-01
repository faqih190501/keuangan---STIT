/**
 * SIMPEL-IF Manual Payment Verification Queue View
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, formatDateTime, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { BillingEngine } from '../billing-engine.js';

export function renderVerifikasiView(container) {
  const state = appState.getState();

  // Strict Access Guard: Only Admin / Bendahara can approve payments
  if (state.currentRole !== 'ADMIN') {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 48px 24px; border: 2px solid #fecaca; background: #fff5f5; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); max-width: 650px; margin: 40px auto;">
        <div style="font-size: 3.2rem; margin-bottom: 12px;">🔒</div>
        <h3 style="color: #991b1b; font-size: 1.3rem; font-weight: 900; margin-bottom: 8px;">Akses Terbatas: Khusus Admin & Bendahara</h3>
        <p style="color: #7f1d1d; font-size: 0.86rem; max-width: 500px; margin: 0 auto 24px; line-height: 1.5;">
          Sesuai SOP Keuangan STIT Ihsanul Fikri, <strong>hanya Admin Keuangan / Bendahara</strong> yang memiliki wewenang untuk menyetujui, menolak, dan menerbitkan kwitansi sah atas bukti transfer manual mahasiswa.
        </p>
        <button class="btn btn-primary" id="btn-redirect-portal-mhs" style="font-weight: 800; padding: 10px 22px;">
          Kembali ke Portal Mahasiswa &rarr;
        </button>
      </div>
    `;
    const btnRedir = container.querySelector('#btn-redirect-portal-mhs');
    if (btnRedir) {
      btnRedir.addEventListener('click', () => {
        if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
      });
    }
    return;
  }

  const verifications = state.paymentVerifications || [];
  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;
  const approvedCount = verifications.filter(v => v.status === 'APPROVED').length;
  const rejectedCount = verifications.filter(v => v.status === 'REJECTED').length;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 0;">🔍 Antrean Verifikasi & Persetujuan Pembayaran</h2>
          <span class="badge" style="background: #1e3a8a; color: #fff; font-weight: 800; font-size: 0.72rem;">👑 Otoritas Khusus Admin</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">Tinjau, validasi rekening koran, dan setujui bukti transfer bank manual untuk menerbitkan kwitansi resmi QR Code.</p>
      </div>
      <div class="filter-group">
        <select class="filter-select" id="filter-verif-status" style="font-weight: 700;">
          <option value="ALL">Semua Status (${verifications.length})</option>
          <option value="PENDING" selected>Menunggu Verifikasi (${pendingCount})</option>
          <option value="APPROVED">Telah Disetujui (${approvedCount})</option>
          <option value="REJECTED">Ditolak (${rejectedCount})</option>
        </select>
      </div>
    </div>

    <!-- Quick Status Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px;">
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.72rem; color: #b45309; font-weight: 700; text-transform: uppercase;">Menunggu Verifikasi</div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #92400e;">${pendingCount} Berkas</div>
        </div>
        <div style="font-size: 1.6rem;">⏳</div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.72rem; color: #15803d; font-weight: 700; text-transform: uppercase;">Telah Disetujui</div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #166534;">${approvedCount} Berkas</div>
        </div>
        <div style="font-size: 1.6rem;">✅</div>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.72rem; color: #b91c1c; font-weight: 700; text-transform: uppercase;">Ditolak / Batal</div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #991b1b;">${rejectedCount} Berkas</div>
        </div>
        <div style="font-size: 1.6rem;">❌</div>
      </div>
    </div>

    <!-- Verification Cards / Table -->
    <div class="card">
      <div class="table-responsive">
        <table class="custom-table" id="verif-table">
          <thead>
            <tr>
              <th>ID & Waktu Upload</th>
              <th>Data Mahasiswa</th>
              <th>Rincian Transfer</th>
              <th>Nominal</th>
              <th>Bukti Struk Transfer</th>
              <th>Status</th>
              <th>Aksi Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            ${renderVerifRows(verifications, 'PENDING')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach filter handler
  const filterStatus = container.querySelector('#filter-verif-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      const val = filterStatus.value;
      const tbody = container.querySelector('#verif-table tbody');
      if (tbody) {
        tbody.innerHTML = renderVerifRows(state.paymentVerifications, val);
        attachVerifActions(container);
      }
    });
  }

  attachVerifActions(container);
}

function renderVerifRows(verifs, filterVal) {
  let filtered = verifs;
  if (filterVal !== 'ALL') {
    filtered = verifs.filter(v => v.status === filterVal);
  }

  if (filtered.length === 0) {
    return `
      <tr>
        <td colspan="7" class="table-empty-state">
          <div class="table-empty-icon">✅</div>
          <p>Tidak ada antrean bukti transfer dengan status "${filterVal}".</p>
        </td>
      </tr>
    `;
  }

  return filtered.map(v => {
    return `
      <tr>
        <td>
          <div style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.78rem;">${v.id}</div>
          <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">${formatDateTime(v.submittedAt)}</div>
        </td>
        <td>
          <div class="table-student-name">${v.studentName}</div>
          <div class="table-student-nim">NIM: ${v.studentNim}</div>
          <div style="margin-top: 4px; display: flex; gap: 4px; align-items: center;">
            ${getProdiBadge(v.prodi)}
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Sem ${v.semester}</span>
          </div>
        </td>
        <td>
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-dark);">${v.senderBank}</div>
          <div style="font-size: 0.74rem; color: var(--text-light);">A.N. ${v.senderAccountName} (${v.senderAccountNumber})</div>
          <div style="font-size: 0.72rem; color: #0284c7; margin-top: 2px;">Tujuan: ${v.destinationBank.split('-')[0]}</div>
        </td>
        <td style="font-size: 0.96rem; font-weight: 800; color: var(--primary-900);">
          ${formatRupiah(v.amount)}
        </td>
        <td>
          <div style="position: relative; display: inline-block;">
            <img src="${v.proofImage}" alt="Struk Transfer" class="btn-preview-image" data-img-url="${v.proofImage}" style="width: 58px; height: 58px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-color); cursor: pointer; transition: transform 0.2s;" title="Klik untuk memperbesar gambar">
            <span style="display: block; font-size: 0.68rem; color: var(--text-light); text-align: center; margin-top: 2px;">🔍 Perbesar</span>
          </div>
        </td>
        <td>
          ${v.status === 'PENDING' ? '<span class="badge badge-pending"><span class="badge-dot"></span>Menunggu</span>' :
            v.status === 'APPROVED' ? '<span class="badge badge-paid"><span class="badge-dot"></span>Disetujui</span>' :
            '<span class="badge badge-unpaid"><span class="badge-dot"></span>Ditolak</span>'}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${v.status === 'PENDING' ? `
              <button class="btn btn-success btn-sm btn-approve-verif" data-verif-id="${v.id}" data-student="${v.studentName}" data-amount="${v.amount}">
                ✓ Setujui
              </button>
              <button class="btn btn-danger btn-sm btn-reject-verif" data-verif-id="${v.id}" data-student="${v.studentName}">
                ✕ Tolak
              </button>
            ` : v.status === 'APPROVED' ? `
              <button class="btn btn-outline btn-sm btn-view-verif-receipt" data-invoice-id="${v.invoiceId}">
                🧾 Lihat Kwitansi
              </button>
            ` : `
              <span style="font-size: 0.74rem; color: #b91c1c; font-style: italic;">Alasan: ${v.rejectionReason || 'Ditolak'}</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function attachVerifActions(container) {
  // Image preview zoom
  container.querySelectorAll('.btn-preview-image').forEach(img => {
    img.addEventListener('click', () => {
      const url = img.getAttribute('data-img-url');
      window.simpelModals.openImagePreviewModal(url);
    });
  });

  // Approve action
  container.querySelectorAll('.btn-approve-verif').forEach(btn => {
    btn.addEventListener('click', () => {
      const verifId = btn.getAttribute('data-verif-id');
      const studentName = btn.getAttribute('data-student');
      const amount = Number(btn.getAttribute('data-amount')) || 0;

      const confirmApprove = confirm(`Setujui pembayaran transfer manual untuk ${studentName} sebesar ${formatRupiah(amount)}?\n\nKwitansi resmi STIT Ihsanul Fikri akan langsung diterbitkan.`);
      if (confirmApprove) {
        const res = BillingEngine.approveManualPayment(verifId, 'Bukti transfer valid dan sesuai dengan mutasi rekening BSI STIT-IF.');
        if (res.success) {
          window.simpelToast.show(
            'Verifikasi Disetujui',
            `Pembayaran ${studentName} disetujui. Kwitansi: ${res.receiptNumber}`,
            'success'
          );
          renderVerifikasiView(container);
          window.simpelModals.openReceiptModal(res.invoice.id);
        }
      }
    });
  });

  // Reject action
  container.querySelectorAll('.btn-reject-verif').forEach(btn => {
    btn.addEventListener('click', () => {
      const verifId = btn.getAttribute('data-verif-id');
      const studentName = btn.getAttribute('data-student');
      const reason = prompt(`Masukkan alasan penolakan bukti transfer untuk ${studentName}:`, 'Nominal transfer tidak sesuai dengan tagihan / mutasi rekening tidak ditemukan');
      if (reason) {
        const res = BillingEngine.rejectManualPayment(verifId, reason);
        if (res.success) {
          window.simpelToast.show(
            'Bukti Ditolak',
            `Bukti transfer ${studentName} telah ditolak dengan alasan: "${reason}".`,
            'warning'
          );
          renderVerifikasiView(container);
        }
      }
    });
  });

  // View Receipt
  container.querySelectorAll('.btn-view-verif-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const invoiceId = btn.getAttribute('data-invoice-id');
      window.simpelModals.openReceiptModal(invoiceId);
    });
  });
}
