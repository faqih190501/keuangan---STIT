/**
 * SIMPEL-IF Portal Mahasiswa View
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { AuthManager } from '../auth.js';
import { formatRupiah, formatDate, formatDateTime, getStatusBadge, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { STATUS_TAGIHAN } from '../models.js';
import { BillingEngine } from '../billing-engine.js';

export function renderMahasiswaPortal(container) {
  const state = appState.getState();
  const currentNim = state.currentUser.nim || '202486209012'; // Default Ahmad Fauzi
  const currentStudent = state.students.find(s => s.nim === currentNim) || state.students[0];
  const scholarship = state.scholarshipSchemes.find(sc => sc.id === currentStudent.scholarshipId) || state.scholarshipSchemes[0];
  
  // Find current semester invoice
  const currentInvoice = state.invoices.find(
    inv => inv.studentNim === currentStudent.nim && inv.semester === state.activeSemester
  ) || null;

  // Student history invoices
  const studentInvoices = state.invoices.filter(inv => inv.studentNim === currentStudent.nim);

  container.innerHTML = `
    <!-- Switch Student Selector for Testing Demo -->
    <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2rem;">👨‍🎓</span>
        <div>
          <span style="font-size: 0.74rem; font-weight: 700; color: var(--text-light); text-transform: uppercase;">Akun Mahasiswa Aktif:</span>
          <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark);">${currentStudent.name} (${currentStudent.nim})</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-outline btn-sm" id="btn-student-logout" style="border-color: #fca5a5; color: #b91c1c; background: #fff1f2; font-weight: 700;">
          🚪 Keluar / Logout
        </button>
        <button class="btn btn-outline btn-sm" id="btn-goto-login-view" style="color: var(--primary-700); font-weight: 700;">
          🔑 Halaman Login Mahasiswa
        </button>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 0.78rem; color: var(--text-muted);">Pilih Akun Cepat:</span>
          <select class="filter-select" id="select-active-student" style="padding: 6px 12px; font-size: 0.8rem;">
            ${state.students.map(s => {
              const sch = state.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
              return `<option value="${s.nim}" ${s.nim === currentStudent.nim ? 'selected' : ''}>
                ${s.name} - ${s.prodi} (Sem ${s.semester} | ${sch ? sch.name : 'Reguler'})
              </option>`;
            }).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Student Profile Hero Card -->
    <div class="card" style="background: linear-gradient(135deg, #0f2042 0%, #1e40af 100%); color: #ffffff; margin-bottom: 28px; padding: 26px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
        <div style="display: flex; align-items: center; gap: 18px;">
          <div style="width: 60px; height: 60px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.15); border: 2px solid rgba(255, 255, 255, 0.3); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;">
            ${currentStudent.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
          </div>
          <div>
            <div style="font-size: 0.74rem; color: #7dd3fc; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Portal Pembayaran Mahasiswa</div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 2px 0;">${currentStudent.name}</h2>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #cbd5e1; flex-wrap: wrap;">
              <span>NIM: <strong>${currentStudent.nim}</strong></span>
              <span>•</span>
              <span>Prodi: <strong>${currentStudent.prodi === 'BKPI' ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' : 'Pendidikan Islam Anak Usia Dini (PIAUD)'}</strong></span>
              <span>•</span>
              <span>Semester: <strong>${currentStudent.semester} (${currentStudent.statusAkademik})</strong></span>
            </div>
          </div>
        </div>
        <div style="text-align: right; background: rgba(255, 255, 255, 0.1); padding: 12px 18px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.15);">
          <div style="font-size: 0.72rem; color: #7dd3fc; font-weight: 600; text-transform: uppercase;">Skema Pembiayaan Terpasang</div>
          <div style="font-size: 1.02rem; font-weight: 800; color: #ffffff; margin-top: 2px;">${scholarship.name}</div>
          <div style="font-size: 0.74rem; color: #cbd5e1; margin-top: 2px;">
            ${scholarship.id === 'REGULER' ? 'Tarif Penuh Reguler' : `Subsidi: ${scholarship.discountType === 'PERCENT' ? scholarship.discountValue + '% SPP' : formatRupiah(scholarship.discountValue)}`}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Invoice Section -->
    ${currentInvoice ? `
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div class="card-title-group">
            <h3 class="card-title">📋 Tagihan Semester Aktif (${state.activeSemester})</h3>
            <p class="card-subtitle">Nomor Tagihan: <strong style="font-family:var(--font-mono); color:var(--primary-700);">${currentInvoice.id}</strong> | Batas Pembayaran: <strong>${formatDate(currentInvoice.dueDate)}</strong></p>
          </div>
          <div>
            ${getStatusBadge(currentInvoice.status)}
          </div>
        </div>

        <!-- Line Item Breakdown -->
        <div class="bill-breakdown-card">
          <div style="font-size: 0.76rem; font-weight: 700; color: var(--text-light); text-transform: uppercase; margin-bottom: 8px;">Rincian Komponen Biaya:</div>
          ${currentInvoice.items.map(item => `
            <div class="bill-line-item">
              <div>
                <strong>${item.name}</strong>
                ${item.discount > 0 ? `<div style="font-size: 0.72rem; color: #0284c7;">Potongan ${scholarship.name}: -${formatRupiah(item.discount)}</div>` : ''}
              </div>
              <div style="text-align: right;">
                ${item.discount > 0 ? `<span style="text-decoration: line-through; color: var(--text-light); font-size: 0.76rem; margin-right: 6px;">${formatRupiah(item.baseAmount)}</span>` : ''}
                <strong style="font-size: 0.92rem; color: var(--text-dark);">${formatRupiah(item.finalAmount)}</strong>
              </div>
            </div>
          `).join('')}

          ${currentInvoice.totalDiscount > 0 ? `
            <div class="bill-line-item discount-item" style="background: #f0f9ff; padding: 10px; border-radius: var(--radius-md); margin-top: 8px;">
              <div>
                <span>✨ Total Subsidi Beasiswa Hemat:</span>
              </div>
              <div>
                <strong>-${formatRupiah(currentInvoice.totalDiscount)}</strong>
              </div>
            </div>
          ` : ''}

          <div class="bill-total-row">
            <span>Total Yang Wajib Dibayar:</span>
            <span style="font-size: 1.35rem; color: var(--primary-800);">${formatRupiah(currentInvoice.netAmount)}</span>
          </div>
        </div>

        <!-- If Invoice is Lunas -->
        ${currentInvoice.status === STATUS_TAGIHAN.LUNAS ? `
          <div style="background: var(--status-paid-bg); border: 1px solid var(--status-paid-border); border-radius: var(--radius-lg); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="font-size: 2rem;">✅</div>
              <div>
                <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--status-paid-text);">Tagihan Telah Lunas</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted);">Pembayaran telah tercatat dan diverifikasi pada sistem pangkalan data STIT Ihsanul Fikri.</p>
                <div style="font-size: 0.74rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-dark); margin-top: 3px;">
                  No. Kwitansi: ${currentInvoice.receiptNumber} (${formatDateTime(currentInvoice.paymentDate)})
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-view-my-receipt" data-invoice-id="${currentInvoice.id}">
              🧾 Cetak & Unduh Kwitansi Digital Resmi (QR Code)
            </button>
          </div>
        ` : currentInvoice.status === STATUS_TAGIHAN.MENUNGGU_VERIFIKASI ? `
          <div style="background: var(--status-pending-bg); border: 1px solid var(--status-pending-border); border-radius: var(--radius-lg); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="font-size: 2rem;">⏳</div>
              <div>
                <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--status-pending-text);">Bukti Pembayaran Sedang Diverifikasi</h4>
                <p style="font-size: 0.78rem; color: #92400e;">Anda telah mengunggah bukti transfer manual. Bendahara keuangan sedang memvalidasi mutasi kas. Kwitansi digital akan otomatis terbit setelah disetujui.</p>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" disabled style="opacity: 0.8;">
              Dalam Antrean Bendahara
            </button>
          </div>
        ` : `
          <!-- Unpaid: Payment Channel Selection -->
          <div style="margin-top: 24px;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin-bottom: 14px;">Pilih Metode Pembayaran:</h4>

            <div class="tabs-container" style="margin-bottom: 18px;">
              <button class="tab-nav-btn active" id="tab-btn-va">
                💳 Virtual Account (Otomatis & Instan)
              </button>
              <button class="tab-nav-btn" id="tab-btn-manual">
                🏦 Transfer Bank Manual (Upload Bukti)
              </button>
            </div>

            <!-- TAB 1: Virtual Account -->
            <div id="tab-content-va">
              <div class="va-box">
                <div class="va-bank-title" id="va-bank-label">Bank Syariah Indonesia (BSI) Virtual Account</div>
                <div class="va-number-display">
                  <span id="va-number-text">${currentInvoice.virtualAccount}</span>
                  <button class="copy-va-btn" id="btn-copy-va">📋 Salin</button>
                </div>
                <div style="font-size: 0.78rem; color: #cbd5e1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span>Nominal Pas: <strong>${formatRupiah(currentInvoice.netAmount)}</strong></span>
                  <span>•</span>
                  <span>Atas Nama: <strong>STIT IHSANUL FIKRI - ${currentStudent.name.toUpperCase()}</strong></span>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; background: #f8fafc; padding: 16px 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-dark);">Pilihan Bank VA:</span>
                  <select class="filter-select" id="select-va-bank" style="padding: 6px 12px; font-size: 0.8rem;">
                    <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                    <option value="MANDIRI">Bank Mandiri</option>
                    <option value="MUAMALAT">Bank Muamalat</option>
                  </select>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-pay-va-instant" data-invoice-id="${currentInvoice.id}">
                  ⚡ Simulasi Pembayaran VA Instan (Auto-Reconcile)
                </button>
              </div>
            </div>

            <!-- TAB 2: Transfer Manual -->
            <div id="tab-content-manual" style="display: none;">
              <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 22px; margin-bottom: 18px;">
                <h5 style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin-bottom: 10px;">Rekening Resmi STIT Ihsanul Fikri:</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 18px;">
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 12px 16px;">
                    <div style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">BANK SYARIAH INDONESIA (BSI)</div>
                    <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-mono); color: #0f172a; margin: 2px 0;">1009827361</div>
                    <div style="font-size: 0.74rem; color: #64748b;">a.n. STIT IHSANUL FIKRI</div>
                  </div>
                  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 12px 16px;">
                    <div style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">BANK MANDIRI</div>
                    <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-mono); color: #0f172a; margin: 2px 0;">1370018273645</div>
                    <div style="font-size: 0.74rem; color: #64748b;">a.n. YAYASAN IHSANUL FIKRI</div>
                  </div>
                </div>

                <!-- Manual Upload Form -->
                <form id="form-manual-transfer">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">Bank Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-bank" placeholder="Contoh: Bank BSI / Mandiri / BCA" required value="Bank BSI">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nama Pemilik Rekening Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-name" placeholder="Nama sesuai rekening/struk" required value="${currentStudent.name.toUpperCase()}">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nomor Rekening Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-acc" placeholder="Nomor rekening" required value="7198293812">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nominal Transfer (Rp) <span class="required">*</span></label>
                      <input type="number" class="form-control" id="manual-transfer-amount" required value="${currentInvoice.netAmount}">
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Unggah Bukti Transfer / Struk <span class="required">*</span></label>
                    <div class="upload-dropzone" id="manual-dropzone">
                      <div class="upload-icon">📷</div>
                      <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-dark);">Klik atau Tarik Foto Bukti Transfer Disini</div>
                      <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">Format JPG, PNG, atau Screenshot M-Banking (Maks 5MB)</div>
                      <input type="file" id="manual-file-input" accept="image/*" style="display: none;">
                      <div class="upload-preview-container" id="manual-preview-wrapper" style="display: none;">
                        <img id="manual-img-preview" class="upload-preview-img" alt="Preview Struk">
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
                    <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-manual-transfer">
                      📤 Kirim Bukti Transfer Untuk Verifikasi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `}
      </div>
    ` : `
      <div class="card" style="text-align: center; padding: 48px;">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">🎉</div>
        <h3 style="font-size: 1.1rem; font-weight: 800;">Tidak Ada Tagihan Aktif</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">Semua kewajiban administrasi semester ${state.activeSemester} telah diselesaikan.</p>
      </div>
    `}

    <!-- Histori Transaksi Pembayaran Mahasiswa -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <h3 class="card-title">📜 Histori Tagihan & Kwitansi Mahasiswa</h3>
          <p class="card-subtitle">Riwayat seluruh transaksi pembayaran kuliah di STIT Ihsanul Fikri</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Semester</th>
              <th>Total Biaya</th>
              <th>Subsidi Beasiswa</th>
              <th>Nominal Bayar</th>
              <th>Status</th>
              <th>No. Kwitansi Resmi</th>
              <th>Kwitansi</th>
            </tr>
          </thead>
          <tbody>
            ${studentInvoices.map(inv => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.78rem;">${inv.id}</td>
                <td style="font-weight: 600;">${inv.semester}</td>
                <td>${formatRupiah(inv.grossAmount)}</td>
                <td style="color: #0284c7; font-weight: 700;">-${formatRupiah(inv.totalDiscount)}</td>
                <td style="font-weight: 800; color: var(--text-dark);">${formatRupiah(inv.netAmount)}</td>
                <td>${getStatusBadge(inv.status)}</td>
                <td style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">${inv.receiptNumber || '-'}</td>
                <td>
                  ${inv.status === STATUS_TAGIHAN.LUNAS ? `
                    <button class="btn btn-outline btn-sm btn-view-my-receipt" data-invoice-id="${inv.id}">
                      🧾 Cetak Kwitansi
                    </button>
                  ` : `
                    <span style="font-size: 0.74rem; color: var(--text-light);">-</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Event Listeners
  // 1. Switch Student demo
  const selectStudent = container.querySelector('#select-active-student');
  if (selectStudent) {
    selectStudent.addEventListener('change', (e) => {
      const newNim = e.target.value;
      appState.setRole('MAHASISWA', newNim);
      renderMahasiswaPortal(container);
    });
  }

  const btnGotoLogin = container.querySelector('#btn-goto-login-view');
  if (btnGotoLogin) {
    btnGotoLogin.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-login');
    });
  }

  const btnStudentLogout = container.querySelector('#btn-student-logout');
  if (btnStudentLogout) {
    btnStudentLogout.addEventListener('click', () => {
      AuthManager.logout();
    });
  }

  // 2. Tabs Switcher (VA vs Manual)
  const tabBtnVa = container.querySelector('#tab-btn-va');
  const tabBtnManual = container.querySelector('#tab-btn-manual');
  const tabContentVa = container.querySelector('#tab-content-va');
  const tabContentManual = container.querySelector('#tab-content-manual');

  if (tabBtnVa && tabBtnManual) {
    tabBtnVa.addEventListener('click', () => {
      tabBtnVa.classList.add('active');
      tabBtnManual.classList.remove('active');
      if (tabContentVa) tabContentVa.style.display = 'block';
      if (tabContentManual) tabContentManual.style.display = 'none';
    });

    tabBtnManual.addEventListener('click', () => {
      tabBtnManual.classList.add('active');
      tabBtnVa.classList.remove('active');
      if (tabContentManual) tabContentManual.style.display = 'block';
      if (tabContentVa) tabContentVa.style.display = 'none';
    });
  }

  // 3. VA Bank Selector
  const selectVaBank = container.querySelector('#select-va-bank');
  const vaBankLabel = container.querySelector('#va-bank-label');
  if (selectVaBank && vaBankLabel) {
    selectVaBank.addEventListener('change', (e) => {
      const b = e.target.value;
      vaBankLabel.textContent = b === 'BSI' ? 'Bank Syariah Indonesia (BSI) Virtual Account' :
                                b === 'MANDIRI' ? 'Bank Mandiri Virtual Account' : 'Bank Muamalat Virtual Account';
    });
  }

  // 4. Copy VA
  const btnCopyVa = container.querySelector('#btn-copy-va');
  const vaNumberText = container.querySelector('#va-number-text');
  if (btnCopyVa && vaNumberText) {
    btnCopyVa.addEventListener('click', () => {
      navigator.clipboard.writeText(vaNumberText.textContent.trim());
      btnCopyVa.textContent = '✓ Disalin';
      setTimeout(() => btnCopyVa.textContent = '📋 Salin', 2000);
      window.simpelToast.show('Nomor VA Disalin', 'Nomor Virtual Account telah disalin ke clipboard.', 'info');
    });
  }

  // 5. Pay Instant VA simulation
  const btnPayVa = container.querySelector('#btn-pay-va-instant');
  if (btnPayVa) {
    btnPayVa.addEventListener('click', () => {
      const invId = btnPayVa.getAttribute('data-invoice-id');
      const bankChoice = selectVaBank ? selectVaBank.options[selectVaBank.selectedIndex].text : 'Bank Syariah Indonesia';
      
      const res = BillingEngine.processVAPayment(invId, bankChoice);
      if (res.success) {
        window.simpelToast.show(
          'Pembayaran Virtual Account Berhasil!',
          `Kwitansi resmi ${res.receiptNumber} otomatis diterbitkan.`,
          'success'
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(invId);
      }
    });
  }

  // 6. Manual Upload File handling
  const dropzone = container.querySelector('#manual-dropzone');
  const fileInput = container.querySelector('#manual-file-input');
  const previewWrapper = container.querySelector('#manual-preview-wrapper');
  const imgPreview = container.querySelector('#manual-img-preview');
  let selectedImageData = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          selectedImageData = re.target.result;
          if (imgPreview) imgPreview.src = selectedImageData;
          if (previewWrapper) previewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 7. Submit Manual Transfer Form
  const formManual = container.querySelector('#form-manual-transfer');
  if (formManual && currentInvoice) {
    formManual.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderBank = container.querySelector('#manual-sender-bank').value;
      const senderName = container.querySelector('#manual-sender-name').value;
      const senderAcc = container.querySelector('#manual-sender-acc').value;
      const amount = Number(container.querySelector('#manual-transfer-amount').value);

      const res = BillingEngine.submitManualTransfer(currentInvoice.id, {
        senderBank,
        senderAccountName: senderName,
        senderAccountNumber: senderAcc,
        amount,
        proofImage: selectedImageData
      });

      if (res.success) {
        window.simpelToast.show(
          'Bukti Transfer Terkirim',
          'Bukti pembayaran Anda berhasil masuk ke antrean verifikasi Bendahara.',
          'success'
        );
        renderMahasiswaPortal(container);
      }
    });
  }

  // 8. View Receipt buttons
  container.querySelectorAll('.btn-view-my-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-invoice-id');
      window.simpelModals.openReceiptModal(invId);
    });
  });
}
