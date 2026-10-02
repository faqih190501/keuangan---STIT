/**
 * SIMPEL-IF Main Application Entry Point & Router
 * STIT Ihsanul Fikri
 */

import { appState } from './state.js';
import { AuthManager, ROLE_PERMISSIONS } from './auth.js';
import { ModalManager } from './modals.js';
import { DragScrollHelper } from './utils/drag-scroll.js';
import { UserExperienceHelper } from './utils/user-experience.js';
import { MultiplatformHelper } from './utils/multiplatform.js';
import { ApiClient } from './utils/api-client.js';
import { getHijriDate } from './utils/formatters.js';

import { renderDashboardBendahara } from './views/dashboard-bendahara.js';
import { renderMatriksRekapView } from './views/view-matriks-rekap.js';
import { renderSkemaTarifView } from './views/view-skema-tarif.js';
import { renderVerifikasiView } from './views/view-verifikasi.js';
import { renderMahasiswaPortal } from './views/view-mahasiswa.js';
import { renderAkademikView } from './views/view-akademik.js';
import { renderKalenderView } from './views/view-kalender.js';
import { renderPimpinanView } from './views/view-pimpinan.js';
import { renderLaporanView } from './views/view-laporan.js';
import { renderAuditLogView } from './views/view-audit-log.js';
import { renderQrValidatorView } from './views/view-qr-validator.js';
import { renderLoginView } from './views/view-login.js';

// Toast Notification Manager
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
  }

  show(title, message, type = 'info', duration = 4000) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'danger' ? '❌' : 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Single Page Application Router
class Router {
  constructor() {
    this.currentView = 'view-login';
    this.container = document.getElementById('main-view-container');
    this.pageTitleEl = document.getElementById('page-main-title');
    this.pageBreadcrumbEl = document.getElementById('page-breadcrumb');
    this.verifBadgeEl = document.getElementById('sidebar-verif-badge');
  }

