/**
 * SIMPEL-IF Global Modal Dialogs Manager
 * STIT Ihsanul Fikri
 */

import { appState } from './state.js';
import { formatRupiah, formatDate, formatDateTime, terbilang, getProdiBadge, getScholarshipBadge } from './utils/formatters.js';
import { generateQRCodeSVG, createReceiptValidationToken } from './utils/qr-engine.js';
import { BillingEngine } from './billing-engine.js';
import { printReceiptElement } from './utils/export-engine.js';

export class ModalManager {
  static init() {
    window.simpelModals = this;
  }

  static getModalElements() {
    return {
      overlay: document.getElementById('global-modal-overlay'),
      card: document.getElementById('global-modal-card'),
      title: document.getElementById('global-modal-title'),
      body: document.getElementById('global-modal-body'),
      footer: document.getElementById('global-modal-footer'),
      closeBtn: document.getElementById('global-modal-close')
    };
  }

  static closeModal() {
    const { overlay, card } = this.getModalElements();
    if (overlay) overlay.classList.remove('active');
    if (card) {
      card.className = 'modal-card';
    }
  }

  /**
   * 1. Official Digital Receipt Modal with QR Code and Institution Kop Surat
   */
  static openReceiptModal(invoiceId) {
    const state = appState.getState();
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const student = state.students.find(s => s.nim === invoice.studentNim) || {
      name: 'Mahasiswa',
      nim: invoice.studentNim,
      prodi: 'BKPI',
      semester: 1,
      scholarshipId: 'REGULER'
    };

    const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId) || state.scholarshipSchemes[0];
    const qrPayload = createReceiptValidationToken(invoice.receiptNumber || invoice.id, student.nim, invoice.paidAmount || invoice.netAmount);
    const qrSVG = generateQRCodeSVG(qrPayload, 95);
    const terbilangText = terbilang(invoice.paidAmount || invoice.netAmount);

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.add('modal-xl');

    const admin = state.adminProfile || {
      name: 'Ustadzah Siti Fatimah, S.E.',
      title: 'Bendahara Penerimaan Kampus',
      nip: '19840512 201201 2 003'
    };

    const signatureShort = (admin.name || 'Siti Fatimah').replace(/^(Ustadz|Ustadzah|Bpk|Ibu|Dr|Dra|Drs)\.?\s+/i, '').split(',')[0].trim();

    title.innerHTML = `🧾 Kwitansi Elektronik Resmi — STIT Ihsanul Fikri`;
    
