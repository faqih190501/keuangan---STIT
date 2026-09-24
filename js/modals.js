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
    card.classList.add('modal-receipt');
    body.scrollTop = 0;

    const admin = state.adminProfile || {
      name: 'Ustadzah Siti Fatimah, S.E.',
      title: 'Bendahara Penerimaan Kampus',
      nip: '19840512 201201 2 003'
    };

    const signatureShort = (admin.name || 'Siti Fatimah').replace(/^(Ustadz|Ustadzah|Bpk|Ibu|Dr|Dra|Drs)\.?\s+/i, '').split(',')[0].trim();
    const paymentDateFormatted = formatDate(invoice.paymentDate || invoice.createdDate || new Date().toISOString());
    const isLunas = invoice.status === 'LUNAS';
    
    // Channel description
    let paymentChannelDesc = 'Bank Syariah Indonesia (BSI) 1056405743 a.n. STIT IHSANUL FIKRI';
    if (invoice.paymentMethod === 'QRIS_NATIONAL') {
      paymentChannelDesc = 'QRIS Dinamis Standar Nasional (NMID: ID10200392019)';
    } else if (invoice.paymentMethod === 'KASIR_TUNAI') {
      paymentChannelDesc = 'Kasir Keuangan Tunai Kampus STIT-IF Magelang';
    } else if (invoice.paymentMethod === 'VA_BSI') {
      paymentChannelDesc = 'BSI Virtual Account 1056405743 a.n. STIT IHSANUL FIKRI';
    }

    // Prodi full title
    const prodiFullName = student.prodi === 'BKPI' 
      ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' 
      : 'Pendidikan Islam Anak Usia Dini (PIAUD)';

    // Generate Official Circular Stamp (Stempel Basah Bulat STIT-IF)
    const stampColor = isLunas ? '#1e40af' : '#b45309';
    const stampStatusWord = isLunas ? 'L U N A S' : 'D I C I C I L';
    const stampDate = invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';
    
    const officialStampSVG = `
      <svg width="115" height="115" viewBox="0 0 120 120" class="signature-stamp-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="stampUpperPath" d="M 18,60 A 42,42 0 1,1 102,60" fill="none" />
          <path id="stampLowerPath" d="M 102,60 A 42,42 0 0,1 18,60" fill="none" />
        </defs>
        <circle cx="60" cy="60" r="56" fill="none" stroke="${stampColor}" stroke-width="2.5" stroke-opacity="0.88" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="${stampColor}" stroke-width="1.2" stroke-opacity="0.88" />
        <text font-size="7.2" font-weight="900" fill="${stampColor}" letter-spacing="1.2px" font-family="'Plus Jakarta Sans', Arial, sans-serif" opacity="0.92">
          <textPath href="#stampUpperPath" startOffset="50%" text-anchor="middle">
            SEKOLAH TINGGI ILMU TARBIYAH
          </textPath>
        </text>
        <text font-size="6.8" font-weight="900" fill="${stampColor}" letter-spacing="1px" font-family="'Plus Jakarta Sans', Arial, sans-serif" opacity="0.92">
          <textPath href="#stampLowerPath" startOffset="50%" text-anchor="middle">
            ★ IHSANUL FIKRI MAGELANG ★
          </textPath>
        </text>
        <line x1="22" y1="45" x2="98" y2="45" stroke="${stampColor}" stroke-width="1.2" opacity="0.88" />
        <text x="60" y="55" font-size="7.5" font-weight="900" fill="${stampColor}" text-anchor="middle" letter-spacing="1.2px" font-family="'Plus Jakarta Sans', Arial, sans-serif">
          BAGIAN KEUANGAN
        </text>
        <text x="60" y="67" font-size="8.8" font-weight="900" fill="${stampColor}" text-anchor="middle" letter-spacing="2px" font-family="'Plus Jakarta Sans', Arial, sans-serif">
          ${stampStatusWord}
        </text>
        ${stampDate ? `<text x="60" y="74" font-size="5.8" font-weight="700" fill="${stampColor}" text-anchor="middle" font-family="monospace">${stampDate}</text>` : ''}
        <line x1="22" y1="${stampDate ? 78 : 73}" x2="98" y2="${stampDate ? 78 : 73}" stroke="${stampColor}" stroke-width="1.2" opacity="0.88" />
        <text x="14" y="62" font-size="7" fill="${stampColor}" text-anchor="middle">★</text>
        <text x="106" y="62" font-size="7" fill="${stampColor}" text-anchor="middle">★</text>
      </svg>
    `;

    title.innerHTML = `🧾 Salinan Dokumen Kwitansi Elektronik — STIT Ihsanul Fikri`;
    
    body.innerHTML = `
      <div class="receipt-modal-container">
        <!-- Floating Document Action Bar -->
        <div class="receipt-toolbar no-print">
          <div class="receipt-toolbar-left">
            <span class="receipt-doc-badge">
              <span>🛡️</span>
              <span>Dokumen Keuangan Sah STIT-IF</span>
            </span>
            <span style="font-size: 0.75rem; color: #94a3b8; font-family: var(--font-mono);">${invoice.receiptNumber || invoice.id}</span>
          </div>
          <div class="receipt-toolbar-right">
            <button class="receipt-tool-btn" id="btn-quick-copy-receipt" title="Salin Ringkasan Kwitansi ke Clipboard">
              📋 Salin Info
            </button>
            <button class="receipt-tool-btn" id="btn-quick-validate-receipt" title="Uji Keaslian di Pusat Validator QR">
              🔍 Cek Validator
            </button>
            <button class="receipt-tool-btn btn-print-action" id="btn-quick-print-receipt" title="Cetak Kwitansi (Kertas A4 / PDF)">
              🖨️ Cetak A4 / PDF
            </button>
          </div>
        </div>

        <!-- Official Printable Paper Sheet -->
        <div class="official-receipt-paper" id="official-receipt-printable">
          <div class="receipt-inner-frame">
            <!-- Security Corner Marks -->
            <div class="receipt-corner-mark corner-tl"></div>
            <div class="receipt-corner-mark corner-tr"></div>
            <div class="receipt-corner-mark corner-bl"></div>
            <div class="receipt-corner-mark corner-br"></div>

            <!-- Background Security Watermark -->
            <div class="receipt-watermark">
              STIT IHSANUL FIKRI
              <span class="receipt-watermark-sub">OFFICIAL FINANCIAL DOCUMENT</span>
            </div>

            <!-- Paid / Installment Stamp -->
            ${isLunas ? `
              <div class="paid-stamp-watermark stamp-lunas">
                <div class="stamp-stars">★ ★ ★</div>
                <div class="stamp-main">LUNAS / PAID</div>
                <div class="stamp-sub">KAS TERVERIFIKASI</div>
                <div class="stamp-date">${paymentDateFormatted}</div>
              </div>
            ` : `
              <div class="paid-stamp-watermark stamp-cicil">
                <div class="stamp-stars">★ ★ ★</div>
                <div class="stamp-main">DICICIL / ANGSURAN</div>
                <div class="stamp-sub">DISPENSASI RESMI</div>
                <div class="stamp-date">${paymentDateFormatted}</div>
              </div>
            `}

            <!-- Kop Surat Resmi Institusi -->
            <div class="receipt-header-kop">
              <img src="./assets/images/logo.png" alt="Logo STIT-IF" class="receipt-kop-logo">
              <div class="receipt-kop-text">
                <div class="kop-yayasan">YAYASAN TARBIYATUL MUKMIN PABELAN</div>
                <div class="kop-institution">SEKOLAH TINGGI ILMU TARBIYAH (STIT) IHSANUL FIKRI</div>
                <div class="kop-accreditation">STATUS TERAKREDITASI KEMENTERIAN AGAMA RI & BAN-PT</div>
                <div class="kop-prodi-info">Program Studi: S1 Bimbingan Konseling Pendidikan Islam (BKPI) &bull; S1 Pendidikan Islam Anak Usia Dini (PIAUD)</div>
                <div class="kop-address">Kampus: Pabelan 1, Pabelan, Kec. Mungkid, Kabupaten Magelang, Jawa Tengah 56512<br>Telp/WA: 082342307414 &bull; Web: <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" style="color: inherit; font-weight: 700; text-decoration: underline;">www.stitihsanulfikri.ac.id</a> &bull; Email: stit.ihsanulfikri@ac.id</div>
              </div>
            </div>

            <!-- Kop Divider (Double Line) -->
            <div class="receipt-kop-divider">
              <div class="divider-thick"></div>
              <div class="divider-thin"></div>
            </div>

            <!-- Islamic Basmalah Calligraphy -->
            <div class="receipt-basmalah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

            <!-- Receipt Title -->
            <div class="receipt-title-box">
              <h2 class="receipt-title-heading">KWITANSI BUKTI PEMBAYARAN SAH</h2>
              <div class="receipt-title-sub">OFFICIAL FINANCIAL PAYMENT RECEIPT &bull; SIMPEL-IF STIT IHSANUL FIKRI</div>
            </div>

            <!-- Receipt Metadata & Verification Tag -->
            <div class="receipt-meta-grid">
              <div>
                <div class="receipt-meta-label">Nomor Kwitansi Resmi:</div>
                <div class="receipt-number-highlight">
                  <span>${invoice.receiptNumber || 'KW-IF/2026/08/0001'}</span>
                </div>
                <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">
                  Tanggal Terbit: <strong>${formatDateTime(invoice.paymentDate || invoice.createdDate)}</strong>
                </div>
              </div>
              <div class="receipt-meta-right">
                <div class="receipt-meta-label">Status Verifikasi Kas:</div>
                <div>
                  <span class="badge ${isLunas ? 'badge-paid' : 'badge-installment'}">
                    <span class="badge-dot"></span>${isLunas ? 'LUNAS (SAH)' : 'DISPENSASI / DICICIL'}
                  </span>
                </div>
                <div style="font-size: 0.7rem; color: #64748b; font-weight: 600; margin-top: 2px;">
                  Tercatat Resmi Pangkalan Data Keuangan
                </div>
              </div>
            </div>

            <!-- Student Profile Section -->
            <div class="receipt-student-profile">
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Telah Diterima Dari</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value receipt-student-name">${student.name}</span>
              </div>
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Nomor Induk Mahasiswa</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value" style="font-family: var(--font-mono); font-weight: 800; color: #0a1e42;">${student.nim}</span>
              </div>
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Program Studi / Strata</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value">${prodiFullName} &bull; S1</span>
              </div>
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Semester / Angkatan</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value">Semester ${student.semester} &bull; Angkatan ${student.cohort || '2026'}</span>
              </div>
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Skema Pembiayaan</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value">${scholarship ? scholarship.name : 'Reguler Mandiri'}</span>
              </div>
              <div class="receipt-profile-row">
                <span class="receipt-profile-label">Tahun Akademik</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value">${invoice.semester || state.activeSemester}</span>
              </div>
              <div class="receipt-profile-row" style="grid-column: 1 / -1;">
                <span class="receipt-profile-label">Kanal Pembayaran</span>
                <span class="receipt-profile-colon">:</span>
                <span class="receipt-profile-value" style="color: #1e40af; font-weight: 700;">${paymentChannelDesc}</span>
              </div>
            </div>

            <!-- Itemized Fee Breakdown Table -->
            <table class="receipt-breakdown-table">
              <thead>
                <tr>
                  <th class="col-no">No.</th>
                  <th>Rincian Pos Pembayaran</th>
                  <th style="text-align: right; width: 130px;">Tarif Pokok</th>
                  <th style="text-align: right; width: 140px;">Subsidi Beasiswa</th>
                  <th style="text-align: right; width: 140px;">Kewajiban Bersih</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, idx) => `
                  <tr>
                    <td class="col-no">${idx + 1}</td>
                    <td>
                      <div class="receipt-item-title">${item.name}</div>
                      <div class="receipt-item-desc">${item.category === 'INITIAL' ? 'Biaya Registrasi / Awal Masuk' : item.category === 'FINAL' ? 'Biaya Akhir Studi / Wisuda' : 'Biaya Rutin Perkuliahan'}</div>
                    </td>
                    <td style="text-align: right; font-family: var(--font-mono);">${formatRupiah(item.grossAmount)}</td>
                    <td style="text-align: right; font-family: var(--font-mono); color: #0284c7;">
                      ${item.discountAmount > 0 ? `-${formatRupiah(item.discountAmount)}` : '-'}
                    </td>
                    <td style="text-align: right; font-family: var(--font-mono); font-weight: 800; color: #0a1e42;">
                      ${formatRupiah(item.netAmount)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="receipt-subtotal-row">
                  <td colspan="4" style="text-align: right;">TOTAL TARIF BIAYA PENDIDIKAN:</td>
                  <td style="text-align: right; font-family: var(--font-mono);">${formatRupiah(invoice.grossAmount)}</td>
                </tr>
                ${invoice.totalDiscount > 0 ? `
                  <tr class="receipt-discount-row">
                    <td colspan="4" style="text-align: right;">TOTAL SUBSIDI BEASISWA / POTONGAN:</td>
                    <td style="text-align: right; font-family: var(--font-mono);">-${formatRupiah(invoice.totalDiscount)}</td>
                  </tr>
                ` : ''}
                <tr class="receipt-grand-total-row">
                  <td colspan="4" style="text-align: right;">
                    <div class="receipt-grand-total-label">TOTAL DITERIMA KAS (NETTO):</div>
                    <div class="receipt-balance-note">
                      ${isLunas 
                        ? 'Status: Lunas Penuh Tanpa Sisa Tunggakan (Rp 0)' 
                        : `Telah Dibayar: ${formatRupiah(invoice.paidAmount || 0)} | Sisa Kewajiban: ${formatRupiah(Math.max(0, invoice.netAmount - (invoice.paidAmount || 0)))}`}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="receipt-grand-total-val">${formatRupiah(invoice.paidAmount || invoice.netAmount)}</div>
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Terbilang Box -->
            <div class="receipt-terbilang-box">
              <div class="terbilang-label">Nominal Terbilang:</div>
              <div class="terbilang-text"># ${terbilangText} Rupiah #</div>
            </div>

            <!-- Bottom Row: QR Authenticity & Official Signature -->
            <div class="receipt-bottom-grid">
              <!-- QR Authenticity -->
              <div class="receipt-qr-section">
                <div class="receipt-qr-box">
                  ${qrSVG}
                </div>
                <div class="receipt-qr-instructions">
                  <div class="receipt-qr-title">
                    <span>🛡️</span>
                    <span>QR Code Keabsahan Resmi</span>
                  </div>
                  <div>Pindai kode QR untuk memvalidasi keaslian dokumen pada pangkalan data <strong>SIMPEL-IF STIT Ihsanul Fikri</strong>.</div>
                  <div class="receipt-qr-hash">Token: ${invoice.receiptNumber || invoice.id} &bull; ${invoice.id.slice(-6)}</div>
                </div>
              </div>

              <!-- Official Signature Box -->
              <div class="receipt-signature-box">
                <div class="signature-date">Magelang, ${paymentDateFormatted}</div>
                <div class="signature-role">
                  a.n. Pimpinan STIT Ihsanul Fikri<br>
                  ${admin.title || 'Bendahara Penerimaan Kampus'},
                </div>
                <div class="signature-space">
                  ${officialStampSVG}
                  <div class="signature-digital-img">${signatureShort}</div>
                </div>
                <div class="signature-name">${admin.name}</div>
                <div class="signature-nip">${admin.nip ? `NIP/NIDN: ${admin.nip}` : 'NIP: 19840512 201201 2 003'}</div>
              </div>
            </div>

            <!-- Doa Ta'awun Pembayaran Berkah -->
            <div class="receipt-doa-taawun">
              <span>🤲</span>
              <span>"Jazakumullahu Khairan Katsiran atas pembayaran biaya perkuliahan di STIT Ihsanul Fikri. Semoga menjadi ilmu yang bermanfaat dan berkah fiddunya wal akhirah."</span>
            </div>

            <!-- Legal Notice & Security Footer -->
            <div class="receipt-legal-footer">
              <div class="receipt-legal-text">
                <strong>CATATAN HUKUM:</strong> Dokumen ini merupakan bukti pembayaran elektronik resmi yang diterbitkan secara sah oleh Sistem Informasi Manajemen Pembayaran Elektronik (SIMPEL-IF) STIT Ihsanul Fikri Magelang. Keaslian dokumen dijamin secara kriptografis dan dilindungi Undang-Undang Republik Indonesia Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE) Pasal 5 Ayat 1 & 2. Harap simpan kwitansi ini untuk kelengkapan administrasi akademik, registrasi semester, dan yudisium.
              </div>
              <div class="receipt-audit-trail">
                <span>ID Invoice: ${invoice.id}</span>
                <span>Dicetak: ${formatDateTime(new Date().toISOString())}</span>
                <span>SIMPEL-IF v7.2 Production</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const waText = encodeURIComponent(
      `*بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ*\n` +
      `*KWITANSI PEMBAYARAN ELEKTRONIK RESMI*\n` +
      `*STIT IHSANUL FIKRI MAGELANG*\n\n` +
      `📄 *No. Kwitansi:* ${invoice.receiptNumber || invoice.id}\n` +
      `👤 *Nama Mahasiswa:* ${student.name}\n` +
      `🎓 *NIM:* ${student.nim}\n` +
      `📚 *Program Studi:* ${student.prodi} (S1)\n` +
      `💰 *Nominal Diterima Kas:* ${formatRupiah(invoice.paidAmount || invoice.netAmount)}\n` +
      `✅ *Status:* ${isLunas ? 'LUNAS (SAH)' : 'DICICIL / DISPENSASI'}\n` +
      `📅 *Tanggal:* ${paymentDateFormatted}\n` +
      `🏛️ *Kanal:* ${paymentChannelDesc}\n\n` +
      `🛡️ *Cek Keaslian Dokumen & QR Code:* https://faqih190501.github.io/keuangan---STIT/#view-qr-validator\n\n` +
      `_Kwitansi ini diterbitkan secara sah oleh Bagian Keuangan STIT Ihsanul Fikri._`
    );

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-close-receipt-modal">Tutup</button>
      <button class="btn btn-outline" id="btn-copy-receipt-footer" style="font-weight: 700;">
        📋 Salin Rincian
      </button>
      <a href="https://api.whatsapp.com/send?text=${waText}" target="_blank" rel="noopener" class="btn btn-outline" style="background: #f0fdf4; color: #166534; border-color: #86efac; font-weight: 800; text-decoration: none;" id="btn-share-receipt-wa">
        📲 Bagikan via WhatsApp
      </a>
      <button class="btn btn-primary" id="btn-print-receipt-modal" style="font-weight: 800; background: #0f2042; border-color: #0a1e42;">
        🖨️ Cetak / Simpan Kwitansi PDF (A4)
      </button>
    `;

    overlay.classList.add('active');

    // Copy helper function
    const copyReceiptSummary = () => {
      const summaryText = 
        `KWITANSI PEMBAYARAN RESMI STIT IHSANUL FIKRI MAGELANG\n` +
        `Yayasan        : Yayasan Tarbiyatul Mukmin Pabelan\n` +
        `Nomor Kwitansi : ${invoice.receiptNumber || invoice.id}\n` +
        `Nama Mahasiswa : ${student.name}\n` +
        `NIM            : ${student.nim}\n` +
        `Program Studi  : ${prodiFullName}\n` +
        `Semester       : ${student.semester} (${invoice.semester || state.activeSemester})\n` +
        `Skema Biaya    : ${scholarship ? scholarship.name : 'Reguler Mandiri'}\n` +
        `Total Diterima : ${formatRupiah(invoice.paidAmount || invoice.netAmount)}\n` +
        `Status Kas     : ${isLunas ? 'LUNAS (SAH)' : 'DISPENSASI / DICICIL'}\n` +
        `Tanggal Bayar  : ${paymentDateFormatted}\n` +
        `Kanal Bayar    : ${paymentChannelDesc}\n` +
        `Verifikasi QR  : https://faqih190501.github.io/keuangan---STIT/#view-qr-validator`;

      navigator.clipboard.writeText(summaryText).then(() => {
        if (window.simpelToast) {
          window.simpelToast.show('Kwitansi Disalin', `Rincian ${invoice.receiptNumber || invoice.id} berhasil disalin ke clipboard.`, 'success');
        } else {
          alert('Rincian kwitansi berhasil disalin!');
        }
      }).catch(() => {
        if (window.simpelToast) {
          window.simpelToast.show('Info Kwitansi', invoice.receiptNumber || invoice.id, 'info');
        }
      });
    };

    // Attach listeners
    const btnClose = footer.querySelector('#btn-close-receipt-modal');
    if (btnClose) btnClose.addEventListener('click', () => ModalManager.closeModal());

    const btnPrintFooter = footer.querySelector('#btn-print-receipt-modal');
    if (btnPrintFooter) btnPrintFooter.addEventListener('click', () => printReceiptElement());

    const btnQuickPrint = body.querySelector('#btn-quick-print-receipt');
    if (btnQuickPrint) btnQuickPrint.addEventListener('click', () => printReceiptElement());

    const btnCopyFooter = footer.querySelector('#btn-copy-receipt-footer');
    if (btnCopyFooter) btnCopyFooter.addEventListener('click', copyReceiptSummary);

    const btnQuickCopy = body.querySelector('#btn-quick-copy-receipt');
    if (btnQuickCopy) btnQuickCopy.addEventListener('click', copyReceiptSummary);

    const btnQuickValidate = body.querySelector('#btn-quick-validate-receipt');
    if (btnQuickValidate) {
      btnQuickValidate.addEventListener('click', () => {
        ModalManager.closeModal();
        window.location.hash = 'view-qr-validator';
        setTimeout(() => {
          const input = document.getElementById('input-receipt-token');
          if (input) {
            input.value = invoice.receiptNumber || invoice.id;
            const btnRun = document.getElementById('btn-run-qr-validation');
            if (btnRun) btnRun.click();
          }
        }, 150);
      });
    }
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

    const sppComp = state.feeComponents.find(c => c.id === 'SPP');
    const sppAmount = sppComp ? sppComp.defaultAmount : 2400000;

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
            <span style="font-size: 0.74rem; color: #0369a1; font-weight: 700; text-transform: uppercase;">Simulasi Tarif SPP Pokok (${formatRupiah(sppAmount)}):</span>
            <span style="font-size: 0.72rem; color: #0284c7; font-weight: 700;">Mahasiswa Aktif: ${studentCount} Orang</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 0.84rem; color: var(--text-dark);">Subsidi Dihemat Mahasiswa:</span>
            <strong style="color: #0284c7; font-size: 0.95rem;" id="preview-discount-val">- Rp 0</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed #bae6fd;">
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-dark);">Sisa SPP Wajib Bayar Mahasiswa:</span>
            <strong style="color: #1e40af; font-size: 1.15rem;" id="preview-final-val">${formatRupiah(sppAmount)}</strong>
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
        disc = (sppAmount * val) / 100;
      } else {
        disc = Math.min(val, sppAmount);
      }
      const finalVal = sppAmount - disc;
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
    const state = appState.getState();
    const sppComp = state.feeComponents.find(c => c.id === 'SPP');
    const sppAmount = sppComp ? sppComp.defaultAmount : 2400000;

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
          <div style="font-size: 0.74rem; color: #0369a1; font-weight: 700; text-transform: uppercase;">Simulasi Tarif SPP Pokok (${formatRupiah(sppAmount)}):</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
            <span style="font-size: 0.84rem; color: var(--text-dark);">Subsidi Dihemat Mahasiswa:</span>
            <strong style="color: #0284c7; font-size: 0.95rem;" id="new-preview-discount-val">- ${formatRupiah(sppAmount / 2)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 6px; border-top: 1px dashed #bae6fd;">
            <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-dark);">Sisa SPP Wajib Bayar Mahasiswa:</span>
            <strong style="color: #1e40af; font-size: 1.15rem;" id="new-preview-final-val">${formatRupiah(sppAmount / 2)}</strong>
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
        disc = (sppAmount * val) / 100;
      } else {
        disc = Math.min(val, sppAmount);
      }
      const finalVal = sppAmount - disc;
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
   * 6. Edit Student & Credential Management Modal (Username, Password, Biodata)
   */
  static openEditStudentModal(studentNim) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-sm');
    card.classList.add('modal-lg');

    title.innerHTML = `✏️ Edit Data & Akun Mahasiswa: <span style="color:var(--primary-700);">${student.name}</span>`;

    const currentPwd = student.password || student.pin || '123456';
    const currentUsername = student.username || student.nim;

    body.innerHTML = `
      <form id="form-edit-student" onsubmit="return false;">
        
        <!-- Account Credentials Card -->
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-lg); padding: 16px 18px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem;">🔐</span>
              <div>
                <h4 style="margin: 0; font-size: 0.92rem; font-weight: 800; color: #166534;">Kredensial Akun & Akses Login Mahasiswa</h4>
                <p style="margin: 2px 0 0; font-size: 0.72rem; color: #15803d;">Admin dapat mengubah Username, NIM, dan Password/PIN akun mahasiswa</p>
              </div>
            </div>
            <span class="badge" style="background: #22c55e; color: #ffffff; font-weight: 800; font-size: 0.68rem;">Akses Admin</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nomor Induk Mahasiswa (NIM) <span class="required">*</span></label>
              <input type="text" class="form-control" id="edit-std-nim" value="${student.nim}" required style="font-family:var(--font-mono); font-weight: 800; background: #ffffff;">
              <span class="input-help-text" style="color: #15803d;">NIM digunakan sebagai ID unik resmi transaksi.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Username Login Mahasiswa <span class="required">*</span></label>
              <input type="text" class="form-control" id="edit-std-username" value="${currentUsername}" required style="font-weight: 700; background: #ffffff;">
              <span class="input-help-text" style="color: #15803d;">Dapat digunakan mahasiswa untuk login selain NIM.</span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 10px;">
            <label class="form-label">Password / PIN Akun Mahasiswa <span class="required">*</span></label>
            <div style="display: flex; gap: 8px;">
              <div style="position: relative; flex: 1;">
                <input type="password" class="form-control" id="edit-std-password" value="${currentPwd}" required style="font-family: var(--font-mono); font-weight: 700; padding-right: 40px; background: #ffffff;">
                <button type="button" id="btn-toggle-edit-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                  👁️
                </button>
              </div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-reset-default-pwd" style="white-space: nowrap; font-size: 0.76rem; font-weight: 700; background: #ffffff;">
                🔄 Reset (123456)
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="btn-random-pwd" style="white-space: nowrap; font-size: 0.76rem; font-weight: 700; background: #ffffff;">
                🎲 Acak PIN
              </button>
            </div>
            <span class="input-help-text" style="color: #15803d;">Password yang dimasukkan akan langsung aktif dan dapat digunakan mahasiswa untuk login.</span>
          </div>
        </div>

        <!-- Biodata Mahasiswa -->
        <h4 style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin: 0 0 12px; display: flex; align-items: center; gap: 6px;">
          <span>👤</span> Data Pokok & Akademik Mahasiswa
        </h4>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nama Lengkap Mahasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="edit-std-name" value="${student.name}" required style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label class="form-label">Jenis Kelamin <span class="required">*</span></label>
            <select class="filter-select" id="edit-std-gender" style="width: 100%;">
              <option value="L" ${student.gender === 'L' ? 'selected' : ''}>Laki-laki (Ikhwan)</option>
              <option value="P" ${student.gender === 'P' ? 'selected' : ''}>Perempuan (Akhwat)</option>
            </select>
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
            <label class="form-label">Skema Beasiswa Terpasang</label>
            <select class="filter-select" id="edit-std-sch" style="width: 100%;">
              ${state.scholarshipSchemes.map(sc => `
                <option value="${sc.id}" ${student.scholarshipId === sc.id ? 'selected' : ''}>
                  ${sc.name} (${sc.id === 'REGULER' ? 'Reguler' : sc.discountType === 'PERCENT' ? sc.discountValue + '%' : formatRupiah(sc.discountValue)})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="form-grid" style="margin-top: 4px;">
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp Aktif</label>
            <input type="text" class="form-control" id="edit-std-phone" value="${student.phone || '082342307414'}" placeholder="08xxxxxxxxxx">
          </div>
          <div class="form-group">
            <label class="form-label">Email Mahasiswa</label>
            <input type="email" class="form-control" id="edit-std-email" value="${student.email || ''}" placeholder="nama@mahasiswa.stitihsanulfikri.ac.id">
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
          <button class="btn btn-primary" id="btn-save-edit-student" style="font-weight: 800;">💾 Simpan Kredensial & Profil</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    // Password Toggle & Helper Buttons
    const pwdInput = body.querySelector('#edit-std-password');
    const btnTogglePwd = body.querySelector('#btn-toggle-edit-pwd');
    if (btnTogglePwd && pwdInput) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    const btnResetPwd = body.querySelector('#btn-reset-default-pwd');
    if (btnResetPwd && pwdInput) {
      btnResetPwd.addEventListener('click', () => {
        pwdInput.value = '123456';
        pwdInput.type = 'text';
        if (btnTogglePwd) btnTogglePwd.textContent = '🙈';
        window.simpelToast.show('PIN Direset', 'Password diisi dengan default: 123456', 'info');
      });
    }

    const btnRandomPwd = body.querySelector('#btn-random-pwd');
    if (btnRandomPwd && pwdInput) {
      btnRandomPwd.addEventListener('click', () => {
        const randPIN = Math.floor(100000 + Math.random() * 900000).toString();
        pwdInput.value = randPIN;
        pwdInput.type = 'text';
        if (btnTogglePwd) btnTogglePwd.textContent = '🙈';
        window.simpelToast.show('PIN Baru Diacak', `PIN Baru dibuat: ${randPIN}`, 'info');
      });
    }

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
      const newNim = body.querySelector('#edit-std-nim').value.trim();
      const newUsername = body.querySelector('#edit-std-username').value.trim();
      const newPassword = body.querySelector('#edit-std-password').value.trim();
      const name = body.querySelector('#edit-std-name').value.trim();
      const gender = body.querySelector('#edit-std-gender').value;
      const prodi = body.querySelector('#edit-std-prodi').value;
      const statusAkademik = body.querySelector('#edit-std-status').value;
      const semester = Number(body.querySelector('#edit-std-sem').value) || student.semester;
      const scholarshipId = body.querySelector('#edit-std-sch').value;
      const phone = body.querySelector('#edit-std-phone').value.trim();
      const email = body.querySelector('#edit-std-email').value.trim();

      if (!name) {
        window.simpelToast.show('Nama Kosong', 'Nama lengkap mahasiswa wajib diisi.', 'warning');
        return;
      }

      if (!newNim) {
        window.simpelToast.show('NIM Kosong', 'NIM mahasiswa wajib diisi.', 'warning');
        return;
      }

      if (!newPassword) {
        window.simpelToast.show('Password Kosong', 'Password / PIN mahasiswa wajib diisi.', 'warning');
        return;
      }

      const res = appState.updateStudentCredentials(student.nim, {
        nim: newNim,
        username: newUsername,
        password: newPassword,
        name,
        gender,
        prodi,
        statusAkademik,
        semester,
        scholarshipId,
        phone,
        email
      });

      if (res.success) {
        window.simpelToast.show('Akun Berhasil Diperbarui', res.message, 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      } else {
        window.simpelToast.show('Gagal Memperbarui', res.message, 'danger');
      }
    });
  }

  /**
   * 6c. Dedicated Quick Password / PIN Reset Modal for Student
   */
  static openChangeStudentPasswordModal(studentNim) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-md');

    title.innerHTML = `🔑 Ganti Password / PIN: <span style="color:var(--primary-700);">${student.name}</span>`;

    const currentPwd = student.password || student.pin || '123456';
    const currentUsername = student.username || student.nim;

    body.innerHTML = `
      <form id="form-change-student-pwd" onsubmit="return false;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 18px;">
          <div style="font-size: 0.72rem; color: #1e40af; font-weight: 800; text-transform: uppercase;">Akun Mahasiswa Terdaftar:</div>
          <div style="font-size: 1.05rem; font-weight: 900; color: #0f172a; margin-top: 2px;">${student.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; display: flex; gap: 10px; flex-wrap: wrap;">
            <span>NIM: <strong style="font-family:var(--font-mono);">${student.nim}</strong></span>
            <span>&bull;</span>
            <span>Username: <strong style="font-family:var(--font-mono);">${currentUsername}</strong></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password / PIN Baru Mahasiswa <span class="required">*</span></label>
          <div style="position: relative;">
            <input type="password" class="form-control" id="quick-pwd-input" value="${currentPwd}" required style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 800; padding-right: 42px;">
            <button type="button" id="btn-toggle-quick-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
              👁️
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn btn-outline btn-sm" id="btn-quick-set-default" style="font-size: 0.76rem; font-weight: 700;">
            🔄 Default (123456)
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-quick-set-random" style="font-size: 0.76rem; font-weight: 700;">
            🎲 Acak PIN 6 Angka
          </button>
        </div>

        <div style="margin-top: 14px; padding: 10px 14px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid #e2e8f0; font-size: 0.74rem; color: var(--text-light);">
          ℹ️ Mahasiswa dapat langsung masuk ke portal dengan password baru ini tanpa perlu konfirmasi email.
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-quick-pwd">Batal</button>
      <button class="btn btn-primary" id="btn-save-quick-pwd" style="font-weight: 800;">💾 Simpan Password Baru</button>
    `;

    overlay.classList.add('active');

    const pwdInp = body.querySelector('#quick-pwd-input');
    const toggleBtn = body.querySelector('#btn-toggle-quick-pwd');
    if (toggleBtn && pwdInp) {
      toggleBtn.addEventListener('click', () => {
        const isP = pwdInp.type === 'password';
        pwdInp.type = isP ? 'text' : 'password';
        toggleBtn.textContent = isP ? '🙈' : '👁️';
      });
    }

    body.querySelector('#btn-quick-set-default').addEventListener('click', () => {
      pwdInp.value = '123456';
      pwdInp.type = 'text';
      if (toggleBtn) toggleBtn.textContent = '🙈';
    });

    body.querySelector('#btn-quick-set-random').addEventListener('click', () => {
      const randPIN = Math.floor(100000 + Math.random() * 900000).toString();
      pwdInp.value = randPIN;
      pwdInp.type = 'text';
      if (toggleBtn) toggleBtn.textContent = '🙈';
    });

    footer.querySelector('#btn-cancel-quick-pwd').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-save-quick-pwd').addEventListener('click', () => {
      const newPassword = pwdInp.value.trim();
      if (!newPassword) {
        window.simpelToast.show('Password Kosong', 'Password / PIN baru tidak boleh kosong.', 'warning');
        return;
      }

      const res = appState.updateStudentCredentials(student.nim, { password: newPassword });
      if (res.success) {
        window.simpelToast.show('Password Berhasil Diubah', `Password baru untuk ${student.name} (${student.nim}) telah disimpan.`, 'success');
        ModalManager.closeModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      }
    });
  }

  /**
   * 6b. Comprehensive Student & User Detail Inspector Modal
   */
  static openStudentDetailModal(studentNim) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return;

    const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId) || { name: 'Reguler', discountType: 'NONE', discountValue: 0 };
    const studentInvoices = state.invoices.filter(i => i.studentNim === student.nim);
    const totalPaid = studentInvoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalGross = studentInvoices.reduce((sum, i) => sum + (i.grossAmount || 0), 0);
    const totalDiscount = studentInvoices.reduce((sum, i) => sum + (i.totalDiscount || 0), 0);
    const totalNet = studentInvoices.reduce((sum, i) => sum + (i.netAmount || 0), 0);
    const totalRemaining = Math.max(0, totalNet - totalPaid);

    const cleanPhone = (student.phone || '082342307414').replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-sm');
    card.classList.add('modal-xl');

    title.innerHTML = `👨‍🎓 Detail Profil Mahasiswa: <span style="color:var(--primary-700);">${student.name}</span>`;

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, ${student.gender === 'L' ? '#1e3a8a 0%, #1e40af 100%' : '#831843 0%, #9d174d 100%'}); color: #ffffff; border-radius: var(--radius-xl); padding: 22px 26px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #ffffff; color: ${student.gender === 'L' ? '#1e40af' : '#9d174d'}; font-weight: 900; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.18); flex-shrink: 0;">
              ${student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 style="font-size: 1.2rem; font-weight: 900; margin: 0; color: #ffffff;">${student.name}</h3>
                <span class="badge" style="background: rgba(255,255,255,0.25); color: #ffffff; font-weight: 800; font-size: 0.72rem; padding: 2px 8px;">NIM: ${student.nim}</span>
              </div>
              <div style="font-size: 0.82rem; opacity: 0.95; margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;">
                <span>Prodi: <strong>${student.prodi === 'BKPI' ? 'BKPI (Bimbingan Konseling)' : 'PIAUD (PAUD Islam)'}</strong></span>
                <span>&bull;</span>
                <span>Semester: <strong>${student.semester}</strong></span>
                <span>&bull;</span>
                <span>Angkatan: <strong>${student.classYear}</strong></span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            ${getProdiBadge(student.prodi)}
            ${getScholarshipBadge(student.scholarshipId)}
            <span class="badge" style="background: ${student.statusAkademik === 'Aktif' ? '#dcfce7' : '#fef3c7'}; color: ${student.statusAkademik === 'Aktif' ? '#15803d' : '#b45309'}; font-weight: 800;">
              ${student.statusAkademik}
            </span>
          </div>
        </div>

        <!-- 3 Info Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 18px;">
            <div style="font-size: 0.72rem; color: #1e40af; font-weight: 800; text-transform: uppercase;">Total Tagihan Terbit</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #1e3a8a; font-family: var(--font-mono); margin-top: 2px;">
              ${formatRupiah(totalNet)}
            </div>
            <div style="font-size: 0.7rem; color: #0284c7; margin-top: 2px;">Subsidi: -${formatRupiah(totalDiscount)}</div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); padding: 14px 18px;">
            <div style="font-size: 0.72rem; color: #15803d; font-weight: 800; text-transform: uppercase;">Total Dana Terbayar</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #166534; font-family: var(--font-mono); margin-top: 2px;">
              ${formatRupiah(totalPaid)}
            </div>
            <div style="font-size: 0.7rem; color: #16a34a; margin-top: 2px;">${studentInvoices.filter(i => i.status === 'LUNAS').length} Invoice Lunas</div>
          </div>

          <div style="background: ${totalRemaining > 0 ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${totalRemaining > 0 ? '#fecaca' : '#bbf7d0'}; border-radius: var(--radius-lg); padding: 14px 18px;">
            <div style="font-size: 0.72rem; color: ${totalRemaining > 0 ? '#b91c1c' : '#15803d'}; font-weight: 800; text-transform: uppercase;">Sisa Piutang Berjalan</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: ${totalRemaining > 0 ? '#991b1b' : '#166534'}; font-family: var(--font-mono); margin-top: 2px;">
              ${formatRupiah(totalRemaining)}
            </div>
            <div style="font-size: 0.7rem; color: ${totalRemaining > 0 ? '#dc2626' : '#16a34a'}; margin-top: 2px;">
              ${totalRemaining > 0 ? '⚠️ Menunggu Pembayaran' : '✅ Semua Tagihan Lunas'}
            </div>
          </div>
        </div>

        <!-- Two Columns Detail Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
          
          <!-- Column 1: Kontak & Biodata -->
          <div style="border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 18px 22px; background: #ffffff;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin: 0 0 14px; display: flex; align-items: center; gap: 8px;">
              <span>📱</span> Kredensial Akun & Kontak Mahasiswa
            </h4>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.84rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px;">
                <span style="color: var(--text-light);">NIM Resmi:</span>
                <strong style="color: var(--primary-800); font-family: var(--font-mono);">${student.nim}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px;">
                <span style="color: var(--text-light);">Username Login:</span>
                <strong style="color: #1e40af; font-family: var(--font-mono);">${student.username || student.nim}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px; align-items: center;">
                <span style="color: var(--text-light);">Password / PIN:</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <strong style="font-family: var(--font-mono); color: var(--text-dark); background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${student.password || '123456'}</strong>
                  <button type="button" class="btn btn-sm" id="btn-detail-quick-chg-pwd" style="background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; font-size: 0.68rem; padding: 2px 8px; border-radius: 4px; font-weight: 800; cursor: pointer;">
                    🔑 Ganti PIN
                  </button>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px;">
                <span style="color: var(--text-light);">Jenis Kelamin:</span>
                <strong style="color: ${student.gender === 'L' ? '#1e40af' : '#be185d'};">${student.gender === 'L' ? 'Laki-laki (Ikhwan)' : 'Perempuan (Akhwat)'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px;">
                <span style="color: var(--text-light);">Email Mahasiswa:</span>
                <strong style="color: var(--text-dark);">${student.email || '-'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px; align-items: center;">
                <span style="color: var(--text-light);">No. WhatsApp:</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <strong style="font-family: var(--font-mono); color: var(--text-dark);">${student.phone || '-'}</strong>
                  <a href="https://wa.me/${waNumber}?text=Assalamu'alaikum%20${encodeURIComponent(student.name)},%20ini%20dari%20Admin%20Keuangan%20STIT%20Ihsanul%20Fikri." target="_blank" rel="noopener" class="btn btn-sm" style="background: #16a34a; color: #fff; font-size: 0.68rem; padding: 2px 8px; border-radius: var(--radius-sm); text-decoration: none; font-weight: 700;">
                    WA 💬
                  </a>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--border-subtle); padding-bottom: 6px;">
                <span style="color: var(--text-light);">Status Akun:</span>
                <span class="badge" style="background: #dcfce7; color: #15803d; font-weight: 800; font-size: 0.7rem;">Terdaftar di SIMPEL-IF</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-light);">Rekening VA Resmi:</span>
                <strong style="font-family: var(--font-mono); color: var(--primary-800);">Bank BSI (1056405743)</strong>
              </div>
            </div>
          </div>

          <!-- Column 2: Program Beasiswa -->
          <div style="border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 18px 22px; background: #ffffff;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin: 0 0 14px; display: flex; align-items: center; gap: 8px;">
              <span>🎓</span> Skema Beasiswa & Pembiayaan
            </h4>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 12px;">
              <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Skema Terdaftar:</div>
              <div style="font-size: 1rem; font-weight: 800; color: var(--primary-900); margin-top: 2px;">
                ${scholarship.name}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                ${scholarship.description || 'Skema pembayaran reguler mandiri penuh.'}
              </div>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5;">
              Besaran subsidi: <strong style="color: #0284c7;">${scholarship.id === 'REGULER' ? 'Rp 0 (Mandiri)' : scholarship.discountType === 'PERCENT' ? scholarship.discountValue + '% Biaya SPP' : formatRupiah(scholarship.discountValue)}</strong>
            </div>
          </div>

        </div>

        <!-- Histori Tagihan & Kwitansi Mahasiswa -->
        <div style="border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 18px 22px; background: #ffffff;">
          <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin: 0 0 14px; display: flex; align-items: center; justify-content: space-between;">
            <span>📜 Riwayat Tagihan & Kwitansi (${studentInvoices.length} Transaksi)</span>
          </h4>
          <div class="table-responsive">
            <table class="custom-table" style="font-size: 0.82rem;">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Semester</th>
                  <th>Kewajiban Pokok</th>
                  <th>Subsidi</th>
                  <th>Total Bersih</th>
                  <th>Terbayar</th>
                  <th>Status</th>
                  <th>No. Kwitansi</th>
                </tr>
              </thead>
              <tbody>
                ${studentInvoices.length > 0 ? studentInvoices.map(inv => `
                  <tr>
                    <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700);">${inv.id}</td>
                    <td>Semester ${inv.semester || state.activeSemester}</td>
                    <td>${formatRupiah(inv.grossAmount)}</td>
                    <td style="color: #0284c7; font-weight: 700;">${inv.totalDiscount > 0 ? `-${formatRupiah(inv.totalDiscount)}` : '-'}</td>
                    <td style="font-weight: 800; color: var(--text-dark);">${formatRupiah(inv.netAmount)}</td>
                    <td style="font-weight: 800; color: #166534; font-family: var(--font-mono);">${inv.paidAmount > 0 ? formatRupiah(inv.paidAmount) : '-'}</td>
                    <td>
                      <span class="badge" style="background: ${inv.status === 'LUNAS' ? '#dcfce7' : inv.status === 'DICICIL' ? '#e0f2fe' : '#fef2f2'}; color: ${inv.status === 'LUNAS' ? '#15803d' : inv.status === 'DICICIL' ? '#0369a1' : '#b91c1c'}; font-weight: 800;">
                        ${inv.status}
                      </span>
                    </td>
                    <td style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">
                      ${inv.receiptNumber || '<span style="color:var(--text-light);">-</span>'}
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-light); padding: 18px;">Belum ada riwayat tagihan terbit.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; flex-wrap: wrap; gap: 10px;">
        <a href="https://wa.me/${waNumber}?text=Assalamu'alaikum%20${encodeURIComponent(student.name)},%20ini%20dari%20Admin%20Keuangan%20STIT%20Ihsanul%20Fikri." target="_blank" rel="noopener" class="btn btn-sm" style="background: #16a34a; color: #ffffff; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          📱 Hubungi via WhatsApp (${student.phone || '082342307414'})
        </a>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline btn-sm" id="btn-detail-open-chg-pwd" style="font-weight: 700; color: #0284c7; border-color: #bae6fd; background: #f0f9ff;">
            🔑 Ganti Password
          </button>
          <button class="btn btn-outline btn-sm" id="btn-goto-student-portal-detail" style="font-weight: 700;">
            🎓 Buka Portal Mahasiswa
          </button>
          <button class="btn btn-outline btn-sm" id="btn-edit-student-from-detail" style="font-weight: 700;">
            ✏️ Edit Akun & Biodata
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-close-student-detail">
            Tutup
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-close-student-detail').addEventListener('click', () => ModalManager.closeModal());
    footer.querySelector('#btn-edit-student-from-detail').addEventListener('click', () => {
      ModalManager.closeModal();
      ModalManager.openEditStudentModal(student.nim);
    });
    footer.querySelector('#btn-detail-open-chg-pwd').addEventListener('click', () => {
      ModalManager.closeModal();
      ModalManager.openChangeStudentPasswordModal(student.nim);
    });
    const quickChgBtn = body.querySelector('#btn-detail-quick-chg-pwd');
    if (quickChgBtn) {
      quickChgBtn.addEventListener('click', () => {
        ModalManager.closeModal();
        ModalManager.openChangeStudentPasswordModal(student.nim);
      });
    }
    footer.querySelector('#btn-goto-student-portal-detail').addEventListener('click', () => {
      ModalManager.closeModal();
      appState.setRole('MAHASISWA', student.nim);
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  /**
   * 7. Transfer Proof Slip & BSI Mobile E-Receipt Modal
   * Admin / Bendahara can preview, zoom, verify, and approve/reject transfer receipts
   */
  static openTransferProofModal(identifier) {
    const state = appState.getState();
    const { overlay, card, title, body, footer } = this.getModalElements();
    if (!overlay || !card) return;

    card.className = 'modal-card modal-transfer-proof';
    body.scrollTop = 0;

    // 1. Resolve verification and related invoice/student
    let verif = null;
    let invoice = null;

    if (identifier && typeof identifier === 'object') {
      verif = identifier;
    } else if (identifier) {
      verif = (state.paymentVerifications || []).find(v => v.id === identifier || v.invoiceId === identifier);
      if (!verif) {
        invoice = (state.invoices || []).find(i => i.id === identifier);
        if (invoice) {
          verif = (state.paymentVerifications || []).find(v => v.studentNim === invoice.studentNim);
        }
      }
    }

    if (verif && !invoice && verif.invoiceId) {
      invoice = (state.invoices || []).find(i => i.id === verif.invoiceId);
    }
    if (verif && !invoice && verif.studentNim) {
      invoice = (state.invoices || []).find(i => i.studentNim === verif.studentNim);
    }

    // Determine target student
    const studentNim = verif?.studentNim || invoice?.studentNim || (typeof identifier === 'string' && identifier.length === 7 ? identifier : null);
    const student = (state.students || []).find(s => s.nim === studentNim) || {
      name: verif?.studentName || invoice?.studentName || 'Mahasiswa STIT-IF',
      nim: studentNim || '2601001',
      prodi: verif?.prodi || invoice?.prodi || 'BKPI',
      semester: verif?.semester || invoice?.semester || 1
    };

    // Determine financial amounts
    const amount = Number(verif?.amount) || Number(invoice?.paidAmount) || Number(invoice?.netAmount) || 200000;
    const paymentTypeDesc = verif?.paymentType ? verif.paymentType.replace(/_/g, ' ') : (invoice?.feeType ? invoice.feeType.replace(/_/g, ' ') : 'BIAYA PENDIDIKAN');
    
    // Determine bank and transfer metadata
    const senderBank = verif?.senderBank || 'Bank Syariah Indonesia (BSI)';
    const senderAccName = verif?.senderAccountName || verif?.studentName || student.name;
    const senderAccNum = verif?.senderAccountNumber || ('52' + String(student.nim).padStart(8, '0'));
    const destAccNum = '1056405743';
    const destAccName = 'STIT IHSANUL FIKRI';
    const destBankName = 'BANK SYARIAH INDONESIA (451)';

    const trxDate = verif?.submittedAt || verif?.paymentDate || invoice?.paymentDate || invoice?.createdDate || new Date().toISOString();
    const trxDateFormatted = formatDateTime(trxDate);

    // Reference number
    const refCode = verif?.bankRefNumber || verif?.id || `BSI-${(invoice?.id || 'TRX').replace(/[^a-zA-Z0-9]/g, '')}-${student.nim.slice(-4)}`;

    // Image URL check
    let rawImageUrl = verif?.proofImage || verif?.proofImageUrl;
    if (!rawImageUrl && typeof identifier === 'string' && (identifier.startsWith('data:') || identifier.startsWith('http') || identifier.includes('.png') || identifier.includes('.jpg') || identifier.includes('.webp') || identifier.includes('/'))) {
      rawImageUrl = identifier;
    }

    const isPending = verif ? verif.status === 'PENDING' : (invoice?.status === 'MENUNGGU_VERIFIKASI');
    const isApproved = verif ? verif.status === 'APPROVED' : (invoice?.status === 'LUNAS');

    // Status Badge
    let statusBadgeHTML = '';
    if (isPending) {
      statusBadgeHTML = `<span class="badge badge-pending"><span class="badge-dot"></span>Menunggu Verifikasi Bendahara</span>`;
    } else if (isApproved) {
      statusBadgeHTML = `<span class="badge badge-paid"><span class="badge-dot"></span>Disetujui & Terverifikasi Sah</span>`;
    } else {
      statusBadgeHTML = `<span class="badge badge-unpaid"><span class="badge-dot"></span>Ditolak</span>`;
    }

    title.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <span>📄 Bukti Struk Transfer & M-Banking</span>
        ${statusBadgeHTML}
      </div>
    `;

    body.innerHTML = `
      <div class="transfer-proof-grid">
        <!-- Kolom Kiri: Authentic BSI Mobile Digital Slip -->
        <div class="bsi-receipt-card" id="bsi-slip-printable">
          <div class="bsi-receipt-header">
            <div class="bsi-header-top">
              <div class="bsi-logo-badge">
                <span class="bsi-logo-icon">BSI</span>
                <span>BSI Mobile</span>
              </div>
              <span class="bsi-channel-tag">M-Banking Transfer</span>
            </div>
            
            <div class="bsi-status-circle">✓</div>
            <h3 class="bsi-status-title">TRANSFER BERHASIL</h3>
            <p class="bsi-status-time">${trxDateFormatted} WIB</p>
          </div>

          <div class="bsi-tear-border"></div>

          <div class="bsi-receipt-body">
            <div class="bsi-amount-box">
              <div class="bsi-amount-label">Jumlah Pembayaran</div>
              <div class="bsi-amount-value">${formatRupiah(amount)}</div>
            </div>

            <div class="bsi-detail-list">
              <div class="bsi-detail-item">
                <span class="bsi-item-label">No. Referensi</span>
                <span class="bsi-item-val highlight" style="font-family: var(--font-mono);">${refCode}</span>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Pengirim</span>
                <div class="bsi-item-val">
                  <div style="font-weight: 700;">${senderAccName.toUpperCase()}</div>
                  <div style="font-size: 0.74rem; color: #64748b;">${senderBank} (${senderAccNum})</div>
                </div>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Penerima</span>
                <div class="bsi-item-val">
                  <div style="font-weight: 700; color: #00827d;">${destAccName}</div>
                  <div style="font-size: 0.74rem; color: #64748b;">${destBankName}</div>
                  <div style="font-size: 0.74rem; font-family: var(--font-mono); font-weight: 700; color: #1e293b;">Rek: ${destAccNum}</div>
                </div>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Tipe Transaksi</span>
                <span class="bsi-item-val">Pemindahbukuan / Transfer Online BSI</span>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Biaya Administrasi</span>
                <span class="bsi-item-val" style="color: #15803d; font-weight: 700;">Rp 0 (Bebas Biaya)</span>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Total Transaksi</span>
                <span class="bsi-item-val highlight" style="font-size: 0.95rem;">${formatRupiah(amount)}</span>
              </div>

              <div class="bsi-detail-item">
                <span class="bsi-item-label">Berita / Catatan</span>
                <span class="bsi-item-val" style="font-size: 0.76rem; color: #475569; font-style: italic;">
                  ${verif?.notes || `Bayar ${paymentTypeDesc} - ${student.name} (${student.nim})`}
                </span>
              </div>
            </div>
          </div>

          <div class="bsi-receipt-footer">
            <span>🔒</span>
            <span>Struk transaksi resmi tersinkronisasi sistem perbankan Bank Syariah Indonesia</span>
          </div>
        </div>

        <!-- Kolom Kanan: Pratinjau Foto Asli & Data Mahasiswa -->
        <div class="transfer-proof-sidebar">
          <!-- Dokumen Foto Unggahan -->
          ${rawImageUrl ? `
            <div class="proof-photo-card">
              <div class="proof-photo-header">
                <span>📷 Foto Struk yang Diunggah Mahasiswa</span>
                <span style="font-size: 0.72rem; color: #94a3b8;">Klik gambar untuk zoom</span>
              </div>
              <div class="proof-photo-preview-wrap">
                <img src="${rawImageUrl}" alt="Bukti Transfer Mahasiswa" class="proof-photo-img" id="img-proof-zoom" title="Klik untuk memperbesar gambar">
              </div>
              <div class="proof-photo-actions">
                <button class="btn btn-outline btn-sm" id="btn-toggle-zoom" style="color: #ffffff; border-color: #475569; background: #1e293b;">
                  🔍 Toggle Zoom
                </button>
                <a href="${rawImageUrl}" target="_blank" download="Bukti-Transfer-${student.nim}.jpg" class="btn btn-outline btn-sm" style="color: #ffffff; border-color: #475569; background: #1e293b;">
                  ⬇️ Unduh Gambar
                </a>
              </div>
            </div>
          ` : `
            <div class="proof-no-photo-card">
              <div style="font-size: 2rem; margin-bottom: 8px;">📱</div>
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #334155; margin: 0 0 4px;">Transfer Elektronik M-Banking</h4>
              <p style="font-size: 0.76rem; margin: 0; line-height: 1.4;">
                Transaksi ini diproses via transfer rekening BSI. Rincian data mutasi telah terekam secara otomatis pada struk digital di samping.
              </p>
            </div>
          `}

          <!-- Informasi Akademik & Verifikasi -->
          <div class="proof-context-card">
            <div class="proof-context-header">
              <span>👤</span>
              <span>Data Mahasiswa & Tagihan</span>
            </div>

            <div class="proof-context-row">
              <span style="color: #64748b;">Nama Lengkap</span>
              <span style="font-weight: 700; color: #1e293b;">${student.name}</span>
            </div>

            <div class="proof-context-row">
              <span style="color: #64748b;">NIM</span>
              <span style="font-family: var(--font-mono); font-weight: 700;">${student.nim}</span>
            </div>

            <div class="proof-context-row">
              <span style="color: #64748b;">Program Studi</span>
              <span style="font-weight: 600;">${student.prodi === 'BKPI' ? 'BKPI' : 'PIAUD'} (Sem ${student.semester})</span>
            </div>

            <div class="proof-context-row">
              <span style="color: #64748b;">No. Tagihan</span>
              <span style="font-family: var(--font-mono);">${invoice?.id || verif?.invoiceId || '-'}</span>
            </div>

            <div class="proof-context-row">
              <span style="color: #64748b;">Status Tagihan</span>
              <span>${invoice?.status || (isApproved ? 'LUNAS' : 'MENUNGGU VERIFIKASI')}</span>
            </div>

            ${verif?.receiptNumber ? `
              <div class="proof-context-row">
                <span style="color: #64748b;">No. Kwitansi Sah</span>
                <span style="color: #00827d; font-weight: 800; font-family: var(--font-mono);">${verif.receiptNumber}</span>
              </div>
            ` : ''}

            ${verif?.verifiedBy ? `
              <div class="proof-context-row">
                <span style="color: #64748b;">Diverifikasi Oleh</span>
                <span>${verif.verifiedBy}</span>
              </div>
            ` : ''}

            ${verif?.rejectedReason ? `
              <div class="proof-context-row" style="background: #fef2f2; padding: 6px; border-radius: 4px; margin-top: 4px;">
                <span style="color: #b91c1c; font-weight: 600;">Alasan Tolak</span>
                <span style="color: #b91c1c;">${verif.rejectedReason}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Footer Action Buttons
    let footerBtnsHTML = '';

    if (isPending && verif) {
      footerBtnsHTML = `
        <button class="btn btn-danger btn-sm" id="btn-modal-reject-proof">
          ✕ Tolak Bukti
        </button>
        <button class="btn btn-success btn-sm" id="btn-modal-approve-proof" style="background: #059669; border-color: #047857;">
          ✓ Setujui Pembayaran & Terbitkan Kwitansi
        </button>
        <button class="btn btn-outline btn-sm" id="btn-modal-close-proof">
          Tutup
        </button>
      `;
    } else if (invoice || verif?.invoiceId) {
      footerBtnsHTML = `
        <button class="btn btn-outline btn-sm" id="btn-modal-print-bsi">
          🖨️ Cetak Struk Transfer
        </button>
        <button class="btn btn-primary btn-sm" id="btn-modal-open-kwitansi">
          🧾 Buka Kwitansi Sah STIT-IF
        </button>
        <button class="btn btn-outline btn-sm" id="btn-modal-close-proof">
          Tutup
        </button>
      `;
    } else {
      footerBtnsHTML = `
        <button class="btn btn-outline btn-sm" id="btn-modal-print-bsi">
          🖨️ Cetak Struk Transfer
        </button>
        <button class="btn btn-primary btn-sm" id="btn-modal-close-proof">
          Tutup
        </button>
      `;
    }

    footer.innerHTML = footerBtnsHTML;
    overlay.classList.add('active');

    // Attach Interactive Event Listeners inside modal
    const closeBtn = footer.querySelector('#btn-modal-close-proof');
    if (closeBtn) closeBtn.addEventListener('click', () => ModalManager.closeModal());

    // Zoom toggle on image
    const imgZoom = body.querySelector('#img-proof-zoom');
    const toggleZoomBtn = body.querySelector('#btn-toggle-zoom');
    if (imgZoom) {
      const toggleZoom = () => imgZoom.classList.toggle('zoomed');
      imgZoom.addEventListener('click', toggleZoom);
      if (toggleZoomBtn) toggleZoomBtn.addEventListener('click', toggleZoom);
    }

    // Print BSI receipt
    const printBtn = footer.querySelector('#btn-modal-print-bsi');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        const slipEl = body.querySelector('#bsi-slip-printable');
        if (slipEl && window.printReceiptElement) {
          window.printReceiptElement(slipEl);
        } else {
          window.print();
        }
      });
    }

    // Open Kwitansi
    const kwitansiBtn = footer.querySelector('#btn-modal-open-kwitansi');
    if (kwitansiBtn) {
      kwitansiBtn.addEventListener('click', () => {
        ModalManager.closeModal();
        const targetInvId = invoice?.id || verif?.invoiceId;
        if (targetInvId) ModalManager.openReceiptModal(targetInvId);
      });
    }

    // Approve from modal
    const approveBtn = footer.querySelector('#btn-modal-approve-proof');
    if (approveBtn && verif) {
      approveBtn.addEventListener('click', () => {
        const confirmApprove = confirm(`Setujui pembayaran transfer untuk ${student.name} sebesar ${formatRupiah(amount)}?\n\nKwitansi resmi STIT Ihsanul Fikri akan langsung diterbitkan.`);
        if (confirmApprove) {
          const res = BillingEngine.approveManualPayment(verif.id, 'Bukti transfer valid dan sesuai dengan mutasi rekening BSI STIT-IF.');
          if (res.success) {
            ModalManager.closeModal();
            if (window.simpelToast) {
              window.simpelToast.show(
                'Verifikasi Disetujui',
                `Pembayaran ${student.name} disetujui. Kwitansi: ${res.receiptNumber}`,
                'success'
              );
            }
            if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
            ModalManager.openReceiptModal(res.invoice.id);
          }
        }
      });
    }

    // Reject from modal
    const rejectBtn = footer.querySelector('#btn-modal-reject-proof');
    if (rejectBtn && verif) {
      rejectBtn.addEventListener('click', () => {
        const reason = prompt(`Masukkan alasan penolakan bukti transfer untuk ${student.name}:`, 'Nominal transfer tidak sesuai dengan tagihan / mutasi rekening tidak ditemukan');
        if (reason) {
          const res = BillingEngine.rejectManualPayment(verif.id, reason);
          if (res.success) {
            ModalManager.closeModal();
            if (window.simpelToast) {
              window.simpelToast.show(
                'Bukti Ditolak',
                `Bukti transfer ${student.name} telah ditolak.`,
                'warning'
              );
            }
            if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
          }
        }
      });
    }
  }

  static openImagePreviewModal(imageUrl) {
    this.openTransferProofModal(imageUrl);
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
          <textarea class="form-control" id="self-std-address" rows="2" placeholder="Alamat lengkap RT/RW, Desa, Kecamatan, Kabupaten/Kota">${student.address || 'Pabelan, Kec. Mungkid, Kab. Magelang, Jawa Tengah 56512'}</textarea>
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
            <div style="font-size: 0.72rem; opacity: 0.85; margin-top: 3px;">Pabelan, Kec. Mungkid, Magelang</div>
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
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <button class="btn btn-outline" id="btn-open-manage-admins-from-profile" style="color: #1e40af; border-color: #93c5fd; font-weight: 700;">
          👥 Kelola Semua Akun Admin
        </button>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" id="btn-cancel-admin-profile">Batal</button>
          <button class="btn btn-primary" id="btn-save-admin-profile" style="background: #1e40af; font-weight: 800;">
            💾 Simpan Perubahan Profil
          </button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-open-manage-admins-from-profile').addEventListener('click', () => {
      ModalManager.openAdminManagementModal();
    });
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

  /**
   * 10. Master Admin & Staff Management Modal (Multi-Admin)
   */
  static openAdminManagementModal() {
    const state = appState.getState();
    const adminUsers = state.adminUsers || [state.adminProfile];
    const currentAdminId = state.currentUser?.id || state.adminProfile?.id || 'ADM-001';

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-lg');
    card.classList.add('modal-xl');

    title.innerHTML = `👑 Manajemen Akun Admin & Pengelola Kampus`;

    const totalAdmins = adminUsers.length;
    const activeAdmins = adminUsers.filter(a => a.status === 'AKTIF').length;

    function renderAdminList(list) {
      if (list.length === 0) {
        return `
          <div style="text-align: center; padding: 36px 20px; background: #f8fafc; border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">👤</div>
            <div style="font-weight: 700; color: var(--text-dark); font-size: 0.95rem;">Tidak Ada Akun Admin Ditemukan</div>
            <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 4px;">Coba gunakan kata kunci pencarian yang lain atau tambah admin baru.</div>
          </div>
        `;
      }

      return list.map(adm => {
        const isCurrent = adm.id === currentAdminId;
        const isActive = adm.status === 'AKTIF';
        const isSuper = !!adm.isSuperAdmin;

        return `
          <div class="admin-user-card" data-admin-id="${adm.id}" style="background: #ffffff; border: 1px solid ${isCurrent ? '#3b82f6' : 'var(--border-light)'}; border-radius: var(--radius-lg); padding: 16px 20px; transition: all 0.2s; box-shadow: ${isCurrent ? '0 4px 12px rgba(59,130,246,0.12)' : 'var(--shadow-sm)'}; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 14px; min-width: 280px; flex: 1;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: ${isCurrent ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'linear-gradient(135deg, #334155, #64748b)'}; color: #ffffff; font-weight: 900; font-size: 1.15rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                ${adm.avatarText || 'AD'}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">${adm.name}</span>
                  ${isSuper ? '<span class="badge" style="background: #f59e0b; color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 2px 6px;">👑 Super Admin</span>' : ''}
                  ${isCurrent ? '<span class="badge" style="background: #22c55e; color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 2px 6px;">⭐ Sesi Aktif</span>' : ''}
                  <span class="badge" style="background: ${isActive ? '#ecfdf5; color: #047857; border: 1px solid #a7f3d0;' : '#fef2f2; color: #b91c1c; border: 1px solid #fecaca;'} font-size: 0.68rem; font-weight: 700; padding: 2px 6px;">
                    ${isActive ? '🟢 Aktif' : '⚪ Non-Aktif'}
                  </span>
                </div>
                <div style="font-size: 0.78rem; color: var(--primary-800); font-weight: 700; margin-top: 2px;">
                  ${adm.title || 'Pengelola SIMPEL-IF'} &bull; <span style="color: var(--text-muted); font-weight: 500;">${adm.department || 'BAU'}</span>
                </div>
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 3px; display: flex; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono);">
                  <span>👤 Username: <strong style="color: var(--text-dark);">${adm.username}</strong></span>
                  <span>🔑 Password: <strong style="color: var(--text-dark);">${adm.password || '••••••'}</strong></span>
                  <span>📧 ${adm.email}</span>
                  <span>📱 ${adm.phone || '-'}</span>
                  ${adm.nip && adm.nip !== '-' ? `<span>🪪 NIP: ${adm.nip}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              ${!isCurrent && isActive ? `
                <button class="btn btn-sm btn-outline btn-switch-admin" data-id="${adm.id}" title="Login / Beralih sebagai Admin ini" style="font-size: 0.76rem; font-weight: 700; color: #1e40af; border-color: #bfdbfe; background: #eff6ff;">
                  🔄 Beralih Sesi
                </button>
              ` : ''}
              <button class="btn btn-sm btn-outline btn-edit-admin" data-id="${adm.id}" title="Edit Data & Password" style="font-size: 0.76rem; font-weight: 700;">
                ✏️ Edit Akun
              </button>
              ${!isSuper && !isCurrent ? `
                <button class="btn btn-sm btn-outline btn-toggle-admin-status" data-id="${adm.id}" title="${isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}" style="font-size: 0.76rem; font-weight: 700; color: ${isActive ? '#b45309' : '#15803d'};">
                  ${isActive ? '⛔ Nonaktifkan' : '✅ Aktifkan'}
                </button>
                <button class="btn btn-sm btn-outline btn-delete-admin" data-id="${adm.id}" title="Hapus Akun Admin" style="font-size: 0.76rem; font-weight: 700; color: #b91c1c; border-color: #fecaca; background: #fff1f2;">
                  🗑️ Hapus
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    body.innerHTML = `
      <!-- Top Overview Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; padding: 14px 18px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="font-size: 0.74rem; font-weight: 700; opacity: 0.85; text-transform: uppercase;">Total Akun Admin</div>
          <div style="font-size: 1.55rem; font-weight: 900; margin-top: 2px;">${totalAdmins} Pengelola</div>
        </div>
        <div style="background: linear-gradient(135deg, #065f46 0%, #059669 100%); color: #ffffff; padding: 14px 18px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="font-size: 0.74rem; font-weight: 700; opacity: 0.85; text-transform: uppercase;">Admin Aktif</div>
          <div style="font-size: 1.55rem; font-weight: 900; margin-top: 2px;">${activeAdmins} Akun</div>
        </div>
        <div style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #ffffff; padding: 14px 18px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <div style="font-size: 0.74rem; font-weight: 700; opacity: 0.85; text-transform: uppercase;">Otoritas & Akses</div>
          <div style="font-size: 1.15rem; font-weight: 900; margin-top: 6px;">Penuh (Keuangan & BAAK)</div>
        </div>
      </div>

      <!-- Action Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div class="search-box-wrapper" style="flex: 1; min-width: 240px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="search-admin-input" placeholder="Cari nama admin, username, jabatan, email...">
        </div>
        <button class="btn btn-primary" id="btn-modal-add-new-admin" style="font-weight: 800; display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px;">
          <span>+</span> Tambah Admin Baru
        </button>
      </div>

      <!-- Admin List Container -->
      <div id="admin-cards-list-container" style="display: flex; flex-direction: column; gap: 12px; max-height: 440px; overflow-y: auto; padding-right: 4px;">
        ${renderAdminList(adminUsers)}
      </div>

      <!-- Security Notice -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 10px 14px; margin-top: 18px; font-size: 0.76rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <span>🛡️</span>
        <span>Setiap penambahan dan modifikasi akun admin diverifikasi secara otomatis serta tercatat dalam Audit Trail SIMPEL-IF.</span>
      </div>
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-size: 0.78rem; color: var(--text-light);">STIT Ihsanul Fikri &bull; Tata Kelola Akun Institusi</span>
        <button class="btn btn-secondary" id="btn-close-admin-mgmt">Tutup</button>
      </div>
    `;

    overlay.classList.add('active');

    function bindAdminListActions() {
      // 1. Switch Active Admin Session
      body.querySelectorAll('.btn-switch-admin').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const res = appState.setActiveAdmin(id);
          if (res.success) {
            window.simpelToast.show('Sesi Berhasil Diganti', res.message, 'success');
            ModalManager.closeModal();
            if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
          } else {
            window.simpelToast.show('Gagal', res.message, 'warning');
          }
        });
      });

      // 2. Edit Admin User
      body.querySelectorAll('.btn-edit-admin').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          ModalManager.openEditAdminModal(id);
        });
      });

      // 3. Toggle Status
      body.querySelectorAll('.btn-toggle-admin-status').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const res = appState.toggleAdminUserStatus(id);
          if (res.success) {
            window.simpelToast.show('Status Diperbarui', res.message, 'info');
            ModalManager.openAdminManagementModal();
          } else {
            window.simpelToast.show('Peringatan', res.message, 'warning');
          }
        });
      });

      // 4. Delete Admin User
      body.querySelectorAll('.btn-delete-admin').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const admin = appState.getState().adminUsers.find(a => a.id === id);
          if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${admin ? admin.name : id}" dari sistem?\n\nAksi ini tidak dapat dibatalkan.`)) {
            const res = appState.deleteAdminUser(id);
            if (res.success) {
              window.simpelToast.show('Admin Dihapus', res.message, 'success');
              ModalManager.openAdminManagementModal();
            } else {
              window.simpelToast.show('Gagal Menghapus', res.message, 'danger');
            }
          }
        });
      });
    }

    bindAdminListActions();

    // Search Filtering
    const searchInput = body.querySelector('#search-admin-input');
    const listContainer = body.querySelector('#admin-cards-list-container');
    if (searchInput && listContainer) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        const filtered = (appState.getState().adminUsers || []).filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q) ||
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.department && a.department.toLowerCase().includes(q)) ||
          (a.email && a.email.toLowerCase().includes(q)) ||
          (a.phone && a.phone.toLowerCase().includes(q)) ||
          (a.nip && a.nip.toLowerCase().includes(q))
        );
        listContainer.innerHTML = renderAdminList(filtered);
        bindAdminListActions();
      });
    }

    // Add New Admin Button
    const btnAddNew = body.querySelector('#btn-modal-add-new-admin');
    if (btnAddNew) {
      btnAddNew.addEventListener('click', () => {
        ModalManager.openAddAdminModal();
      });
    }

    footer.querySelector('#btn-close-admin-mgmt').addEventListener('click', () => ModalManager.closeModal());
  }

  /**
   * 11. Modal Tambah Admin Baru
   */
  static openAddAdminModal() {
    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    title.innerHTML = `➕ Tambah Akun Admin / Pengelola Baru`;

    body.innerHTML = `
      <form id="form-add-new-admin" onsubmit="return false;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 18px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.8rem;">👑</span>
          <div>
            <div style="font-weight: 800; font-size: 0.95rem;">Entri Data Akun Admin Baru</div>
            <div style="font-size: 0.74rem; opacity: 0.9;">Buat akun pengelola untuk staf keuangan, kasir, BAAK, atau pimpinan STIT-IF.</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nama Lengkap & Gelar Pejabat <span class="required">*</span></label>
            <input type="text" class="form-control" id="add-admin-name" required placeholder="Contoh: Ustadz Ahmad Farhan, S.Kom.">
          </div>
          <div class="form-group">
            <label class="form-label">NIP / NIDN / No. Induk Pegawai</label>
            <input type="text" class="form-control" id="add-admin-nip" placeholder="Contoh: 19920101 202001 1 004">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Username Login <span class="required">*</span></label>
            <div style="position: relative;">
              <input type="text" class="form-control" id="add-admin-username" required placeholder="Contoh: farhan.admin" style="padding-left: 32px; font-family: var(--font-mono);">
              <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: var(--text-light);">@</span>
            </div>
            <small style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px; display: block;">Digunakan saat login ke Dashboard Admin (huruf kecil tanpa spasi).</small>
          </div>
          <div class="form-group">
            <label class="form-label">Password Login <span class="required">*</span></label>
            <div style="position: relative;">
              <input type="password" class="form-control" id="add-admin-password" required value="admin123" placeholder="Masukkan password" style="padding-right: 40px;">
              <button type="button" id="btn-toggle-add-admin-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                👁️
              </button>
            </div>
            <small style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px; display: block;">Default awal: <code>admin123</code></small>
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Jabatan Struktural / Peran <span class="required">*</span></label>
            <input type="text" class="form-control" id="add-admin-title" required placeholder="Contoh: Staf Keuangan & Pembayaran" value="Staf Administrasi & Keuangan">
          </div>
          <div class="form-group">
            <label class="form-label">Unit Kerja / Biro</label>
            <input type="text" class="form-control" id="add-admin-dept" placeholder="Biro Keuangan & Administrasi Umum (BAU)" value="Biro Keuangan & Administrasi Umum (BAU)">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Email Resmi Institusi</label>
            <input type="email" class="form-control" id="add-admin-email" placeholder="nama@stit-if.ac.id">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp / HP Aktif</label>
            <input type="text" class="form-control" id="add-admin-phone" placeholder="0813-xxxx-xxxx" value="082342307414">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Inisial Avatar (Opsional, 2 Huruf)</label>
            <input type="text" class="form-control" id="add-admin-avatar" maxlength="2" placeholder="Auto" style="width: 120px; text-transform: uppercase; font-weight: 800; text-align: center;">
          </div>
          <div class="form-group">
            <label class="form-label">Status Akun</label>
            <select class="form-control" id="add-admin-status">
              <option value="AKTIF" selected>🟢 Aktif (Dapat Login)</option>
              <option value="NON_AKTIF">⚪ Non-Aktif (Ditangguhkan)</option>
            </select>
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-add-admin">Batal</button>
      <button class="btn btn-primary" id="btn-save-new-admin" style="background: #1e40af; font-weight: 800;">
        💾 Simpan & Tambahkan Admin
      </button>
    `;

    overlay.classList.add('active');

    // Toggle Password Visibility
    const pwdInput = body.querySelector('#add-admin-password');
    const btnTogglePwd = body.querySelector('#btn-toggle-add-admin-pwd');
    if (pwdInput && btnTogglePwd) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    footer.querySelector('#btn-cancel-add-admin').addEventListener('click', () => {
      ModalManager.openAdminManagementModal();
    });

    footer.querySelector('#btn-save-new-admin').addEventListener('click', () => {
      const name = body.querySelector('#add-admin-name').value.trim();
      const username = body.querySelector('#add-admin-username').value.trim().toLowerCase();
      const password = body.querySelector('#add-admin-password').value.trim();
      const nip = body.querySelector('#add-admin-nip').value.trim();
      const titleText = body.querySelector('#add-admin-title').value.trim();
      const department = body.querySelector('#add-admin-dept').value.trim();
      const email = body.querySelector('#add-admin-email').value.trim();
      const phone = body.querySelector('#add-admin-phone').value.trim();
      const avatarText = body.querySelector('#add-admin-avatar').value.trim().toUpperCase();
      const status = body.querySelector('#add-admin-status').value;

      if (!name) {
        window.simpelToast.show('Peringatan', 'Nama lengkap admin wajib diisi.', 'warning');
        return;
      }
      if (!username) {
        window.simpelToast.show('Peringatan', 'Username login admin wajib diisi.', 'warning');
        return;
      }
      if (!password) {
        window.simpelToast.show('Peringatan', 'Password admin wajib diisi.', 'warning');
        return;
      }

      const res = appState.addAdminUser({
        name,
        username,
        password,
        nip,
        title: titleText,
        department,
        email,
        phone,
        avatarText,
        status
      });

      if (res.success) {
        window.simpelToast.show('Admin Baru Ditambahkan!', res.message, 'success');
        ModalManager.openAdminManagementModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      } else {
        window.simpelToast.show('Gagal Menambahkan Admin', res.message, 'danger');
      }
    });
  }

  /**
   * 12. Modal Edit Akun Admin & Reset Password
   */
  static openEditAdminModal(adminId) {
    const state = appState.getState();
    const admin = (state.adminUsers || []).find(a => a.id === adminId) || state.adminProfile;
    if (!admin) {
      window.simpelToast.show('Error', 'Data admin tidak ditemukan.', 'danger');
      return;
    }

    const { overlay, card, title, body, footer } = this.getModalElements();
    card.classList.remove('modal-xl');
    card.classList.add('modal-lg');

    const isSuper = !!admin.isSuperAdmin;

    title.innerHTML = `✏️ Edit Akun Admin — ${admin.name}`;

    body.innerHTML = `
      <form id="form-edit-admin" onsubmit="return false;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #ffffff; color: #1e40af; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center;">
              ${admin.avatarText || 'AD'}
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem;">${admin.name}</div>
              <div style="font-size: 0.74rem; opacity: 0.9;">ID: ${admin.id} &bull; @${admin.username}</div>
            </div>
          </div>
          ${isSuper ? '<span class="badge" style="background: #f59e0b; color: #fff; font-weight: 800;">👑 Super Admin Utama</span>' : ''}
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nama Lengkap & Gelar <span class="required">*</span></label>
            <input type="text" class="form-control" id="edit-admin-name" value="${admin.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label">NIP / NIDN / No. Induk Pegawai</label>
            <input type="text" class="form-control" id="edit-admin-nip" value="${admin.nip || ''}">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Username Login <span class="required">*</span></label>
            <div style="position: relative;">
              <input type="text" class="form-control" id="edit-admin-username" value="${admin.username}" required style="padding-left: 32px; font-family: var(--font-mono);">
              <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: var(--text-light);">@</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Password Login <span class="required">*</span></label>
            <div style="position: relative;">
              <input type="password" class="form-control" id="edit-admin-password" value="${admin.password || 'admin123'}" required style="padding-right: 40px;">
              <button type="button" id="btn-toggle-edit-admin-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                👁️
              </button>
            </div>
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Jabatan Struktural / Peran <span class="required">*</span></label>
            <input type="text" class="form-control" id="edit-admin-title" value="${admin.title || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Unit Kerja / Biro</label>
            <input type="text" class="form-control" id="edit-admin-dept" value="${admin.department || ''}">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Email Resmi Institusi</label>
            <input type="email" class="form-control" id="edit-admin-email" value="${admin.email || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor WhatsApp / HP</label>
            <input type="text" class="form-control" id="edit-admin-phone" value="${admin.phone || ''}">
          </div>
        </div>

        <div class="form-grid" style="margin-top: 10px;">
          <div class="form-group">
            <label class="form-label">Inisial Avatar (Maks. 2 Huruf)</label>
            <input type="text" class="form-control" id="edit-admin-avatar" value="${admin.avatarText || ''}" maxlength="2" style="width: 120px; text-transform: uppercase; font-weight: 800; text-align: center;">
          </div>
          <div class="form-group">
            <label class="form-label">Status Akun</label>
            <select class="form-control" id="edit-admin-status" ${isSuper ? 'disabled' : ''}>
              <option value="AKTIF" ${admin.status === 'AKTIF' ? 'selected' : ''}>🟢 Aktif (Dapat Login)</option>
              <option value="NON_AKTIF" ${admin.status === 'NON_AKTIF' ? 'selected' : ''}>⚪ Non-Aktif (Ditangguhkan)</option>
            </select>
            ${isSuper ? '<small style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px; display: block;">Status Super Admin selalu aktif.</small>' : ''}
          </div>
        </div>
      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-cancel-edit-admin">Batal</button>
      <button class="btn btn-primary" id="btn-save-edit-admin" style="background: #1e40af; font-weight: 800;">
        💾 Simpan Perubahan
      </button>
    `;

    overlay.classList.add('active');

    // Toggle Password Visibility
    const pwdInput = body.querySelector('#edit-admin-password');
    const btnTogglePwd = body.querySelector('#btn-toggle-edit-admin-pwd');
    if (pwdInput && btnTogglePwd) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    footer.querySelector('#btn-cancel-edit-admin').addEventListener('click', () => {
      ModalManager.openAdminManagementModal();
    });

    footer.querySelector('#btn-save-edit-admin').addEventListener('click', () => {
      const name = body.querySelector('#edit-admin-name').value.trim();
      const username = body.querySelector('#edit-admin-username').value.trim().toLowerCase();
      const password = body.querySelector('#edit-admin-password').value.trim();
      const nip = body.querySelector('#edit-admin-nip').value.trim();
      const titleText = body.querySelector('#edit-admin-title').value.trim();
      const department = body.querySelector('#edit-admin-dept').value.trim();
      const email = body.querySelector('#edit-admin-email').value.trim();
      const phone = body.querySelector('#edit-admin-phone').value.trim();
      const avatarText = body.querySelector('#edit-admin-avatar').value.trim().toUpperCase();
      const status = body.querySelector('#edit-admin-status').value;

      if (!name) {
        window.simpelToast.show('Peringatan', 'Nama lengkap admin wajib diisi.', 'warning');
        return;
      }
      if (!username) {
        window.simpelToast.show('Peringatan', 'Username login admin wajib diisi.', 'warning');
        return;
      }
      if (!password) {
        window.simpelToast.show('Peringatan', 'Password admin wajib diisi.', 'warning');
        return;
      }

      const res = appState.updateAdminUser(admin.id, {
        name,
        username,
        password,
        nip,
        title: titleText,
        department,
        email,
        phone,
        avatarText,
        status
      });

      if (res.success) {
        window.simpelToast.show('Data Admin Diperbarui!', res.message, 'success');
        ModalManager.openAdminManagementModal();
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
      } else {
        window.simpelToast.show('Gagal Memperbarui Admin', res.message, 'danger');
      }
    });
  }

  /**
   * Modal Registrasi Mandiri Mahasiswa Baru / Buat Akun Mandiri
   */
  static openStudentRegistrationModal(prefillData = {}) {
    const state = appState.getState();
    const { overlay, card, title, body, footer } = this.getModalElements();
    if (!overlay) return;

    const scholarshipSchemes = state.scholarshipSchemes || [];

    // Helper to generate a unique recommended NIM
    function generateRecommendedNim(prodi, angkatan = '2026') {
      const prodiCode = prodi === 'PIAUD' ? '86209' : '86208';
      const existingInProdi = state.students.filter(s => s.nim.startsWith(angkatan + prodiCode));
      const nextSeq = existingInProdi.length + 1;
      return `${angkatan}${prodiCode}${String(nextSeq).padStart(3, '0')}`;
    }

    const defaultProdi = prefillData.prodi || 'BKPI';
    const defaultNim = prefillData.nim || generateRecommendedNim(defaultProdi, '2026');

    title.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.3rem;">🎓</span>
        <span class="gradient-text-primary" style="font-weight: 900;">Registrasi Akun Mahasiswa Baru SIMPEL-IF</span>
      </div>
    `;

    body.innerHTML = `
      <div style="max-height: 72vh; overflow-y: auto; padding-right: 4px;">
        
        <!-- Welcome VIP Header Card -->
        <div class="vip-register-card" style="padding: 16px 20px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);">
              ✨
            </div>
            <div>
              <div style="font-size: 0.92rem; font-weight: 900; color: #1e3a8a;">
                Formulir Pendaftaran Akun Mahasiswa Mandiri
              </div>
              <div style="font-size: 0.76rem; color: #1e40af; margin-top: 2px;">
                Institut STIT Ihsanul Fikri Pabelan Magelang &bull; T.A. ${state.activeSemester || '2026/2027 Ganjil'}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 4px 12px; font-size: 0.72rem; font-weight: 800; color: #1e40af; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <span class="pulsing-dot pulsing-dot-green"></span>
            <span>Akun Langsung Aktif</span>
          </div>
        </div>

        <form id="form-register-student">
          
          <!-- Stepper 1: Data Identitas Mahasiswa -->
          <div style="background: #f8fafc; padding: 8px 14px; border-radius: var(--radius-lg); border-left: 4px solid #2563eb; font-size: 0.82rem; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>👤</span> <span>Langkah 1: Biodata & Program Studi</span>
            </div>
            <span style="font-size: 0.70rem; color: #64748b; font-weight: 700; text-transform: none;">Tahap 1 dari 3</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-student-name" style="font-weight: 700;">Nama Lengkap Mahasiswa <span class="required">*</span></label>
            <input type="text" class="form-control" id="reg-student-name" required placeholder="Contoh: Muhammad Hanif Pratama" value="${prefillData.name || ''}" style="font-size: 0.95rem; border-radius: var(--radius-md);">
            <span class="input-help-text">Nama lengkap sesuai ijazah terakhir / identitas KTP</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="reg-student-gender" style="font-weight: 700;">Jenis Kelamin <span class="required">*</span></label>
              <select class="form-control" id="reg-student-gender" required style="border-radius: var(--radius-md);">
                <option value="L" ${prefillData.gender === 'L' ? 'selected' : ''}>Laki-laki (Ikhwan)</option>
                <option value="P" ${prefillData.gender === 'P' ? 'selected' : ''}>Perempuan (Akhwat)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-student-prodi" style="font-weight: 700;">Program Studi (Prodi) <span class="required">*</span></label>
              <select class="form-control" id="reg-student-prodi" required style="border-radius: var(--radius-md); font-weight: 700;">
                <option value="BKPI" ${defaultProdi === 'BKPI' ? 'selected' : ''}>S1 - Bimbingan & Konseling Pend. Islam (BKPI)</option>
                <option value="PIAUD" ${defaultProdi === 'PIAUD' ? 'selected' : ''}>S1 - Pend. Islam Anak Usia Dini (PIAUD)</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="reg-student-angkatan" style="font-weight: 700;">Tahun Angkatan <span class="required">*</span></label>
              <select class="form-control" id="reg-student-angkatan" required style="border-radius: var(--radius-md);">
                <option value="2026" selected>2026 (Mahasiswa Baru)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-student-semester" style="font-weight: 700;">Semester Masuk <span class="required">*</span></label>
              <select class="form-control" id="reg-student-semester" required style="border-radius: var(--radius-md);">
                <option value="1" selected>Semester 1 (Maba Gasal)</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          <!-- Stepper 2: Skema Beasiswa & Jalur Masuk -->
          <div style="background: #f8fafc; padding: 8px 14px; border-radius: var(--radius-lg); border-left: 4px solid #059669; font-size: 0.82rem; font-weight: 800; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>🏅</span> <span>Langkah 2: Jalur Beasiswa & Afirmasi</span>
            </div>
            <span style="font-size: 0.70rem; color: #64748b; font-weight: 700; text-transform: none;">Tahap 2 dari 3</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-student-scholarship" style="font-weight: 700;">Pilihan Jalur Masuk / Skema Biaya <span class="required">*</span></label>
            <select class="form-control" id="reg-student-scholarship" required style="font-weight: 700; border-radius: var(--radius-md);">
              ${scholarshipSchemes.map(sch => `
                <option value="${sch.id}" ${sch.id === 'REGULER' ? 'selected' : ''}>
                  ${sch.name} ${sch.discountValue > 0 ? `(Diskon SPP ${sch.discountValue}${sch.discountType === 'PERCENT' ? '%' : ' Rupiah'})` : '(Biaya Normal Tanpa Beasiswa)'}
                </option>
              `).join('')}
            </select>
            <span class="input-help-text">Pilih skema beasiswa jika Anda santri asrama tahfidz, mitra lembaga, atau penerima beasiswa khusus.</span>
          </div>

          <!-- Stepper 3: Kredensial Login & Kontak -->
          <div style="background: #f8fafc; padding: 8px 14px; border-radius: var(--radius-lg); border-left: 4px solid #7c3aed; font-size: 0.82rem; font-weight: 800; color: #5b21b6; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>🔐</span> <span>Langkah 3: NIM & Kredensial Login</span>
            </div>
            <span style="font-size: 0.70rem; color: #64748b; font-weight: 700; text-transform: none;">Tahap 3 dari 3</span>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="reg-student-nim" style="margin: 0; font-weight: 700;">Nomor Induk Mahasiswa (NIM) <span class="required">*</span></label>
              <button type="button" id="btn-generate-nim" class="btn btn-outline btn-sm btn-shimmer" style="padding: 3px 10px; font-size: 0.72rem; font-weight: 800; color: #2563eb; border-color: #93c5fd; background: #eff6ff; border-radius: var(--radius-md);">
                🎲 Generate NIM Otomatis
              </button>
            </div>
            <input type="text" class="form-control" id="reg-student-nim" required placeholder="Contoh: 202686208013" value="${defaultNim}" style="font-family: var(--font-mono); font-size: 0.95rem; border-radius: var(--radius-md);">
            <span class="input-help-text">Gunakan NIM resmi STIT-IF atau klik tombol generate di atas.</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="reg-student-username" style="font-weight: 700;">Username Login <span class="required">*</span></label>
              <input type="text" class="form-control" id="reg-student-username" required placeholder="Username akun..." value="${defaultNim}" style="font-family: var(--font-mono); border-radius: var(--radius-md);">
              <span class="input-help-text">Dapat menggunakan NIM atau nama panggilan unik</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-student-phone" style="font-weight: 700;">No. WhatsApp / HP</label>
              <input type="text" class="form-control" id="reg-student-phone" placeholder="Contoh: 082342307414" value="${prefillData.phone || ''}" style="border-radius: var(--radius-md);">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-student-email" style="font-weight: 700;">Alamat Email</label>
            <input type="email" class="form-control" id="reg-student-email" placeholder="Contoh: nama@mahasiswa.stitihsanulfikri.ac.id" value="${prefillData.email || ''}" style="border-radius: var(--radius-md);">
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="reg-student-password" style="font-weight: 700;">PIN / Password Baru <span class="required">*</span></label>
              <div style="position: relative;">
                <input type="password" class="form-control" id="reg-student-password" required placeholder="Minimal 6 karakter" value="123456" style="padding-right: 40px; border-radius: var(--radius-md);">
                <button type="button" id="btn-toggle-reg-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                  👁️
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-student-pwd-confirm" style="font-weight: 700;">Konfirmasi Password <span class="required">*</span></label>
              <input type="password" class="form-control" id="reg-student-pwd-confirm" required placeholder="Ulangi password" value="123456" style="border-radius: var(--radius-md);">
            </div>
          </div>

        </form>

      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="window.simpelModals.closeModal()" style="font-weight: 700;">Batal</button>
      <button class="btn btn-primary btn-shimmer" id="btn-submit-register" style="font-weight: 900; background: linear-gradient(135deg, #1e40af, #2563eb); border: none; display: inline-flex; align-items: center; gap: 6px; padding: 10px 22px; border-radius: var(--radius-lg); box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
        <span>🚀</span> <span>Daftar & Masuk Sekarang</span>
      </button>
    `;

    // Auto-select PAUD_LAKI when gender L and prodi PIAUD
    function checkAutoScholarshipTag() {
      const gender = body.querySelector('#reg-student-gender').value;
      const prodi = body.querySelector('#reg-student-prodi').value;
      const schSel = body.querySelector('#reg-student-scholarship');
      if (gender === 'L' && prodi === 'PIAUD') {
        const paudLaki = scholarshipSchemes.find(s => s.id === 'PAUD_LAKI');
        if (paudLaki && schSel) {
          schSel.value = 'PAUD_LAKI';
        }
      }
    }

    body.querySelector('#reg-student-gender').addEventListener('change', () => {
      checkAutoScholarshipTag();
    });

    // Auto update recommended NIM on prodi change
    body.querySelector('#reg-student-prodi').addEventListener('change', (e) => {
      const nimInput = body.querySelector('#reg-student-nim');
      const angkatan = body.querySelector('#reg-student-angkatan').value;
      if (nimInput && nimInput.value.startsWith(angkatan)) {
        nimInput.value = generateRecommendedNim(e.target.value, angkatan);
        const userInput = body.querySelector('#reg-student-username');
        if (userInput && userInput.value === nimInput.defaultValue) {
          userInput.value = nimInput.value;
        }
      }
      checkAutoScholarshipTag();
    });

    // Generate NIM button
    const btnGenNim = body.querySelector('#btn-generate-nim');
    if (btnGenNim) {
      btnGenNim.addEventListener('click', () => {
        const prodi = body.querySelector('#reg-student-prodi').value;
        const angkatan = body.querySelector('#reg-student-angkatan').value;
        const newNim = generateRecommendedNim(prodi, angkatan);
        body.querySelector('#reg-student-nim').value = newNim;
        body.querySelector('#reg-student-username').value = newNim;
        window.simpelToast.show('NIM Digenerate', `NIM format resmi: ${newNim}`, 'info');
      });
    }

    // Toggle Password Visibility
    const btnTogglePwd = body.querySelector('#btn-toggle-reg-pwd');
    const pwdInput = body.querySelector('#reg-student-password');
    if (btnTogglePwd && pwdInput) {
      btnTogglePwd.addEventListener('click', () => {
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        btnTogglePwd.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    // Sync NIM to Username if user hasn't modified it
    const nimInput = body.querySelector('#reg-student-nim');
    const usernameInput = body.querySelector('#reg-student-username');
    if (nimInput && usernameInput) {
      nimInput.addEventListener('input', (e) => {
        if (!usernameInput.getAttribute('data-customized')) {
          usernameInput.value = e.target.value.trim();
        }
      });
      usernameInput.addEventListener('input', () => {
        usernameInput.setAttribute('data-customized', 'true');
      });
    }



    // Submit handler
    const btnSubmit = footer.querySelector('#btn-submit-register');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        const name = body.querySelector('#reg-student-name').value.trim();
        const gender = body.querySelector('#reg-student-gender').value;
        const prodi = body.querySelector('#reg-student-prodi').value;
        const angkatan = body.querySelector('#reg-student-angkatan').value;
        const semester = body.querySelector('#reg-student-semester').value;
        const scholarshipId = body.querySelector('#reg-student-scholarship').value;
        const nim = body.querySelector('#reg-student-nim').value.trim();
        const username = body.querySelector('#reg-student-username').value.trim();
        const phone = body.querySelector('#reg-student-phone').value.trim();
        const email = body.querySelector('#reg-student-email').value.trim();
        const password = body.querySelector('#reg-student-password').value;
        const pwdConfirm = body.querySelector('#reg-student-pwd-confirm').value;

        if (!name) {
          window.simpelToast.show('Validasi Gagal', 'Nama lengkap mahasiswa wajib diisi.', 'warning');
          return;
        }
        if (!nim) {
          window.simpelToast.show('Validasi Gagal', 'NIM wajib diisi.', 'warning');
          return;
        }
        if (!username) {
          window.simpelToast.show('Validasi Gagal', 'Username akun wajib diisi.', 'warning');
          return;
        }
        if (!password || password.length < 4) {
          window.simpelToast.show('Validasi Gagal', 'Password minimal 4 karakter.', 'warning');
          return;
        }
        if (password !== pwdConfirm) {
          window.simpelToast.show('Validasi Gagal', 'Konfirmasi password tidak cocok dengan password baru.', 'danger');
          return;
        }

        const res = appState.registerStudent({
          name,
          gender,
          prodi,
          angkatan,
          semester,
          scholarshipId,
          nim,
          username,
          phone,
          email,
          password
        });

        if (res.success) {
          window.simpelModals.closeModal();
          
          // Switch active role immediately to the new student and navigate to student portal
          appState.setRole('MAHASISWA', res.student.nim);
          if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
          
          window.simpelToast.show('Pendaftaran Berhasil! 🎉', `Selamat datang, ${res.student.name}! Anda telah masuk ke portal mahasiswa SIMPEL-IF.`, 'success', 6000);
        } else {
          window.simpelToast.show('Pendaftaran Gagal', res.message, 'danger');
        }
      });
    }

    overlay.classList.add('active');
  }
}

export const openReceiptModal = (invoiceId) => ModalManager.openReceiptModal(invoiceId);
export const openStudentDetailModal = (nim) => ModalManager.openStudentDetailModal(nim);
export const openCustomPaymentModal = (data) => ModalManager.openCustomPaymentModal(data);
export const openStudentRegistrationModal = () => ModalManager.openStudentRegistrationModal();
export const openAdminManagementModal = () => ModalManager.openAdminManagementModal();
export const openStudentSelfProfileModal = (nim) => ModalManager.openStudentSelfProfileModal(nim);
export const openAdminSelfProfileModal = () => ModalManager.openAdminSelfProfileModal();
export const openNewInvoiceModal = (nim) => ModalManager.openNewInvoiceModal(nim);
export const openTransferProofModal = (id) => ModalManager.openTransferProofModal(id);
export const openImagePreviewModal = (urlOrId) => ModalManager.openTransferProofModal(urlOrId);