  init() {
    window.simpelRouter = this;
    window.simpelToast = new ToastManager();

    try { ModalManager.init(); } catch (e) { console.warn('[Init] ModalManager warning:', e); }
    try { AuthManager.init(); } catch (e) { console.warn('[Init] AuthManager warning:', e); }
    try { UserExperienceHelper.init(); } catch (e) { console.warn('[Init] UserExperienceHelper warning:', e); }
    try { MultiplatformHelper.init(); } catch (e) { console.warn('[Init] MultiplatformHelper warning:', e); }
    try { ApiClient.init(); } catch (e) { console.warn('[Init] ApiClient warning:', e); }

    // Bind sidebar navigation links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = item.getAttribute('data-view');
        if (targetView) {
          e.preventDefault();
          this.navigateTo(targetView);
        }
      });
    });

    // Database cPanel modal trigger from sidebar
    const navDb = document.getElementById('nav-database-cpanel');
    if (navDb) {
      navDb.addEventListener('click', (e) => {
        e.preventDefault();
        ApiClient.openDatabaseConfigModal();
      });
    }

    // Admin management trigger from sidebar
    const navKelolaAdmin = document.getElementById('nav-kelola-admin');
    if (navKelolaAdmin) {
      navKelolaAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        ModalManager.openAdminManagementModal();
      });
    }

    // Student registration triggers from sidebar & topbar banner
    const navDaftar = document.getElementById('nav-daftar-mahasiswa');
    if (navDaftar) {
      navDaftar.addEventListener('click', (e) => {
        e.preventDefault();
        ModalManager.openStudentRegistrationModal();
      });
    }

    const btnTopRegister = document.getElementById('btn-topbar-register');
    if (btnTopRegister) {
      btnTopRegister.addEventListener('click', () => {
        ModalManager.openStudentRegistrationModal();
      });
    }

    // Mobile sidebar toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });

      // Close sidebar when clicking view content on mobile
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target) && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
        }
      });

      // Mobile close button inside sidebar header
      const mobileCloseBtn = document.getElementById('sidebar-mobile-close-btn');
      if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
        });
      }
    }

    // Sidebar logout button
    const sidebarLogoutBtn = document.getElementById('btn-sidebar-logout');
    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', () => {
        AuthManager.logout();
      });
    }

    // Topbar header logout button
    const topbarLogoutBtn = document.getElementById('btn-topbar-logout');
    if (topbarLogoutBtn) {
      topbarLogoutBtn.addEventListener('click', () => {
        AuthManager.logout();
      });
    }

    // Self-Profile click handler (Sidebar user avatar & Topbar profile button)
    const handleOpenSelfProfile = () => {
      const state = appState.getState();
      if (state.currentRole === 'MAHASISWA') {
        const studentNim = state.currentUser?.nim || (state.students[0] && state.students[0].nim);
        if (studentNim) ModalManager.openStudentSelfProfileModal(studentNim);
      } else {
        ModalManager.openAdminSelfProfileModal();
      }
    };

    const sidebarProfile = document.getElementById('sidebar-user-profile');
    if (sidebarProfile) {
      sidebarProfile.addEventListener('click', handleOpenSelfProfile);
    }

    const topbarProfileBtn = document.getElementById('btn-topbar-profile');
    if (topbarProfileBtn) {
      topbarProfileBtn.addEventListener('click', handleOpenSelfProfile);
    }

    // Sync / Reset Data State button
    const btnSyncState = document.getElementById('btn-sync-reset-state');
    if (btnSyncState) {
      btnSyncState.addEventListener('click', () => {
        if (window.simpelApi) {
          window.simpelApi.syncEverything(true);
        } else {
          appState.resetAllData();
          window.simpelToast.show('Data Disinkronkan', 'Data sistem berhasil diperbarui ke versi mutakhir.', 'success');
          this.refreshCurrentView();
        }
      });
    }

    // Modal close overlay listener
    const modalOverlay = document.getElementById('global-modal-overlay');
    const modalCloseBtn = document.getElementById('global-modal-close');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) ModalManager.closeModal();
      });
    }
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => ModalManager.closeModal());
    }

    // Listen for state changes to update badge counters and auto-synchronize views
    appState.subscribe((state, options = {}) => {
      this.updateBadges();
      AuthManager.renderRoleBar();

      // Auto-synchronize and re-render current view if no modal is actively open and not on login page
      const modalOverlay = document.getElementById('global-modal-overlay');
      const isModalOpen = modalOverlay && modalOverlay.classList.contains('active');

      if (!isModalOpen && this.currentView && this.currentView !== 'view-login' && !options?.silent) {
        this.renderCurrentViewContent(false);
      }
    });

    // Initial View Routing: Default to view-login if unauthenticated
    const hash = window.location.hash.slice(1);
    const hashView = hash.includes('?') ? hash.split('?')[0] : hash;
    let initialView = 'view-login';

    if (appState.isAuthenticated()) {
      const defaultRoleView = ROLE_PERMISSIONS[appState.getState().currentRole]?.defaultView || 'dashboard-bendahara';
      initialView = hashView && hashView !== '' && hashView !== 'view-login' ? hashView : defaultRoleView;
    } else {
      // Unauthenticated: only allow view-qr-validator if accessed directly with receipt token, otherwise default to view-login
      if (hashView === 'view-qr-validator') {
        initialView = 'view-qr-validator';
      } else {
        initialView = 'view-login';
      }
    }

    this.navigateTo(initialView);
    this.updateBadges();

    // Listen to hashchange for browser back/forward buttons and direct bookmark navigation
    window.addEventListener('hashchange', () => {
      const currentHash = window.location.hash.slice(1);
      const cleanHash = currentHash.includes('?') ? currentHash.split('?')[0] : currentHash;
      if (cleanHash && cleanHash !== this.currentView) {
        this.navigateTo(cleanHash);
      }
    });
  }

  updateBadges() {
    const isAuthed = appState.isAuthenticated();
    const state = appState.getState();
    const pendingCount = (state.paymentVerifications || []).filter(v => v.status === 'PENDING').length;
    if (this.verifBadgeEl) {
      this.verifBadgeEl.textContent = pendingCount;
      this.verifBadgeEl.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    // Update notification indicator on header
    const notifDot = document.getElementById('header-notif-indicator');
    if (notifDot) {
      notifDot.style.display = (isAuthed && pendingCount > 0) ? 'block' : 'none';
    }

    // Update sidebar nav items visibility based on authentication and role
    const currentRole = state.currentRole;
    const allowedViews = isAuthed && currentRole ? (ROLE_PERMISSIONS[currentRole]?.allowedViews || []) : [];

    document.querySelectorAll('.nav-item').forEach(item => {
      const v = item.getAttribute('data-view');
      if (!isAuthed) {
        if (v === 'view-login' || v === 'view-qr-validator') {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      } else {
        if (allowedViews.includes(v)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      }
    });

    // Hide or show registration links based on current role
    const isStudent = currentRole === 'MAHASISWA';
    const navDaftar = document.getElementById('nav-daftar-mahasiswa');
    if (navDaftar) navDaftar.style.display = (!isAuthed || isStudent) ? 'none' : 'flex';

    const btnTopRegister = document.getElementById('btn-topbar-register');
    if (btnTopRegister) btnTopRegister.style.display = (!isAuthed || isStudent) ? 'none' : 'inline-flex';

    const btnSyncState = document.getElementById('btn-sync-reset-state');
    if (btnSyncState) btnSyncState.style.display = isAuthed ? 'inline-flex' : 'none';

    // Hide or show sidebar section headers based on visible items
    document.querySelectorAll('.nav-section-label').forEach(lbl => {
      let sibling = lbl.nextElementSibling;
      let hasVisible = false;
      while (sibling && !sibling.classList.contains('nav-section-label')) {
        if (sibling.style.display !== 'none') hasVisible = true;
        sibling = sibling.nextElementSibling;
      }
      lbl.style.display = hasVisible ? 'block' : 'none';
    });
  }

  navigateTo(viewName) {
    const isAuthed = appState.isAuthenticated();
    const state = appState.getState();
    const currentRole = state.currentRole;

    // Normalize viewName if query params exist (e.g. #view-qr-validator?token=...)
    let cleanViewName = viewName;
    if (viewName && viewName.includes('?')) {
      cleanViewName = viewName.split('?')[0];
    }

    // STRICT AUTHENTICATION GUARD:
    // Unauthenticated visitors CANNOT access admin or student portals
    if (!isAuthed) {
      if (cleanViewName !== 'view-login' && cleanViewName !== 'view-qr-validator') {
        if (cleanViewName && cleanViewName !== '') {
          window.simpelToast.show(
            'Silakan Login',
            'Silakan login terlebih dahulu untuk mengakses portal SIMPEL-IF.',
            'warning'
          );
        }
        cleanViewName = 'view-login';
      }
    } else {
      // Authenticated users
      if (cleanViewName === 'view-login') {
        cleanViewName = ROLE_PERMISSIONS[currentRole]?.defaultView || (currentRole === 'MAHASISWA' ? 'view-mahasiswa' : 'dashboard-bendahara');
      } else {
        const allowedViews = ROLE_PERMISSIONS[currentRole]?.allowedViews || [];
        if (cleanViewName && !allowedViews.includes(cleanViewName) && cleanViewName !== 'view-qr-validator') {
          window.simpelToast.show(
            'Akses Terbatas',
            'Akun Anda tidak memiliki wewenang untuk mengakses modul ini.',
            'danger'
          );
          cleanViewName = ROLE_PERMISSIONS[currentRole]?.defaultView || 'view-mahasiswa';
        }
      }
    }

    this.currentView = cleanViewName;

    // Synchronize URL hash so page refreshes and direct URLs preserve the active view
    const currentHashClean = window.location.hash.slice(1).split('?')[0];
    if (currentHashClean !== cleanViewName) {
      history.replaceState(null, '', '#' + cleanViewName);
    }

    // Highlight active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === cleanViewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    this.renderCurrentViewContent(true);
  }

  renderCurrentViewContent(scrollToTop = true) {
    if (!this.container) return;
    this.container.innerHTML = '';

    const isAuthed = appState.isAuthenticated();
    const viewName = this.currentView;

    // Apply guest-mode full-width layout when unauthenticated or on login view
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (!isAuthed || viewName === 'view-login') {
      document.body.classList.add('guest-mode');
      document.body.setAttribute('data-view', 'view-login');
      if (mobileBtn) mobileBtn.style.setProperty('display', 'none', 'important');
    } else {
      document.body.classList.remove('guest-mode');
      document.body.setAttribute('data-view', viewName);
      if (mobileBtn) mobileBtn.style.removeProperty('display');
    }

    try {
      switch (viewName) {
        case 'view-login':
          this.setPageHeaders('Portal Login SIMPEL-IF', 'SIMPEL-IF / Autentikasi');
          renderLoginView(this.container);
          break;

        case 'dashboard-bendahara':
        case 'view-pimpinan':
          this.setPageHeaders('Dashboard Utama Admin', 'SIMPEL-IF / Dashboard Admin');
          renderDashboardBendahara(this.container);
          break;

        case 'view-matriks-rekap':
          this.setPageHeaders('Matriks Rekapitulasi Google Sheets (PMB 2026 & Multi-Angkatan)', 'SIMPEL-IF / Administrasi / Matriks Sheets');
          renderMatriksRekapView(this.container);
          break;

        case 'view-skema-tarif':
          this.setPageHeaders('Konfigurasi Skema Beasiswa & Tarif', 'SIMPEL-IF / Keuangan / Skema & Tarif');
          renderSkemaTarifView(this.container);
          break;

        case 'view-verifikasi':
          this.setPageHeaders('Antrean Verifikasi Pembayaran Manual', 'SIMPEL-IF / Keuangan / Verifikasi');
          renderVerifikasiView(this.container);
          break;

        case 'view-mahasiswa':
          this.setPageHeaders('Portal Pembayaran Kuliah Mahasiswa', 'SIMPEL-IF / Mahasiswa / Tagihan');
          renderMahasiswaPortal(this.container);
          break;

        case 'view-akademik':
          this.setPageHeaders('Master Data Mahasiswa & Akademik', 'SIMPEL-IF / Akademik / Data Induk');
          renderAkademikView(this.container);
          break;

        case 'view-kalender':
          this.setPageHeaders('Kalender Akademik & Jadwal Finansial', 'SIMPEL-IF / Akademik / Kalender');
          renderKalenderView(this.container);
          break;

        case 'view-laporan':
          this.setPageHeaders('Rekapitulasi Laporan Keuangan', 'SIMPEL-IF / Laporan / Arus Kas');
          renderLaporanView(this.container);
          break;

        case 'view-audit-log':
          this.setPageHeaders('Audit Trail & Log Transaksi', 'SIMPEL-IF / Pengaturan / Audit Trail');
          renderAuditLogView(this.container);
          break;

        case 'view-qr-validator':
          this.setPageHeaders('Verifikator QR Code & Dokumen Resmi', 'SIMPEL-IF / Publik / Validasi QR');
          renderQrValidatorView(this.container);
          break;

        default:
          this.setPageHeaders('Dashboard Keuangan', 'SIMPEL-IF / Utama');
          renderDashboardBendahara(this.container);
      }
    } catch (renderError) {
      console.error(`[Router] Error rendering view ${viewName}:`, renderError);
      this.container.innerHTML = `
        <div style="max-width: 600px; margin: 40px auto; padding: 24px; background: #fff; border-radius: 16px; border: 1.5px solid #fed7aa; box-shadow: 0 10px 25px rgba(0,0,0,0.06); text-align: center;">
          <div style="font-size: 2.6rem; margin-bottom: 8px;">⚠️</div>
          <h3 style="color: #9a3412; margin-bottom: 8px; font-weight: 800;">Tampilan Sedang Diperbarui</h3>
          <p style="color: #78350f; font-size: 0.88rem; margin-bottom: 16px; line-height: 1.5;">
            Modul sedang menyinkronkan data tampilan. Klik tombol di bawah untuk kembali ke halaman utama atau login.
          </p>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button class="btn btn-primary btn-sm" onclick="window.simpelRouter ? window.simpelRouter.navigateTo('view-login') : window.location.reload(true);" style="font-weight: 700;">
              Kembali ke Login ➔
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.location.reload(true);" style="font-weight: 700;">
              Segarkan (Refresh)
            </button>
          </div>
        </div>
      `;
    }

    // Initialize drag and swipe horizontal scroll for all tables, cards, and toolbars
    setTimeout(() => {
      try {
        DragScrollHelper.init(document);
        UserExperienceHelper.bindCopyButtons(this.container);
        MultiplatformHelper.bindMultiplatformButtons();
      } catch (e) {
        console.warn('[Router Post-Render Warning]:', e);
      }
    }, 50);

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  refreshCurrentView() {
    this.renderCurrentViewContent(false);
  }

  setPageHeaders(title, breadcrumb) {
    if (this.pageTitleEl) this.pageTitleEl.textContent = title;
    if (this.pageBreadcrumbEl) this.pageBreadcrumbEl.textContent = breadcrumb;
  }
}

// Resilient Application Bootstrapper (handles both loading and interactive/complete DOM readyState)
function bootstrapApp() {
  try {
    const router = new Router();
    router.init();
    try { DragScrollHelper.init(document); } catch (e) { }

    // Inisialisasi Penanggalan Kalender Hijriyah Dinamis
    const hijriTextEl = document.getElementById('topbar-hijri-text');
    if (hijriTextEl) {
      hijriTextEl.textContent = getHijriDate(new Date());
    }
  } catch (bootstrapErr) {
    console.error('[SIMPEL-IF Bootstrap Exception]:', bootstrapErr);
    const container = document.getElementById('main-view-container');
    if (container && (!container.children || container.children.length === 0)) {
      try {
        renderLoginView(container);
      } catch (fallbackErr) {
        container.innerHTML = `
          <div style="max-width: 520px; margin: 60px auto; padding: 32px 24px; background: #fff; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; border: 1px solid #e2e8f0;">
            <div style="width: 64px; height: 64px; border-radius: 16px; background: #0f1e3c; padding: 6px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <img src="./assets/images/logo.png" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <h2 style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0 0 6px;">SIMPEL-IF STIT Ihsanul Fikri</h2>
            <p style="font-size: 0.85rem; color: #64748b; margin: 0 auto 20px; max-width: 380px;">Sistem sedang menyinkronkan pembaruan terkini. Klik tombol di bawah untuk menyegarkan tampilan.</p>
            <button onclick="window.location.reload(true)" style="background: linear-gradient(135deg, #1e40af, #2563eb); color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
              🔄 Segarkan Tampilan (Refresh)
            </button>
          </div>
        `;
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
