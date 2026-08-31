/**
 * SIMPEL-IF Portal Mahasiswa View (Ultra User-Friendly)
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

  // Calculate total saved from scholarship across history
  const totalSaved = studentInvoices.reduce((acc, inv) => acc + (inv.totalDiscount || 0), 0);

  // Status helper flags
  const isLunas = currentInvoice && currentInvoice.status === STATUS_TAGIHAN.LUNAS;
  const isPending = currentInvoice && currentInvoice.status === STATUS_TAGIHAN.MENUNGGU_VERIFIKASI;

  container.innerHTML = `
    <!-- Top Bar: Account Switcher & Quick Actions -->
    <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.3rem;">👨‍🎓</span>
        <div>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-light); text-transform: uppercase;">Akun Mahasiswa Aktif:</span>
          <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark);">${currentStudent.name} &bull; <span style="font-family: var(--font-mono); color: var(--primary-700);">${currentStudent.nim}</span></div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 0.76rem; color: var(--text-muted);">Ganti Mahasiswa:</span>
          <select class="filter-select" id="select-active-student" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-md);">
            ${state.students.map(s => {
              const sch = state.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
              return `<option value="${s.nim}" ${s.nim === currentStudent.nim ? 'selected' : ''}>
                ${s.name} (${s.prodi} - Sem ${s.semester} | ${sch ? sch.name.split('(')[0] : 'Reguler'})
              </option>`;
            }).join('')}
          </select>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-goto-login-view" style="color: var(--primary-700); font-weight: 700;">
          🔑 Halaman Login
        </button>
        <button class="btn btn-outline btn-sm" id="btn-student-logout" style="border-color: #fca5a5; color: #b91c1c; background: #fff1f2; font-weight: 700;">
          🚪 Keluar / Logout
        </button>
      </div>
    </div>

    <!-- 1. Warm Islamic Welcome Hero Banner -->
    <div class="student-welcome-hero">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 68px; height: 68px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.18); border: 2.5px solid rgba(255, 255, 255, 0.4); display: flex; align-items: center; justify-content: center; font-size: 1.7rem; font-weight: 900; box-shadow: var(--shadow-sm); flex-shrink: 0;">
            ${currentStudent.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #93c5fd; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;">
              Assalamu'alaikum Warahmatullahi Wabarakatuh
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.3px;">
              ${currentStudent.name}
            </h2>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #e2e8f0; margin-top: 6px; flex-wrap: wrap;">
              <span style="background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);">NIM: ${currentStudent.nim}</span>
              <span>&bull;</span>
              <span>Prodi: <strong>${currentStudent.prodi === 'BKPI' ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' : 'Pendidikan Islam Anak Usia Dini (PIAUD)'}</strong></span>
              <span>&bull;</span>
              <span>Semester: <strong>${currentStudent.semester}</strong> (${currentStudent.statusAkademik})</span>
            </div>
          </div>
        </div>

        <div style="text-align: right; background: rgba(255, 255, 255, 0.12); padding: 14px 20px; border-radius: var(--radius-xl); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px);">
          <div style="font-size: 0.72rem; color: #93c5fd; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Skema Pembiayaan Mahasiswa</div>
          <div style="font-size: 1.05rem; font-weight: 900; color: #ffffff; margin-top: 3px;">
            ${scholarship.name}
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; margin-top: 3px;">
            ${scholarship.id === 'REGULER' ? 'Pembayaran Penuh Mandiri' : `Mendapat Subsidi: ${scholarship.discountType === 'PERCENT' ? scholarship.discountValue + '% Biaya SPP' : formatRupiah(scholarship.discountValue)}`}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Quick Summary Stat Cards -->
    <div class="student-summary-grid">
      <!-- Card 1: Status Pembayaran -->
      <div class="student-stat-card">
        <div class="student-stat-icon" style="background: ${isLunas ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2'}; color: ${isLunas ? '#15803d' : isPending ? '#b45309' : '#b91c1c'};">
          ${isLunas ? '✅' : isPending ? '⏳' : '💳'}
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Status Semester ${state.activeSemester}</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin-top: 2px;">
            ${currentInvoice ? getStatusBadge(currentInvoice.status) : '<span class="badge badge-success">Tidak Ada Tagihan</span>'}
          </div>
        </div>
      </div>

      <!-- Card 2: Total Kewajiban Semester Ini -->
      <div class="student-stat-card">
        <div class="student-stat-icon" style="background: #eff6ff; color: #1d4ed8;">
          💰
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Kewajiban Semester ${state.activeSemester}</div>
          <div style="font-size: 1.15rem; font-weight: 900; color: var(--primary-900); font-family: var(--font-mono); margin-top: 2px;">
            ${currentInvoice ? formatRupiah(currentInvoice.netAmount) : 'Rp 0'}
          </div>
        </div>
      </div>

      <!-- Card 3: Total Penghematan Subsidi Beasiswa -->
      <div class="student-stat-card">
        <div class="student-stat-icon" style="background: #f0fdf4; color: #059669;">
          🎁
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Subsidi Beasiswa Hemat</div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #059669; font-family: var(--font-mono); margin-top: 2px;">
            ${currentInvoice && currentInvoice.totalDiscount > 0 ? `-${formatRupiah(currentInvoice.totalDiscount)}` : formatRupiah(0)}
          </div>
        </div>
      </div>

      <!-- Card 4: Dokumen Kwitansi Sah -->
      <div class="student-stat-card">
        <div class="student-stat-icon" style="background: #fdf4ff; color: #a21caf;">
          🧾
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Kwitansi Sah Digital</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin-top: 2px;">
            ${isLunas ? `<span style="color:#059669; font-weight:800; font-family:var(--font-mono);">${currentInvoice.receiptNumber}</span>` : '<span style="color:var(--text-light); font-size:0.78rem;">Tersedia Saat Lunas</span>'}
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Active Invoice & Payment Hub Section -->
    ${currentInvoice ? `
      <div class="card" style="margin-bottom: 28px; box-shadow: var(--shadow-md);">
        
        <!-- Header Tagihan -->
        <div class="card-header" style="flex-wrap: wrap; gap: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 16px;">
          <div class="card-title-group">
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 class="card-title" style="font-size: 1.12rem; font-weight: 800; margin: 0;">📋 Tagihan Kuliah Semester ${state.activeSemester} (Tahun Akademik 2026/2027)</h3>
            </div>
            <p class="card-subtitle" style="margin-top: 4px;">
              Nomor Referensi: <strong style="font-family:var(--font-mono); color:var(--primary-700);">${currentInvoice.id}</strong> &bull; 
              Batas Jatuh Tempo: <strong style="color: #b91c1c;">${formatDate(currentInvoice.dueDate)}</strong>
            </p>
          </div>
          <div>
            ${getStatusBadge(currentInvoice.status)}
          </div>
        </div>

        <!-- Line Item Breakdown Card (Transparansi Rincian Biaya) -->
        <div class="bill-breakdown-card" style="margin-top: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: var(--text-dark); text-transform: uppercase; letter-spacing: 0.5px;">
              📊 Rincian Komponen Biaya & Subsidi Terpasang:
            </div>
            <span class="badge badge-scholarship" style="font-size: 0.72rem;">${scholarship.name}</span>
          </div>

          ${currentInvoice.items.map(item => `
            <div class="bill-line-item">
              <div>
                <strong style="color: var(--text-dark);">${item.name}</strong>
                ${item.discount > 0 ? `<div style="font-size: 0.74rem; color: #0284c7; font-weight: 600; margin-top: 1px;">✨ Potongan Subsidi ${scholarship.name.split('(')[0]}: -${formatRupiah(item.discount)}</div>` : ''}
              </div>
              <div style="text-align: right;">
                ${item.discount > 0 ? `<span style="text-decoration: line-through; color: var(--text-light); font-size: 0.76rem; margin-right: 8px;">${formatRupiah(item.baseAmount)}</span>` : ''}
                <strong style="font-size: 0.95rem; color: var(--text-dark); font-family: var(--font-mono);">${formatRupiah(item.finalAmount)}</strong>
              </div>
            </div>
          `).join('')}

          ${currentInvoice.totalDiscount > 0 ? `
            <div class="bill-line-item discount-item" style="background: linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%); padding: 12px 16px; border-radius: var(--radius-md); margin: 12px 0 6px; border: 1px solid #bfdbfe;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem;">🎁</span>
                <div>
                  <div style="font-weight: 800; color: #1e40af; font-size: 0.84rem;">Total Potongan Beasiswa Diklaim:</div>
                  <div style="font-size: 0.72rem; color: #3b82f6;">Pengurangan langsung dari tarif resmi reguler</div>
                </div>
              </div>
              <div>
                <strong style="font-size: 1.05rem; color: #1e40af; font-family: var(--font-mono); font-weight: 900;">-${formatRupiah(currentInvoice.totalDiscount)}</strong>
              </div>
            </div>
          ` : ''}

          <div class="bill-total-row" style="background: #ffffff; padding: 16px 18px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-top: 12px;">
            <div>
              <span style="font-size: 0.9rem; font-weight: 800; color: var(--text-dark);">Total Kewajiban Bersih yang Harus Dibayar:</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Sudah termasuk seluruh komponen SPP & potongan beasiswa</div>
            </div>
            <span style="font-size: 1.55rem; font-weight: 900; color: var(--primary-900); font-family: var(--font-mono);">${formatRupiah(currentInvoice.netAmount)}</span>
          </div>
        </div>

        <!-- Dynamic Action Card Based on Status -->
        ${isLunas ? `
          <!-- KONDISI 1: SUDAH LUNAS -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1.5px solid #86efac; border-radius: var(--radius-xl); padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-top: 20px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 18px;">
              <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: #22c55e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.35); flex-shrink: 0;">
                ✓
              </div>
              <div>
                <h4 style="font-size: 1.12rem; font-weight: 900; color: #14532d; margin: 0;">Alhamdulillah! Tagihan Semester Ini Telah Lunas</h4>
                <p style="font-size: 0.82rem; color: #166534; margin: 4px 0 0;">Pembayaran Anda telah tervalidasi secara resmi pada sistem pangkalan data STIT Ihsanul Fikri.</p>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; font-size: 0.76rem; color: #15803d; font-family: var(--font-mono); font-weight: 700; flex-wrap: wrap;">
                  <span>No. Kwitansi: <strong>${currentInvoice.receiptNumber}</strong></span>
                  <span>&bull;</span>
                  <span>Waktu Bayar: <strong>${formatDateTime(currentInvoice.paymentDate)}</strong></span>
                </div>
              </div>
            </div>
            <button class="btn btn-primary btn-lg btn-view-my-receipt" data-invoice-id="${currentInvoice.id}" style="background: #15803d; border-color: #166534; font-weight: 800; box-shadow: 0 4px 12px rgba(21, 128, 61, 0.3);">
              🧾 Cetak & Unduh Kwitansi Digital Sah (QR Code)
            </button>
          </div>
        ` : isPending ? `
          <!-- KONDISI 2: MENUNGGU VERIFIKASI -->
          <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fde68a; border-radius: var(--radius-xl); padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-top: 20px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 18px;">
              <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: #f59e0b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.35); flex-shrink: 0;">
                ⏳
              </div>
              <div>
                <h4 style="font-size: 1.12rem; font-weight: 900; color: #78350f; margin: 0;">Bukti Transfer Sedang Diverifikasi oleh Bendahara</h4>
                <p style="font-size: 0.82rem; color: #92400e; margin: 4px 0 0;">Anda telah mengunggah bukti pembayaran manual. Tim keuangan sedang mencocokkan mutasi kas (proses maks 1x24 jam kerja). Kwitansi resmi QR Code akan otomatis terbit setelah disetujui.</p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" id="btn-refresh-portal" style="font-weight: 700; border-color: #f59e0b; color: #b45309; background: #ffffff;">
                🔄 Cek Status Terbaru
              </button>
            </div>
          </div>
        ` : `
          <!-- KONDISI 3: BELUM BAYAR (PILIH METODE PEMBAYARAN) -->
          <div style="margin-top: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 900; color: var(--text-dark); margin: 0;">Pusat Pembayaran Kuliah</h4>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 2px 0 0;">Pilih salah satu metode pembayaran praktis di bawah ini:</p>
              </div>
              <span class="badge badge-warning" style="font-size: 0.74rem;">Batas Bayar: ${formatDate(currentInvoice.dueDate)}</span>
            </div>

            <!-- Tab Tombol Pilihan Metode -->
            <div class="tabs-container" style="margin-bottom: 20px;">
              <button class="tab-nav-btn active" id="tab-btn-va">
                💳 Virtual Account (Otomatis & Bebas Antre)
              </button>
              <button class="tab-nav-btn" id="tab-btn-manual">
                🏦 Transfer Bank Rekening Yayasan (Upload Bukti)
              </button>
            </div>

            <!-- TAB 1: Virtual Account -->
            <div id="tab-content-va">
              
              <!-- Pilihan Bank VA -->
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-dark); text-transform: uppercase; margin-bottom: 10px;">
                1. Pilih Bank Virtual Account:
              </div>
              <div class="payment-method-selector">
                <div class="payment-method-card active" data-bank="BSI">
                  <span style="font-size: 1.5rem;">🌙</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.86rem; color: var(--text-dark);">Bank Syariah Indonesia</div>
                    <div style="font-size: 0.7rem; color: var(--text-light);">BSI Virtual Account</div>
                  </div>
                </div>
                <div class="payment-method-card" data-bank="MUAMALAT">
                  <span style="font-size: 1.5rem;">🕌</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.86rem; color: var(--text-dark);">Bank Muamalat</div>
                    <div style="font-size: 0.7rem; color: var(--text-light);">Muamalat VA</div>
                  </div>
                </div>
                <div class="payment-method-card" data-bank="MANDIRI">
                  <span style="font-size: 1.5rem;">🏛️</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.86rem; color: var(--text-dark);">Bank Mandiri</div>
                    <div style="font-size: 0.7rem; color: var(--text-light);">Mandiri Bill Payment</div>
                  </div>
                </div>
                <div class="payment-method-card" data-bank="BRI">
                  <span style="font-size: 1.5rem;">🏢</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.86rem; color: var(--text-dark);">Bank BRI (BRIVA)</div>
                    <div style="font-size: 0.7rem; color: var(--text-light);">BRI Virtual Account</div>
                  </div>
                </div>
              </div>

              <!-- VA Display Card -->
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-dark); text-transform: uppercase; margin: 16px 0 8px;">
                2. Rincian Pembayaran Virtual Account:
              </div>
              <div class="va-box">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="va-bank-title" id="va-bank-label">Bank Syariah Indonesia (BSI) Virtual Account</div>
                  <span style="background: rgba(255,255,255,0.2); font-size: 0.68rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">REALTIME ONLINE</span>
                </div>
                
                <div class="va-number-display">
                  <span id="va-number-text">${currentInvoice.virtualAccount}</span>
                  <button class="copy-va-btn" id="btn-copy-va" title="Salin Nomor VA">📋 Salin VA</button>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 10px 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                  <div>
                    <div style="font-size: 0.7rem; color: #93c5fd; text-transform: uppercase;">Nominal Pembayaran Pas:</div>
                    <div style="font-size: 1.15rem; font-weight: 900; font-family: var(--font-mono); color: #ffffff;" id="va-amount-text">${formatRupiah(currentInvoice.netAmount)}</div>
                  </div>
                  <button class="copy-va-btn" id="btn-copy-amount" title="Salin Nominal Pembayaran" style="background: rgba(255,255,255,0.25);">
                    📋 Salin Nominal
                  </button>
                </div>

                <div style="font-size: 0.74rem; color: #cbd5e1; margin-top: 12px;">
                  Atas Nama: <strong style="color: #ffffff;">STIT IHSANUL FIKRI - ${currentStudent.name.toUpperCase()}</strong>
                </div>
              </div>

              <!-- Quick Simulation Button & Guide Toggle -->
              <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; background: #f8fafc; padding: 16px 20px; border-radius: var(--radius-xl); border: 1px solid var(--border-light); margin-bottom: 20px;">
                <div>
                  <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-dark);">Uji Coba Pembayaran Langsung:</div>
                  <div style="font-size: 0.74rem; color: var(--text-muted);">Simulasikan notifikasi pembayaran otomatis dari perbankan</div>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-pay-va-instant" data-invoice-id="${currentInvoice.id}" style="background: linear-gradient(135deg, #1e40af, #0284c7); font-weight: 800; box-shadow: var(--shadow-sm);">
                  ⚡ Simulasikan Pembayaran VA Berhasil
                </button>
              </div>

              <!-- Cara Pembayaran Accordion -->
              <div style="margin-top: 20px;">
                <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-dark); margin-bottom: 10px;">
                  📖 Panduan Cara Bayar Virtual Account:
                </div>
                
                <div class="faq-accordion-item">
                  <div class="faq-accordion-header">
                    <span>📱 Cara Bayar via Mobile Banking (BSI Mobile / Livin Mandiri / Muamalat DIN)</span>
                    <span class="acc-icon">▼</span>
                  </div>
                  <div class="faq-accordion-body open">
                    <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
                      <li>Buka aplikasi Mobile Banking Anda dan lakukan Login.</li>
                      <li>Pilih menu <strong>Bayar / Pembayaran</strong> &gt; <strong>Akademik / Institusi Pendidikan</strong> (atau menu <strong>Virtual Account</strong>).</li>
                      <li>Masukkan Nomor Virtual Account: <code style="font-weight: 800; color: #1e40af;">${currentInvoice.virtualAccount}</code>.</li>
                      <li>Periksa data yang muncul di layar: Pastikan nama adalah <strong>${currentStudent.name.toUpperCase()}</strong> dan nominal adalah <strong>${formatRupiah(currentInvoice.netAmount)}</strong>.</li>
                      <li>Masukkan PIN M-Banking Anda dan konfirmasi transaksi.</li>
                      <li>Selesai! Tagihan di SIMPEL-IF akan langsung otomatis <strong>LUNAS</strong> dan kwitansi resmi langsung terbit.</li>
                    </ol>
                  </div>
                </div>

                <div class="faq-accordion-item">
                  <div class="faq-accordion-header">
                    <span>🏧 Cara Bayar via Mesin ATM & Teller Bank</span>
                    <span class="acc-icon">▼</span>
                  </div>
                  <div class="faq-accordion-body">
                    <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
                      <li>Masukkan kartu ATM dan PIN Anda di mesin ATM.</li>
                      <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Pembayaran</strong> &gt; <strong>Lainnya / Virtual Account</strong>.</li>
                      <li>Ketikkan nomor VA: <code style="font-weight: 800;">${currentInvoice.virtualAccount}</code>.</li>
                      <li>Periksa rincian tagihan di layar ATM, lalu tekan <strong>Ya / Benar</strong>.</li>
                      <li>Simpan struk ATM sebagai bukti transaksi sah Anda.</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>

            <!-- TAB 2: Transfer Bank Manual -->
            <div id="tab-content-manual" style="display: none;">
              <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <h5 style="font-size: 0.92rem; font-weight: 800; color: var(--text-dark); margin: 0;">Rekening Resmi Kampus STIT Ihsanul Fikri:</h5>
                  <span class="badge badge-info">Transfer Antar Bank</span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 20px;">
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); padding: 14px 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 0.72rem; color: #166534; font-weight: 800;">BANK SYARIAH INDONESIA (BSI)</div>
                      <span style="font-size: 0.7rem; color: #15803d; font-weight: 700;">Utama</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 4px 0;">7123456789</div>
                    <div style="font-size: 0.74rem; color: #334155; display: flex; justify-content: space-between; align-items: center;">
                      <span>a.n. <strong>STIT IHSANUL FIKRI</strong></span>
                      <button type="button" class="btn-copy-rek" data-rek="7123456789" style="background:none; border:none; color:#15803d; font-weight:800; font-size:0.74rem; cursor:pointer;">📋 Salin</button>
                    </div>
                  </div>

                  <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 0.72rem; color: #1e40af; font-weight: 800;">BANK MUAMALAT</div>
                      <span style="font-size: 0.7rem; color: #2563eb; font-weight: 700;">Syariah</span>
                    </div>
                    <div style="font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 4px 0;">5010098273</div>
                    <div style="font-size: 0.74rem; color: #334155; display: flex; justify-content: space-between; align-items: center;">
                      <span>a.n. <strong>STIT IHSANUL FIKRI</strong></span>
                      <button type="button" class="btn-copy-rek" data-rek="5010098273" style="background:none; border:none; color:#1d4ed8; font-weight:800; font-size:0.74rem; cursor:pointer;">📋 Salin</button>
                    </div>
                  </div>
                </div>

                <!-- Formulir Unggah Struk Transfer -->
                <form id="form-manual-transfer">
                  <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-dark); margin-bottom: 12px;">
                    📝 Formulir Konfirmasi Bukti Transfer:
                  </div>

                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">Bank Pengirim Asal <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-bank" placeholder="Contoh: BSI / Mandiri / BRI / BCA" required value="Bank BSI">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nama Pemilik Rekening Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-name" placeholder="Nama sesuai rekening" required value="${currentStudent.name.toUpperCase()}">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nomor Rekening Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-acc" placeholder="Nomor rekening pengirim" required value="7128938291">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nominal Transfer (Rp) <span class="required">*</span></label>
                      <input type="number" class="form-control" id="manual-transfer-amount" required value="${currentInvoice.netAmount}">
                    </div>
                  </div>

                  <div class="form-group" style="margin-top: 14px;">
                    <label class="form-label">Unggah Foto Struk / Bukti Transfer M-Banking <span class="required">*</span></label>
                    <div class="upload-dropzone" id="manual-dropzone">
                      <div class="upload-icon">📷</div>
                      <div style="font-size: 0.86rem; font-weight: 800; color: var(--text-dark);">Klik atau Tarik Foto Bukti Transfer Disini</div>
                      <div style="font-size: 0.74rem; color: var(--text-light); margin-top: 3px;">Mendukung format JPG, PNG, atau Screenshot M-Banking (Maksimal 5MB)</div>
                      <input type="file" id="manual-file-input" accept="image/*" style="display: none;">
                      <div class="upload-preview-container" id="manual-preview-wrapper" style="display: none; margin-top: 12px;">
                        <img id="manual-img-preview" class="upload-preview-img" alt="Preview Bukti Bayar">
                        <div style="margin-top: 6px; font-size: 0.72rem; color: #16a34a; font-weight: 700;">✓ Foto bukti siap diunggah</div>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
                    <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-manual-transfer" style="font-weight: 800; background: linear-gradient(135deg, #16a34a, #059669); border: none;">
                      📤 Kirim Bukti Transfer Untuk Diverifikasi Bendahara
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `}
      </div>
    ` : `
      <!-- KONDISI 4: TIDAK ADA TAGIHAN AKTIF -->
      <div class="card" style="text-align: center; padding: 48px 24px; margin-bottom: 28px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
        <h3 style="font-size: 1.2rem; font-weight: 900; color: var(--text-dark);">Tidak Ada Tagihan Aktif</h3>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 480px; margin: 6px auto 0;">Seluruh kewajiban administrasi untuk Semester ${state.activeSemester} telah terselesaikan atau belum diterbitkan oleh bagian keuangan.</p>
      </div>
    `}

    <!-- 4. Histori Transaksi Pembayaran Mahasiswa -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title-group">
          <h3 class="card-title" style="font-size: 1.05rem; font-weight: 800;">📜 Riwayat Pembayaran & Kwitansi Seluruh Semester</h3>
          <p class="card-subtitle">Semua catatan transaksi perkuliahan Anda di STIT Ihsanul Fikri Pagentan Magelang</p>
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
              <th>Total Bayar</th>
              <th>Status</th>
              <th>No. Kwitansi Sah</th>
              <th>Aksi Kwitansi</th>
            </tr>
          </thead>
          <tbody>
            ${studentInvoices.length > 0 ? studentInvoices.map(inv => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.78rem;">${inv.id}</td>
                <td style="font-weight: 700;">Semester ${inv.semester}</td>
                <td>${formatRupiah(inv.grossAmount)}</td>
                <td style="color: #0284c7; font-weight: 700;">${inv.totalDiscount > 0 ? `-${formatRupiah(inv.totalDiscount)}` : '-'}</td>
                <td style="font-weight: 900; color: var(--text-dark); font-family: var(--font-mono);">${formatRupiah(inv.netAmount)}</td>
                <td>${getStatusBadge(inv.status)}</td>
                <td style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">${inv.receiptNumber || '<span style="color:var(--text-light);">-</span>'}</td>
                <td>
                  ${inv.status === STATUS_TAGIHAN.LUNAS ? `
                    <button class="btn btn-outline btn-sm btn-view-my-receipt" data-invoice-id="${inv.id}" style="font-weight: 700; color: #166534; border-color: #86efac; background: #f0fdf4;">
                      🧾 Cetak Kwitansi
                    </button>
                  ` : `
                    <span style="font-size: 0.74rem; color: var(--text-light);">-</span>
                  `}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="8" class="table-empty-state">
                  <div class="table-empty-icon">📭</div>
                  <div>Belum ada riwayat tagihan yang tercatat.</div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 5. Pusat Bantuan & Kontak Layanan Keuangan Kampus -->
    <div class="helpdesk-box">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 52px; height: 52px; border-radius: var(--radius-full); background: #059669; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);">
          💬
        </div>
        <div>
          <h4 style="font-size: 1rem; font-weight: 900; color: #065f46; margin: 0;">Butuh Bantuan Pembayaran atau Informasi Beasiswa?</h4>
          <p style="font-size: 0.78rem; color: #047857; margin: 3px 0 0;">
            Layanan Keuangan & BAAK STIT Ihsanul Fikri siap membantu Anda pada hari kerja (Senin - Sabtu, 08:00 - 15:30 WIB).
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <a href="https://wa.me/6281234567890?text=Assalamu'alaikum%20Admin%20Keuangan%20STIT-IF,%20saya%20${encodeURIComponent(currentStudent.name)}%20(NIM:%20${currentStudent.nim})%20ingin%20bertanya%20mengenai%20tagihan." target="_blank" class="btn btn-primary btn-sm" style="background: #059669; border: none; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
          📱 Hubungi WhatsApp Keuangan
        </a>
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

  const btnRefresh = container.querySelector('#btn-refresh-portal');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      renderMahasiswaPortal(container);
      window.simpelToast.show('Status Diperbarui', 'Memeriksa status pembayaran mutakhir.', 'info');
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

  // 3. Bank Method Card Selection
  container.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const b = card.getAttribute('data-bank');
      const vaBankLabel = container.querySelector('#va-bank-label');
      if (vaBankLabel) {
        vaBankLabel.textContent = b === 'BSI' ? 'Bank Syariah Indonesia (BSI) Virtual Account' :
                                  b === 'MUAMALAT' ? 'Bank Muamalat Virtual Account' :
                                  b === 'MANDIRI' ? 'Bank Mandiri Virtual Account' : 'Bank BRI (BRIVA) Virtual Account';
      }
    });
  });

  // 4. Copy Buttons
  const btnCopyVa = container.querySelector('#btn-copy-va');
  const vaNumberText = container.querySelector('#va-number-text');
  if (btnCopyVa && vaNumberText) {
    btnCopyVa.addEventListener('click', () => {
      navigator.clipboard.writeText(vaNumberText.textContent.trim());
      btnCopyVa.textContent = '✓ Disalin';
      setTimeout(() => btnCopyVa.textContent = '📋 Salin VA', 2000);
      window.simpelToast.show('Nomor VA Disalin', 'Nomor Virtual Account telah disalin ke clipboard.', 'info');
    });
  }

  const btnCopyAmount = container.querySelector('#btn-copy-amount');
  if (btnCopyAmount && currentInvoice) {
    btnCopyAmount.addEventListener('click', () => {
      navigator.clipboard.writeText(currentInvoice.netAmount.toString());
      btnCopyAmount.textContent = '✓ Disalin';
      setTimeout(() => btnCopyAmount.textContent = '📋 Salin Nominal', 2000);
      window.simpelToast.show('Nominal Disalin', `Nominal Rp ${currentInvoice.netAmount.toLocaleString('id-ID')} disalin ke clipboard.`, 'info');
    });
  }

  container.querySelectorAll('.btn-copy-rek').forEach(btn => {
    btn.addEventListener('click', () => {
      const rek = btn.getAttribute('data-rek');
      navigator.clipboard.writeText(rek);
      btn.textContent = '✓ Disalin';
      setTimeout(() => btn.textContent = '📋 Salin', 2000);
      window.simpelToast.show('Nomor Rekening Disalin', `No. Rekening ${rek} telah disalin ke clipboard.`, 'info');
    });
  });

  // 5. Pay Instant VA simulation
  const btnPayVa = container.querySelector('#btn-pay-va-instant');
  if (btnPayVa) {
    btnPayVa.addEventListener('click', () => {
      const invId = btnPayVa.getAttribute('data-invoice-id');
      const activeCard = container.querySelector('.payment-method-card.active');
      const bankChoice = activeCard ? activeCard.querySelector('div div').textContent : 'Bank Syariah Indonesia';
      
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
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--primary-600)';
      dropzone.style.background = '#f0f9ff';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--border-color)';
      dropzone.style.background = '#ffffff';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--border-color)';
      dropzone.style.background = '#ffffff';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          selectedImageData = evt.target.result;
          if (imgPreview) imgPreview.src = selectedImageData;
          if (previewWrapper) previewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          selectedImageData = evt.target.result;
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

  // 9. FAQ Accordions
  container.querySelectorAll('.faq-accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      if (body) {
        body.classList.toggle('open');
        const icon = header.querySelector('.acc-icon');
        if (icon) {
          icon.textContent = body.classList.contains('open') ? '▲' : '▼';
        }
      }
    });
  });
}
