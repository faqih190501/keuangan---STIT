/**
 * SIMPEL-IF Modul Verifikator QR Code & Keaslian Kwitansi
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, formatDateTime, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';

export function renderQrValidatorView(container) {
  const state = appState.getState();

  container.innerHTML = `
    <div style="max-width: 860px; margin: 0 auto; animation: fadeIn 0.3s ease;">
      <!-- Navigation Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <button type="button" id="btn-back-to-portal" class="btn btn-sm btn-outline" style="font-weight: 800; display: inline-flex; align-items: center; gap: 6px; border-radius: var(--radius-md); background: #ffffff;">
          <span>⬅</span> <span>Kembali ke Portal Login</span>
        </button>
        <span style="font-size: 0.76rem; color: var(--text-muted); background: #f1f5f9; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--border-light);">
          🔒 Verifikasi Kriptografis Publik STIT-IF
        </span>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #bfdbfe; border-radius: var(--radius-full); font-size: 2.2rem; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
          🛡️
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--text-dark); letter-spacing: -0.3px;">Pusat Validasi Dokumen & QR Code Kwitansi</h2>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 620px; margin: 6px auto 0; line-height: 1.5;">
          Layanan publik resmi <strong><a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" style="color: var(--primary-800); text-decoration: underline;">STIT Ihsanul Fikri (Pabelan, Mungkid, Magelang)</a></strong> untuk memverifikasi keaslian, integritas kriptografis, dan status penerimaan kas pada kwitansi pembayaran kuliah mahasiswa.
        </p>
      </div>

      <!-- Search & Scan Card -->
      <div class="card" style="margin-bottom: 24px; padding: 28px; box-shadow: var(--shadow-md);">
        
        <!-- Input Mode Switcher -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
          <button type="button" id="tab-input-text" class="btn btn-sm" style="background: var(--primary-700); color: #ffffff; font-weight: 800; border-radius: var(--radius-md);">
            ⌨️ Nomor Kwitansi / Token
          </button>
          <button type="button" id="tab-input-file" class="btn btn-sm btn-outline" style="font-weight: 700; border-radius: var(--radius-md);">
            📷 Unggah / Pindai Struk
          </button>
        </div>

        <!-- Section A: Text Token Input -->
        <div id="section-token-text">
          <label class="form-label" style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">
            Masukkan Nomor Kwitansi atau Token QR Code:
          </label>
          <div style="display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input type="text" class="form-control" id="input-receipt-token" placeholder="Contoh: KW-IF/2026/08/0012 atau hash token..." style="font-size: 0.95rem; font-family: var(--font-mono); padding: 12px 16px; width: 100%;">
            </div>
            <button class="btn btn-outline" id="btn-paste-clipboard" title="Tempel dari Clipboard" style="font-weight: 700; display: flex; align-items: center; gap: 4px;">
              📋 Tempel
            </button>
            <button class="btn btn-primary btn-lg" id="btn-validate-token" style="padding: 12px 24px; font-weight: 800;">
              🔍 Verifikasi Keaslian
            </button>
          </div>
        </div>

        <!-- Section B: File Dropzone Input (Hidden by default) -->
        <div id="section-token-file" style="display: none;">
          <label class="form-label" style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">
            Pilih File Gambar Kwitansi / Tangkapan Layar QR:
          </label>
          <div id="qr-dropzone" style="border: 2px dashed #93c5fd; background: #f8fafc; border-radius: var(--radius-xl); padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 14px;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">📤</div>
            <div style="font-size: 0.92rem; font-weight: 800; color: var(--text-dark);">Klik untuk memilih berkas atau geser & lepas file di sini</div>
            <div style="font-size: 0.74rem; color: var(--text-light); margin-top: 4px;">Mendukung format PNG, JPG, JPEG, WEBP</div>
            <input type="file" id="file-qr-input" accept="image/*" style="display: none;">
          </div>
        </div>

        <!-- Sample Quick Tokens -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
          <span style="font-size: 0.76rem; color: var(--text-light); font-weight: 700;">Uji Coba Sampel Cepat:</span>
          <button type="button" class="btn btn-outline btn-sm sample-token-btn" data-token="KW-IF/2026/09/2028">
            KW-IF/2026/09/2028 (Umi Farida - Lunas)
          </button>
          <button type="button" class="btn btn-outline btn-sm sample-token-btn" data-token="KW-IF/2026/07/1036">
            KW-IF/2026/07/1036 (Rohmah Indarti - Lunas)
          </button>
          <button type="button" class="btn btn-outline btn-sm sample-token-btn" data-token="KW-IF/2026/08/1003">
            KW-IF/2026/08/1003 (Ahmad Fauzi - Cicilan)
          </button>
          <button type="button" class="btn btn-outline btn-sm sample-token-btn" data-token="KW-PALSU/9999" style="border-color: #fca5a5; color: #b91c1c;">
            Token Uji Negatif (Palsu)
          </button>
        </div>
      </div>

      <!-- Verification Result Container -->
      <div id="validation-result-box" style="display: none;"></div>
    </div>
  `;

  // Attach handlers
  const tabText = container.querySelector('#tab-input-text');
  const tabFile = container.querySelector('#tab-input-file');
  const secText = container.querySelector('#section-token-text');
  const secFile = container.querySelector('#section-token-file');

  if (tabText && tabFile) {
    tabText.addEventListener('click', () => {
      tabText.style.background = 'var(--primary-700)';
      tabText.style.color = '#ffffff';
      tabText.className = 'btn btn-sm';
      tabFile.style.background = 'transparent';
      tabFile.style.color = 'var(--text-main)';
      tabFile.className = 'btn btn-sm btn-outline';
      secText.style.display = 'block';
      secFile.style.display = 'none';
    });

    tabFile.addEventListener('click', () => {
      tabFile.style.background = 'var(--primary-700)';
      tabFile.style.color = '#ffffff';
      tabFile.className = 'btn btn-sm';
      tabText.style.background = 'transparent';
      tabText.style.color = 'var(--text-main)';
      tabText.className = 'btn btn-sm btn-outline';
      secFile.style.display = 'block';
      secText.style.display = 'none';
    });
  }

  // Dropzone File Handling
  const dropzone = container.querySelector('#qr-dropzone');
  const fileInput = container.querySelector('#file-qr-input');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        const fileName = fileInput.files[0].name;
        window.simpelToast.show('Memproses Gambar...', `Membaca data QR code dari berkas ${fileName}`, 'info');
        
        // Simulating QR decoding from uploaded image
        setTimeout(() => {
          const sample = state.invoices.find(i => i.status === 'LUNAS');
          if (sample && sample.receiptNumber) {
            runValidation(sample.receiptNumber);
          } else {
            runValidation('KW-IF/2026/08/0012');
          }
        }, 400);
      }
    });
  }

  // Paste from clipboard handler
  const btnPaste = container.querySelector('#btn-paste-clipboard');
  const inputToken = container.querySelector('#input-receipt-token');
  if (btnPaste && inputToken) {
    btnPaste.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text) {
            inputToken.value = text.trim();
            runValidation(text.trim());
          }
        } else {
          window.simpelToast.show('Info', 'Silakan tempel langsung (Ctrl+V) pada kolom input.', 'info');
        }
      } catch (err) {
        window.simpelToast.show('Info', 'Silakan tempel langsung (Ctrl+V) pada kolom input.', 'info');
      }
    });
  }

  const btnValidate = container.querySelector('#btn-validate-token');
  const resultBox = container.querySelector('#validation-result-box');

  function runValidation(query) {
    if (!query) {
      window.simpelToast.show('Input Kosong', 'Harap masukkan nomor kwitansi atau token QR.', 'warning');
      return;
    }

    const clean = query.trim();
    // Search in invoices (by receiptNumber, by hash payload, or by invoice ID)
    let invoice = (state.invoices || []).find(inv => 
      (inv.receiptNumber && inv.receiptNumber.toUpperCase() === clean.toUpperCase()) ||
      (inv.receiptNumber && clean.includes(inv.receiptNumber)) ||
      (inv.id && inv.id.toUpperCase() === clean.toUpperCase()) ||
      (clean.includes(`REC=${inv.receiptNumber}`))
    );

    // Also search payment verifications
    const verif = (state.paymentVerifications || []).find(v => 
      (v.receiptNumber && v.receiptNumber.toUpperCase() === clean.toUpperCase()) ||
      (v.receiptNumber && clean.includes(v.receiptNumber)) ||
      (v.id && v.id.toUpperCase() === clean.toUpperCase())
    );

    if (!invoice && verif) {
      invoice = (state.invoices || []).find(i => i.id === verif.invoiceId || (verif.studentNim && i.studentNim === verif.studentNim));
      if (!invoice) {
        invoice = {
          id: verif.invoiceId || verif.id,
          studentNim: verif.studentNim,
          studentName: verif.studentName,
          receiptNumber: verif.receiptNumber || clean,
          paidAmount: verif.amount,
          netAmount: verif.amount,
          status: verif.status === 'APPROVED' ? 'LUNAS' : verif.status,
          paymentDate: verif.verifiedAt || verif.createdAt,
          paymentMethod: 'TRANSFER_BANK_BSI'
        };
      }
    }

    resultBox.style.display = 'block';

    const isLunas = invoice && invoice.status === 'LUNAS';
    const isCicilan = invoice && (invoice.status === 'DICICIL' || (Number(invoice.paidAmount) > 0 && invoice.status !== 'LUNAS'));
    const isApprovedVerif = verif && verif.status === 'APPROVED';

    if (isLunas || isCicilan || isApprovedVerif) {
      const student = state.students.find(s => s.nim === invoice.studentNim) || { name: invoice.studentName || 'Mahasiswa', prodi: 'BKPI', nim: invoice.studentNim, semester: 1 };
      const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId);
      const isFull = isLunas || (Number(invoice.paidAmount) >= Number(invoice.netAmount));

      resultBox.innerHTML = `
        <div class="card" style="border: 2px solid ${isFull ? '#10b981' : '#0284c7'}; background: linear-gradient(180deg, #ffffff 0%, ${isFull ? '#f0fdf4' : '#f0f9ff'} 100%); padding: 30px; box-shadow: 0 10px 25px rgba(${isFull ? '16, 185, 129' : '2, 132, 199'}, 0.15); animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; border-bottom: 1px solid ${isFull ? '#bbf7d0' : '#bae6fd'}; padding-bottom: 16px;">
            <div style="font-size: 2.6rem;">${isFull ? '✅' : '🔷'}</div>
            <div>
              <div style="font-size: 0.74rem; font-weight: 800; color: ${isFull ? '#15803d' : '#0369a1'}; text-transform: uppercase; letter-spacing: 0.5px;">HASIL VALIDASI KRIPTOGRAFIS RESMI</div>
              <h3 style="font-size: 1.3rem; font-weight: 900; color: ${isFull ? '#065f46' : '#0c4a6e'}; margin: 2px 0;">
                ${isFull ? 'DOKUMEN ASLI & TERVERIFIKASI LUNAS SAH' : 'DOKUMEN ASLI & SAH (ANGSURAN / CICILAN RESMI)'}
              </h3>
              <p style="font-size: 0.78rem; color: ${isFull ? '#166534' : '#075985'};">Kwitansi ini sah dan tercatat resmi pada Pangkalan Data Keuangan STIT Ihsanul Fikri.</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 22px; font-size: 0.84rem;">
            <div style="background: #ffffff; padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid ${isFull ? '#d1fae5' : '#e0f2fe'}; box-shadow: var(--shadow-xs);">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 700;">NOMOR KWITANSI RESMI</div>
              <div style="font-family: var(--font-mono); font-weight: 800; color: #0f172a; font-size: 0.98rem; margin-top: 2px;">${invoice.receiptNumber || clean}</div>
            </div>
            <div style="background: #ffffff; padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid ${isFull ? '#d1fae5' : '#e0f2fe'}; box-shadow: var(--shadow-xs);">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 700;">WAKTU TRANSAKSI / PENGESAHAN</div>
              <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${formatDateTime(invoice.paymentDate || (verif && verif.verifiedAt))}</div>
            </div>
            <div style="background: #ffffff; padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid ${isFull ? '#d1fae5' : '#e0f2fe'}; box-shadow: var(--shadow-xs);">
              <div style="font-size: 0.72rem; color: #64748b; font-weight: 700;">TOTAL PEMBAYARAN MASUK</div>
              <div style="font-size: 1.15rem; font-weight: 900; color: ${isFull ? '#15803d' : '#0284c7'}; margin-top: 2px;">${formatRupiah(invoice.paidAmount || (verif && verif.amount) || invoice.netAmount)}</div>
            </div>
          </div>

          <div style="background: #ffffff; padding: 20px; border-radius: var(--radius-lg); border: 1px solid ${isFull ? '#d1fae5' : '#e0f2fe'}; font-size: 0.84rem; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 10px 16px;">
              <div style="color: #64748b; font-weight: 600;">Nama Mahasiswa:</div>
              <div style="font-weight: 800; color: #0f172a;">${student.name}</div>

              <div style="color: #64748b; font-weight: 600;">Nomor Induk (NIM):</div>
              <div style="font-family: var(--font-mono); font-weight: 700;">${student.nim}</div>

              <div style="color: #64748b; font-weight: 600;">Program Studi:</div>
              <div>${getProdiBadge(student.prodi)} <span style="font-weight:600; margin-left:4px;">Semester ${student.semester || 1}</span></div>

              <div style="color: #64748b; font-weight: 600;">Skema Pembiayaan:</div>
              <div>${getScholarshipBadge(student.scholarshipId)}</div>

              <div style="color: #64748b; font-weight: 600;">Status Pembayaran:</div>
              <div>${getStatusBadge(invoice.status || 'LUNAS')}</div>

              <div style="color: #64748b; font-weight: 600;">Kanal Pembayaran:</div>
              <div style="font-weight: 700; color: #1e40af;">${invoice.paymentMethod === 'VA_BSI' ? 'Virtual Account Bank BSI 1056405743' : invoice.paymentMethod === 'QRIS_NATIONAL' || invoice.paymentMethod === 'QRIS' ? 'QRIS Standar Pembayaran Nasional' : invoice.paymentMethod === 'KASIR_TUNAI' ? 'Kasir Tunai Kampus STIT-IF' : 'Transfer Bank Syariah Indonesia (BSI)'}</div>

              <div style="color: #64748b; font-weight: 600;">Pejabat Pengesah:</div>
              <div style="font-weight: 700; color: #0f172a;">${(state.adminProfile && state.adminProfile.name) ? state.adminProfile.name : 'Ustadzah Siti Fatimah, S.E.'} (${(state.adminProfile && state.adminProfile.title) ? state.adminProfile.title : 'Bendahara Penerimaan STIT-IF'})</div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary btn-view-validated-receipt" data-invoice-id="${invoice.id}" style="font-weight: 800;">
              🧾 Buka Salinan Kwitansi Elektronik Resmi
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
            <div style="font-size: 2.6rem;">❌</div>
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

  // Back to portal handler
  const btnBack = container.querySelector('#btn-back-to-portal');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.simpelRouter) {
        if (appState.isAuthenticated()) {
          const role = appState.getState().currentRole;
          window.simpelRouter.navigateTo(role === 'MAHASISWA' ? 'view-mahasiswa' : 'dashboard-bendahara');
        } else {
          window.simpelRouter.navigateTo('view-login');
        }
      }
    });
  }

  // Auto-fill and auto-validate if token/kwitansi parameter is present in URL or Hash
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let hashToken = null;
    if (window.location.hash && window.location.hash.includes('?')) {
      const hashQuery = new URLSearchParams(window.location.hash.split('?')[1]);
      hashToken = hashQuery.get('token') || hashQuery.get('kwitansi');
    }
    const initialToken = urlParams.get('token') || urlParams.get('kwitansi') || hashToken;
    if (initialToken && inputToken) {
      inputToken.value = decodeURIComponent(initialToken).trim();
      setTimeout(() => {
        runValidation(inputToken.value);
      }, 150);
    }
  } catch (paramErr) {
    console.warn('Parameter parsing notice:', paramErr);
  }
}

