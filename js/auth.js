/**
 * SIMPEL-IF Role-Based Access Control (RBAC) & Navigation Manager
 * STIT Ihsanul Fikri
 * Hanya 2 peran utama: ADMIN (Pengelola/Keuangan) & MAHASISWA (Portal Mahasiswa)
 */

import { appState } from './state.js';
import { USER_ROLES } from './models.js';

export const ROLE_PERMISSIONS = {
  ADMIN: {
    allowedViews: [
      'dashboard-bendahara',
      'view-skema-tarif',
      'view-verifikasi',
      'view-akademik',
      'view-laporan',
      'view-audit-log',
      'view-qr-validator',
      'view-login'
    ],
    defaultView: 'dashboard-bendahara'
  },
  MAHASISWA: {
    allowedViews: [
      'view-mahasiswa',
      'view-qr-validator',
      'view-login'
    ],
    defaultView: 'view-mahasiswa'
  }
};

// Aliases
ROLE_PERMISSIONS.BENDAHARA = ROLE_PERMISSIONS.ADMIN;
ROLE_PERMISSIONS.PIMPINAN = ROLE_PERMISSIONS.ADMIN;
ROLE_PERMISSIONS.AKADEMIK = ROLE_PERMISSIONS.ADMIN;

export class AuthManager {
  static init() {
    this.renderRoleBar();
    this.updateSidebarNav();
  }

  static renderRoleBar() {
    const state = appState.getState();
    const currentRole = state.currentRole === 'MAHASISWA' ? 'MAHASISWA' : 'ADMIN';
    const currentUser = state.currentUser;

    const roleContainer = document.getElementById('role-buttons-container');
    if (roleContainer) {
      // Display only 2 roles: ADMIN and MAHASISWA
      const rolesList = ['ADMIN', 'MAHASISWA'];
      roleContainer.innerHTML = rolesList.map(roleKey => {
        const role = USER_ROLES[roleKey];
        const isActive = roleKey === currentRole ? 'active' : '';
        return `
          <button class="role-btn ${isActive}" data-role="${roleKey}">
            <span>${role.icon}</span> ${role.name}
          </button>
        `;
      }).join('');

      // Add click handlers
      roleContainer.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const roleKey = btn.getAttribute('data-role');
          if (roleKey === 'MAHASISWA' && currentRole !== 'MAHASISWA') {
            AuthManager.switchRole('MAHASISWA');
          } else {
            AuthManager.switchRole(roleKey);
          }
        });
      });
    }

    // Update topbar / sidebar current user display
    const userNameEl = document.getElementById('topbar-user-name');
    const userRoleEl = document.getElementById('topbar-user-role');
    const userAvatarEl = document.getElementById('topbar-user-avatar');

    const roleObj = USER_ROLES[currentRole] || USER_ROLES.ADMIN;
    if (userNameEl) userNameEl.textContent = currentUser.name || roleObj.defaultUser;
    if (userRoleEl) userRoleEl.textContent = `${roleObj.shortTitle}`;
    if (userAvatarEl) userAvatarEl.textContent = currentUser.avatarText || roleObj.avatarText;

    this.updateSidebarNav();
  }

  static updateSidebarNav() {
    const state = appState.getState();
    const isStudent = state.currentRole === 'MAHASISWA';

    const navDashboard = document.getElementById('nav-dashboard');
    const navSkema = document.getElementById('nav-skema');
    const navVerifikasi = document.getElementById('nav-verifikasi');
    const navAkademik = document.getElementById('nav-akademik');
    const navLaporan = document.getElementById('nav-laporan');
    const navAuditLog = document.getElementById('nav-audit-log');
    const navMahasiswa = document.getElementById('nav-mahasiswa');

    if (isStudent) {
      if (navDashboard) navDashboard.style.display = 'none';
      if (navSkema) navSkema.style.display = 'none';
      if (navVerifikasi) navVerifikasi.style.display = 'none';
      if (navAkademik) navAkademik.style.display = 'none';
      if (navLaporan) navLaporan.style.display = 'none';
      if (navAuditLog) navAuditLog.style.display = 'none';
      if (navMahasiswa) navMahasiswa.style.display = 'flex';
    } else {
      if (navDashboard) navDashboard.style.display = 'flex';
      if (navSkema) navSkema.style.display = 'flex';
      if (navVerifikasi) navVerifikasi.style.display = 'flex';
      if (navAkademik) navAkademik.style.display = 'flex';
      if (navLaporan) navLaporan.style.display = 'flex';
      if (navAuditLog) navAuditLog.style.display = 'flex';
      if (navMahasiswa) navMahasiswa.style.display = 'flex';
    }
  }

  static switchRole(roleKey, customStudentNim = null) {
    const targetRole = roleKey === 'MAHASISWA' ? 'MAHASISWA' : 'ADMIN';
    appState.setRole(targetRole, customStudentNim);
    this.renderRoleBar();

    const perms = ROLE_PERMISSIONS[targetRole] || ROLE_PERMISSIONS.ADMIN;
    const defaultView = perms.defaultView;

    // Trigger router navigation to default view for this role
    if (window.simpelRouter) {
      window.simpelRouter.navigateTo(defaultView);
    }
  }

  static logout() {
    if (window.simpelRouter) {
      window.simpelRouter.navigateTo('view-login');
      window.simpelToast.show('Logout Berhasil', 'Anda telah keluar dari sesi aktif.', 'info');
    }
  }
}
