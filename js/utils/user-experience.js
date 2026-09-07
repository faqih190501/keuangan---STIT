/**
 * SIMPEL-IF User Experience & Accessibility Enhancer
 * STIT Ihsanul Fikri
 * Features:
 * 1. Global Spotlight Command Palette (Ctrl+K / ⌘K)
 * 2. Interactive Help Hub & Quick Start Guide (Panduan Interaktif Mahasiswa & Admin)
 * 3. Mobile Bottom Navigation Bar (Ergonomic Thumb Access)
 * 4. Universal 1-Click Copy with Tooltip Feedback
 * 5. Global Keyboard Shortcuts Listener (?, Esc, Alt+1..8)
 * 6. Accessibility & Font Size / Contrast Scaler
 * 7. Quick Notification Center Dropdown
 */

import { appState } from '../state.js';
import { AuthManager, ROLE_PERMISSIONS } from '../auth.js';
import { ModalManager } from '../modals.js';
import { formatRupiah, formatDate, getProdiBadge, getScholarshipBadge, getStatusBadge } from './formatters.js';

export class UserExperienceHelper {
  static init() {
    this.injectSpotlightModal();
    this.injectHelpCenterWidget();
    this.injectMobileBottomNav();
    this.bindGlobalKeyboardShortcuts();
    this.bindCopyButtons();
    this.bindNotificationBell();
    this.restoreAccessibilitySettings();
    window.simpelUX = this;
    window.simpelCopy = (text, label) => this.copyToClipboard(text, label);
  }

