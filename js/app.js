/**
 * SIMPEL-IF Main Application Entry Point & Router
 * STIT Ihsanul Fikri
 */

import { appState } from './state.js';
import { AuthManager, ROLE_PERMISSIONS } from './auth.js';
import { ModalManager } from './modals.js';
import { DragScrollHelper } from './utils/drag-scroll.js';

import { renderDashboardBendahara } from './views/dashboard-bendahara.js';
import { renderSkemaTarifView } from './views/view-skema-tarif.js';
import { renderVerifikasiView } from './views/view-verifikasi.js';
import { renderMahasiswaPortal } from './views/view-mahasiswa.js';
import { renderAkademikView } from './views/view-akademik.js';
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
    ModalManager.init();
    AuthManager.init();

    // Bind sidebar navigation links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        if (targetView) this.navigateTo(targetView);
      });
    });

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

    // Sync / Reset Data State button
    const btnSyncState = document.getElementById('btn-sync-reset-state');
    if (btnSyncState) {
      btnSyncState.addEventListener('click', () => {
        if (confirm('Apakah Anda ingin menyinkronkan ulang data awal SIMPEL-IF?\n\nSemua skema beasiswa, tarif, dan data mahasiswa akan diperbarui ke versi mutakhir.')) {
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

    // Listen for state changes to update badge counters and active view
    appState.subscribe(() => {
      this.updateBadges();
      AuthManager.renderRoleBar();
    });

    // Initial View Routing: Always land on view-login (Portal Login & Pendaftaran) by default
    const hashView = window.location.hash.slice(1);
    const initialView = hashView && hashView !== '' ? hashView : 'view-login';
    this.navigateTo(initialView);
    this.updateBadges();
  }

  updateBadges() {
    const state = appState.getState();
    const pendingCount = (state.paymentVerifications || []).filter(v => v.status === 'PENDING').length;
    if (this.verifBadgeEl) {
      this.verifBadgeEl.textContent = pendingCount;
      this.verifBadgeEl.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    // Update notification indicator on header
    const notifDot = document.getElementById('header-notif-indicator');
    if (notifDot) {
      notifDot.style.display = pendingCount > 0 ? 'block' : 'none';
    }

    // Update sidebar nav items visibility based on current role
    const currentRole = state.currentRole;
    const allowedViews = ROLE_PERMISSIONS[currentRole]?.allowedViews || [];

    document.querySelectorAll('.nav-item').forEach(item => {
      const v = item.getAttribute('data-view');
      if (allowedViews.includes(v)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

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
    this.currentView = viewName;

    // Highlight active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile drawer if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Render target view
    if (!this.container) return;
    this.container.innerHTML = '';

    const state = appState.getState();

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

    // Initialize drag and swipe horizontal scroll for all tables, cards, and toolbars
    setTimeout(() => {
      DragScrollHelper.init(document);
    }, 50);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refreshCurrentView() {
    this.navigateTo(this.currentView);
  }

  setPageHeaders(title, breadcrumb) {
    if (this.pageTitleEl) this.pageTitleEl.textContent = title;
    if (this.pageBreadcrumbEl) this.pageBreadcrumbEl.textContent = breadcrumb;
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const router = new Router();
  router.init();
  DragScrollHelper.init(document);
});
