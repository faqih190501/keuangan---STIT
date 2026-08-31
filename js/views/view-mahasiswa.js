/**
 * SIMPEL-IF Portal Mahasiswa View
 * STIT Ihsanul Fikri
 * Fitur: Pilihan Lunas / Cicilan & Saluran Pembayaran (QRIS, Bank BSI VA 1056405743, Transfer Manual)
 */

import { appState } from '../state.js';
import { AuthManager } from '../auth.js';
import { formatRupiah, formatDate, formatDateTime, getStatusBadge, getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { STATUS_TAGIHAN } from '../models.js';
import { BillingEngine } from '../billing-engine.js';
import { generateQRCodeSVG } from '../utils/qr-engine.js';

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

  // Status helper flags
  const isLunas = currentInvoice && currentInvoice.status === STATUS_TAGIHAN.LUNAS;
  const isPending = currentInvoice && currentInvoice.status === STATUS_TAGIHAN.MENUNGGU_VERIFIKASI;
  const isCicil = currentInvoice && currentInvoice.status === STATUS_TAGIHAN.DICICIL;

  const totalNetAmount = currentInvoice ? currentInvoice.netAmount : 0;
  const totalPaidAmount = currentInvoice ? (currentInvoice.paidAmount || 0) : 0;
  const remainingAmount = Math.max(0, totalNetAmount - totalPaidAmount);
  const halfAmount = Math.round(totalNetAmount / 2);

  // Default active payment plan
  let selectedPlan = 'FULL'; // 'FULL' or 'INSTALLMENT'
  let selectedPayAmount = remainingAmount > 0 ? remainingAmount : totalNetAmount;

  // Generate dynamic QRIS SVG payload
  function getQrisSvg(amount) {
    const qrisPayload = `00020101021226600016ID.CO.QRIS.WWW01189360098800000000000215ID1020268809123520454995303360540${amount}5802ID5918STIT IHSANUL FIKRI6008MAGELANG61055610062${currentInvoice ? currentInvoice.id : 'INV'}6304`;
    return generateQRCodeSVG(qrisPayload, 175);
  }

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
        <div class="student-stat-icon" style="background: ${isLunas ? '#dcfce7' : isPending ? '#fef3c7' : isCicil ? '#e0f2fe' : '#fee2e2'}; color: ${isLunas ? '#15803d' : isPending ? '#b45309' : isCicil ? '#0369a1' : '#b91c1c'};">
          ${isLunas ? '✅' : isPending ? '⏳' : isCicil ? '🔄' : '💳'}
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Status Semester ${state.activeSemester}</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin-top: 2px;">
            ${currentInvoice ? getStatusBadge(currentInvoice.status) : '<span class="badge badge-success">Tidak Ada Tagihan</span>'}
          </div>
        </div>
      </div>

      <!-- Card 2: Total Kewajiban & Sisa Bayar -->
      <div class="student-stat-card">
        <div class="student-stat-icon" style="background: #eff6ff; color: #1d4ed8;">
          💰
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">
            ${isCicil ? 'Sisa Tagihan Berjalan' : 'Total Kewajiban Semester'}
          </div>
          <div style="font-size: 1.15rem; font-weight: 900; color: ${isLunas ? '#15803d' : '#1e3a8a'}; font-family: var(--font-mono); margin-top: 2px;">
            ${currentInvoice ? formatRupiah(isLunas ? currentInvoice.netAmount : remainingAmount) : 'Rp 0'}
          </div>
          ${isCicil ? `<div style="font-size:0.68rem; color:#0369a1; font-weight:700;">Telah dibayar: ${formatRupiah(totalPaidAmount)}</div>` : ''}
        </div>
      </div>

      <!-- Card 3: Subsidi Beasiswa Hemat -->
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
            ${isLunas || (isCicil && currentInvoice.receiptNumber) ? `<span style="color:#059669; font-weight:800; font-family:var(--font-mono);">${currentInvoice.receiptNumber}</span>` : '<span style="color:var(--text-light); font-size:0.78rem;">Tersedia Saat Bayar</span>'}
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
              <span style="font-size: 0.9rem; font-weight: 800; color: var(--text-dark);">Total Tagihan Bersih Semester Ini:</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Sudah termasuk seluruh komponen SPP & potongan beasiswa</div>
            </div>
            <span style="font-size: 1.55rem; font-weight: 900; color: var(--primary-900); font-family: var(--font-mono);">${formatRupiah(currentInvoice.netAmount)}</span>
          </div>

          <!-- If Dicicil, show installment progress -->
          ${isCicil ? `
            <div style="margin-top: 12px; background: #e0f2fe; border: 1px solid #bae6fd; padding: 12px 16px; border-radius: var(--radius-md);">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 700; color: #0369a1; margin-bottom: 6px;">
                <span>Progres Angsuran / Cicilan:</span>
                <span>${formatRupiah(totalPaidAmount)} / ${formatRupiah(totalNetAmount)} (${Math.round((totalPaidAmount / totalNetAmount) * 100)}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background: #bae6fd; border-radius: 4px; overflow: hidden;">
                <div style="width: ${(totalPaidAmount / totalNetAmount) * 100}%; height: 100%; background: #0284c7; border-radius: 4px;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; color: #0c4a6e; margin-top: 6px;">
                <span>Sisa Tunggakan yang Belum Dibayar:</span>
                <strong style="font-family: var(--font-mono); font-size: 0.92rem; color: #b91c1c;">${formatRupiah(remainingAmount)}</strong>
              </div>
            </div>
          ` : ''}
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
                <p style="font-size: 0.82rem; color: #92400e; margin: 4px 0 0;">Anda telah mengunggah bukti pembayaran manual. Tim keuangan sedang memvalidasi mutasi kas. Kwitansi resmi QR Code akan otomatis terbit setelah disetujui.</p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" id="btn-refresh-portal" style="font-weight: 700; border-color: #f59e0b; color: #b45309; background: #ffffff;">
                🔄 Cek Status Terbaru
              </button>
            </div>
          </div>
        ` : `
          <!-- KONDISI 3: BELUM LUNAS / CICILAN (PILIH SKEMA & SALURAN PEMBAYARAN) -->
          <div style="margin-top: 28px;">
            
            <!-- LANGKAH 1: PILIH SKEMA PEMBAYARAN (LUNAS VS DICICIL) -->
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: var(--radius-xl); padding: 22px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h4 style="font-size: 1rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                    Langkah 1: Pilih Rencana Pembayaran
                  </h4>
                  <p style="font-size: 0.78rem; color: var(--text-light); margin: 2px 0 0;">
                    Pilih apakah ingin melunasi seluruhnya atau mengangsur secara bertahap:
                  </p>
                </div>
                <span class="badge badge-scholarship">Fleksibilitas Pembayaran</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                
                <!-- Option 1: Bayar Lunas Sekaligus -->
                <div class="payment-plan-card active" id="plan-card-full" style="border: 2px solid var(--primary-700); background: #eff6ff; border-radius: var(--radius-lg); padding: 16px 18px; cursor: pointer; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <input type="radio" name="payment_plan" id="radio-plan-full" value="FULL" checked style="cursor: pointer; transform: scale(1.2);">
                      <label for="radio-plan-full" style="font-weight: 800; font-size: 0.92rem; color: #1e40af; cursor: pointer;">
                        ✨ Bayar Lunas Sekaligus (100%)
                      </label>
                    </div>
                    <span class="badge" style="background:#dcfce7; color:#15803d; font-size:0.68rem; font-weight:800;">Bebas Tanggungan</span>
                  </div>
                  <p style="font-size: 0.76rem; color: #3b82f6; margin: 0 0 10px 24px;">
                    Melunasi seluruh sisa kewajiban semester ini dalam 1 transaksi.
                  </p>
                  <div style="margin-left: 24px; font-size: 1.25rem; font-weight: 900; color: #0f172a; font-family: var(--font-mono);">
                    ${formatRupiah(remainingAmount)}
                  </div>
                </div>

                <!-- Option 2: Bayar Dicicil / Angsuran -->
                <div class="payment-plan-card" id="plan-card-installment" style="border: 2px solid var(--border-light); background: #ffffff; border-radius: var(--radius-lg); padding: 16px 18px; cursor: pointer; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <input type="radio" name="payment_plan" id="radio-plan-installment" value="INSTALLMENT" style="cursor: pointer; transform: scale(1.2);">
                      <label for="radio-plan-installment" style="font-weight: 800; font-size: 0.92rem; color: var(--text-dark); cursor: pointer;">
                        🔄 Bayar Dicicil / Angsuran (Termin)
                      </label>
                    </div>
                    <span class="badge" style="background:#fef3c7; color:#b45309; font-size:0.68rem; font-weight:800;">Dispensasi</span>
                  </div>
                  <p style="font-size: 0.76rem; color: var(--text-light); margin: 0 0 10px 24px;">
                    Bayar sebagian sekarang, sisa dapat diangsur sebelum UAS.
                  </p>

                  <!-- Installment Sub-options -->
                  <div id="installment-presets-container" style="display: none; margin-left: 24px; margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                    <div style="font-size: 0.74rem; font-weight: 700; color: var(--text-dark); margin-bottom: 6px;">Pilih Besaran Angsuran Kali Ini:</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <button type="button" class="btn btn-outline btn-sm btn-installment-preset active" data-amount="${halfAmount}" style="font-family: var(--font-mono); font-weight: 800; background: #e0f2fe; border-color: #0284c7; color: #0369a1;">
                        Termin (50%): ${formatRupiah(halfAmount)}
                      </button>
                      <button type="button" class="btn btn-outline btn-sm btn-installment-preset" data-amount="500000" style="font-family: var(--font-mono); font-weight: 700;">
                        Rp 500.000
                      </button>
                      <button type="button" class="btn btn-outline btn-sm btn-installment-preset" data-amount="1000000" style="font-family: var(--font-mono); font-weight: 700;">
                        Rp 1.000.000
                      </button>
                    </div>
                  </div>
                  <div style="margin-left: 24px; font-size: 1.15rem; font-weight: 900; color: #0284c7; font-family: var(--font-mono); margin-top: 6px;" id="display-plan-installment-amount">
                    ${formatRupiah(halfAmount)}
                  </div>
                </div>

              </div>
            </div>

            <!-- LANGKAH 2: PILIH SALURAN PEMBAYARAN (QRIS, BSI VA 1056405743, TRANSFER MANUAL) -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                  Langkah 2: Pilih Saluran Pembayaran
                </h4>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 2px 0 0;">
                  Pilih kanal pembayaran resmi STIT Ihsanul Fikri:
                </p>
              </div>
              <div style="background: #f8fafc; padding: 4px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.76rem; font-weight: 800; color: var(--text-dark);">
                Nominal Bayar: <span style="font-family: var(--font-mono); color: #1e40af; font-size: 0.88rem;" id="active-pay-target-badge">${formatRupiah(selectedPayAmount)}</span>
              </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="tabs-container" style="margin-bottom: 20px;">
              <button class="tab-nav-btn active" id="tab-btn-qris">
                🔴 QRIS (Scan Semua e-Wallet & M-Banking)
              </button>
              <button class="tab-nav-btn" id="tab-btn-va">
                🌙 BSI Virtual Account (1056405743)
              </button>
              <button class="tab-nav-btn" id="tab-btn-manual">
                🏦 Transfer Bank BSI Manual (Upload Struk)
              </button>
            </div>

            <!-- TAB 1: QRIS PAYMENT (NATIONAL STANDARD) -->
            <div id="tab-content-qris">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: center; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-2xl); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
                
                <!-- Left: Official QRIS Box Design -->
                <div style="text-align: center; background: #fafafa; border: 2px solid #e2e8f0; border-radius: var(--radius-xl); padding: 20px 16px; position: relative; max-width: 320px; margin: 0 auto; box-shadow: var(--shadow-sm);">
                  
                  <!-- QRIS Top Badge -->
                  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #dc2626; padding-bottom: 8px; margin-bottom: 12px;">
                    <div style="font-weight: 900; font-size: 1.25rem; color: #dc2626; letter-spacing: 1px;">QRIS</div>
                    <div style="font-size: 0.65rem; color: #64748b; text-align: right; line-height: 1.2;">
                      STANDAR PEMBAYARAN<br><strong>NASIONAL INDONESIA</strong>
                    </div>
                  </div>

                  <div style="font-size: 0.86rem; font-weight: 900; color: #0f172a; margin-bottom: 2px;">
                    STIT IHSANUL FIKRI
                  </div>
                  <div style="font-size: 0.68rem; color: #64748b; font-family: var(--font-mono); margin-bottom: 12px;">
                    NMID: ID102026880912 &bull; A01
                  </div>

                  <!-- Dynamic SVG QR Code Container -->
                  <div id="qris-svg-wrapper" style="display: inline-block; padding: 8px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);">
                    ${getQrisSvg(selectedPayAmount)}
                  </div>

                  <div style="margin-top: 12px; font-size: 0.74rem; color: #334155;">
                    Nominal Terkunci Otomatis:
                  </div>
                  <div style="font-size: 1.25rem; font-weight: 900; color: #dc2626; font-family: var(--font-mono); margin: 2px 0 6px;" id="qris-amount-display">
                    ${formatRupiah(selectedPayAmount)}
                  </div>
                  <div style="font-size: 0.68rem; color: #64748b;">
                    Dicetak untuk: <strong>${currentStudent.name.toUpperCase()}</strong>
                  </div>
                </div>

                <!-- Right: QRIS Actions & Instructions -->
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem;">📱</span>
                    <h5 style="font-size: 0.98rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                      Cara Praktis Bayar Menggunakan QRIS
                    </h5>
                  </div>
                  
                  <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
                    Scan kode QR di samping langsung dari kamera HP Anda menggunakan aplikasi perbankan atau dompet digital apa pun (BSI Mobile, BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, DANA, LinkAja).
                  </p>

                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 20px;">
                    <div style="font-size: 0.76rem; font-weight: 800; color: #166534; text-transform: uppercase;">
                      ⚡ Keunggulan QRIS:
                    </div>
                    <ul style="margin: 6px 0 0; padding-left: 18px; font-size: 0.78rem; color: #15803d; line-height: 1.5;">
                      <li>Nominal pas secara otomatis terisi (tidak perlu ketik manual).</li>
                      <li>Pembayaran langsung terverifikasi secara realtime 24/7.</li>
                      <li>Kwitansi sah ber-QR Code langsung terbit otomatis.</li>
                    </ul>
                  </div>

                  <button class="btn btn-primary btn-lg" id="btn-pay-qris-instant" data-invoice-id="${currentInvoice.id}" style="width: 100%; font-weight: 900; background: linear-gradient(135deg, #dc2626, #991b1b); border: none; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
                    ⚡ Simulasikan Scan QRIS & Bayar Berhasil
                  </button>
                </div>

              </div>
            </div>

            <!-- TAB 2: VIRTUAL ACCOUNT BANK BSI ONLY -->
            <div id="tab-content-va" style="display: none;">
              
              <!-- VA Display Card -->
              <div class="va-box" style="background: linear-gradient(135deg, #0f766e 0%, #064e3b 100%); border-radius: var(--radius-xl); padding: 24px; color: #ffffff; box-shadow: var(--shadow-md); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.8rem;">🌙</span>
                    <div>
                      <div style="font-size: 1.15rem; font-weight: 900; color: #ffffff;">Bank Syariah Indonesia (BSI)</div>
                      <div style="font-size: 0.74rem; color: #a7f3d0;">Layanan Virtual Account Resmi STIT Ihsanul Fikri</div>
                    </div>
                  </div>
                  <span style="background: rgba(255,255,255,0.25); color: #ffffff; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; font-weight: 800; letter-spacing: 0.5px;">
                    ONLINE 24/7 OTOMATIS
                  </span>
                </div>
                
                <div style="font-size: 0.76rem; color: #a7f3d0; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">
                  Nomor Virtual Account Bank BSI:
                </div>
                <div class="va-number-display" style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 12px 18px; border-radius: var(--radius-lg); border: 1.5px dashed rgba(255,255,255,0.4); margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                  <span id="va-number-text" style="font-size: 1.75rem; font-weight: 900; font-family: var(--font-mono); letter-spacing: 2px; color: #fef08a;">1056405743</span>
                  <button class="copy-va-btn" id="btn-copy-va" title="Salin Nomor VA BSI" style="background: #fef08a; color: #713f12; font-weight: 900; padding: 8px 16px; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.84rem;">
                    📋 Salin No. VA BSI
                  </button>
                </div>

                <div style="background: rgba(255,255,255,0.12); padding: 12px 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
                  <div>
                    <div style="font-size: 0.72rem; color: #a7f3d0; text-transform: uppercase; font-weight: 700;">Nominal Transfer Pas:</div>
                    <div style="font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #ffffff;" id="va-amount-text">${formatRupiah(selectedPayAmount)}</div>
                  </div>
                  <button class="copy-va-btn" id="btn-copy-amount" title="Salin Nominal Pembayaran" style="background: rgba(255,255,255,0.25); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); padding: 6px 14px; border-radius: var(--radius-md); cursor: pointer; font-weight: 800; font-size: 0.8rem;">
                    📋 Salin Nominal
                  </button>
                </div>

                <div style="font-size: 0.78rem; color: #e6fffa; line-height: 1.4;">
                  Atas Nama: <strong style="color: #ffffff; text-decoration: underline;">STIT IHSANUL FIKRI - ${currentStudent.name.toUpperCase()}</strong>
                </div>
              </div>

              <!-- Quick Simulation Button -->
              <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; background: #f0fdf4; padding: 16px 20px; border-radius: var(--radius-xl); border: 1.5px solid #86efac; margin-bottom: 20px;">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 900; color: #14532d;">Simulasi Pembayaran BSI Virtual Account:</div>
                  <div style="font-size: 0.76rem; color: #166534;">Simulasikan notifikasi pembayaran otomatis dari BSI Mobile / ATM</div>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-pay-va-instant" data-invoice-id="${currentInvoice.id}" style="background: linear-gradient(135deg, #059669, #047857); font-weight: 900; border: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                  ⚡ Simulasikan Pembayaran BSI VA Berhasil
                </button>
              </div>

              <!-- Cara Pembayaran Accordion -->
              <div style="margin-top: 20px;">
                <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-dark); margin-bottom: 10px;">
                  📖 Panduan Cara Bayar BSI Virtual Account (1056405743):
                </div>
                
                <div class="faq-accordion-item">
                  <div class="faq-accordion-header">
                    <span>📱 Cara Bayar via BSI Mobile</span>
                    <span class="acc-icon">▼</span>
                  </div>
                  <div class="faq-accordion-body open">
                    <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--text-dark);">
                      <li>Buka aplikasi <strong>BSI Mobile</strong> dan lakukan Login.</li>
                      <li>Pilih menu <strong>Bayar</strong> &gt; pilih <strong>Institusi / Akademik</strong> atau <strong>Virtual Account</strong>.</li>
                      <li>Masukkan Nomor VA / Rekening: <code style="font-weight: 900; color: #047857; font-size: 0.92rem;">1056405743</code>.</li>
                      <li>Periksa data: Nama adalah <strong>STIT IHSANUL FIKRI - ${currentStudent.name.toUpperCase()}</strong> dan nominal adalah <strong id="guide-va-amount">${formatRupiah(selectedPayAmount)}</strong>.</li>
                      <li>Masukkan PIN BSI Mobile Anda dan selesaikan transaksi.</li>
                    </ol>
                  </div>
                </div>

                <div class="faq-accordion-item">
                  <div class="faq-accordion-header">
                    <span>🏧 Cara Bayar via ATM BSI & ATM Bersama</span>
                    <span class="acc-icon">▼</span>
                  </div>
                  <div class="faq-accordion-body">
                    <ol style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--text-dark);">
                      <li>Masukkan kartu ATM dan PIN Anda di mesin ATM BSI / ATM Bersama.</li>
                      <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Transfer / Pembayaran</strong>.</li>
                      <li>Masukkan Kode Bank BSI (<strong>451</strong> jika dari bank lain) + Nomor VA <strong>1056405743</strong>.</li>
                      <li>Konfirmasi nama institusi <strong>STIT IHSANUL FIKRI</strong> dan nominal tagihan.</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>

            <!-- TAB 3: TRANSFER REKENING BANK BSI MANUAL -->
            <div id="tab-content-manual" style="display: none;">
              <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                  <h5 style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin: 0;">Rekening Resmi STIT Ihsanul Fikri:</h5>
                  <span class="badge badge-success">Bank Syariah Indonesia</span>
                </div>
                
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1.5px solid #86efac; border-radius: var(--radius-xl); padding: 18px 22px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.76rem; color: #166534; font-weight: 800; text-transform: uppercase;">BANK SYARIAH INDONESIA (BSI)</div>
                    <span style="font-size: 0.72rem; color: #15803d; font-weight: 700; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">Rekening Utama Yayasan</span>
                  </div>
                  <div style="font-size: 1.65rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 8px 0 6px;">1056405743</div>
                  <div style="font-size: 0.8rem; color: #166534; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <span>Atas Nama: <strong>STIT IHSANUL FIKRI</strong></span>
                    <button type="button" class="btn-copy-rek" data-rek="1056405743" style="background: #16a34a; border: none; color: #ffffff; font-weight: 800; font-size: 0.78rem; padding: 4px 12px; border-radius: 6px; cursor: pointer;">📋 Salin No. Rekening BSI</button>
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
                      <input type="text" class="form-control" id="manual-sender-acc" placeholder="Nomor rekening pengirim" required value="1056405743">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nominal Ditransfer (Rp) <span class="required">*</span></label>
                      <input type="number" class="form-control" id="manual-transfer-amount" required value="${selectedPayAmount}">
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
              <th>Total Terbayar</th>
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
                <td style="font-weight: 900; color: var(--text-dark); font-family: var(--font-mono);">
                  ${inv.paidAmount > 0 ? formatRupiah(inv.paidAmount) : formatRupiah(inv.netAmount)}
                </td>
                <td>${getStatusBadge(inv.status)}</td>
                <td style="font-family: var(--font-mono); font-size: 0.76rem; font-weight: 700;">${inv.receiptNumber || '<span style="color:var(--text-light);">-</span>'}</td>
                <td>
                  ${inv.status === STATUS_TAGIHAN.LUNAS || inv.paidAmount > 0 ? `
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

  // 2. Payment Plan Selector (LUNAS vs DICICIL)
  const planCardFull = container.querySelector('#plan-card-full');
  const planCardInstallment = container.querySelector('#plan-card-installment');
  const radioPlanFull = container.querySelector('#radio-plan-full');
  const radioPlanInstallment = container.querySelector('#radio-plan-installment');
  const installmentPresets = container.querySelector('#installment-presets-container');

  const qrisSvgWrapper = container.querySelector('#qris-svg-wrapper');
  const qrisAmountDisplay = container.querySelector('#qris-amount-display');
  const vaAmountText = container.querySelector('#va-amount-text');
  const activePayBadge = container.querySelector('#active-pay-target-badge');
  const guideVaAmount = container.querySelector('#guide-va-amount');
  const manualAmountInput = container.querySelector('#manual-transfer-amount');

  function updatePaymentPlan(plan, customAmount = null) {
    selectedPlan = plan;
    if (plan === 'FULL') {
      selectedPayAmount = remainingAmount;
      if (planCardFull) {
        planCardFull.style.borderColor = 'var(--primary-700)';
        planCardFull.style.background = '#eff6ff';
        radioPlanFull.checked = true;
      }
      if (planCardInstallment) {
        planCardInstallment.style.borderColor = 'var(--border-light)';
        planCardInstallment.style.background = '#ffffff';
        radioPlanInstallment.checked = false;
      }
      if (installmentPresets) installmentPresets.style.display = 'none';
    } else {
      selectedPayAmount = customAmount || halfAmount;
      if (planCardInstallment) {
        planCardInstallment.style.borderColor = 'var(--primary-700)';
        planCardInstallment.style.background = '#eff6ff';
        radioPlanInstallment.checked = true;
      }
      if (planCardFull) {
        planCardFull.style.borderColor = 'var(--border-light)';
        planCardFull.style.background = '#ffffff';
        radioPlanFull.checked = false;
      }
      if (installmentPresets) installmentPresets.style.display = 'block';
    }

    // Update displays across QRIS, VA, and Manual
    if (qrisSvgWrapper) qrisSvgWrapper.innerHTML = getQrisSvg(selectedPayAmount);
    if (qrisAmountDisplay) qrisAmountDisplay.textContent = formatRupiah(selectedPayAmount);
    if (vaAmountText) vaAmountText.textContent = formatRupiah(selectedPayAmount);
    if (activePayBadge) activePayBadge.textContent = formatRupiah(selectedPayAmount);
    if (guideVaAmount) guideVaAmount.textContent = formatRupiah(selectedPayAmount);
    if (manualAmountInput) manualAmountInput.value = selectedPayAmount;
  }

  if (planCardFull) {
    planCardFull.addEventListener('click', () => updatePaymentPlan('FULL'));
  }
  if (planCardInstallment) {
    planCardInstallment.addEventListener('click', () => updatePaymentPlan('INSTALLMENT'));
  }

  container.querySelectorAll('.btn-installment-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.querySelectorAll('.btn-installment-preset').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-main)';
      });
      btn.classList.add('active');
      btn.style.background = '#e0f2fe';
      btn.style.borderColor = '#0284c7';
      btn.style.color = '#0369a1';

      const amt = Number(btn.getAttribute('data-amount')) || halfAmount;
      const disp = container.querySelector('#display-plan-installment-amount');
      if (disp) disp.textContent = formatRupiah(amt);
      updatePaymentPlan('INSTALLMENT', amt);
    });
  });

  // 3. Tabs Switcher (QRIS vs VA vs Manual)
  const tabBtnQris = container.querySelector('#tab-btn-qris');
  const tabBtnVa = container.querySelector('#tab-btn-va');
  const tabBtnManual = container.querySelector('#tab-btn-manual');

  const tabContentQris = container.querySelector('#tab-content-qris');
  const tabContentVa = container.querySelector('#tab-content-va');
  const tabContentManual = container.querySelector('#tab-content-manual');

  function setPaymentTab(tabName) {
    [tabBtnQris, tabBtnVa, tabBtnManual].forEach(b => {
      if (b) b.classList.remove('active');
    });
    [tabContentQris, tabContentVa, tabContentManual].forEach(c => {
      if (c) c.style.display = 'none';
    });

    if (tabName === 'qris') {
      if (tabBtnQris) tabBtnQris.classList.add('active');
      if (tabContentQris) tabContentQris.style.display = 'block';
    } else if (tabName === 'va') {
      if (tabBtnVa) tabBtnVa.classList.add('active');
      if (tabContentVa) tabContentVa.style.display = 'block';
    } else {
      if (tabBtnManual) tabBtnManual.classList.add('active');
      if (tabContentManual) tabContentManual.style.display = 'block';
    }
  }

  if (tabBtnQris) tabBtnQris.addEventListener('click', () => setPaymentTab('qris'));
  if (tabBtnVa) tabBtnVa.addEventListener('click', () => setPaymentTab('va'));
  if (tabBtnManual) tabBtnManual.addEventListener('click', () => setPaymentTab('manual'));

  // 4. QRIS Instant Simulation Payment
  const btnPayQris = container.querySelector('#btn-pay-qris-instant');
  if (btnPayQris && currentInvoice) {
    btnPayQris.addEventListener('click', () => {
      const invId = btnPayQris.getAttribute('data-invoice-id');
      const res = BillingEngine.processQRISPayment(invId, selectedPayAmount, selectedPlan);
      if (res.success) {
        window.simpelToast.show(
          res.isFullyPaid ? 'Pembayaran QRIS Lunas!' : 'Pembayaran Angsuran QRIS Berhasil!',
          `Nominal: ${formatRupiah(res.paidAmount)} telah diterima. No. Kwitansi: ${res.receiptNumber}`,
          'success',
          5000
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(invId);
      }
    });
  }

  // 5. Copy Buttons
  const btnCopyVa = container.querySelector('#btn-copy-va');
  const vaNumberText = container.querySelector('#va-number-text');
  if (btnCopyVa && vaNumberText) {
    btnCopyVa.addEventListener('click', () => {
      navigator.clipboard.writeText('1056405743');
      btnCopyVa.textContent = '✓ Disalin';
      setTimeout(() => btnCopyVa.textContent = '📋 Salin No. VA BSI', 2000);
      window.simpelToast.show('Nomor BSI VA Disalin', 'Nomor BSI Virtual Account (1056405743) disalin ke clipboard.', 'info');
    });
  }

  const btnCopyAmount = container.querySelector('#btn-copy-amount');
  if (btnCopyAmount) {
    btnCopyAmount.addEventListener('click', () => {
      navigator.clipboard.writeText(selectedPayAmount.toString());
      btnCopyAmount.textContent = '✓ Disalin';
      setTimeout(() => btnCopyAmount.textContent = '📋 Salin Nominal', 2000);
      window.simpelToast.show('Nominal Disalin', `Nominal ${formatRupiah(selectedPayAmount)} disalin ke clipboard.`, 'info');
    });
  }

  container.querySelectorAll('.btn-copy-rek').forEach(btn => {
    btn.addEventListener('click', () => {
      const rek = btn.getAttribute('data-rek') || '1056405743';
      navigator.clipboard.writeText(rek);
      btn.textContent = '✓ Disalin';
      setTimeout(() => btn.textContent = '📋 Salin No. Rekening BSI', 2000);
      window.simpelToast.show('Nomor Rekening Disalin', `No. Rekening BSI (${rek}) telah disalin ke clipboard.`, 'info');
    });
  });

  // 6. Pay Instant VA simulation
  const btnPayVa = container.querySelector('#btn-pay-va-instant');
  if (btnPayVa && currentInvoice) {
    btnPayVa.addEventListener('click', () => {
      const invId = btnPayVa.getAttribute('data-invoice-id');
      const res = BillingEngine.processVAPayment(invId, 'Bank Syariah Indonesia (BSI)', selectedPayAmount, selectedPlan);
      if (res.success) {
        window.simpelToast.show(
          res.isFullyPaid ? 'Pembayaran BSI VA Lunas!' : 'Pembayaran Angsuran BSI VA Berhasil!',
          `Nominal: ${formatRupiah(res.paidAmount)} diterima via BSI (1056405743). No. Kwitansi: ${res.receiptNumber}`,
          'success',
          5000
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(invId);
      }
    });
  }

  // 7. Manual Upload File handling
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

  // 8. Submit Manual Transfer Form
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
        destinationBank: 'Bank BSI (No. Rek 1056405743 a.n. STIT Ihsanul Fikri)',
        amount,
        proofImage: selectedImageData,
        planType: selectedPlan
      });

      if (res.success) {
        window.simpelToast.show(
          'Bukti Transfer Terkirim',
          `Bukti pembayaran ${formatRupiah(amount)} ke Bank BSI (1056405743) berhasil masuk ke antrean verifikasi Bendahara.`,
          'success'
        );
        renderMahasiswaPortal(container);
      }
    });
  }

  // 9. View Receipt buttons
  container.querySelectorAll('.btn-view-my-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-invoice-id');
      window.simpelModals.openReceiptModal(invId);
    });
  });

  // 10. FAQ Accordions
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