    body.innerHTML = `
      <div class="receipt-modal-container">
        <div class="official-receipt-paper" id="official-receipt-printable">
          <!-- Watermark -->
          <div class="receipt-watermark">STIT IHSANUL FIKRI</div>

          <!-- Paid Stamp -->
          <div class="paid-stamp-watermark">LUNAS / PAID</div>

          <!-- Kop Surat Resmi -->
          <div class="receipt-header-kop">
            <img src="./assets/images/logo.png" alt="Logo STIT-IF" class="receipt-kop-logo">
            <div class="receipt-kop-text">
              <div class="kop-yayasan">YAYASAN PENDIDIKAN DAN DAKWAH IHSANUL FIKRI</div>
              <div class="kop-institution">SEKOLAH TINGGI ILMU TARBIYAH (STIT) IHSANUL FIKRI</div>
              <div class="kop-prodi-info">Program Studi: Bimbingan Konseling Pendidikan Islam (BKPI) &bull; Pendidikan Islam Anak Usia Dini (PIAUD)</div>
              <div class="kop-address">Kampus Terpadu: Jl. Pendidikan No. 01, Ihsanul Fikri &bull; Telp: (0737) 71234 &bull; Email: stit.ihsanulfikri@ac.id &bull; Web: www.stit-ihsanulfikri.ac.id</div>
            </div>
          </div>

          <!-- Receipt Details -->
          <div class="receipt-meta-grid">
            <div>
              <div class="receipt-meta-label">Nomor Kwitansi Resmi:</div>
              <div class="receipt-meta-value receipt-number-highlight">${invoice.receiptNumber || 'KW-IF/2026/08/0001'}</div>
            </div>
            <div style="text-align: right;">
              <div class="receipt-meta-label">Status Verifikasi Kas:</div>
              <span class="badge ${invoice.status === 'LUNAS' ? 'badge-paid' : 'badge-installment'}">
                <span class="badge-dot"></span>${invoice.status === 'LUNAS' ? 'LUNAS (SAH)' : 'DICICIL'}
              </span>
            </div>
          </div>

          <!-- Student & Payment Profile Section -->
          <div class="receipt-student-profile">
            <div class="receipt-profile-row">
              <span class="receipt-profile-label">Telah Diterima Dari:</span>
              <span class="receipt-profile-value" style="font-size: 1rem; font-weight: 800;">${student.name}</span>
            </div>
            <div class="receipt-profile-row">
              <span class="receipt-profile-label">Nomor Induk Mahasiswa (NIM):</span>
              <span class="receipt-profile-value" style="font-family: var(--font-mono); font-weight: 700;">${student.nim}</span>
            </div>
            <div class="receipt-profile-row">
              <span class="receipt-profile-label">Program Studi & Semester:</span>
              <span class="receipt-profile-value">${student.prodi === 'BKPI' ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' : 'Pendidikan Islam Anak Usia Dini (PIAUD)'} &bull; Semester ${student.semester}</span>
            </div>
            <div class="receipt-profile-row">
              <span class="receipt-profile-label">Skema Pembiayaan:</span>
              <span class="receipt-profile-value">${scholarship ? scholarship.name : 'Reguler Mandiri'}</span>
            </div>
            <div class="receipt-profile-row">
              <span class="receipt-profile-label">Tahun Akademik:</span>
              <span class="receipt-profile-value">${invoice.semester || state.activeSemester}</span>
            </div>
          </div>

          <!-- Invoice Breakdown Table -->
          <table class="receipt-breakdown-table">
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">No.</th>
                <th>Rincian Pos Pembayaran</th>
                <th style="text-align: right;">Tarif Pokok</th>
                <th style="text-align: right;">Subsidi Beasiswa</th>
                <th style="text-align: right;">Kewajiban Bersih</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, idx) => `
                <tr>
                  <td style="text-align: center; font-family: var(--font-mono);">${idx + 1}</td>
                  <td>
                    <div style="font-weight: 700;">${item.name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-light);">${item.category === 'INITIAL' ? 'Biaya Registrasi Awal' : item.category === 'FINAL' ? 'Biaya Akhir Studi' : 'Biaya Rutin Semester'}</div>
                  </td>
                  <td style="text-align: right; font-family: var(--font-mono);">${formatRupiah(item.grossAmount)}</td>
                  <td style="text-align: right; font-family: var(--font-mono); color: #0284c7;">
                    ${item.discountAmount > 0 ? `-${formatRupiah(item.discountAmount)}` : '-'}
                  </td>
                  <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">
                    ${formatRupiah(item.netAmount)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right; font-weight: 700;">TOTAL BIAYA PENDIDIKAN:</td>
                <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">${formatRupiah(invoice.grossAmount)}</td>
              </tr>
              ${invoice.totalDiscount > 0 ? `
                <tr style="color: #0284c7;">
                  <td colspan="4" style="text-align: right; font-weight: 700;">TOTAL SUBSIDI BEASISWA / POTONGAN:</td>
                  <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">-${formatRupiah(invoice.totalDiscount)}</td>
                </tr>
              ` : ''}
              <tr class="receipt-grand-total-row">
                <td colspan="4" style="text-align: right; font-weight: 800; font-size: 0.95rem;">TOTAL DITERIMA KAS (NET):</td>
                <td style="text-align: right; font-family: var(--font-mono); font-weight: 900; font-size: 1.1rem; color: #1e40af;">
                  ${formatRupiah(invoice.paidAmount || invoice.netAmount)}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Terbilang Box -->
          <div class="receipt-terbilang-box">
            <div class="terbilang-label">Terbilang:</div>
            <div class="terbilang-text">&ldquo;${terbilangText}&rdquo;</div>
          </div>

          <!-- Bottom Row: QR Authenticity & Official Signature -->
          <div class="receipt-bottom-grid">
            <div class="receipt-qr-section">
              <div class="receipt-qr-box">
                ${qrSVG}
              </div>
              <div class="receipt-qr-instructions">
                <strong>QR CODE KEASLIAN RESMI</strong>
                Pindai kode QR untuk memvalidasi keaslian dokumen pada sistem terintegrasi <strong>SIMPEL-IF STIT Ihsanul Fikri</strong>.
                <div style="font-size:0.65rem; color:#64748b; font-family:var(--font-mono); margin-top:3px;">Hash: ${invoice.id}-${student.nim.slice(-4)}</div>
              </div>
            </div>

            <div class="receipt-signature-box">
              <div class="signature-date">STIT Ihsanul Fikri, ${formatDate(invoice.paymentDate || invoice.createdDate)}</div>
              <div class="signature-role">${admin.title || 'Bendahara Penerimaan Kampus'},</div>
              <div class="signature-space">
                <div class="signature-digital-img">${signatureShort}</div>
              </div>
              <div class="signature-name">${admin.name}</div>
              <div class="signature-nip">${admin.nip ? `NIP/NIDN: ${admin.nip}` : 'NIP: 19840512 201201 2 003'}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-close-receipt-modal">Tutup</button>
      <button class="btn btn-primary" id="btn-print-receipt-modal">
        🖨️ Cetak / Simpan Kwitansi PDF
      </button>
    `;

    overlay.classList.add('active');

    // Attach listeners
    footer.querySelector('#btn-close-receipt-modal').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-print-receipt-modal').addEventListener('click', () => {
      printReceiptElement();
    });
  }

  /**
   * 2. Edit Scholarship Scheme Modal
   */
  static openEditSchemeModal(schemeId) {
    const state = appState.getState();
    const scheme = state.scholarshipSchemes.find(s => s.id === schemeId);
    if (!scheme) return;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `✏️ Edit Skema Beasiswa: ${scheme.name}`;

    const studentCount = state.students.filter(s => s.scholarshipId === scheme.id).length;
    const isReguler = scheme.id === 'REGULER';

    body.innerHTML = `
      <form id="form-edit-scheme">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">ID / Kode Skema</label>
            <input type="text" class="form-control" value="${scheme.id}" disabled style="font-family:var(--font-mono); font-weight:700;">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Skema Beasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="scheme-name" value="${scheme.name}" required style="font-weight:700;">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi & Landasan SK Kebijakan <span class="required">*</span></label>
          <textarea class="form-control" id="scheme-desc" rows="3" required placeholder="Tuliskan tujuan dan kriteria penerima beasiswa...">${scheme.description}</textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Program Studi yang Berhak <span class="required">*</span></label>
            <select class="filter-select" id="scheme-prodi" style="width: 100%;">
              <option value="ALL" ${(scheme.eligibleProdi && scheme.eligibleProdi.length > 1) ? 'selected' : ''}>Semua Program Studi (BKPI & PIAUD)</option>
              <option value="PIAUD" ${(scheme.eligibleProdi && scheme.eligibleProdi.length === 1 && scheme.eligibleProdi[0] === 'PIAUD') ? 'selected' : ''}>Hanya Prodi PIAUD (PAUD Islam)</option>
              <option value="BKPI" ${(scheme.eligibleProdi && scheme.eligibleProdi.length === 1 && scheme.eligibleProdi[0] === 'BKPI') ? 'selected' : ''}>Hanya Prodi BKPI (Bimbingan Konseling)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Komponen Biaya Terpotong</label>
            <input type="text" class="form-control" value="SPP / UKT Pokok Semester" disabled>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Jenis Pemotongan Subsidi <span class="required">*</span></label>
            <select class="filter-select" id="scheme-discount-type" style="width: 100%;">
              <option value="PERCENT" ${scheme.discountType === 'PERCENT' ? 'selected' : ''}>Persentase (%)</option>
              <option value="FIXED" ${scheme.discountType === 'FIXED' ? 'selected' : ''}>Nominal Tetap (Rp)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" id="scheme-val-label">Besaran Potongan <span class="required">*</span></label>
            <input type="number" class="form-control" id="scheme-discount-val" value="${scheme.discountValue}" required min="0">
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-lg); padding: 14px 18px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.74rem; color: #0369a1; font-weight: 700; text-transform: uppercase;">Simulasi Tarif SPP Pokok (Rp 2.500.000):</span>
            <span style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">Mahasiswa Aktif: ${studentCount} Orang</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 0.84rem; color: var(--text-dark);">Subsidi Dihemat Mahasiswa:</span>
            <strong style="color: #0284c7; font-size: 0.95rem;" id="preview-discount-val">- Rp 0</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed #bae6fd;">
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-dark);">Sisa SPP Wajib Bayar Mahasiswa:</span>
            <strong style="color: #1e40af; font-size: 1.15rem;" id="preview-final-val">Rp 2.500.000</strong>
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
        <div>
          ${!isReguler ? `
            <button class="btn btn-outline btn-sm" id="btn-delete-scheme" style="color: #b91c1c; border-color: #fca5a5;">
              🗑️ Hapus Skema
            </button>
          ` : '<span style="font-size:0.75rem; color:var(--text-light);">Skema standar wajib</span>'}
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" id="btn-cancel-scheme-edit">Batal</button>
          <button class="btn btn-primary" id="btn-save-scheme-edit">💾 Simpan Perubahan Skema</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    // Live preview updater
    const typeSelect = body.querySelector('#scheme-discount-type');
    const valInput = body.querySelector('#scheme-discount-val');
    const valLabel = body.querySelector('#scheme-val-label');
    const previewDisc = body.querySelector('#preview-discount-val');
    const previewFinal = body.querySelector('#preview-final-val');

    function updatePreview() {
      const isPercent = typeSelect.value === 'PERCENT';
      valLabel.innerHTML = isPercent ? 'Besaran Potongan (%) <span class="required">*</span>' : 'Besaran Potongan (Rp) <span class="required">*</span>';
      
      const val = Number(valInput.value) || 0;
      let disc = 0;
      if (isPercent) {
        disc = (2500000 * val) / 100;
      } else {
        disc = Math.min(val, 2500000);
      }
      const finalVal = 2500000 - disc;
      previewDisc.textContent = `- ${formatRupiah(disc)}`;
      previewFinal.textContent = formatRupiah(finalVal);
    }

    typeSelect.addEventListener('change', updatePreview);
    valInput.addEventListener('input', updatePreview);
    updatePreview();

    // Save
    footer.querySelector('#btn-cancel-scheme-edit').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-scheme-edit').addEventListener('click', () => {
      const name = body.querySelector('#scheme-name').value.trim();
      const description = body.querySelector('#scheme-desc').value.trim();
      const discountType = typeSelect.value;
      const discountValue = Number(valInput.value) || 0;
      const prodiChoice = body.querySelector('#scheme-prodi').value;
      const eligibleProdi = prodiChoice === 'ALL' ? ['BKPI', 'PIAUD'] : [prodiChoice];

      if (!name) {
        window.simpelToast.show('Data Tidak Lengkap', 'Nama skema beasiswa wajib diisi.', 'warning');
        return;
      }

      const res = BillingEngine.updateScholarshipScheme(schemeId, { 
        name, 
        description, 
        discountType, 
        discountValue,
        eligibleProdi 
      });

      if (res.success) {
        window.simpelToast.show('Skema Beasiswa Diperbarui', `Skema "${name}" berhasil disimpan dan tagihan aktif telah dihitung ulang.`, 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      }
    });

    // Delete (for non-reguler)
    const btnDelete = footer.querySelector('#btn-delete-scheme');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        if (confirm(`Apakah Anda yakin ingin menghapus skema beasiswa "${scheme.name}"?\n\nMahasiswa yang terdaftar pada skema ini akan otomatis dialihkan ke skema Reguler.`)) {
          const res = BillingEngine.deleteScholarshipScheme(schemeId);
          if (res.success) {
            window.simpelToast.show('Skema Dihapus', `Skema "${scheme.name}" berhasil dihapus.`, 'info');
            ModalManager.closeModal();
            if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
          }
        }
      });
    }
  }

  /**
   * 2b. Add New Scholarship Scheme Modal
   */
  static openAddSchemeModal() {
    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `+ Tambah Skema Program Beasiswa Baru`;

    body.innerHTML = `
      <form id="form-add-scheme">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Kode / ID Skema Unik <span class="required">*</span></label>
            <input type="text" class="form-control" id="new-scheme-id" placeholder="Contoh: TAHFIDZ_30" required style="font-family:var(--font-mono); text-transform:uppercase;">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Program Beasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="new-scheme-name" placeholder="Contoh: Beasiswa Tahfidz Al-Qur'an 30 Juz" required style="font-weight:700;">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Deskripsi & Landasan SK Kebijakan <span class="required">*</span></label>
          <textarea class="form-control" id="new-scheme-desc" rows="3" required placeholder="Contoh: Beasiswa penuh SPP untuk santri berprestasi hafalan Al-Qur'an 30 juz mutqin..."></textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Program Studi yang Berhak <span class="required">*</span></label>
            <select class="filter-select" id="new-scheme-prodi" style="width: 100%;">
              <option value="ALL" selected>Semua Program Studi (BKPI & PIAUD)</option>
              <option value="PIAUD">Hanya Prodi PIAUD (PAUD Islam)</option>
              <option value="BKPI">Hanya Prodi BKPI (Bimbingan Konseling)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Komponen Biaya Terpotong</label>
            <input type="text" class="form-control" value="SPP / UKT Pokok Semester" disabled>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Jenis Pemotongan Subsidi <span class="required">*</span></label>
            <select class="filter-select" id="new-scheme-discount-type" style="width: 100%;">
              <option value="PERCENT" selected>Persentase (%)</option>
              <option value="FIXED">Nominal Tetap (Rp)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" id="new-scheme-val-label">Besaran Potongan (%) <span class="required">*</span></label>
            <input type="number" class="form-control" id="new-scheme-discount-val" value="50" required min="0">
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: var(--radius-lg); padding: 14px 18px; margin-top: 10px;">
          <div style="font-size: 0.74rem; color: #0369a1; font-weight: 700; text-transform: uppercase;">Simulasi Tarif SPP Pokok (Rp 2.500.000):</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 0.84rem; color: var(--text-dark);">Subsidi Dihemat Mahasiswa:</span>
            <strong style="color: #0284c7; font-size: 0.95rem;" id="new-preview-discount-val">- Rp 1.250.000</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed #bae6fd;">
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-dark);">Sisa SPP Wajib Bayar Mahasiswa:</span>
            <strong style="color: #1e40af; font-size: 1.15rem;" id="new-preview-final-val">Rp 1.250.000</strong>
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-new-scheme">Batal</button>
      <button class="btn btn-primary" id="btn-save-new-scheme">🚀 Buat Skema Beasiswa</button>
    `;

    overlay.classList.add('active');

    // Live preview updater
    const typeSelect = body.querySelector('#new-scheme-discount-type');
    const valInput = body.querySelector('#new-scheme-discount-val');
    const valLabel = body.querySelector('#new-scheme-val-label');
    const previewDisc = body.querySelector('#new-preview-discount-val');
    const previewFinal = body.querySelector('#new-preview-final-val');

    function updatePreview() {
      const isPercent = typeSelect.value === 'PERCENT';
      valLabel.innerHTML = isPercent ? 'Besaran Potongan (%) <span class="required">*</span>' : 'Besaran Potongan (Rp) <span class="required">*</span>';
      
      const val = Number(valInput.value) || 0;
      let disc = 0;
      if (isPercent) {
        disc = (2500000 * val) / 100;
      } else {
        disc = Math.min(val, 2500000);
      }
      const finalVal = 2500000 - disc;
      previewDisc.textContent = `- ${formatRupiah(disc)}`;
      previewFinal.textContent = formatRupiah(finalVal);
    }

    typeSelect.addEventListener('change', updatePreview);
    valInput.addEventListener('input', updatePreview);
    updatePreview();

    // Save
    footer.querySelector('#btn-cancel-new-scheme').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-new-scheme').addEventListener('click', () => {
      const id = body.querySelector('#new-scheme-id').value.trim();
      const name = body.querySelector('#new-scheme-name').value.trim();
      const description = body.querySelector('#new-scheme-desc').value.trim();
      const discountType = typeSelect.value;
      const discountValue = Number(valInput.value) || 0;
      const prodiChoice = body.querySelector('#new-scheme-prodi').value;
      const eligibleProdi = prodiChoice === 'ALL' ? ['BKPI', 'PIAUD'] : [prodiChoice];

      if (!id || !name) {
        window.simpelToast.show('Data Tidak Lengkap', 'ID dan Nama skema beasiswa wajib diisi.', 'warning');
        return;
      }

      const res = BillingEngine.createScholarshipScheme({ 
        id, 
        name, 
        description, 
        discountType, 
        discountValue, 
        eligibleProdi 
      });

      if (res.success) {
        window.simpelToast.show('Skema Beasiswa Baru Ditambahkan', `Skema "${name}" berhasil dibuat dan siap diterapkan.`, 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      } else {
        window.simpelToast.show('Gagal Membuat Skema', res.message, 'danger');
      }
    });
  }

  /**
   * 3. Edit Fee Component Modal
   */
  static openEditFeeCompModal(compId) {
    const state = appState.getState();
    const comp = state.feeComponents.find(c => c.id === compId);
    if (!comp) return;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.remove('modal-lg');

    title.textContent = `✏️ Ubah Tarif: ${comp.name}`;

    body.innerHTML = `
      <form id="form-edit-fee-comp">
        <div class="form-group">
          <label class="form-label">Nama Komponen Biaya</label>
          <input type="text" class="form-control" value="${comp.name}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Tarif Dasar Pokok (Rp) <span class="required">*</span></label>
          <input type="number" class="form-control" id="fee-comp-amount" value="${comp.defaultAmount}" required min="0" step="50000">
        </div>
        <div class="form-group">
          <label class="form-label">Keterangan</label>
          <textarea class="form-control" id="fee-comp-desc">${comp.description}</textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-comp-edit">Batal</button>
      <button class="btn btn-primary" id="btn-save-comp-edit">💾 Simpan Tarif Baru</button>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-cancel-comp-edit').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-comp-edit').addEventListener('click', () => {
      const amount = Number(body.querySelector('#fee-comp-amount').value) || 0;
      const desc = body.querySelector('#fee-comp-desc').value;

      comp.defaultAmount = amount;
      comp.description = desc;

      appState.addAuditLog('UPDATE_TARIF_KOMPONEN', comp.name, `Penyesuaian tarif dasar menjadi ${formatRupiah(amount)}.`);
      appState.notify();

      window.simpelToast.show('Tarif Diperbarui', `Tarif komponen ${comp.name} telah disimpan.`, 'success');
      ModalManager.closeModal();
      if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
    });
  }

  /**
   * 4. Override Individual / Dispensasi Modal
   */
  static openOverrideModal() {
    const state = appState.getState();
    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `✍️ Penetapan Override Individual / Dispensasi Cicilan`;

    body.innerHTML = `
      <form id="form-add-override">
        <div class="form-group">
          <label class="form-label">Pilih Mahasiswa STIT Ihsanul Fikri <span class="required">*</span></label>
          <select class="filter-select" id="override-student-select" style="width: 100%;" required>
            ${state.students.map(s => `
              <option value="${s.nim}">${s.name} (NIM: ${s.nim}) - ${s.prodi} Sem ${s.semester}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Jenis Override / Dispensasi <span class="required">*</span></label>
            <select class="filter-select" id="override-type-select" style="width: 100%;">
              <option value="ADDITIONAL_DISCOUNT">Potongan Khusus / Beasiswa Tambahan (Rp)</option>
              <option value="INSTALLMENT_PLAN">Rencana Angsuran / Dispensasi Cicilan</option>
            </select>
          </div>

          <div class="form-group" id="override-amount-group">
            <label class="form-label">Nominal Potongan Tambahan (Rp) <span class="required">*</span></label>
            <input type="number" class="form-control" id="override-amount-val" value="500000" min="0" step="50000">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Alasan Penetapan & Nomor Rujukan SK / Dispensasi <span class="required">*</span></label>
          <textarea class="form-control" id="override-reason" rows="3" placeholder="Contoh: Dispensasi Beasiswa Tahfidz 15 Juz SK No. 042/SK-TIT/2026 atau Permohonan Cicilan Orang Tua" required></textarea>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-override">Batal</button>
      <button class="btn btn-primary" id="btn-save-override">💾 Tetapkan Override</button>
    `;

    overlay.classList.add('active');

    const typeSelect = body.querySelector('#override-type-select');
    const amountGroup = body.querySelector('#override-amount-group');

    typeSelect.addEventListener('change', () => {
      if (typeSelect.value === 'ADDITIONAL_DISCOUNT') {
        amountGroup.style.display = 'block';
      } else {
        amountGroup.style.display = 'none';
      }
    });

    footer.querySelector('#btn-cancel-override').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-override').addEventListener('click', () => {
      const studentNim = body.querySelector('#override-student-select').value;
      const overrideType = typeSelect.value;
      const discountAmount = Number(body.querySelector('#override-amount-val').value) || 0;
      const reason = body.querySelector('#override-reason').value;

      if (!reason) {
        alert('Harap masukkan alasan penetapan override.');
        return;
      }

      const res = BillingEngine.addIndividualOverride({ studentNim, overrideType, discountAmount, reason });
      if (res.success) {
        window.simpelToast.show('Override Ditetapkan', 'Pengecualian khusus berhasil disimpan dan diterapkan pada tagihan.', 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      }
    });
  }

  /**
   * 5. Add Student Modal with Auto-Tagging
   */
  static openAddStudentModal() {
    const state = appState.getState();
    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `+ Tambah Mahasiswa Baru STIT Ihsanul Fikri (Auto-Tagging)`;

    body.innerHTML = `
      <form id="form-add-student">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nomor Induk Mahasiswa (NIM) <span class="required">*</span></label>
            <input type="text" class="form-control" id="new-std-nim" value="2026862090${Math.floor(10 + Math.random() * 90)}" required style="font-family:var(--font-mono);">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Lengkap Mahasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="new-std-name" placeholder="Nama mahasiswa lengkap" required>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Jenis Kelamin <span class="required">*</span></label>
            <select class="filter-select" id="new-std-gender" style="width: 100%;">
              <option value="L">Laki-laki (Ikhwan)</option>
              <option value="P">Perempuan (Akhwat)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Program Studi <span class="required">*</span></label>
            <select class="filter-select" id="new-std-prodi" style="width: 100%;">
              <option value="PIAUD">Pendidikan Islam Anak Usia Dini (PIAUD)</option>
              <option value="BKPI">Bimbingan Konseling Pendidikan Islam (BKPI)</option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Semester Masuk</label>
            <input type="number" class="form-control" id="new-std-semester" value="1" min="1" max="8">
          </div>
          <div class="form-group">
            <label class="form-label">Tahun Angkatan</label>
            <input type="text" class="form-control" id="new-std-year" value="2026">
          </div>
        </div>

        <!-- Scholarship Tagging with Auto-Tagging Notice -->
        <div class="form-group">
          <label class="form-label">Skema Pembiayaan / Beasiswa Terpasang <span class="required">*</span></label>
          <select class="filter-select" id="new-std-scholarship" style="width: 100%;">
            ${state.scholarshipSchemes.map(sc => `
              <option value="${sc.id}">${sc.name} (${sc.id === 'REGULER' ? 'Tarif Standar' : sc.discountType === 'PERCENT' ? sc.discountValue + '% SPP' : formatRupiah(sc.discountValue)})</option>
            `).join('')}
          </select>
          <div id="auto-tag-badge" style="margin-top: 6px; font-size: 0.76rem; color: #be185d; font-weight: 700; display: none;">
            ✨ Rekomendasi Otomatis: Mahasiswa putra prodi PIAUD terdeteksi berhak atas Beasiswa PAUD Laki-laki.
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-student">Batal</button>
      <button class="btn btn-primary" id="btn-save-new-student">💾 Simpan Data Mahasiswa</button>
    `;

    overlay.classList.add('active');

    // Auto-Tagging Logic
    const genderSel = body.querySelector('#new-std-gender');
    const prodiSel = body.querySelector('#new-std-prodi');
    const schSel = body.querySelector('#new-std-scholarship');
    const autoTagBadge = body.querySelector('#auto-tag-badge');

    function checkAutoTag() {
      if (genderSel.value === 'L' && prodiSel.value === 'PIAUD') {
        const paudLaki = state.scholarshipSchemes.find(s => s.id === 'PAUD_LAKI');
        if (paudLaki) {
          schSel.value = 'PAUD_LAKI';
          autoTagBadge.style.display = 'block';
        }
      } else {
        autoTagBadge.style.display = 'none';
      }
    }

    genderSel.addEventListener('change', checkAutoTag);
    prodiSel.addEventListener('change', checkAutoTag);
    checkAutoTag();

    // Save Student
    footer.querySelector('#btn-cancel-student').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-new-student').addEventListener('click', () => {
      const nim = body.querySelector('#new-std-nim').value;
      const name = body.querySelector('#new-std-name').value;
      const gender = genderSel.value;
      const prodi = prodiSel.value;
      const semester = Number(body.querySelector('#new-std-semester').value) || 1;
      const classYear = body.querySelector('#new-std-year').value;
      const scholarshipId = schSel.value;

      if (!name) {
        alert('Harap isi nama lengkap mahasiswa.');
        return;
      }

      const newStudent = {
        nim,
        name,
        gender,
        prodi,
        semester,
        classYear,
        statusAkademik: 'Aktif',
        scholarshipId,
        phone: '0812-0000-0000',
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@mahasiswa.stit-ihsanulfikri.ac.id`
      };

      state.students.unshift(newStudent);

      // Auto generate invoice for new student
      const calc = BillingEngine.calculateInvoice(newStudent, state.activeSemester);
      const newInv = {
        id: `INV-${Date.now().toString().slice(-6)}-${newStudent.nim.slice(-3)}`,
        studentNim: newStudent.nim,
        semester: state.activeSemester,
        createdDate: new Date().toISOString().slice(0, 10),
        dueDate: '2026-09-10',
        items: calc.items,
        grossAmount: calc.grossAmount,
        totalDiscount: calc.totalDiscount,
        netAmount: calc.netAmount,
        paidAmount: 0,
        status: 'BELUM_BAYAR',
        paymentMethod: null,
        receiptNumber: null,
        paymentDate: null,
        virtualAccount: calc.virtualAccount,
        notes: 'Tagihan otomatis untuk mahasiswa baru'
      };
      state.invoices.unshift(newInv);

      appState.addAuditLog(
        'ADD_STUDENT',
        `${name} (${nim})`,
        `Pendaftaran mahasiswa baru prodi ${prodi} dengan skema ${scholarshipId}. Tagihan awal otomatis diterbitkan.`
      );

      appState.notify();

      window.simpelToast.show('Mahasiswa Ditambahkan', `Mahasiswa ${name} (${prodi}) berhasil didaftarkan.`, 'success');
      ModalManager.closeModal();
      if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
    });
  }

  /**
   * 6. Edit Student Modal
   */
  static openEditStudentModal(studentNim) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `✏️ Edit Data Mahasiswa: ${student.name}`;

    body.innerHTML = `
      <form id="form-edit-student">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nomor Induk Mahasiswa (NIM)</label>
            <input type="text" class="form-control" value="${student.nim}" disabled style="font-family:var(--font-mono);">
          </div>
          <div class="form-group">
            <label class="form-label">Nama Lengkap Mahasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="edit-std-name" value="${student.name}" required>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Program Studi</label>
            <select class="filter-select" id="edit-std-prodi" style="width: 100%;">
              <option value="BKPI" ${student.prodi === 'BKPI' ? 'selected' : ''}>Bimbingan Konseling (BKPI)</option>
              <option value="PIAUD" ${student.prodi === 'PIAUD' ? 'selected' : ''}>PAUD Islam (PIAUD)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status Akademik</label>
            <select class="filter-select" id="edit-std-status" style="width: 100%;">
              <option value="Aktif" ${student.statusAkademik === 'Aktif' ? 'selected' : ''}>Aktif</option>
              <option value="Cuti" ${student.statusAkademik === 'Cuti' ? 'selected' : ''}>Cuti</option>
              <option value="Lulus" ${student.statusAkademik === 'Lulus' ? 'selected' : ''}>Lulus</option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Semester Berjalan</label>
            <input type="number" class="form-control" id="edit-std-sem" value="${student.semester}" min="1" max="8">
          </div>
          <div class="form-group">
            <label class="form-label">Skema Beasiswa</label>
            <select class="filter-select" id="edit-std-sch" style="width: 100%;">
              ${state.scholarshipSchemes.map(sc => `
                <option value="${sc.id}" ${student.scholarshipId === sc.id ? 'selected' : ''}>
                  ${sc.name} (${sc.id === 'REGULER' ? 'Reguler' : sc.discountType === 'PERCENT' ? sc.discountValue + '%' : formatRupiah(sc.discountValue)})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button class="btn btn-outline btn-sm" id="btn-delete-student-modal" style="color: #b91c1c; border-color: #fca5a5; background: #fff1f2; font-weight: 700;">
          🗑️ Hapus Mahasiswa Ini
        </button>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" id="btn-cancel-edit-student">Batal</button>
          <button class="btn btn-primary" id="btn-save-edit-student">💾 Simpan Perubahan</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    // Delete Student Handler
    const btnDeleteModal = footer.querySelector('#btn-delete-student-modal');
    if (btnDeleteModal) {
      btnDeleteModal.addEventListener('click', () => {
        if (confirm(`⚠️ KONFIRMASI HAPUS DATA MAHASISWA\n\nApakah Anda yakin ingin menghapus "${student.name}" (NIM: ${student.nim})?\n\nSeluruh data tagihan dan verifikasi terkait mahasiswa ini akan dibersihkan.`)) {
          const res = appState.deleteStudent(student.nim);
          if (res.success) {
            window.simpelToast.show('Mahasiswa Berhasil Dihapus', res.message, 'success');
            ModalManager.closeModal();
            if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
          }
        }
      });
    }

    footer.querySelector('#btn-cancel-edit-student').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-edit-student').addEventListener('click', () => {
      student.name = body.querySelector('#edit-std-name').value;
      student.prodi = body.querySelector('#edit-std-prodi').value;
      student.statusAkademik = body.querySelector('#edit-std-status').value;
      student.semester = Number(body.querySelector('#edit-std-sem').value) || student.semester;
      student.scholarshipId = body.querySelector('#edit-std-sch').value;

      appState.addAuditLog('EDIT_STUDENT', `${student.name} (${student.nim})`, 'Pembaruan profil data mahasiswa dan status beasiswa.');
      appState.notify();

      window.simpelToast.show('Data Disimpan', `Perubahan data ${student.name} berhasil disimpan.`, 'success');
      ModalManager.closeModal();
      if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
    });
  }

  /**
   * 7. Fullscreen Image Preview Modal
   */
  static openImagePreviewModal(imageUrl) {
    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.textContent = `🔍 Pratinjau Bukti Pembayaran / Struk Transfer`;

    body.innerHTML = `
      <div style="text-align: center; padding: 10px; background: #0f172a; border-radius: var(--radius-lg);">
        <img src="${imageUrl}" alt="Bukti Pembayaran" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius-md);">
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-primary" id="btn-close-img-preview">Tutup Pratinjau</button>
    `;

    overlay.classList.add('active');
    footer.querySelector('#btn-close-img-preview').addEventListener('click', () => ModalManager.closeModal());
  }

  /**
   * 8. Student Self-Profile Edit Modal
   */
  static openStudentSelfProfileModal(studentNim) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return;

    const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId) || { name: 'Reguler' };

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.innerHTML = `👤 Edit Profil & Biodata Mahasiswa`;

    body.innerHTML = `
      <form id="form-self-profile" onsubmit="return false;">
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 0.72rem; color: #1e40af; font-weight: 800; text-transform: uppercase;">Nomor Induk Mahasiswa (NIM):</div>
            <div style="font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a;">${student.nim}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge" style="background:#2563eb; color:#ffffff; font-weight:800;">${student.prodi === 'BKPI' ? 'BKPI' : 'PIAUD'} - Semester ${student.semester}</span>
            <div style="font-size: 0.72rem; color: #1e40af; font-weight: 700; margin-top: 3px;">Skema: ${scholarship.name.split('(')[0]}</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nama Lengkap Mahasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="self-std-name" value="${student.name}" required placeholder="Nama lengkap sesuai ijazah/KTP">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Telepon / WhatsApp Aktif <span class="required">*</span></label>
            <input type="text" class="form-control" id="self-std-phone" value="${student.phone || '081234567890'}" required placeholder="Contoh: 081234567890">
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Alamat Email Aktif</label>
            <input type="email" class="form-control" id="self-std-email" value="${student.email || `${student.nim}@student.stit-if.ac.id`}" placeholder="nama@email.com">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Kontak Orang Tua / Wali</label>
            <input type="text" class="form-control" id="self-std-parent-phone" value="${student.parentPhone || '082198765432'}" placeholder="Contoh: 082198765432">
          </div>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label">Alamat Domisili / Tempat Tinggal</label>
          <textarea class="form-control" id="self-std-address" rows="2" placeholder="Alamat lengkap RT/RW, Desa, Kecamatan, Kabupaten/Kota">${student.address || 'Pagentan, Magelang, Jawa Tengah'}</textarea>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 10px 14px; margin-top: 14px; font-size: 0.76rem; color: #166534; line-height: 1.4;">
          ℹ️ <strong>Catatan:</strong> Perubahan data Program Studi, Semester, dan Status Skema Beasiswa hanya dapat diproses melalui Bagian Administrasi Akademik (BAAK) & Bendahara.
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-self-profile">Batal</button>
      <button class="btn btn-primary" id="btn-save-self-profile" style="background: #1e40af; font-weight: 800;">
        💾 Simpan Pembaruan Profil
      </button>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-cancel-self-profile').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-self-profile').addEventListener('click', () => {
      const newName = body.querySelector('#self-std-name').value.trim();
      const newPhone = body.querySelector('#self-std-phone').value.trim();
      const newEmail = body.querySelector('#self-std-email').value.trim();
      const newParentPhone = body.querySelector('#self-std-parent-phone').value.trim();
      const newAddress = body.querySelector('#self-std-address').value.trim();

      if (!newName) {
        window.simpelToast.show('Peringatan', 'Nama lengkap tidak boleh kosong.', 'warning');
        return;
      }

      student.name = newName;
      student.phone = newPhone;
      student.email = newEmail;
      student.parentPhone = newParentPhone;
      student.address = newAddress;

      // Update state current user name if active
      if (state.currentUser && state.currentUser.nim === student.nim) {
        state.currentUser.name = newName;
      }

      appState.addAuditLog(
        'EDIT_STUDENT_SELF',
        `${student.name} (${student.nim})`,
        `Mahasiswa memperbarui profil biodata mandiri (Nama: ${newName}, Kontak: ${newPhone}).`
      );
      appState.notify();

      window.simpelToast.show('Profil Berhasil Diperbarui!', 'Biodata profil Anda telah tersimpan dengan aman.', 'success');
      ModalManager.closeModal();
      if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
    });
  }

  /**
   * 9. Admin / Bendahara Self-Profile Edit Modal
   */
  static openAdminSelfProfileModal() {
    const state = appState.getState();
    const admin = state.adminProfile || {
      id: 'USR-ADMIN',
      name: 'Ustadzah Siti Fatimah, S.E.',
      role: 'ADMIN',
      email: 'bendahara@stit-if.ac.id',
      phone: '081392817263',
      title: 'Kepala Bagian Keuangan & Bendahara Penerimaan',
      department: 'Biro Keuangan & Administrasi Umum (BAU)',
      nip: '19840512 201201 2 003',
      avatarText: 'SF'
    };

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.innerHTML = `👑 Profil & Pengaturan Identitas Admin / Bendahara`;

    body.innerHTML = `
      <form id="form-admin-profile" onsubmit="return false;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: var(--radius-xl); padding: 18px 22px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: #ffffff; color: #1e40af; font-weight: 900; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              ${admin.avatarText || 'SF'}
            </div>
            <div>
              <div style="font-size: 1.05rem; font-weight: 800;">${admin.name}</div>
              <div style="font-size: 0.76rem; opacity: 0.9;">${admin.title}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge" style="background: #3b82f6; color: #ffffff; font-weight: 800; font-size: 0.74rem;">STIT Ihsanul Fikri</span>
            <div style="font-size: 0.72rem; opacity: 0.85; margin-top: 3px;">Pagentan, Magelang</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nama Lengkap & Gelar Pejabat <span class="required">*</span></label>
            <input type="text" class="form-control" id="admin-prof-name" value="${admin.name}" required placeholder="Contoh: Ustadzah Siti Fatimah, S.E.">
            <small style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px; display: block;">Nama ini dicantumkan sebagai penandatangan pada kwitansi sah & bukti bayar.</small>
          </div>
          <div class="form-group">
            <label class="form-label">NIP / NIDN / No. Induk Pegawai</label>
            <input type="text" class="form-control" id="admin-prof-nip" value="${admin.nip || '19840512 201201 2 003'}" placeholder="Contoh: 19840512 201201 2 003">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Jabatan Struktural / Tugas Pokok <span class="required">*</span></label>
            <input type="text" class="form-control" id="admin-prof-title" value="${admin.title || 'Kepala Bagian Keuangan & Bendahara Penerimaan'}" required placeholder="Contoh: Kepala Bagian Keuangan">
          </div>
          <div class="form-group">
            <label class="form-label">Unit Kerja / Biro Administrasi</label>
            <input type="text" class="form-control" id="admin-prof-dept" value="${admin.department || 'Biro Keuangan & Administrasi Umum (BAU)'}" placeholder="Biro Keuangan & Administrasi Umum">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Email Resmi Institusi <span class="required">*</span></label>
            <input type="email" class="form-control" id="admin-prof-email" value="${admin.email || 'bendahara@stit-if.ac.id'}" required placeholder="nama@stit-if.ac.id">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp / HP Aktif <span class="required">*</span></label>
            <input type="text" class="form-control" id="admin-prof-phone" value="${admin.phone || '081392817263'}" required placeholder="0813-xxxx-xxxx">
          </div>
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label">Inisial Avatar (Maks. 2 Huruf)</label>
          <input type="text" class="form-control" id="admin-prof-avatar" value="${admin.avatarText || 'SF'}" maxlength="2" style="width: 120px; font-weight: 800; text-transform: uppercase; text-align: center;">
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 12px 16px; margin-top: 16px; font-size: 0.78rem; color: #166534; line-height: 1.45;">
          🛡️ <strong>Keterangan Integritas:</strong> Informasi identitas ini disinkronkan secara otomatis ke seluruh komponen aplikasi, kop surat kwitansi pembayaran, pusat verifikasi QR, serta log audit sistem.
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-admin-profile">Batal</button>
      <button class="btn btn-primary" id="btn-save-admin-profile" style="background: #1e40af; font-weight: 800;">
        💾 Simpan Perubahan Profil Admin
      </button>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-cancel-admin-profile').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-admin-profile').addEventListener('click', () => {
      const name = body.querySelector('#admin-prof-name').value.trim();
      const nip = body.querySelector('#admin-prof-nip').value.trim();
      const titleText = body.querySelector('#admin-prof-title').value.trim();
      const department = body.querySelector('#admin-prof-dept').value.trim();
      const email = body.querySelector('#admin-prof-email').value.trim();
      const phone = body.querySelector('#admin-prof-phone').value.trim();
      let avatarText = body.querySelector('#admin-prof-avatar').value.trim().toUpperCase();

      if (!name) {
        window.simpelToast.show('Peringatan', 'Nama lengkap Admin/Bendahara tidak boleh kosong.', 'warning');
        return;
      }
      if (!email) {
        window.simpelToast.show('Peringatan', 'Email resmi institusi tidak boleh kosong.', 'warning');
        return;
      }

      if (!avatarText) {
        const words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(Boolean);
        avatarText = words.slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'AD';
      }

      const res = appState.updateAdminProfile({
        name,
        nip,
        title: titleText,
        department,
        email,
        phone,
        avatarText
      });

      if (res.success) {
        window.simpelToast.show('Profil Berhasil Diperbarui!', `Identitas ${name} telah diperbarui di sistem.`, 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      }
    });
  }
}