  /**
   * 1. Universal Copy to Clipboard with Feedback
   */
  static copyToClipboard(text, label = 'Teks') {
    if (!text) return;
    const cleanText = text.toString().trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanText).then(() => {
        if (window.simpelToast) {
          window.simpelToast.show('Berhasil Disalin ✅', `${label} "${cleanText}" telah disalin ke papan klip.`, 'success', 2500);
        }
      }).catch(() => {
        this.fallbackCopy(cleanText, label);
      });
    } else {
      this.fallbackCopy(cleanText, label);
    }
  }

  static fallbackCopy(text, label) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (window.simpelToast) {
        window.simpelToast.show('Berhasil Disalin ✅', `${label} berhasil disalin ke papan klip.`, 'success', 2500);
      }
    } catch (e) {
      prompt(`Salin ${label} secara manual:`, text);
    }
    document.body.removeChild(textArea);
  }

  /**
   * Attach click-to-copy handlers to any element with [data-copy]
   */
  static bindCopyButtons(root = document) {
    root.querySelectorAll('[data-copy]').forEach(el => {
      if (el.dataset.copyBound) return;
      el.dataset.copyBound = 'true';
      el.style.cursor = 'pointer';
      el.title = el.title || 'Klik untuk menyalin';

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const copyVal = el.getAttribute('data-copy');
        const copyLabel = el.getAttribute('data-copy-label') || 'Data';
        this.copyToClipboard(copyVal, copyLabel);

        // Micro visual pulse
        el.classList.add('copy-success-pulse');
        setTimeout(() => el.classList.remove('copy-success-pulse'), 800);
      });
    });
  }

  /**
   * 2. Global Spotlight Command Palette (Ctrl+K)
   */
  static injectSpotlightModal() {
    if (document.getElementById('simpel-spotlight-modal')) return;

    const spotlightOverlay = document.createElement('div');
    spotlightOverlay.id = 'simpel-spotlight-modal';
    spotlightOverlay.className = 'spotlight-overlay';
    spotlightOverlay.innerHTML = `
      <div class="spotlight-card">
        <div class="spotlight-search-header">
          <span class="spotlight-icon">🔍</span>
          <input type="text" id="spotlight-input" class="spotlight-input" placeholder="Cari halaman, mahasiswa, aksi cepat, atau ketik bantuan... (tekan ↑↓ lalu Enter)" autocomplete="off">
          <button id="spotlight-close-btn" class="spotlight-close-btn" title="Tutup (Esc)">✕</button>
        </div>
        <div class="spotlight-quick-tags" id="spotlight-quick-tags">
          <button class="spotlight-tag-btn" data-filter="PAGE">📄 Halaman</button>
          <button class="spotlight-tag-btn" data-filter="STUDENT">🎓 Mahasiswa</button>
          <button class="spotlight-tag-btn" data-filter="ACTION">⚡ Aksi Cepat</button>
          <button class="spotlight-tag-btn" data-filter="HELP">💡 Bantuan</button>
        </div>
        <div class="spotlight-results" id="spotlight-results">
          <!-- Dynamically populated -->
        </div>
        <div class="spotlight-footer">
          <div class="spotlight-hint"><span>Navigasi:</span> <kbd>↑</kbd> <kbd>↓</kbd> <span>Pilih:</span> <kbd>Enter</kbd> <span>Tutup:</span> <kbd>Esc</kbd></div>
          <div class="spotlight-brand">SIMPEL-IF STIT Ihsanul Fikri</div>
        </div>
      </div>
    `;

    document.body.appendChild(spotlightOverlay);

    const input = document.getElementById('spotlight-input');
    const closeBtn = document.getElementById('spotlight-close-btn');
    const resultsContainer = document.getElementById('spotlight-results');

    // Close on overlay click
    spotlightOverlay.addEventListener('click', (e) => {
      if (e.target === spotlightOverlay) this.closeSpotlight();
    });

    closeBtn.addEventListener('click', () => this.closeSpotlight());

    // Search typing listener
    input.addEventListener('input', () => {
      this.renderSpotlightResults(input.value.trim());
    });

    // Tag buttons
    spotlightOverlay.querySelectorAll('.spotlight-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        spotlightOverlay.querySelectorAll('.spotlight-tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderSpotlightResults(input.value.trim(), filter);
      });
    });

    // Keyboard navigation within spotlight
    input.addEventListener('keydown', (e) => {
      const items = Array.from(resultsContainer.querySelectorAll('.spotlight-item'));
      let currentIndex = items.findIndex(item => item.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          if (currentIndex >= 0) items[currentIndex].classList.remove('active');
          items[currentIndex + 1].classList.add('active');
          items[currentIndex + 1].scrollIntoView({ block: 'nearest' });
        } else if (items.length > 0) {
          if (currentIndex >= 0) items[currentIndex].classList.remove('active');
          items[0].classList.add('active');
          items[0].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex].classList.remove('active');
          items[currentIndex - 1].classList.add('active');
          items[currentIndex - 1].scrollIntoView({ block: 'nearest' });
        } else if (items.length > 0) {
          if (currentIndex >= 0) items[currentIndex].classList.remove('active');
          items[items.length - 1].classList.add('active');
          items[items.length - 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = items.find(i => i.classList.contains('active')) || items[0];
        if (activeItem) {
          activeItem.click();
        }
      } else if (e.key === 'Escape') {
        this.closeSpotlight();
      }
    });

    // Topbar search button listener
    const topSearchBtn = document.getElementById('btn-spotlight-search');
    if (topSearchBtn) {
      topSearchBtn.addEventListener('click', () => this.openSpotlight());
    }
  }

  static openSpotlight() {
    const modal = document.getElementById('simpel-spotlight-modal');
    if (!modal) return;
    modal.classList.add('active');
    const input = document.getElementById('spotlight-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.renderSpotlightResults('');
  }

  static closeSpotlight() {
    const modal = document.getElementById('simpel-spotlight-modal');
    if (modal) modal.classList.remove('active');
  }

  static renderSpotlightResults(query = '', filter = 'ALL') {
    const resultsContainer = document.getElementById('spotlight-results');
    if (!resultsContainer) return;

    const state = appState.getState();
    const currentRole = state.currentRole || 'ADMIN';
    const allowedViews = ROLE_PERMISSIONS[currentRole]?.allowedViews || [];
    const q = query.toLowerCase();

    // Base pages catalog
    const pages = [
      { id: 'dashboard-bendahara', title: 'Dashboard Utama Admin', desc: 'Pusat statistik keuangan, neraca prodi, dan ringkasan tagihan', icon: '👑', type: 'PAGE' },
      { id: 'view-mahasiswa', title: 'Portal Pembayaran Mahasiswa', desc: 'Cek tagihan semester, QRIS dinamis, virtual account BSI, dan bayar cicilan', icon: '🎓', type: 'PAGE' },
      { id: 'view-skema-tarif', title: 'Skema Beasiswa & Tarif Kuliah', desc: 'Atur beasiswa santri, mitra pesantren, PAUD laki-laki, dan rincian tarif', icon: '⚙️', type: 'PAGE' },
      { id: 'view-verifikasi', title: 'Antrean Verifikasi Pembayaran', desc: 'Validasi dan setujui bukti transfer bank manual mahasiswa', icon: '🔍', type: 'PAGE' },
      { id: 'view-akademik', title: 'Master Data Mahasiswa & Prodi', desc: 'Pangkalan data mahasiswa, ubah identitas, reset PIN & ekspor CSV', icon: '📚', type: 'PAGE' },
      { id: 'view-kalender', title: 'Kalender Akademik & Jadwal', desc: 'Jadwal KRS, batas akhir pembayaran UTS/UAS, wisuda, dan her-registrasi', icon: '📅', type: 'PAGE' },
      { id: 'view-laporan', title: 'Rekapitulasi Laporan Keuangan', desc: 'Laporan arus kas, neraca penerimaan prodi BKPI & PIAUD, dan cetak', icon: '📈', type: 'PAGE' },
      { id: 'view-qr-validator', title: 'Validasi QR Kwitansi Resmi', desc: 'Cek keaslian dokumen kwitansi ber-QR Code STIT Ihsanul Fikri', icon: '🛡️', type: 'PAGE' },
      { id: 'view-audit-log', title: 'Audit Trail & Log Transaksi', desc: 'Rekam jejak seluruh aktivitas finansial dan keamanan sistem', icon: '📜', type: 'PAGE' },
      { id: 'view-login', title: 'Portal Login & Pendaftaran', desc: 'Halaman masuk mahasiswa/admin dan registrasi mahasiswa baru (PMB)', icon: '🔑', type: 'PAGE' }
    ];

    // Quick actions catalog
    const actions = [
      { title: 'Buat Akun Mahasiswa Baru (PMB)', desc: 'Buka formulir pendaftaran mahasiswa baru langsung', icon: '✨', action: () => ModalManager.openStudentRegistrationModal(), type: 'ACTION' },
      { title: 'Kelola Akun Admin & Bendahara', desc: 'Tambah atau ubah data login pengelola keuangan', icon: '👥', action: () => ModalManager.openAdminManagementModal(), type: 'ACTION' },
      { title: 'Profil Saya / Ganti Password', desc: 'Edit data profil akun aktif dan ubah password/PIN', icon: '👤', action: () => {
        if (state.currentRole === 'MAHASISWA') {
          ModalManager.openStudentSelfProfileModal(state.currentUser?.nim);
        } else {
          ModalManager.openAdminSelfProfileModal();
        }
      }, type: 'ACTION' },
      { title: 'Sinkronkan Ulang Data Awal', desc: 'Reset dan segarkan data master simulasi ke versi terbaru', icon: '🔄', action: () => {
        if (confirm('Sinkronkan ulang data awal SIMPEL-IF?')) {
          appState.resetAllData();
          if (window.simpelToast) window.simpelToast.show('Data Disinkronkan', 'Data master berhasil diperbarui.', 'success');
          if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
        }
      }, type: 'ACTION' },
      { title: 'Salin Rekening Bank BSI STIT-IF', desc: 'Salin No. Rekening BSI: 1056405743 a.n STIT Ihsanul Fikri', icon: '💳', action: () => this.copyToClipboard('1056405743', 'Rekening BSI'), type: 'ACTION' },
      { title: 'Buka Website Resmi STIT-IF', desc: 'Kunjungi https://www.stitihsanulfikri.ac.id/', icon: '🌐', action: () => window.open('https://www.stitihsanulfikri.ac.id/', '_blank'), type: 'ACTION' },
      { title: 'Bantuan WhatsApp Admin', desc: 'Hubungi hotline admin STIT-IF di 082342307414', icon: '💬', action: () => window.open('https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20SIMPEL-IF', '_blank'), type: 'HELP' },
      { title: 'Panduan Penggunaan Interaktif', desc: 'Buka panduan langkah demi langkah penggunaan SIMPEL-IF', icon: '📖', action: () => this.openHelpCenterModal('PANDUAN'), type: 'HELP' }
    ];

    let items = [];

    // Filter by category if tag selected
    if (filter === 'PAGE' || filter === 'ALL') {
      const filteredPages = pages.filter(p => allowedViews.includes(p.id) && (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)));
      items.push(...filteredPages.map(p => ({
        title: p.title,
        desc: p.desc,
        icon: p.icon,
        category: 'Halaman & Modul',
        action: () => {
          this.closeSpotlight();
          if (window.simpelRouter) window.simpelRouter.navigateTo(p.id);
        }
      })));
    }

    if (filter === 'ACTION' || filter === 'HELP' || filter === 'ALL') {
      const filteredActions = actions.filter(a => (filter === 'ALL' || a.type === filter) && (a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)));
      items.push(...filteredActions.map(a => ({
        title: a.title,
        desc: a.desc,
        icon: a.icon,
        category: a.type === 'HELP' ? 'Bantuan & Dukungan' : 'Tindakan Cepat',
        action: () => {
          this.closeSpotlight();
          a.action();
        }
      })));
    }

    if (filter === 'STUDENT' || filter === 'ALL') {
      const students = state.students || [];
      const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.nim.toLowerCase().includes(q) ||
        s.prodi.toLowerCase().includes(q) ||
        (s.username && s.username.toLowerCase().includes(q))
      ).slice(0, 8); // Top 8 matches

      if (filteredStudents.length > 0) {
        filteredStudents.forEach(s => {
          const sch = (state.scholarshipSchemes || []).find(sc => sc.id === s.scholarshipId);
          items.push({
            title: `${s.name} (${s.nim})`,
            desc: `Prodi ${s.prodi} &bull; Sem ${s.semester} &bull; ${sch ? sch.name.split('(')[0] : 'Reguler'} &bull; WA: ${s.phone || '-'}`,
            icon: '👨‍🎓',
            category: 'Data Mahasiswa',
            action: () => {
              this.closeSpotlight();
              // Switch active student in state and open Mahasiswa portal or Student detail modal
              if (currentRole === 'MAHASISWA') {
                appState.setCurrentStudent(s.nim);
                if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
              } else {
                ModalManager.openStudentEditModal(s.nim);
              }
            }
          });
        });
      }
    }

    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div class="spotlight-empty-state">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🤔</div>
          <div style="font-weight: 800; color: var(--text-dark); font-size: 0.95rem;">Tidak ditemukan hasil untuk "${query}"</div>
          <div style="font-size: 0.78rem; color: var(--text-light); margin-top: 4px;">Coba gunakan kata kunci seperti <em>NIM, Nama Mahasiswa, Laporan, Beasiswa, BSI, atau Kwitansi</em>.</div>
        </div>
      `;
      return;
    }

    let groupedHtml = '';
    let currentCat = '';

    items.forEach((item, idx) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        groupedHtml += `<div class="spotlight-category-header">${currentCat}</div>`;
      }
      groupedHtml += `
        <div class="spotlight-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <div class="spotlight-item-icon">${item.icon}</div>
          <div class="spotlight-item-content">
            <div class="spotlight-item-title">${item.title}</div>
            <div class="spotlight-item-desc">${item.desc}</div>
          </div>
          <div class="spotlight-item-badge">Buka ↵</div>
        </div>
      `;
    });

    resultsContainer.innerHTML = groupedHtml;

    // Attach click listeners to items
    resultsContainer.querySelectorAll('.spotlight-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        if (items[index] && items[index].action) {
          items[index].action();
        }
      });
      el.addEventListener('mouseenter', () => {
        resultsContainer.querySelectorAll('.spotlight-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
      });
    });
  }

  /**
   * 3. Floating Help Hub & Quick Start Guide
   */
  static injectHelpCenterWidget() {
    if (document.getElementById('simpel-floating-help-btn')) return;

    const widget = document.createElement('div');
    widget.id = 'simpel-floating-help-btn';
    widget.className = 'floating-help-widget';
    widget.innerHTML = `
      <button class="floating-help-main-btn" id="btn-floating-help-toggle" title="Pusat Bantuan & Panduan Cepat (Tekan ?)">
        <span class="help-btn-icon">💬</span>
        <span class="help-btn-text">Bantuan</span>
      </button>
    `;

    document.body.appendChild(widget);

    const toggleBtn = document.getElementById('btn-floating-help-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.openHelpCenterModal();
      });
    }
  }

  static openHelpCenterModal(defaultTab = 'PANDUAN') {
    const { overlay, card, title, body, footer } = ModalManager.getModalElements();
    card.classList.add('modal-lg');

    title.innerHTML = `💡 Pusat Bantuan, Panduan & Pintasan SIMPEL-IF`;

    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <!-- Tabs -->
        <div style="display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: var(--radius-lg); margin-bottom: 20px; overflow-x: auto;">
          <button type="button" class="btn btn-sm help-tab-btn ${defaultTab === 'PANDUAN' ? 'active' : ''}" data-tab="tab-panduan" style="flex: 1; font-weight: 800; padding: 8px 14px; border-radius: var(--radius-md); border: none; cursor: pointer;">
            📖 Panduan Mahasiswa
          </button>
          <button type="button" class="btn btn-sm help-tab-btn ${defaultTab === 'ADMIN' ? 'active' : ''}" data-tab="tab-admin" style="flex: 1; font-weight: 800; padding: 8px 14px; border-radius: var(--radius-md); border: none; cursor: pointer;">
            👑 Panduan Admin
          </button>
          <button type="button" class="btn btn-sm help-tab-btn ${defaultTab === 'SHORTCUT' ? 'active' : ''}" data-tab="tab-shortcut" style="flex: 1; font-weight: 800; padding: 8px 14px; border-radius: var(--radius-md); border: none; cursor: pointer;">
            ⌨️ Pintasan Tombol (?)
          </button>
          <button type="button" class="btn btn-sm help-tab-btn ${defaultTab === 'KONTAK' ? 'active' : ''}" data-tab="tab-kontak" style="flex: 1; font-weight: 800; padding: 8px 14px; border-radius: var(--radius-md); border: none; cursor: pointer;">
            📞 Kontak & WhatsApp
          </button>
          <button type="button" class="btn btn-sm help-tab-btn ${defaultTab === 'AKSES' ? 'active' : ''}" data-tab="tab-akses" style="flex: 1; font-weight: 800; padding: 8px 14px; border-radius: var(--radius-md); border: none; cursor: pointer;">
            🔤 Ukuran Huruf & Tema
          </button>
        </div>

        <!-- PANE 1: PANDUAN MAHASISWA -->
        <div id="tab-panduan" class="help-pane" style="display: ${defaultTab === 'PANDUAN' ? 'block' : 'none'};">
          <div style="display: grid; gap: 14px;">
            <div class="user-guide-step-card">
              <div class="guide-step-num">1</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Cek Rincian Tagihan & Potongan Beasiswa</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Buka <strong>Portal Mahasiswa</strong> untuk melihat rincian SPP, DPP, SKS, dan subsidi beasiswa yang telah otomatis terpotong sesuai skema Anda (Santri Asrama, Mitra, atau PAUD Laki-Laki).
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num">2</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Pilih Saluran Pembayaran Bebas</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  SIMPEL-IF mendukung 3 saluran resmi:
                  <br>&bull; <strong>QRIS Dinamis</strong> (Bisa scan via GoPay, OVO, Dana, ShopeePay, BCA, BSI Mobile).
                  <br>&bull; <strong>Virtual Account Bank BSI</strong> (Contoh: <code>900202486209012</code>).
                  <br>&bull; <strong>Transfer Rekening Manual Bank BSI</strong>: <code>1056405743</code> a.n STIT Ihsanul Fikri.
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num">3</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Bebas Tentukan Nominal (Cicilan Fleksibel)</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Anda dapat memilih pembayaran <strong>Lunas Penuh</strong> atau <strong>Cicilan Bebas</strong> (25%, 50%, 75%, atau nominal custom tanpa batas minimal) sesuai kemampuan keuangan.
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num">4</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Unduh Kwitansi Sah Ber-QR Code</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Setelah pembayaran tuntas atau disetujui admin, tombol <strong>Cetak Kwitansi</strong> akan aktif. Kwitansi dilengkapi QR Code resmi yang dapat divalidasi keasliannya kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- PANE 2: PANDUAN ADMIN -->
        <div id="tab-admin" class="help-pane" style="display: ${defaultTab === 'ADMIN' ? 'block' : 'none'};">
          <div style="display: grid; gap: 14px;">
            <div class="user-guide-step-card">
              <div class="guide-step-num" style="background: #1e3a8a;">A</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Pusat Verifikasi Pembayaran Manual</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Buka menu <strong>Antrean Verifikasi</strong> untuk memeriksa bukti transfer yang diunggah mahasiswa. Klik <strong>Setujui & Terbitkan Kwitansi</strong> setelah mencocokkan mutasi rekening bank.
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num" style="background: #1e3a8a;">B</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Kelola Skema Beasiswa & Tarif Kuliah</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Atur besaran SPP, DPP, SKS, dan persentase beasiswa santri asrama (50%), beasiswa mitra (30%), beasiswa PAUD laki-laki (70%), atau buat skema beasiswa baru di menu <strong>Skema Beasiswa & Tarif</strong>.
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num" style="background: #1e3a8a;">C</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Edit Data Mahasiswa & Reset PIN</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Pada menu <strong>Data Mahasiswa & Akademik</strong>, Anda dapat mengubah nama, NIM, username, program studi (BKPI/PIAUD), dan mereset password/PIN akun mahasiswa yang lupa akses.
                </p>
              </div>
            </div>

            <div class="user-guide-step-card">
              <div class="guide-step-num" style="background: #1e3a8a;">D</div>
              <div>
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Ekspor Laporan & Neraca Real-time</h4>
                <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">
                  Seluruh data transaksi dan neraca keuangan dapat diekspor ke format <strong>CSV / Excel</strong> serta dicetak dalam format laporan resmi ber-kop surat kampus.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- PANE 3: SHORTCUTS -->
        <div id="tab-shortcut" class="help-pane" style="display: ${defaultTab === 'SHORTCUT' ? 'block' : 'none'};">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 14px;">
            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">Gunakan tombol pintasan keyboard berikut untuk menavigasi aplikasi lebih cepat dan efisien:</p>
          </div>
          <table class="custom-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th style="width: 160px;">Tombol Pintas</th>
                <th>Fungsi / Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd class="help-kbd">Ctrl + K</kbd> atau <kbd class="help-kbd">⌘ + K</kbd></td>
                <td><strong>Buka Spotlight Command Palette</strong> (Cari menu, mahasiswa, atau aksi cepat)</td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">?</kbd> (Shift + /)</td>
                <td><strong>Buka Pusat Bantuan & Panduan ini</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Esc</kbd></td>
                <td><strong>Tutup Dialog / Modal / Spotlight</strong> yang sedang terbuka</td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 1</kbd></td>
                <td>Pindah ke <strong>Dashboard Admin</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 2</kbd></td>
                <td>Pindah ke <strong>Portal Mahasiswa</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 3</kbd></td>
                <td>Pindah ke <strong>Skema Beasiswa & Tarif</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 4</kbd></td>
                <td>Pindah ke <strong>Antrean Verifikasi</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 5</kbd></td>
                <td>Pindah ke <strong>Data Mahasiswa & Akademik</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 6</kbd></td>
                <td>Pindah ke <strong>Kalender Akademik</strong></td>
              </tr>
              <tr>
                <td><kbd class="help-kbd">Alt + 7</kbd></td>
                <td>Pindah ke <strong>Validasi QR Kwitansi</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PANE 4: KONTAK & WHATSAPP -->
        <div id="tab-kontak" class="help-pane" style="display: ${defaultTab === 'KONTAK' ? 'block' : 'none'};">
          <div style="text-align: center; padding: 18px 12px;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: #dcfce7; color: #15803d; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(34,197,94,0.2);">
              💬
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 900; color: var(--text-dark); margin: 0 0 6px;">Hotline Layanan Mahasiswa & Keuangan STIT-IF</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 20px;">
              Jika Anda mengalami kendala pembayaran, login akun, atau verifikasi beasiswa, silakan hubungi tim administrasi kami melalui saluran resmi berikut:
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; text-align: left; margin-bottom: 20px;">
              <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-lg); padding: 14px 16px;">
                <div style="font-size: 0.74rem; font-weight: 800; color: #166534; text-transform: uppercase;">WhatsApp Bantuan Cepat</div>
                <div style="font-size: 1.1rem; font-weight: 900; color: #15803d; font-family: var(--font-mono); margin: 4px 0;">082342307414</div>
                <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20SIMPEL-IF" target="_blank" rel="noopener" class="btn btn-sm btn-primary" style="background: #16a34a; border: none; width: 100%; margin-top: 8px; font-weight: 800;">
                  Chat WhatsApp Sekarang ↗
                </a>
              </div>

              <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: var(--radius-lg); padding: 14px 16px;">
                <div style="font-size: 0.74rem; font-weight: 800; color: #1e40af; text-transform: uppercase;">Website Resmi Kampus</div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #1e3a8a; margin: 4px 0;">www.stitihsanulfikri.ac.id</div>
                <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="width: 100%; margin-top: 8px; font-weight: 800; color: #1e40af; border-color: #93c5fd; background: #ffffff;">
                  Kunjungi Website ↗
                </a>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); padding: 12px 16px; font-size: 0.78rem; color: var(--text-light); text-align: center;">
              📍 Kampus STIT Ihsanul Fikri: Pabelan 1, Pabelan, Kec. Mungkid, Kabupaten Magelang, Jawa Tengah 56512
            </div>
          </div>
        </div>

        <!-- PANE 5: AKSESIBILITAS & UKURAN TEKS -->
        <div id="tab-akses" class="help-pane" style="display: ${defaultTab === 'AKSES' ? 'block' : 'none'};">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); padding: 16px 18px; margin-bottom: 18px;">
            <h4 style="margin: 0 0 6px; font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">Pilihan Ukuran Teks & Kenyamanan Membaca</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Sesuaikan ukuran font aplikasi untuk meningkatkan kenyamanan pandangan Anda saat mengelola data keuangan:</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px;">
            <button class="btn btn-outline font-size-btn" data-size="default" style="padding: 14px; font-size: 0.88rem; font-weight: 700; text-align: center; border-radius: var(--radius-lg);">
              <span style="font-size: 1.1rem; display: block; margin-bottom: 4px;">🔤</span>
              Standar (100%)
            </button>
            <button class="btn btn-outline font-size-btn" data-size="medium" style="padding: 14px; font-size: 0.96rem; font-weight: 700; text-align: center; border-radius: var(--radius-lg);">
              <span style="font-size: 1.25rem; display: block; margin-bottom: 4px;">🔍</span>
              Nyaman (110%)
            </button>
            <button class="btn btn-outline font-size-btn" data-size="large" style="padding: 14px; font-size: 1.05rem; font-weight: 800; text-align: center; border-radius: var(--radius-lg);">
              <span style="font-size: 1.4rem; display: block; margin-bottom: 4px;">🔎</span>
              Besar (120%)
            </button>
          </div>

          <div style="background: #f1f5f9; border-radius: var(--radius-lg); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-dark);">Mode Kontras Tinggi (High Contrast)</div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">Tingkatkan ketajaman teks dan batas garis elemen.</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-high-contrast">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
        <button class="btn btn-outline btn-sm" id="btn-open-spotlight-from-help" style="font-weight: 700;">
          🔍 Buka Cari Cepat (Ctrl+K)
        </button>
        <button class="btn btn-primary" id="btn-close-help-modal" style="font-weight: 800; padding: 8px 20px;">
          Tutup Panduan
        </button>
      </div>
    `;

    // Tab switching listener
    body.querySelectorAll('.help-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        body.querySelectorAll('.help-tab-btn').forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--text-muted)';
        });
        btn.style.background = '#ffffff';
        btn.style.color = 'var(--primary-800)';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.08)';

        body.querySelectorAll('.help-pane').forEach(p => p.style.display = 'none');
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.style.display = 'block';
      });
    });

    // Font size triggers
    body.querySelectorAll('.font-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size');
        this.setFontSize(size);
        if (window.simpelToast) window.simpelToast.show('Ukuran Font', `Ukuran font diubah ke: ${size.toUpperCase()}`, 'info', 2000);
      });
    });

    // High contrast toggle
    const contrastToggle = body.querySelector('#toggle-high-contrast');
    if (contrastToggle) {
      contrastToggle.checked = document.body.classList.contains('high-contrast-mode');
      contrastToggle.addEventListener('change', (e) => {
        this.setHighContrast(e.target.checked);
      });
    }

    // Modal footer button listeners
    const btnSpotlightFromHelp = footer.querySelector('#btn-open-spotlight-from-help');
    if (btnSpotlightFromHelp) {
      btnSpotlightFromHelp.addEventListener('click', () => {
        ModalManager.closeModal();
        setTimeout(() => this.openSpotlight(), 150);
      });
    }

    const btnClose = footer.querySelector('#btn-close-help-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => ModalManager.closeModal());
    }

    overlay.classList.add('active');
  }

  /**
   * 4. Accessibility Settings
   */
  static setFontSize(size) {
    document.documentElement.classList.remove('font-size-medium', 'font-size-large');
    if (size === 'medium') document.documentElement.classList.add('font-size-medium');
    if (size === 'large') document.documentElement.classList.add('font-size-large');
    localStorage.setItem('simpel_font_size', size);
  }

  static setHighContrast(enabled) {
    if (enabled) {
      document.body.classList.add('high-contrast-mode');
      localStorage.setItem('simpel_high_contrast', 'true');
    } else {
      document.body.classList.remove('high-contrast-mode');
      localStorage.setItem('simpel_high_contrast', 'false');
    }
  }

  static restoreAccessibilitySettings() {
    const savedSize = localStorage.getItem('simpel_font_size');
    if (savedSize) this.setFontSize(savedSize);

    const savedContrast = localStorage.getItem('simpel_high_contrast');
    if (savedContrast === 'true') this.setHighContrast(true);
  }

  /**
   * 5. Mobile Ergonomic Bottom Navigation Bar
   */
  static injectMobileBottomNav() {
    if (document.getElementById('simpel-mobile-bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'simpel-mobile-bottom-nav';
    nav.className = 'mobile-bottom-navbar';
    nav.innerHTML = `
      <a href="javascript:void(0)" class="mobile-nav-btn" data-target="dashboard-bendahara" id="mob-nav-home">
        <span class="mob-icon">📊</span>
        <span class="mob-label">Dashboard</span>
      </a>
      <a href="javascript:void(0)" class="mobile-nav-btn" data-target="view-mahasiswa" id="mob-nav-mhs">
        <span class="mob-icon">🎓</span>
        <span class="mob-label">Mahasiswa</span>
      </a>
      <a href="javascript:void(0)" class="mobile-nav-btn mobile-nav-highlight" id="mob-nav-search" title="Cari Cepat">
        <span class="mob-icon">🔍</span>
        <span class="mob-label">Cari</span>
      </a>
      <a href="javascript:void(0)" class="mobile-nav-btn" id="mob-nav-register" title="Buat Akun">
        <span class="mob-icon">✨</span>
        <span class="mob-label">Daftar</span>
      </a>
      <a href="javascript:void(0)" class="mobile-nav-btn" id="mob-nav-help" title="Bantuan">
        <span class="mob-icon">💬</span>
        <span class="mob-label">Bantuan</span>
      </a>
    `;

    document.body.appendChild(nav);

    // Nav listeners
    nav.querySelector('#mob-nav-home').addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
    });

    nav.querySelector('#mob-nav-mhs').addEventListener('click', () => {
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });

    nav.querySelector('#mob-nav-search').addEventListener('click', () => {
      this.openSpotlight();
    });

    nav.querySelector('#mob-nav-register').addEventListener('click', () => {
      ModalManager.openStudentRegistrationModal();
    });

    nav.querySelector('#mob-nav-help').addEventListener('click', () => {
      this.openHelpCenterModal();
    });
  }

  /**
   * 6. Global Keyboard Shortcuts Listener
   */
  static bindGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in regular input/textarea, except for special shortcuts
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // Ctrl + K or Cmd + K: Open Spotlight
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const spotlight = document.getElementById('simpel-spotlight-modal');
        if (spotlight && spotlight.classList.contains('active')) {
          this.closeSpotlight();
        } else {
          this.openSpotlight();
        }
        return;
      }

      // Escape: Close any active modal / spotlight
      if (e.key === 'Escape') {
        const spotlight = document.getElementById('simpel-spotlight-modal');
        if (spotlight && spotlight.classList.contains('active')) {
          this.closeSpotlight();
          return;
        }
        ModalManager.closeModal();
        return;
      }

      // '?' key (when not inside an input): Open Help Hub
      if (!isInput && e.key === '?') {
        e.preventDefault();
        this.openHelpCenterModal('SHORTCUT');
        return;
      }

      // Alt + 1..8: Quick View Navigation
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const keyMap = {
          '1': 'dashboard-bendahara',
          '2': 'view-mahasiswa',
          '3': 'view-skema-tarif',
          '4': 'view-verifikasi',
          '5': 'view-akademik',
          '6': 'view-kalender',
          '7': 'view-qr-validator',
          '8': 'view-laporan'
        };

        if (keyMap[e.key] && window.simpelRouter) {
          e.preventDefault();
          window.simpelRouter.navigateTo(keyMap[e.key]);
        }
      }
    });
  }

  /**
   * 7. Smart Notification Center Modal
   */
  static bindNotificationBell() {
    const notifBtn = document.getElementById('btn-notifications');
    if (!notifBtn) return;

    notifBtn.addEventListener('click', () => {
      const state = appState.getState();
      const verifs = state.paymentVerifications || [];
      const pending = verifs.filter(v => v.status === 'PENDING');

      const { overlay, card, title, body, footer } = ModalManager.getModalElements();
      card.classList.add('modal-md');

      title.innerHTML = `🔔 Pusat Notifikasi & Pemberitahuan Sistem`;

      if (pending.length === 0) {
        body.innerHTML = `
          <div style="text-align: center; padding: 36px 16px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0 0 4px;">Tidak Ada Antrean Tertunda</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 380px; margin: 0 auto 16px;">
              Semua bukti transfer manual dan pembayaran mahasiswa telah diverifikasi dengan rapi.
            </p>
            <button class="btn btn-outline btn-sm" id="btn-notif-refresh" style="font-weight: 700;">
              🔄 Periksa Ulang Antrean
            </button>
          </div>
        `;
      } else {
        body.innerHTML = `
          <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.82rem; font-weight: 800; color: #b45309;">
              ⚠️ Ada ${pending.length} bukti transfer menunggu verifikasi bendahara
            </span>
          </div>
          <div style="display: grid; gap: 10px; max-height: 360px; overflow-y: auto; padding-right: 4px;">
            ${pending.map(v => {
              const student = (state.students || []).find(s => s.nim === v.studentNim) || { name: 'Mahasiswa' };
              return `
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: var(--radius-lg); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-dark);">${student.name} (${v.studentNim})</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                      Bank ${v.bankPengirim} &bull; ${formatRupiah(v.amount)} &bull; ${formatDate(v.createdAt)}
                    </div>
                  </div>
                  <button class="btn btn-sm btn-primary" style="font-size: 0.74rem; font-weight: 800; padding: 6px 12px;" onclick="window.simpelRouter.navigateTo('view-verifikasi'); window.simpelModals.closeModal();">
                    Periksa &rarr;
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      footer.innerHTML = `
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <button class="btn btn-outline btn-sm" onclick="window.simpelRouter.navigateTo('view-verifikasi'); window.simpelModals.closeModal();">
            Buka Semua Antrean (${verifs.length})
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.simpelModals.closeModal();">
            Tutup
          </button>
        </div>
      `;

      const btnRef = body.querySelector('#btn-notif-refresh');
      if (btnRef) {
        btnRef.addEventListener('click', () => {
          ModalManager.closeModal();
          if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
        });
      }

      overlay.classList.add('active');
    });
  }
}
