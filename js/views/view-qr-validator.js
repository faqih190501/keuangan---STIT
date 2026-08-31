/**
 * SIMPEL-IF Modul Verifikator QR Code & Keaslian Kwitansi
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, formatDateTime, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';

export function renderQrValidatorView(container) {
  const state = appState.getState();

  container.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: var(--primary-50); border: 2px solid var(--primary-200); border-radius: var(--radius-full); font-size: 2rem; margin-bottom: 12px;">
          🛡️
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-dark);">Pusat Verifikasi Dokumen & QR Code Kwitansi</h2>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 580px; margin: 4px auto 0;">
          Layanan publik resmi STIT Ihsanul Fikri untuk memverifikasi keaslian dan integritas tanda tangan digital pada bukti pembayaran kuliah mahasiswa.
        </p>
      </div>

      <!-- Search Box Card -->
      <div class="card" style="margin-bottom: 24px; padding: 28px;">
        <label class="form-label" style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">
          Pindai / Masukkan Nomor Kwitansi atau Token QR:
        </label>
        <div style="display: flex; gap: 10px; margin-bottom: 14px;">
          <input type="text" class="form-control" id="input-receipt-token" placeholder="Contoh: KW-IF/2026/08/0012 atau token QR..." style="font-size: 0.95rem; font-family: var(--font-mono); padding: 12px 16px;">
          <button class="btn btn-primary btn-lg" id="btn-validate-token" style="padding: 12px 24px;">
            🔍 Verifikasi
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.76rem; color: var(--text-light);">Coba Sampel Data Cepat:</span>
          <button class="btn btn-outline btn-sm sample-token-btn" data-token="KW-IF/2026/08/0012">
            KW-IF/2026/08/0012 (Ahmad Fauzi)
          </button>
          <button class="btn btn-outline btn-sm sample-token-btn" data-token="KW-IF/2026/08/0017">
            KW-IF/2026/08/0017 (Zaid Al-Faruq)
          </button>
          <button class="btn btn-outline btn-sm sample-token-btn" data-token="KW-PALSU/9999">
            Token Tidak Terdaftar (Uji Negatif)
          </button>
        </div>
      </div>

      <!-- Verification Result Container -->
      <div id="validation-result-box" style="display: none;"></div>
    </div>
  `;

  // Attach handlers
  const inputToken = container.querySelector('#input-receipt-token');
  const btnValidate = container.querySelector('#btn-validate-token');
  const resultBox = container.querySelector('#validation-result-box');

  function runValidation(query) {
    if (!query) {
      window.simpelToast.show('Input Kosong', 'Harap masukkan nomor kwitansi atau token QR.', 'warning');
      return;
    }

    const clean = query.trim();
    // Search in invoices
    const invoice = state.invoices.find(inv => 
      (inv.receiptNumber && inv.receiptNumber.toUpperCase() === clean.toUpperCase()) ||
      clean.includes(inv.receiptNumber) ||
      (inv.id && inv.id.toUpperCase() === clean.toUpperCase())
    );

    resultBox.style.display = 'block';

    if (invoice && invoice.status === 'LUNAS') {
      const student = state.students.find(s => s.nim === invoice.studentNim) || { name: 'Mahasiswa', prodi: 'BKPI', nim: invoice.studentNim, semester: 1 };
      const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId);

      resultBox.innerHTML = `
        <div class="card" style="border: 2px solid #10b981; background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%); padding: 30px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.15); animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; border-bottom: 1px solid #bbf7d0; padding-bottom: 16px;">
            <div style="font-size: 2.5rem;">✅</div>
            <div>
              <div style="font-size: 0.74rem; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">HASIL VALIDASI RESMI</div>
              <h3 style="font-size: 1.25rem; font-weight: 900; color: #065f46; margin: 2px 0;">DOKUMEN ASLI & TERVERIFIKASI</h3>
              <p style="font-size: 0.78rem; color: #166534;">Kwitansi ini sah diterbitkan oleh Pangkalan Data Keuangan STIT Ihsanul Fikri.</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 22px; font-size: 0.84rem;">
            <div style="background: #ffffff; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid #d1fae5;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">NOMOR KWITANSI RESMI</div>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #0f172a; font-size: 0.95rem; margin-top: 2px;">${invoice.receiptNumber}</div>
            </div>
            <div style="background: #ffffff; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid #d1fae5;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">WAKTU TRANSAKSI / LUNAS</div>
              <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${formatDateTime(invoice.paymentDate)}</div>
            </div>
            <div style="background: #ffffff; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid #d1fae5;">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 600;">TOTAL PEMBAYARAN KAS</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #15803d; margin-top: 2px;">${formatRupiah(invoice.paidAmount)}</div>
            </div>
          </div>

          <div style="background: #ffffff; padding: 18px 20px; border-radius: var(--radius-lg); border: 1px solid #d1fae5; font-size: 0.82rem; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 140px 1fr; gap: 8px 16px;">
              <div style="color: #64748b; font-weight: 600;">Nama Mahasiswa:</div>
              <div style="font-weight: 800; color: #0f172a;">${student.name}</div>

              <div style="color: #64748b; font-weight: 600;">Nomor Induk (NIM):</div>
              <div style="font-family: var(--font-mono); font-weight: 700;">${student.nim}</div>

              <div style="color: #64748b; font-weight: 600;">Program Studi:</div>
              <div>${getProdiBadge(student.prodi)} <span style="font-weight:600; margin-left:4px;">Semester ${student.semester}</span></div>

              <div style="color: #64748b; font-weight: 600;">Skema Beasiswa:</div>
              <div>${getScholarshipBadge(student.scholarshipId)}</div>

              <div style="color: #64748b; font-weight: 600;">Metode Pembayaran:</div>
              <div style="font-weight: 700; color: #1e40af;">${invoice.paymentMethod === 'VA_BSI' ? 'Virtual Account Bank Syariah Indonesia (BSI)' : invoice.paymentMethod === 'VA_MANDIRI' ? 'Virtual Account Bank Mandiri' : 'Transfer Manual Bank'}</div>

              <div style="color: #64748b; font-weight: 600;">Diverifikasi Oleh:</div>
              <div style="font-weight: 700; color: #0f172a;">Ustadzah Siti Fatimah, S.E. (Bendahara STIT-IF)</div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary btn-view-validated-receipt" data-invoice-id="${invoice.id}">
              🧾 Buka Salinan Kwitansi Elektronik
            </button>
          </div>
        </div>
      `;

      const btnView = resultBox.querySelector('.btn-view-validated-receipt');
      if (btnView) {
        btnView.addEventListener('click', () => {
          window.simpelModals.openReceiptModal(invoice.id);
        });
      }
    } else {
      resultBox.innerHTML = `
        <div class="card" style="border: 2px solid #ef4444; background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%); padding: 30px; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15); animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div style="font-size: 2.5rem;">❌</div>
            <div>
              <div style="font-size: 0.74rem; font-weight: 800; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px;">HASIL VALIDASI</div>
              <h3 style="font-size: 1.25rem; font-weight: 900; color: #991b1b; margin: 2px 0;">DOKUMEN TIDAK DITEMUKAN / TIDAK VALID</h3>
              <p style="font-size: 0.78rem; color: #7f1d1d;">Nomor kwitansi atau token QR "<strong>${clean}</strong>" tidak terdaftar dalam basis data transaksi sah STIT Ihsanul Fikri.</p>
            </div>
          </div>
          <p style="font-size: 0.8rem; color: #475569; margin-top: 10px;">
            Pastikan Anda memasukkan nomor kwitansi yang benar (format: <code>KW-IF/YYYY/MM/XXXX</code>). Jika Anda menduga adanya indikasi pemalsuan bukti bayar, segera laporkan ke Bagian Keuangan STIT Ihsanul Fikri.
          </p>
        </div>
      `;
    }
  }

  if (btnValidate && inputToken) {
    btnValidate.addEventListener('click', () => runValidation(inputToken.value));
    inputToken.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runValidation(inputToken.value);
    });
  }

  container.querySelectorAll('.sample-token-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tok = btn.getAttribute('data-token');
      if (inputToken) inputToken.value = tok;
      runValidation(tok);
    });
  });
}
