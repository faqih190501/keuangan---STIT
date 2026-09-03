/**
 * SIMPEL-IF Portal Mahasiswa View
 * STIT Ihsanul Fikri
 * Fitur:
 * - Kebebasan Menentukan Nominal Pembayaran (Tanpa Paksaan & Fleksibel Penuh)
 * - Pembayaran Tagihan Semester (Lunas / Cicilan Bebas / Kustom Nominal)
 * - Pembayaran Mandiri Bebas Tanpa Tagihan (Ad-hoc Self-Service Payment)
 * - Saluran Pembayaran: QRIS Dinamis, Bank BSI VA 1056405743, Transfer Manual BSI
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
  
  // Dynamic percentage presets
  const pct25 = Math.round(totalNetAmount * 0.25);
  const pct50 = Math.round(totalNetAmount * 0.50);
  const pct75 = Math.round(totalNetAmount * 0.75);

  // Default active payment plan
  let selectedPlan = 'FULL'; // 'FULL' or 'CUSTOM'
  let selectedPayAmount = remainingAmount > 0 ? remainingAmount : (totalNetAmount > 0 ? totalNetAmount : 500000);

  // Mandiri payment states
  let mandiriCategory = 'SPP_MANDIRI';
  let mandiriCategoryLabel = 'Tabungan / Pembayaran Mandiri SPP Kuliah';
  let mandiriAmount = 500000;

  // Generate dynamic QRIS SVG payload
  function getQrisSvg(amount, refId = 'INV') {
    const qrisPayload = `00020101021226600016ID.CO.QRIS.WWW01189360098800000000000215ID1020268809123520454995303360540${amount}5802ID5918STIT IHSANUL FIKRI6008MAGELANG61055610062${refId}6304`;
    return generateQRCodeSVG(qrisPayload, 175);
  }

  container.innerHTML = `
    <!-- Top Bar: Account Switcher & Quick Actions -->
    <div class="glass-panel" style="border-radius: var(--radius-xl); padding: 14px 22px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 20px rgba(15,23,42,0.06); border: 1px solid rgba(255,255,255,0.8);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 42px; height: 42px; border-radius: var(--radius-full); background: linear-gradient(135deg, #1e40af, #0284c7); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: 0 2px 8px rgba(37,99,235,0.35);">
          👨‍🎓
        </div>
        <div>
          <div style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <span class="pulsing-dot pulsing-dot-green"></span> <span>Akun Mahasiswa Aktif:</span>
          </div>
          <div style="font-size: 0.95rem; font-weight: 900; color: var(--text-dark); margin-top: 1px;">
            ${currentStudent.name} &bull; <span style="font-family: var(--font-mono); color: var(--primary-700); font-weight: 800;">${currentStudent.nim}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 6px; background: #ffffff; padding: 4px 8px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-xs);">
          <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">Ganti Mahasiswa:</span>
          <select class="filter-select" id="select-active-student" style="padding: 6px 12px; font-size: 0.8rem; border-radius: var(--radius-md); border-color: #cbd5e1; font-weight: 700;">
            ${state.students.map(s => {
              const sch = state.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
              return `<option value="${s.nim}" ${s.nim === currentStudent.nim ? 'selected' : ''}>
                ${s.name} (${s.prodi} - Sem ${s.semester} | ${sch ? sch.name.split('(')[0] : 'Reguler'})
              </option>`;
            }).join('')}
          </select>
          <button class="btn btn-primary btn-sm btn-shimmer" id="btn-quick-add-student-top" style="font-size: 0.76rem; font-weight: 800; padding: 6px 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border: none; border-radius: var(--radius-md); display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(37,99,235,0.3); white-space: nowrap; cursor: pointer;" title="Tambah / Buat Akun Mahasiswa Baru">
            <span>➕</span> <span>Buat Akun</span>
          </button>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-self-edit-profile-top" style="color: #1e40af; border-color: #93c5fd; background: #eff6ff; font-weight: 800; display: flex; align-items: center; gap: 4px; padding: 7px 12px;">
          👤 Edit Profil Saya
        </button>
        <button class="btn btn-outline btn-sm btn-shimmer" id="btn-topbar-register-student" style="color: #1d4ed8; border-color: #93c5fd; background: linear-gradient(135deg, #eff6ff, #dbeafe); font-weight: 800; display: inline-flex; align-items: center; gap: 4px; padding: 7px 12px; box-shadow: 0 1px 3px rgba(37,99,235,0.12);" title="Buat / Registrasi Akun Mahasiswa Baru">
          ✨ Buat Akun Baru
        </button>
        <button class="btn btn-outline btn-sm" id="btn-goto-login-view" style="color: var(--primary-700); font-weight: 700; padding: 7px 12px;">
          🔑 Halaman Login
        </button>
        <button class="btn btn-outline btn-sm" id="btn-student-logout" style="border-color: #fca5a5; color: #b91c1c; background: #fff1f2; font-weight: 700; padding: 7px 12px;">
          🚪 Keluar / Logout
        </button>
      </div>
    </div>

    <!-- PMB / New Student Self-Registration VIP Banner -->
    <div class="vip-register-card" style="padding: 16px 22px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
          ✨
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.95rem; font-weight: 900; color: #1e3a8a;">Pendaftaran / Registrasi Akun Mahasiswa Baru (PMB)</span>
            <span class="badge" style="background: #2563eb; color: #ffffff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;">T.A. 2026/2027</span>
          </div>
          <div style="font-size: 0.76rem; color: #1e40af; margin-top: 2px;">
            Daftar akun mandiri dalam 1 menit: dapatkan <strong>Nomor Virtual Account BSI</strong>, klaim beasiswa santri/mitra, dan akses KRS otomatis.
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-primary btn-sm btn-shimmer" id="btn-banner-register-student" style="font-weight: 900; font-size: 0.84rem; padding: 10px 20px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border: none; border-radius: var(--radius-lg); box-shadow: 0 4px 12px rgba(37,99,235,0.35); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;">
        <span>📝</span> <span>Buat Akun Mahasiswa Baru Sekarang ➔</span>
      </button>
    </div>

    <!-- 1. Warm Islamic Welcome Hero Banner -->
    <div class="student-welcome-hero" style="background: linear-gradient(135deg, #092540 0%, #0f3d63 40%, #064e3b 100%); border-radius: var(--radius-2xl); padding: 26px 30px; margin-bottom: 24px; box-shadow: 0 15px 35px -5px rgba(9, 37, 64, 0.4); position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);">
      
      <!-- Subtle Decorative Halo Glow -->
      <div style="position: absolute; right: -50px; top: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%); filter: blur(30px); pointer-events: none;"></div>

      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 72px; height: 72px; border-radius: var(--radius-full); background: rgba(255, 255, 255, 0.2); border: 3px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center; font-size: 1.85rem; font-weight: 900; box-shadow: 0 8px 20px rgba(0,0,0,0.25); flex-shrink: 0; position: relative;">
            ${currentStudent.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            <span class="pulsing-dot pulsing-dot-green" style="position: absolute; bottom: 2px; right: 2px; border: 2px solid #092540;" title="Mahasiswa Aktif"></span>
          </div>
          <div>
            <div style="font-size: 0.76rem; color: #a7f3d0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px;">
              Assalamu'alaikum Warahmatullahi Wabarakatuh
            </div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <h2 style="font-size: 1.55rem; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.3px;">
                ${currentStudent.name}
              </h2>
              <button class="btn btn-sm" id="btn-hero-edit-profile" style="background: rgba(255, 255, 255, 0.22); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.45); font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; backdrop-filter: blur(6px); transition: all 0.2s;" title="Sunting Biodata Profil">
                ✏️ Edit Biodata
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #e2e8f0; margin-top: 6px; flex-wrap: wrap;">
              <span style="background: rgba(255,255,255,0.18); padding: 3px 10px; border-radius: 6px; font-family: var(--font-mono); font-weight: 700; border: 1px solid rgba(255,255,255,0.2);">NIM: ${currentStudent.nim}</span>
              <span>&bull;</span>
              <span>Prodi: <strong>${currentStudent.prodi === 'BKPI' ? 'Bimbingan Konseling Pendidikan Islam (BKPI)' : 'Pendidikan Islam Anak Usia Dini (PIAUD)'}</strong></span>
              <span>&bull;</span>
              <span>Semester: <strong>${currentStudent.semester}</strong> (${currentStudent.statusAkademik})</span>
            </div>
          </div>
        </div>

        <div style="text-align: right; background: rgba(255, 255, 255, 0.14); padding: 16px 22px; border-radius: var(--radius-xl); border: 1px solid rgba(255, 255, 255, 0.25); backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
          <div style="font-size: 0.72rem; color: #a7f3d0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px;">Skema Pembiayaan Mahasiswa</div>
          <div style="font-size: 1.12rem; font-weight: 900; color: #ffffff; margin-top: 3px;">
            ${scholarship.name}
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; margin-top: 3px; font-weight: 600;">
            ${scholarship.id === 'REGULER' ? 'Pembayaran Penuh Mandiri' : `Mendapat Subsidi: ${scholarship.discountType === 'PERCENT' ? scholarship.discountValue + '% Biaya SPP' : formatRupiah(scholarship.discountValue)}`}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Quick Summary Stat Cards -->
    <div class="student-summary-grid">
      <div class="student-stat-card interactive-hover-card" style="box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-radius: var(--radius-xl);">
        <div class="student-stat-icon" style="background: ${isLunas ? '#dcfce7' : isPending ? '#fef3c7' : isCicil ? '#e0f2fe' : '#fee2e2'}; color: ${isLunas ? '#15803d' : isPending ? '#b45309' : isCicil ? '#0369a1' : '#b91c1c'}; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
          ${isLunas ? '✅' : isPending ? '⏳' : isCicil ? '🔄' : '💳'}
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;">Status Semester ${state.activeSemester}</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin-top: 2px;">
            ${currentInvoice ? getStatusBadge(currentInvoice.status) : '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800;">Bebas Mandiri</span>'}
          </div>
        </div>
      </div>

      <div class="student-stat-card interactive-hover-card" style="box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-radius: var(--radius-xl);">
        <div class="student-stat-icon" style="background: #eff6ff; color: #1d4ed8; box-shadow: 0 2px 6px rgba(37,99,235,0.15);">
          💰
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;">
            ${isCicil ? 'Sisa Tagihan Berjalan' : 'Kewajiban Tagihan'}
          </div>
          <div style="font-size: 1.2rem; font-weight: 900; color: ${isLunas ? '#15803d' : '#1e3a8a'}; font-family: var(--font-mono); margin-top: 2px;">
            ${currentInvoice ? formatRupiah(isLunas ? currentInvoice.netAmount : remainingAmount) : 'Rp 0'}
          </div>
          ${isCicil ? `<div style="font-size:0.68rem; color:#0369a1; font-weight:700;">Telah dibayar: ${formatRupiah(totalPaidAmount)}</div>` : ''}
        </div>
      </div>

      <div class="student-stat-card interactive-hover-card" style="box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-radius: var(--radius-xl);">
        <div class="student-stat-icon" style="background: #f0fdf4; color: #059669; box-shadow: 0 2px 6px rgba(16,185,129,0.15);">
          🎁
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;">Subsidi Beasiswa Hemat</div>
          <div style="font-size: 1.2rem; font-weight: 900; color: #059669; font-family: var(--font-mono); margin-top: 2px;">
            ${currentInvoice && currentInvoice.totalDiscount > 0 ? `-${formatRupiah(currentInvoice.totalDiscount)}` : formatRupiah(0)}
          </div>
        </div>
      </div>

      <div class="student-stat-card interactive-hover-card" style="box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-radius: var(--radius-xl);">
        <div class="student-stat-icon" style="background: #fdf4ff; color: #a21caf; box-shadow: 0 2px 6px rgba(168,85,247,0.15);">
          🧾
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;">Kwitansi Sah Digital</div>
          <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin-top: 2px;">
            ${isLunas || (isCicil && currentInvoice.receiptNumber) ? `<span style="color:#059669; font-weight:800; font-family:var(--font-mono);">${currentInvoice.receiptNumber}</span>` : '<span style="color:var(--text-light); font-size:0.78rem;">Tersedia Saat Bayar</span>'}
          </div>
        </div>
      </div>
    </div>

    <!-- Kalender Akademik & Jadwal Penting Banner -->
    <div style="margin-bottom: 22px; padding: 14px 18px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac; border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: var(--shadow-sm); flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 38px; height: 38px; border-radius: var(--radius-full); background: #059669; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 2px 6px rgba(5,150,105,0.3);">
          📅
        </div>
        <div>
          <div style="font-size: 0.84rem; font-weight: 800; color: #065f46;">Kalender Akademik & Jadwal Perkuliahan</div>
          <div style="font-size: 0.74rem; color: #047857;">Periksa jadwal penting registrasi ulang, pengisian KRS online, ujian UTS/UAS, dan wisuda sarjana.</div>
        </div>
      </div>
      <button type="button" id="btn-quick-open-calendar" class="btn btn-sm" style="background: #059669; color: #ffffff; font-weight: 800; font-size: 0.75rem; border: none; box-shadow: var(--shadow-sm); cursor: pointer; padding: 6px 14px; border-radius: var(--radius-md); white-space: nowrap;">
        Buka Kalender Akademik ➔
      </button>
    </div>

    <!-- 3. Navigation Mode Switcher -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
      ${currentInvoice && !isLunas ? `
        <button class="btn btn-primary" id="btn-mode-invoice" style="font-weight: 800; display: flex; align-items: center; gap: 8px;">
          📋 Bayar Tagihan Semester ${state.activeSemester}
        </button>
      ` : ''}
      <button class="btn ${currentInvoice && !isLunas ? 'btn-outline' : 'btn-primary'}" id="btn-mode-mandiri" style="font-weight: 800; display: flex; align-items: center; gap: 8px;">
        💳 Bayar Mandiri Bebas (Tanpa Tagihan)
      </button>
    </div>

    <!-- SECTION A: INVOICE-BASED PAYMENT WITH FREE NOMINAL CHOICE -->
    ${currentInvoice ? `
      <div id="section-invoice-payment" class="card" style="margin-bottom: 28px; box-shadow: var(--shadow-md); ${currentInvoice && !isLunas ? '' : 'display: none;'}">
        
        <!-- Header Tagihan -->
        <div class="card-header" style="flex-wrap: wrap; gap: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 16px;">
          <div class="card-title-group">
            <h3 class="card-title" style="font-size: 1.12rem; font-weight: 800; margin: 0;">📋 Tagihan Kuliah Semester ${state.activeSemester} (Tahun Akademik 2026/2027)</h3>
            <p class="card-subtitle" style="margin-top: 4px;">
              Nomor Referensi: <strong style="font-family:var(--font-mono); color:var(--primary-700);">${currentInvoice.id}</strong> &bull; 
              Batas Jatuh Tempo: <strong style="color: #b91c1c;">${formatDate(currentInvoice.dueDate)}</strong>
            </p>
          </div>
          <div>
            ${getStatusBadge(currentInvoice.status)}
          </div>
        </div>

        <!-- Line Item Breakdown Card -->
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
                ${item.discount > 0 ? `<div style="font-size: 0.74rem; color: #0284c7; font-weight: 600; margin-top: 1px;">✨ Potongan Beasiswa: -${formatRupiah(item.discount)}</div>` : ''}
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
              <div style="font-size: 0.72rem; color: var(--text-muted);">Sudah termasuk seluruh komponen SPP & subsidi beasiswa</div>
            </div>
            <span style="font-size: 1.55rem; font-weight: 900; color: var(--primary-900); font-family: var(--font-mono);">${formatRupiah(currentInvoice.netAmount)}</span>
          </div>

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
          <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fde68a; border-radius: var(--radius-xl); padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-top: 20px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 18px;">
              <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: #f59e0b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.35); flex-shrink: 0;">
                ⏳
              </div>
              <div>
                <h4 style="font-size: 1.12rem; font-weight: 900; color: #78350f; margin: 0;">Bukti Transfer Sedang Diverifikasi oleh Bendahara</h4>
                <p style="font-size: 0.82rem; color: #92400e; margin: 4px 0 0;">Anda telah mengunggah bukti pembayaran manual ke Bank BSI (1056405743). Tim keuangan sedang memvalidasi mutasi kas.</p>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" id="btn-refresh-portal" style="font-weight: 700; border-color: #f59e0b; color: #b45309; background: #ffffff;">
                🔄 Cek Status Terbaru
              </button>
            </div>
          </div>
        ` : `
          <!-- KONDISI BELUM LUNAS: PILIH NOMINAL BEBAS TANPA PAKSAAN -->
          <div style="margin-top: 28px;">
            
            <!-- LANGKAH 1: KETENTUAN NOMINAL FLEKSIBEL -->
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: var(--radius-xl); padding: 22px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <h4 style="font-size: 1rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                    Langkah 1: Tentukan Nominal yang Ingin Dibayarkan (Bebas & Fleksibel)
                  </h4>
                  <p style="font-size: 0.78rem; color: var(--text-light); margin: 2px 0 0;">
                    Mahasiswa bebas memilih pelunasan penuh, persentase angsuran, atau mengetik nominal kustom berapapun tanpa batasan yang memaksa.
                  </p>
                </div>
                <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:800; font-size:0.74rem;">✨ Tanpa Paksaan</span>
              </div>

              <!-- Pilihan Cepat Persentase & Nominal -->
              <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-dark); margin-bottom: 8px; text-transform: uppercase;">
                Pilihan Cepat Nominal:
              </div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                <button type="button" class="btn btn-sm btn-invoice-nominal-preset active" data-amount="${remainingAmount}" style="background: #eff6ff; border: 2px solid var(--primary-700); color: #1e40af; font-family: var(--font-mono); font-weight: 900;">
                  ✨ Lunas Penuh (100%): ${formatRupiah(remainingAmount)}
                </button>
                <button type="button" class="btn btn-outline btn-sm btn-invoice-nominal-preset" data-amount="${pct50}" style="font-family: var(--font-mono); font-weight: 700;">
                  Termin (50%): ${formatRupiah(pct50)}
                </button>
                <button type="button" class="btn btn-outline btn-sm btn-invoice-nominal-preset" data-amount="${pct25}" style="font-family: var(--font-mono); font-weight: 700;">
                  Termin (25%): ${formatRupiah(pct25)}
                </button>
                <button type="button" class="btn btn-outline btn-sm btn-invoice-nominal-preset" data-amount="500000" style="font-family: var(--font-mono); font-weight: 700;">
                  Rp 500.000
                </button>
                <button type="button" class="btn btn-outline btn-sm btn-invoice-nominal-preset" data-amount="1000000" style="font-family: var(--font-mono); font-weight: 700;">
                  Rp 1.000.000
                </button>
              </div>

              <!-- Input Bebas Nominal Kustom -->
              <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: var(--radius-lg); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                <div style="flex: 1; min-width: 240px;">
                  <label class="form-label" style="font-weight: 800; font-size: 0.82rem; color: var(--text-dark); margin-bottom: 4px;">
                    Atau Ketik Nominal Bebas Sesuai Kemampuan Anda (Rp):
                  </label>
                  <div style="position: relative;">
                    <span style="position: absolute; left: 12px; top: 10px; font-weight: 900; color: #64748b; font-family: var(--font-mono);">Rp</span>
                    <input type="number" class="form-control" id="input-invoice-custom-amount" value="${remainingAmount}" min="1000" step="10000" style="padding-left: 38px; font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a;">
                  </div>
                </div>
                <div style="text-align: right; background: #ffffff; padding: 10px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-light); min-width: 200px;">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Sisa Tagihan Setelah Bayar:</div>
                  <div style="font-size: 1.15rem; font-weight: 900; font-family: var(--font-mono); color: #b91c1c;" id="display-remaining-after-pay">
                    Rp 0 (LUNAS)
                  </div>
                </div>
              </div>
            </div>

            <!-- LANGKAH 2: PILIH SALURAN PEMBAYARAN -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                  Langkah 2: Saluran Pembayaran Resmi
                </h4>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 2px 0 0;">
                  Pilih QRIS, BSI Virtual Account, atau Transfer Bank BSI:
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

            <!-- TAB 1: QRIS PAYMENT -->
            <div id="tab-content-qris">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: center; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-2xl); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
                
                <div style="text-align: center; background: #fafafa; border: 2px solid #e2e8f0; border-radius: var(--radius-xl); padding: 20px 16px; max-width: 320px; margin: 0 auto; box-shadow: var(--shadow-sm);">
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

                  <div id="qris-svg-wrapper" style="display: inline-block; padding: 8px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-lg); box-shadow: var(--shadow-xs);">
                    ${getQrisSvg(selectedPayAmount, currentInvoice.id)}
                  </div>

                  <div style="margin-top: 12px; font-size: 0.74rem; color: #334155;">
                    Nominal Terkunci Otomatis:
                  </div>
                  <div style="font-size: 1.25rem; font-weight: 900; color: #dc2626; font-family: var(--font-mono); margin: 2px 0 6px;" id="qris-amount-display">
                    ${formatRupiah(selectedPayAmount)}
                  </div>
                  <div style="font-size: 0.68rem; color: #64748b;">
                    Mahasiswa: <strong>${currentStudent.name.toUpperCase()}</strong>
                  </div>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.3rem;">📱</span>
                    <h5 style="font-size: 0.98rem; font-weight: 900; color: var(--text-dark); margin: 0;">
                      Cara Cepat Bayar Pakai QRIS
                    </h5>
                  </div>
                  
                  <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
                    Buka aplikasi dompet digital atau Mobile Banking apa saja (BSI Mobile, BCA, Livin Mandiri, GoPay, OVO, ShopeePay, DANA) lalu scan kode QR di samping.
                  </p>

                  <button class="btn btn-primary btn-lg" id="btn-pay-qris-instant" data-invoice-id="${currentInvoice.id}" style="width: 100%; font-weight: 900; background: linear-gradient(135deg, #dc2626, #991b1b); border: none; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
                    ⚡ Simulasikan Scan QRIS & Bayar Berhasil
                  </button>
                </div>

              </div>
            </div>

            <!-- TAB 2: BSI VIRTUAL ACCOUNT -->
            <div id="tab-content-va" style="display: none;">
              <div class="va-box" style="background: linear-gradient(135deg, #0f766e 0%, #064e3b 100%); border-radius: var(--radius-xl); padding: 24px; color: #ffffff; box-shadow: var(--shadow-md); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.8rem;">🌙</span>
                    <div>
                      <div style="font-size: 1.15rem; font-weight: 900; color: #ffffff;">Bank Syariah Indonesia (BSI)</div>
                      <div style="font-size: 0.74rem; color: #a7f3d0;">Layanan Virtual Account Resmi STIT Ihsanul Fikri</div>
                    </div>
                  </div>
                  <span style="background: rgba(255,255,255,0.25); color: #ffffff; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; font-weight: 800;">
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

                <div style="font-size: 0.78rem; color: #e6fffa;">
                  Atas Nama: <strong style="color: #ffffff; text-decoration: underline;">STIT IHSANUL FIKRI - ${currentStudent.name.toUpperCase()}</strong>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap; background: #f0fdf4; padding: 16px 20px; border-radius: var(--radius-xl); border: 1.5px solid #86efac; margin-bottom: 20px;">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 900; color: #14532d;">Simulasi Pembayaran BSI Virtual Account:</div>
                  <div style="font-size: 0.76rem; color: #166534;">Simulasikan transaksi sukses dari BSI Mobile / ATM</div>
                </div>
                <button class="btn btn-primary btn-lg" id="btn-pay-va-instant" data-invoice-id="${currentInvoice.id}" style="background: linear-gradient(135deg, #059669, #047857); font-weight: 900; border: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                  ⚡ Simulasikan Pembayaran BSI VA Berhasil
                </button>
              </div>
            </div>

            <!-- TAB 3: TRANSFER BSI MANUAL -->
            <div id="tab-content-manual" style="display: none;">
              <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 18px;">
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

                <form id="form-manual-transfer">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">Bank Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-bank" required value="Bank BSI">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nama Pemilik Rekening <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-name" required value="${currentStudent.name.toUpperCase()}">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nomor Rekening Pengirim <span class="required">*</span></label>
                      <input type="text" class="form-control" id="manual-sender-acc" required value="1056405743">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nominal Transfer (Rp) <span class="required">*</span></label>
                      <input type="number" class="form-control" id="manual-transfer-amount" required value="${selectedPayAmount}">
                    </div>
                  </div>

                  <div class="form-group" style="margin-top: 14px;">
                    <label class="form-label">Foto Bukti Transfer M-Banking / Struk <span class="required">*</span></label>
                    <div class="upload-dropzone" id="manual-dropzone">
                      <div class="upload-icon">📷</div>
                      <div style="font-size: 0.86rem; font-weight: 800; color: var(--text-dark);">Klik atau Tarik Foto Bukti Transfer Disini</div>
                      <input type="file" id="manual-file-input" accept="image/*" style="display: none;">
                      <div class="upload-preview-container" id="manual-preview-wrapper" style="display: none; margin-top: 12px;">
                        <img id="manual-img-preview" class="upload-preview-img" alt="Preview Bukti Bayar">
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
                    <button type="submit" class="btn btn-primary btn-lg" style="font-weight: 800; background: linear-gradient(135deg, #16a34a, #059669); border: none;">
                      📤 Kirim Bukti Transfer Untuk Diverifikasi Bendahara
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        `}
      </div>
    ` : ''}

    <!-- SECTION B: PEMBAYARAN MANDIRI BEBAS (CUSTOM SELF-SERVICE PAYMENT) -->
    <div id="section-mandiri-payment" class="card" style="margin-bottom: 28px; box-shadow: var(--shadow-md); ${currentInvoice && !isLunas ? 'display: none;' : ''}">
      <div class="card-header" style="flex-wrap: wrap; gap: 14px; border-bottom: 1px solid var(--border-light); padding-bottom: 16px;">
        <div class="card-title-group">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">💳</span>
            <h3 class="card-title" style="font-size: 1.15rem; font-weight: 900; margin: 0; color: var(--text-dark);">
              Layanan Pembayaran Mandiri Bebas (Tanpa Tagihan)
            </h3>
          </div>
          <p class="card-subtitle" style="margin-top: 4px;">
            Mahasiswa dapat melakukan pembayaran mandiri, angsuran fleksibel, uang muka SPP semester depan, atau infaq tanpa harus menunggu penerbitan tagihan dari bendahara.
          </p>
        </div>
        <span class="badge badge-success" style="font-size: 0.74rem;">Mandiri 24/7 Realtime</span>
      </div>

      <div style="margin-top: 20px;">
        
        <!-- Langkah 1: Pilih Peruntukan Pembayaran -->
        <div style="background: #f8fafc; border: 1.5px solid var(--border-light); border-radius: var(--radius-xl); padding: 20px; margin-bottom: 20px;">
          <label class="form-label" style="font-weight: 800; font-size: 0.88rem; color: var(--text-dark); margin-bottom: 10px; display: block;">
            1. Pilih Jenis / Peruntukan Pembayaran Mandiri:
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
            <button type="button" class="btn-mandiri-category active" data-cat="SPP_MANDIRI" data-label="Tabungan / Pembayaran Mandiri SPP Kuliah" style="background: #eff6ff; border: 2px solid var(--primary-700); color: #1e40af; padding: 12px 14px; border-radius: var(--radius-lg); text-align: left; cursor: pointer;">
              <div style="font-size: 1.2rem; margin-bottom: 4px;">🎓</div>
              <div style="font-weight: 800; font-size: 0.84rem;">SPP / Biaya Kuliah</div>
              <div style="font-size: 0.7rem; color: #3b82f6;">Tabungan / Cicilan Mandiri</div>
            </button>
            
            <button type="button" class="btn-mandiri-category" data-cat="HEREGISTRASI" data-label="Heregistrasi / Daftar Ulang Mandiri" style="background: #ffffff; border: 1.5px solid var(--border-light); color: var(--text-dark); padding: 12px 14px; border-radius: var(--radius-lg); text-align: left; cursor: pointer;">
              <div style="font-size: 1.2rem; margin-bottom: 4px;">📝</div>
              <div style="font-weight: 800; font-size: 0.84rem;">Heregistrasi Semester</div>
              <div style="font-size: 0.7rem; color: var(--text-light);">Daftar ulang semester baru</div>
            </button>

            <button type="button" class="btn-mandiri-category" data-cat="UJIAN_SKRIPSI" data-label="Biaya Ujian / Munaqosyah / Tugas Akhir" style="background: #ffffff; border: 1.5px solid var(--border-light); color: var(--text-dark); padding: 12px 14px; border-radius: var(--radius-lg); text-align: left; cursor: pointer;">
              <div style="font-size: 1.2rem; margin-bottom: 4px;">📚</div>
              <div style="font-weight: 800; font-size: 0.84rem;">Ujian / Skripsi / Wisuda</div>
              <div style="font-size: 0.7rem; color: var(--text-light);">Ujian proposal & munaqosyah</div>
            </button>

            <button type="button" class="btn-mandiri-category" data-cat="INFAQ_KAMPUS" data-label="Infaq & Wakaf Pendidikan STIT-IF" style="background: #ffffff; border: 1.5px solid var(--border-light); color: var(--text-dark); padding: 12px 14px; border-radius: var(--radius-lg); text-align: left; cursor: pointer;">
              <div style="font-size: 1.2rem; margin-bottom: 4px;">🕌</div>
              <div style="font-weight: 800; font-size: 0.84rem;">Infaq & Wakaf Kampus</div>
              <div style="font-size: 0.7rem; color: var(--text-light);">Pembangunan & dakwah kampus</div>
            </button>
          </div>
        </div>

        <!-- Langkah 2: Masukkan Nominal Pembayaran Bebas -->
        <div style="background: #ffffff; border: 1.5px solid var(--border-light); border-radius: var(--radius-xl); padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <label class="form-label" style="font-weight: 800; font-size: 0.88rem; color: var(--text-dark); margin: 0;">
              2. Tentukan Nominal Pembayaran yang Ingin Dibayarkan (Bebas):
            </label>
            <span class="badge badge-success" style="font-size: 0.72rem;">Fleksibel Tanpa Batas Minimal</span>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset" data-amount="100000" style="font-family: var(--font-mono); font-weight: 700;">Rp 100.000</button>
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset" data-amount="250000" style="font-family: var(--font-mono); font-weight: 700;">Rp 250.000</button>
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset active" data-amount="500000" style="font-family: var(--font-mono); font-weight: 800; background: #e0f2fe; border-color: #0284c7; color: #0369a1;">Rp 500.000</button>
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset" data-amount="1000000" style="font-family: var(--font-mono); font-weight: 700;">Rp 1.000.000</button>
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset" data-amount="1500000" style="font-family: var(--font-mono); font-weight: 700;">Rp 1.500.000</button>
            <button type="button" class="btn btn-outline btn-sm btn-mandiri-preset" data-amount="2500000" style="font-family: var(--font-mono); font-weight: 700;">Rp 2.500.000</button>
          </div>

          <div class="form-group" style="max-width: 400px;">
            <label class="form-label">Atau Ketik Nominal Bebas Sesuai Keinginan (Rp):</label>
            <div style="position: relative;">
              <span style="position: absolute; left: 12px; top: 10px; font-weight: 900; color: #64748b; font-family: var(--font-mono);">Rp</span>
              <input type="number" class="form-control" id="input-mandiri-custom-amount" value="500000" min="1000" step="10000" style="padding-left: 38px; font-size: 1.25rem; font-weight: 900; font-family: var(--font-mono); color: var(--primary-900);">
            </div>
          </div>
        </div>

        <!-- Langkah 3: Pilih Saluran Bayar Mandiri (QRIS, BSI VA 1056405743, Transfer BSI) -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <h4 style="font-size: 0.95rem; font-weight: 900; color: var(--text-dark); margin: 0;">
              3. Saluran Pembayaran Mandiri Resmi STIT-IF
            </h4>
            <div style="background: #f0fdf4; padding: 4px 12px; border-radius: var(--radius-md); border: 1px solid #bbf7d0; font-size: 0.78rem; font-weight: 800; color: #166534;">
              Nominal Terpilih: <span style="font-family: var(--font-mono); color: #15803d; font-size: 0.92rem;" id="mandiri-target-badge">Rp 500.000</span>
            </div>
          </div>

          <!-- Tabs Mandiri -->
          <div class="tabs-container" style="margin-bottom: 20px;">
            <button class="tab-nav-btn active" id="tab-mandiri-btn-qris">
              🔴 QRIS Mandiri (Scan Semua Dompet / M-Banking)
            </button>
            <button class="tab-nav-btn" id="tab-mandiri-btn-va">
              🌙 BSI Virtual Account (1056405743)
            </button>
            <button class="tab-nav-btn" id="tab-mandiri-btn-manual">
              🏦 Transfer Bank BSI Manual
            </button>
          </div>

          <!-- TAB MANDIRI 1: QRIS -->
          <div id="tab-mandiri-content-qris">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: center; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-2xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="text-align: center; background: #fafafa; border: 2px solid #e2e8f0; border-radius: var(--radius-xl); padding: 20px 16px; max-width: 320px; margin: 0 auto;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #dc2626; padding-bottom: 8px; margin-bottom: 12px;">
                  <div style="font-weight: 900; font-size: 1.25rem; color: #dc2626;">QRIS</div>
                  <div style="font-size: 0.65rem; color: #64748b; text-align: right;">PEMBAYARAN MANDIRI<br><strong>STIT IHSANUL FIKRI</strong></div>
                </div>
                <div style="font-size: 0.86rem; font-weight: 900; color: #0f172a;" id="mandiri-qris-cat-display">Tabungan / SPP Mandiri</div>
                <div style="font-size: 0.68rem; color: #64748b; font-family: var(--font-mono); margin-bottom: 10px;">NMID: ID102026880912</div>
                
                <div id="mandiri-qris-svg-wrapper" style="display: inline-block; padding: 8px; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-lg);">
                  ${getQrisSvg(mandiriAmount, 'MND')}
                </div>

                <div style="margin-top: 10px; font-size: 0.72rem; color: #334155;">Nominal QRIS Mandiri:</div>
                <div style="font-size: 1.3rem; font-weight: 900; color: #dc2626; font-family: var(--font-mono);" id="mandiri-qris-amount-display">
                  ${formatRupiah(mandiriAmount)}
                </div>
              </div>

              <div>
                <h5 style="font-size: 0.98rem; font-weight: 900; color: var(--text-dark); margin: 0 0 8px;">
                  Scan & Bayar Mandiri Secara Instan
                </h5>
                <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
                  Setelah scan berhasil, sistem akan otomatis mencatatkan pembayaran Anda dan langsung menerbitkan <strong>Kwitansi Resmi Digital ber-QR Code</strong>.
                </p>
                <button class="btn btn-primary btn-lg" id="btn-pay-mandiri-qris" style="width: 100%; font-weight: 900; background: linear-gradient(135deg, #dc2626, #991b1b); border: none; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
                  ⚡ Simulasikan Scan QRIS Mandiri & Terbitkan Kwitansi
                </button>
              </div>
            </div>
          </div>

          <!-- TAB MANDIRI 2: BSI VA 1056405743 -->
          <div id="tab-mandiri-content-va" style="display: none;">
            <div class="va-box" style="background: linear-gradient(135deg, #0f766e 0%, #064e3b 100%); border-radius: var(--radius-xl); padding: 24px; color: #ffffff; margin-bottom: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 14px;">
                <div style="font-size: 1.1rem; font-weight: 900;">Bank Syariah Indonesia (BSI) VA Mandiri</div>
                <span style="background: rgba(255,255,255,0.25); font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: 800;">REALTIME 24/7</span>
              </div>
              <div style="font-size: 0.76rem; color: #a7f3d0; text-transform: uppercase;">Nomor VA Bank BSI:</div>
              <div class="va-number-display" style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 12px 18px; border-radius: var(--radius-lg); margin: 6px 0 12px; flex-wrap: wrap; gap: 8px;">
                <span style="font-size: 1.7rem; font-weight: 900; font-family: var(--font-mono); color: #fef08a;">1056405743</span>
                <button class="copy-va-btn" id="btn-copy-mandiri-va" style="background: #fef08a; color: #713f12; font-weight: 900; padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer;">📋 Salin No. VA</button>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.12); padding: 10px 14px; border-radius: 8px;">
                <div>
                  <div style="font-size: 0.7rem; color: #a7f3d0;">Nominal Transfer Mandiri:</div>
                  <div style="font-size: 1.15rem; font-weight: 900; font-family: var(--font-mono); color: #ffffff;" id="mandiri-va-amount-display">${formatRupiah(mandiriAmount)}</div>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-lg" id="btn-pay-mandiri-va" style="width: 100%; font-weight: 900; background: linear-gradient(135deg, #059669, #047857); border: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
              ⚡ Simulasikan Bayar Mandiri via BSI VA & Terbitkan Kwitansi
            </button>
          </div>

          <!-- TAB MANDIRI 3: TRANSFER BSI MANUAL -->
          <div id="tab-mandiri-content-manual" style="display: none;">
            <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 24px;">
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1.5px solid #86efac; border-radius: var(--radius-xl); padding: 16px 20px; margin-bottom: 16px;">
                <div style="font-size: 0.74rem; color: #166534; font-weight: 800;">BANK SYARIAH INDONESIA (BSI)</div>
                <div style="font-size: 1.5rem; font-weight: 900; font-family: var(--font-mono); color: #0f172a; margin: 4px 0;">1056405743</div>
                <div style="font-size: 0.78rem; color: #166534;">a.n. <strong>STIT IHSANUL FIKRI</strong></div>
              </div>

              <form id="form-mandiri-manual">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Bank Pengirim Asal <span class="required">*</span></label>
                    <input type="text" class="form-control" id="mandiri-sender-bank" required value="Bank BSI">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nama Pemilik Rekening <span class="required">*</span></label>
                    <input type="text" class="form-control" id="mandiri-sender-name" required value="${currentStudent.name.toUpperCase()}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nomor Rekening Pengirim <span class="required">*</span></label>
                    <input type="text" class="form-control" id="mandiri-sender-acc" required value="1056405743">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nominal Ditransfer (Rp) <span class="required">*</span></label>
                    <input type="number" class="form-control" id="mandiri-transfer-amount-input" required value="${mandiriAmount}">
                  </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label class="form-label">Unggah Foto Struk / Screenshot Transfer Mandiri <span class="required">*</span></label>
                  <div class="upload-dropzone" id="mandiri-dropzone">
                    <div class="upload-icon">📷</div>
                    <div style="font-size: 0.86rem; font-weight: 800; color: var(--text-dark);">Klik atau Tarik Foto Bukti Transfer Disini</div>
                    <input type="file" id="mandiri-file-input" accept="image/*" style="display: none;">
                    <div class="upload-preview-container" id="mandiri-preview-wrapper" style="display: none; margin-top: 12px;">
                      <img id="mandiri-img-preview" class="upload-preview-img" alt="Preview Bukti Bayar">
                    </div>
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
                  <button type="submit" class="btn btn-primary btn-lg" style="font-weight: 800; background: linear-gradient(135deg, #16a34a, #059669); border: none;">
                    📤 Kirim Bukti Transfer Mandiri Untuk Diverifikasi
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- 4. Histori Transaksi Pembayaran Mahasiswa -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title-group">
          <h3 class="card-title" style="font-size: 1.05rem; font-weight: 800;">📜 Riwayat Pembayaran & Kwitansi Seluruh Semester</h3>
          <p class="card-subtitle">Semua catatan tagihan semester dan pembayaran mandiri Anda di STIT Ihsanul Fikri</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>No. Transaksi / Invoice</th>
              <th>Semester / Keterangan</th>
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
                <td>
                  <strong style="color: var(--text-dark);">${inv.items && inv.items[0] ? inv.items[0].name : `Semester ${inv.semester}`}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${inv.semester}</div>
                </td>
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
                  <div>Belum ada riwayat transaksi pembayaran.</div>
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
        <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" class="btn btn-outline btn-sm btn-shimmer" style="border-color: #059669; color: #065f46; background: #ecfdf5; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
          🌐 Website Kampus (stitihsanulfikri.ac.id) ↗
        </a>
        <a href="https://wa.me/6282342307414?text=Assalamu'alaikum%20Admin%20Keuangan%20STIT-IF,%20saya%20${encodeURIComponent(currentStudent.name)}%20(NIM:%20${currentStudent.nim})%20ingin%20bertanya%20mengenai%20pembayaran." target="_blank" class="btn btn-primary btn-sm btn-shimmer" style="background: #059669; border: none; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; box-shadow: 0 2px 6px rgba(5,150,105,0.25);">
          📱 Hubungi WhatsApp Admin (082342307414)
        </a>
      </div>
    </div>
  `;

  // Attach Event Listeners
  // Quick open academic calendar
  const btnOpenCal = container.querySelector('#btn-quick-open-calendar');
  if (btnOpenCal) {
    btnOpenCal.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-kalender');
    });
  }

  // 1. Switch Student demo
  const selectStudent = container.querySelector('#select-active-student');
  if (selectStudent) {
    selectStudent.addEventListener('change', (e) => {
      const newNim = e.target.value;
      appState.setRole('MAHASISWA', newNim);
      renderMahasiswaPortal(container);
    });
  }

  // Student Self-Profile Edit Handlers
  const btnEditProfileTop = container.querySelector('#btn-self-edit-profile-top');
  if (btnEditProfileTop) {
    btnEditProfileTop.addEventListener('click', () => {
      if (window.simpelModals && window.simpelModals.openStudentSelfProfileModal) {
        window.simpelModals.openStudentSelfProfileModal(currentStudent.nim);
      }
    });
  }

  const btnHeroEditProfile = container.querySelector('#btn-hero-edit-profile');
  if (btnHeroEditProfile) {
    btnHeroEditProfile.addEventListener('click', () => {
      if (window.simpelModals && window.simpelModals.openStudentSelfProfileModal) {
        window.simpelModals.openStudentSelfProfileModal(currentStudent.nim);
      }
    });
  }

  const btnGotoLogin = container.querySelector('#btn-goto-login-view');
  if (btnGotoLogin) {
    btnGotoLogin.addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-login');
    });
  }

  const btnTopbarRegister = container.querySelector('#btn-topbar-register-student');
  if (btnTopbarRegister) {
    btnTopbarRegister.addEventListener('click', () => {
      if (window.simpelModals && window.simpelModals.openStudentRegistrationModal) {
        window.simpelModals.openStudentRegistrationModal();
      }
    });
  }

  const btnQuickAddTop = container.querySelector('#btn-quick-add-student-top');
  if (btnQuickAddTop) {
    btnQuickAddTop.addEventListener('click', () => {
      if (window.simpelModals && window.simpelModals.openStudentRegistrationModal) {
        window.simpelModals.openStudentRegistrationModal();
      }
    });
  }

  const btnBannerRegister = container.querySelector('#btn-banner-register-student');
  if (btnBannerRegister) {
    btnBannerRegister.addEventListener('click', () => {
      if (window.simpelModals && window.simpelModals.openStudentRegistrationModal) {
        window.simpelModals.openStudentRegistrationModal();
      }
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

  // 2. Mode Toggle: Tagihan Semester vs Mandiri Bebas
  const btnModeInvoice = container.querySelector('#btn-mode-invoice');
  const btnModeMandiri = container.querySelector('#btn-mode-mandiri');
  const sectionInvoice = container.querySelector('#section-invoice-payment');
  const sectionMandiri = container.querySelector('#section-mandiri-payment');

  if (btnModeInvoice && btnModeMandiri) {
    btnModeInvoice.addEventListener('click', () => {
      btnModeInvoice.className = 'btn btn-primary';
      btnModeMandiri.className = 'btn btn-outline';
      if (sectionInvoice) sectionInvoice.style.display = 'block';
      if (sectionMandiri) sectionMandiri.style.display = 'none';
    });

    btnModeMandiri.addEventListener('click', () => {
      btnModeMandiri.className = 'btn btn-primary';
      btnModeInvoice.className = 'btn btn-outline';
      if (sectionInvoice) sectionInvoice.style.display = 'none';
      if (sectionMandiri) sectionMandiri.style.display = 'block';
    });
  }

  // 3. Invoice Flexible Nominal Selector
  const qrisSvgWrapper = container.querySelector('#qris-svg-wrapper');
  const qrisAmountDisplay = container.querySelector('#qris-amount-display');
  const vaAmountText = container.querySelector('#va-amount-text');
  const activePayBadge = container.querySelector('#active-pay-target-badge');
  const manualAmountInput = container.querySelector('#manual-transfer-amount');
  const inputInvoiceCustom = container.querySelector('#input-invoice-custom-amount');
  const displayRemainingAfterPay = container.querySelector('#display-remaining-after-pay');

  function updateInvoicePayAmount(amount) {
    selectedPayAmount = Number(amount) || 0;
    
    if (inputInvoiceCustom && Number(inputInvoiceCustom.value) !== selectedPayAmount) {
      inputInvoiceCustom.value = selectedPayAmount;
    }
    if (manualAmountInput) manualAmountInput.value = selectedPayAmount;
    if (activePayBadge) activePayBadge.textContent = formatRupiah(selectedPayAmount);
    if (qrisAmountDisplay) qrisAmountDisplay.textContent = formatRupiah(selectedPayAmount);
    if (vaAmountText) vaAmountText.textContent = formatRupiah(selectedPayAmount);
    
    if (currentInvoice && qrisSvgWrapper) {
      qrisSvgWrapper.innerHTML = getQrisSvg(selectedPayAmount, currentInvoice.id);
    }

    if (displayRemainingAfterPay) {
      const left = Math.max(0, remainingAmount - selectedPayAmount);
      if (left <= 0) {
        displayRemainingAfterPay.textContent = 'Rp 0 (LUNAS)';
        displayRemainingAfterPay.style.color = '#15803d';
      } else {
        displayRemainingAfterPay.textContent = `${formatRupiah(left)} (Sisa)`;
        displayRemainingAfterPay.style.color = '#b91c1c';
      }
    }
  }

  container.querySelectorAll('.btn-invoice-nominal-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-invoice-nominal-preset').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-main)';
      });
      btn.classList.add('active');
      btn.style.background = '#eff6ff';
      btn.style.borderColor = 'var(--primary-700)';
      btn.style.color = '#1e40af';

      const amt = Number(btn.getAttribute('data-amount'));
      updateInvoicePayAmount(amt);
    });
  });

  if (inputInvoiceCustom) {
    inputInvoiceCustom.addEventListener('input', (e) => {
      container.querySelectorAll('.btn-invoice-nominal-preset').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-main)';
      });
      const amt = Number(e.target.value);
      if (amt >= 0) updateInvoicePayAmount(amt);
    });
  }

  // 4. Invoice Tabs Switcher (QRIS vs VA vs Manual)
  const tabBtnQris = container.querySelector('#tab-btn-qris');
  const tabBtnVa = container.querySelector('#tab-btn-va');
  const tabBtnManual = container.querySelector('#tab-btn-manual');

  const tabContentQris = container.querySelector('#tab-content-qris');
  const tabContentVa = container.querySelector('#tab-content-va');
  const tabContentManual = container.querySelector('#tab-content-manual');

  function setInvoicePaymentTab(tabName) {
    [tabBtnQris, tabBtnVa, tabBtnManual].forEach(b => { if (b) b.classList.remove('active'); });
    [tabContentQris, tabContentVa, tabContentManual].forEach(c => { if (c) c.style.display = 'none'; });

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

  if (tabBtnQris) tabBtnQris.addEventListener('click', () => setInvoicePaymentTab('qris'));
  if (tabBtnVa) tabBtnVa.addEventListener('click', () => setInvoicePaymentTab('va'));
  if (tabBtnManual) tabBtnManual.addEventListener('click', () => setInvoicePaymentTab('manual'));

  // 5. QRIS Instant Invoice Payment
  const btnPayQris = container.querySelector('#btn-pay-qris-instant');
  if (btnPayQris && currentInvoice) {
    btnPayQris.addEventListener('click', () => {
      const invId = btnPayQris.getAttribute('data-invoice-id');
      const res = BillingEngine.processQRISPayment(invId, selectedPayAmount, selectedPayAmount >= remainingAmount ? 'FULL' : 'CUSTOM');
      if (res.success) {
        window.simpelToast.show(
          res.isFullyPaid ? 'Pembayaran QRIS Lunas!' : 'Pembayaran Angsuran QRIS Berhasil!',
          `Nominal: ${formatRupiah(res.paidAmount)} diterima. No. Kwitansi: ${res.receiptNumber}`,
          'success',
          5000
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(invId);
      }
    });
  }

  function copyToClipboardSafe(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }

  // 6. Copy Buttons
  const btnCopyVa = container.querySelector('#btn-copy-va');
  if (btnCopyVa) {
    btnCopyVa.addEventListener('click', () => {
      copyToClipboardSafe('1056405743');
      btnCopyVa.textContent = '✓ Disalin';
      setTimeout(() => btnCopyVa.textContent = '📋 Salin No. VA BSI', 2000);
      window.simpelToast.show('Nomor BSI VA Disalin', 'Nomor BSI Virtual Account (1056405743) disalin ke clipboard.', 'info');
    });
  }

  const btnCopyAmount = container.querySelector('#btn-copy-amount');
  if (btnCopyAmount) {
    btnCopyAmount.addEventListener('click', () => {
      copyToClipboardSafe(selectedPayAmount.toString());
      btnCopyAmount.textContent = '✓ Disalin';
      setTimeout(() => btnCopyAmount.textContent = '📋 Salin Nominal', 2000);
      window.simpelToast.show('Nominal Disalin', `Nominal ${formatRupiah(selectedPayAmount)} disalin ke clipboard.`, 'info');
    });
  }

  container.querySelectorAll('.btn-copy-rek').forEach(btn => {
    btn.addEventListener('click', () => {
      const rek = btn.getAttribute('data-rek') || '1056405743';
      copyToClipboardSafe(rek);
      btn.textContent = '✓ Disalin';
      setTimeout(() => btn.textContent = '📋 Salin No. Rekening BSI', 2000);
      window.simpelToast.show('Nomor Rekening Disalin', `No. Rekening BSI (${rek}) disalin ke clipboard.`, 'info');
    });
  });

  // 7. Pay Instant VA invoice simulation
  const btnPayVa = container.querySelector('#btn-pay-va-instant');
  if (btnPayVa && currentInvoice) {
    btnPayVa.addEventListener('click', () => {
      const invId = btnPayVa.getAttribute('data-invoice-id');
      const res = BillingEngine.processVAPayment(invId, 'Bank Syariah Indonesia (BSI)', selectedPayAmount, selectedPayAmount >= remainingAmount ? 'FULL' : 'CUSTOM');
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

  // 8. Manual Invoice Upload File handling
  const dropzone = container.querySelector('#manual-dropzone');
  const fileInput = container.querySelector('#manual-file-input');
  const previewWrapper = container.querySelector('#manual-preview-wrapper');
  const imgPreview = container.querySelector('#manual-img-preview');
  let selectedImageData = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          selectedImageData = evt.target.result;
          if (imgPreview) imgPreview.src = selectedImageData;
          if (previewWrapper) previewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

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
        planType: selectedPayAmount >= remainingAmount ? 'FULL' : 'CUSTOM'
      });

      if (res.success) {
        window.simpelToast.show(
          'Bukti Transfer Terkirim',
          `Bukti pembayaran ${formatRupiah(amount)} ke Bank BSI (1056405743) berhasil masuk antrean verifikasi Bendahara.`,
          'success'
        );
        renderMahasiswaPortal(container);
      }
    });
  }

  // ==========================================
  // MANDIRI PAYMENT HANDLERS (BEBAS TAGIHAN)
  // ==========================================
  const mandiriQrisSvgWrapper = container.querySelector('#mandiri-qris-svg-wrapper');
  const mandiriQrisAmountDisplay = container.querySelector('#mandiri-qris-amount-display');
  const mandiriVaAmountDisplay = container.querySelector('#mandiri-va-amount-display');
  const mandiriTargetBadge = container.querySelector('#mandiri-target-badge');
  const mandiriCustomInput = container.querySelector('#input-mandiri-custom-amount');
  const mandiriTransferInput = container.querySelector('#mandiri-transfer-amount-input');
  const mandiriQrisCatDisplay = container.querySelector('#mandiri-qris-cat-display');

  function updateMandiriAmount(amt) {
    mandiriAmount = Number(amt) || 0;
    if (mandiriCustomInput && Number(mandiriCustomInput.value) !== mandiriAmount) {
      mandiriCustomInput.value = mandiriAmount;
    }
    if (mandiriTransferInput) mandiriTransferInput.value = mandiriAmount;
    if (mandiriTargetBadge) mandiriTargetBadge.textContent = formatRupiah(mandiriAmount);
    if (mandiriQrisAmountDisplay) mandiriQrisAmountDisplay.textContent = formatRupiah(mandiriAmount);
    if (mandiriVaAmountDisplay) mandiriVaAmountDisplay.textContent = formatRupiah(mandiriAmount);
    if (mandiriQrisSvgWrapper) mandiriQrisSvgWrapper.innerHTML = getQrisSvg(mandiriAmount, 'MND');
  }

  // Category selectors
  container.querySelectorAll('.btn-mandiri-category').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-mandiri-category').forEach(b => {
        b.style.background = '#ffffff';
        b.style.borderColor = 'var(--border-light)';
        b.style.color = 'var(--text-dark)';
      });
      btn.style.background = '#eff6ff';
      btn.style.borderColor = 'var(--primary-700)';
      btn.style.color = '#1e40af';

      mandiriCategory = btn.getAttribute('data-cat');
      mandiriCategoryLabel = btn.getAttribute('data-label');
      if (mandiriQrisCatDisplay) mandiriQrisCatDisplay.textContent = mandiriCategoryLabel;
    });
  });

  // Preset amount selectors
  container.querySelectorAll('.btn-mandiri-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-mandiri-preset').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-main)';
      });
      btn.classList.add('active');
      btn.style.background = '#e0f2fe';
      btn.style.borderColor = '#0284c7';
      btn.style.color = '#0369a1';

      const amt = Number(btn.getAttribute('data-amount'));
      updateMandiriAmount(amt);
    });
  });

  if (mandiriCustomInput) {
    mandiriCustomInput.addEventListener('input', (e) => {
      container.querySelectorAll('.btn-mandiri-preset').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-main)';
      });
      const amt = Number(e.target.value);
      if (amt >= 0) updateMandiriAmount(amt);
    });
  }

  // Mandiri Tabs
  const tabMandiriBtnQris = container.querySelector('#tab-mandiri-btn-qris');
  const tabMandiriBtnVa = container.querySelector('#tab-mandiri-btn-va');
  const tabMandiriBtnManual = container.querySelector('#tab-mandiri-btn-manual');

  const tabMandiriContentQris = container.querySelector('#tab-mandiri-content-qris');
  const tabMandiriContentVa = container.querySelector('#tab-mandiri-content-va');
  const tabMandiriContentManual = container.querySelector('#tab-mandiri-content-manual');

  function setMandiriTab(tabName) {
    [tabMandiriBtnQris, tabMandiriBtnVa, tabMandiriBtnManual].forEach(b => { if (b) b.classList.remove('active'); });
    [tabMandiriContentQris, tabMandiriContentVa, tabMandiriContentManual].forEach(c => { if (c) c.style.display = 'none'; });

    if (tabName === 'qris') {
      if (tabMandiriBtnQris) tabMandiriBtnQris.classList.add('active');
      if (tabMandiriContentQris) tabMandiriContentQris.style.display = 'block';
    } else if (tabName === 'va') {
      if (tabMandiriBtnVa) tabMandiriBtnVa.classList.add('active');
      if (tabMandiriContentVa) tabMandiriContentVa.style.display = 'block';
    } else {
      if (tabMandiriBtnManual) tabMandiriBtnManual.classList.add('active');
      if (tabMandiriContentManual) tabMandiriContentManual.style.display = 'block';
    }
  }

  if (tabMandiriBtnQris) tabMandiriBtnQris.addEventListener('click', () => setMandiriTab('qris'));
  if (tabMandiriBtnVa) tabMandiriBtnVa.addEventListener('click', () => setMandiriTab('va'));
  if (tabMandiriBtnManual) tabMandiriBtnManual.addEventListener('click', () => setMandiriTab('manual'));

  // Pay Mandiri QRIS
  const btnPayMandiriQris = container.querySelector('#btn-pay-mandiri-qris');
  if (btnPayMandiriQris) {
    btnPayMandiriQris.addEventListener('click', () => {
      const res = BillingEngine.processMandiriPayment({
        studentNim: currentStudent.nim,
        categoryName: mandiriCategory,
        categoryLabel: mandiriCategoryLabel,
        amount: mandiriAmount,
        paymentChannel: 'QRIS',
        notes: `Pembayaran Mandiri via QRIS Dinamis`
      });

      if (res.success) {
        window.simpelToast.show(
          'Pembayaran Mandiri Berhasil!',
          `Nominal ${formatRupiah(mandiriAmount)} telah tervalidasi. No. Kwitansi: ${res.receiptNumber}`,
          'success',
          5000
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(res.invoice.id);
      }
    });
  }

  // Copy Mandiri VA
  const btnCopyMandiriVa = container.querySelector('#btn-copy-mandiri-va');
  if (btnCopyMandiriVa) {
    btnCopyMandiriVa.addEventListener('click', () => {
      copyToClipboardSafe('1056405743');
      btnCopyMandiriVa.textContent = '✓ Disalin';
      setTimeout(() => btnCopyMandiriVa.textContent = '📋 Salin No. VA', 2000);
      window.simpelToast.show('Nomor BSI VA Disalin', 'Nomor BSI Virtual Account (1056405743) disalin.', 'info');
    });
  }

  // Pay Mandiri VA
  const btnPayMandiriVa = container.querySelector('#btn-pay-mandiri-va');
  if (btnPayMandiriVa) {
    btnPayMandiriVa.addEventListener('click', () => {
      const res = BillingEngine.processMandiriPayment({
        studentNim: currentStudent.nim,
        categoryName: mandiriCategory,
        categoryLabel: mandiriCategoryLabel,
        amount: mandiriAmount,
        paymentChannel: 'VA_BSI',
        notes: `Pembayaran Mandiri via Bank BSI Virtual Account`
      });

      if (res.success) {
        window.simpelToast.show(
          'Pembayaran Mandiri Berhasil!',
          `Nominal ${formatRupiah(mandiriAmount)} diterima via BSI VA (1056405743). No. Kwitansi: ${res.receiptNumber}`,
          'success',
          5000
        );
        renderMahasiswaPortal(container);
        window.simpelModals.openReceiptModal(res.invoice.id);
      }
    });
  }

  // Mandiri Manual Upload
  const mandiriDropzone = container.querySelector('#mandiri-dropzone');
  const mandiriFileInput = container.querySelector('#mandiri-file-input');
  const mandiriPreviewWrapper = container.querySelector('#mandiri-preview-wrapper');
  const mandiriImgPreview = container.querySelector('#mandiri-img-preview');
  let mandiriSelectedImageData = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';

  if (mandiriDropzone && mandiriFileInput) {
    mandiriDropzone.addEventListener('click', (e) => {
      if (e.target !== mandiriFileInput) mandiriFileInput.click();
    });
    mandiriFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          mandiriSelectedImageData = evt.target.result;
          if (mandiriImgPreview) mandiriImgPreview.src = mandiriSelectedImageData;
          if (mandiriPreviewWrapper) mandiriPreviewWrapper.style.display = 'block';
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  const formMandiriManual = container.querySelector('#form-mandiri-manual');
  if (formMandiriManual) {
    formMandiriManual.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderBank = container.querySelector('#mandiri-sender-bank').value;
      const senderName = container.querySelector('#mandiri-sender-name').value;
      const senderAcc = container.querySelector('#mandiri-sender-acc').value;
      const amount = Number(container.querySelector('#mandiri-transfer-amount-input').value);

      const res = BillingEngine.processMandiriPayment({
        studentNim: currentStudent.nim,
        categoryName: mandiriCategory,
        categoryLabel: mandiriCategoryLabel,
        amount,
        paymentChannel: 'TRANSFER_MANUAL',
        senderData: {
          senderBank,
          senderAccountName: senderName,
          senderAccountNumber: senderAcc,
          proofImage: mandiriSelectedImageData
        },
        notes: `Transfer Manual Bank BSI Mandiri`
      });

      if (res.success) {
        window.simpelToast.show(
          'Bukti Transfer Mandiri Terkirim',
          `Bukti pembayaran mandiri ${formatRupiah(amount)} berhasil dikirim ke antrean verifikasi Bendahara.`,
          'success'
        );
        renderMahasiswaPortal(container);
      }
    });
  }

  // View Receipt buttons
  container.querySelectorAll('.btn-view-my-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const invId = btn.getAttribute('data-invoice-id');
      window.simpelModals.openReceiptModal(invId);
    });
  });
}
