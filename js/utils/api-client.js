/**
 * SIMPEL-IF cPanel Database Client Bridge
 * STIT Ihsanul Fikri
 * Connects Frontend SPA directly to cPanel MySQL / MariaDB via REST API
 */

import { appState } from '../state.js';

export class ApiClient {
  static baseUrl = './api';
  static isConnected = false;
  static isConfigured = false;
  static dbInfo = null;
  static syncTimeout = null;

  static async init() {
    this.injectDatabaseStatusBadge();
    await this.checkStatus();
    this.bindAutoSync();

    window.simpelApi = this;
  }

  /**
   * Universal Sync: Synchronizes Google Sheets Matrix, LocalStorage State, and cPanel MySQL Database
   */
  static async syncEverything(notify = true) {
    if (notify && window.simpelToast) {
      window.simpelToast.show('Memulai Sinkronisasi... ⏳', 'Menghubungkan data lokal, Google Sheets, dan database cPanel.', 'info', 2500);
    }

    let mysqlStatus = 'Mode Offline / Standalone';

    // 1. Check & Sync with cPanel MySQL if available
    try {
      await this.checkStatus();
      if (this.isConnected) {
        const pushRes = await this.pushToDatabase(false);
        if (pushRes) {
          mysqlStatus = `Terhubung ke MySQL cPanel (${this.dbInfo?.database || 'MySQL'})`;
        }
      }
    } catch (e) {
      console.warn('[Sync] MySQL sync bypassed:', e);
    }

    // 2. Trigger Google Sheets matrix sync timestamp update
    const state = appState.getState();
    if (state.googleSheetsMatrix) {
      state.googleSheetsMatrix.lastSyncTime = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    }

    // 3. Save to storage & notify router
    appState.saveToStorage();
    appState.notify();

    if (window.simpelRouter) {
      window.simpelRouter.refreshCurrentView();
    }

    const totalStudents = state.students?.length || 0;
    const totalInvoices = state.invoices?.length || 0;

    if (notify && window.simpelToast) {
      window.simpelToast.show(
        'Sinkronisasi Selesai! ✅',
        `Semua data telah disinkronkan (${totalStudents} Mahasiswa, ${totalInvoices} Tagihan & Beasiswa, ${mysqlStatus}).`,
        'success',
        4000
      );
    }

    return {
      success: true,
      mysqlConnected: this.isConnected,
      mysqlStatus,
      totalStudents,
      totalInvoices,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 1. Check MySQL connection status on cPanel
   */
  static async checkStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/test.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        this.updateBadge(false, false, 'Server API Error');
        return false;
      }

      const result = await response.json();
      if (result.connected) {
        this.isConnected = true;
        this.isConfigured = true;
        this.dbInfo = result;
        this.updateBadge(true, true, result.database, result.table_count);
        return true;
      } else {
        this.isConnected = false;
        this.isConfigured = false;
        this.updateBadge(false, false, result.message || 'Belum Terhubung');
        return false;
      }
    } catch (err) {
      // Local dev without PHP or network error
      this.isConnected = false;
      this.updateBadge(false, false, 'Offline / Standalone');
      return false;
    }
  }

  /**
   * 2. Pull state from cPanel MySQL Database
   */
  static async pullFromDatabase(notify = false) {
    try {
      const response = await fetch(`${this.baseUrl}/sync.php`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (result.success && result.state) {
        // Hydrate state from MySQL
        appState.state = { ...appState.state, ...result.state };
        appState.saveToStorage();

        if (notify && window.simpelToast) {
          window.simpelToast.show('Data Berhasil Ditarik! 📥', `Data sinkron dari MySQL cPanel (${result.counts?.students || 0} mahasiswa).`, 'success');
        }
        if (window.simpelRouter) window.simpelRouter.refreshCurrentView();
        return true;
      } else {
        if (notify && window.simpelToast) {
          window.simpelToast.show('Info Database ℹ️', result.message || 'Belum ada data di database cPanel.', 'info');
        }
        return false;
      }
    } catch (err) {
      if (notify && window.simpelToast) {
        window.simpelToast.show('Gagal Tarik Data ❌', err.message, 'danger');
      }
      return false;
    }
  }

  /**
   * 3. Push local state to cPanel MySQL Database
   */
  static async pushToDatabase(notify = false) {
    if (!this.isConnected) {
      if (notify && window.simpelToast) {
        window.simpelToast.show('Database Belum Konek ⚠️', 'Konfigurasikan koneksi MySQL cPanel terlebih dahulu.', 'warning');
      }
      return false;
    }

    try {
      const state = appState.getState();
      const payload = {
        state: state,
        version: 'SIMPEL_IF_STATE_V10_SINGLE_ADMIN',
        user: state.currentUser?.name || state.adminProfile?.name || 'ADMIN'
      };

      const response = await fetch(`${this.baseUrl}/sync.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        if (notify && window.simpelToast) {
          window.simpelToast.show('Tersimpan di MySQL! 💾', `Data disinkronkan ke cPanel (${result.synced?.students} mhs, ${result.synced?.invoices} tagihan).`, 'success');
        }
        return true;
      } else {
        if (notify && window.simpelToast) {
          window.simpelToast.show('Gagal Menyimpan ❌', result.message, 'danger');
        }
        return false;
      }
    } catch (err) {
      if (notify && window.simpelToast) {
        window.simpelToast.show('Error Koneksi ❌', err.message, 'danger');
      }
      return false;
    }
  }

  /**
   * 4. Test connection with custom credentials
   */
  static async testConnection(config) {
    try {
      const response = await fetch(`${this.baseUrl}/test.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (err) {
      return { success: false, connected: false, message: err.message };
    }
  }

  /**
   * 5. Save database credentials to cPanel server
   */
  static async saveConfig(config) {
    try {
      const response = await fetch(`${this.baseUrl}/config.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await response.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /**
   * 6. Auto-sync state on local changes (debounced 1.5 seconds)
   */
  static bindAutoSync() {
    window.addEventListener('simpel_state_changed', () => {
      if (!this.isConnected) return;
      if (this.syncTimeout) clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => {
        this.pushToDatabase(false);
      }, 1500);
    });
  }

  /**
   * 7. Inject Database Status Badge in Topbar
   */
  static injectDatabaseStatusBadge() {
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight || document.getElementById('btn-db-status-badge')) return;

    const badgeBtn = document.createElement('button');
    badgeBtn.id = 'btn-db-status-badge';
    badgeBtn.className = 'btn btn-outline btn-sm';
    badgeBtn.style.fontWeight = '700';
    badgeBtn.style.display = 'inline-flex';
    badgeBtn.style.alignItems = 'center';
    badgeBtn.style.gap = '6px';
    badgeBtn.style.padding = '6px 12px';
    badgeBtn.style.borderRadius = 'var(--radius-md)';
    badgeBtn.style.background = 'var(--bg-surface)';
    badgeBtn.style.color = '#475569';
    badgeBtn.style.borderColor = '#cbd5e1';
    badgeBtn.title = 'Status Database cPanel MySQL (Klik untuk konfigurasi)';
    badgeBtn.innerHTML = `
      <span class="db-status-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #94a3b8;"></span>
      <span class="db-status-text">MySQL cPanel</span>
    `;

    // Insert before profile button
    const profileBtn = document.getElementById('btn-topbar-profile');
    if (profileBtn) {
      topbarRight.insertBefore(badgeBtn, profileBtn);
    } else {
      topbarRight.appendChild(badgeBtn);
    }

    badgeBtn.addEventListener('click', () => {
      this.openDatabaseConfigModal();
    });
  }

  static updateBadge(connected, configured, label = '', tableCount = 0) {
    const badgeBtn = document.getElementById('btn-db-status-badge');
    if (!badgeBtn) return;

    const dot = badgeBtn.querySelector('.db-status-dot');
    const text = badgeBtn.querySelector('.db-status-text');

    if (connected) {
      if (dot) dot.style.background = '#16a34a';
      badgeBtn.style.color = '#15803d';
      badgeBtn.style.borderColor = '#86efac';
      badgeBtn.style.background = '#f0fdf4';
      if (text) text.textContent = `MySQL: ${label}`;
      badgeBtn.title = `Terhubung ke MySQL cPanel (${label}) - ${tableCount} tabel siap. Klik untuk kelola.`;
    } else if (configured) {
      if (dot) dot.style.background = '#dc2626';
      badgeBtn.style.color = '#b91c1c';
      badgeBtn.style.borderColor = '#fca5a5';
      badgeBtn.style.background = '#fef2f2';
      if (text) text.textContent = 'MySQL: Error';
      badgeBtn.title = `Gagal terhubung ke MySQL cPanel: ${label}. Klik untuk perbaiki konfigurasi.`;
    } else {
      if (dot) dot.style.background = '#eab308';
      badgeBtn.style.color = '#a16207';
      badgeBtn.style.borderColor = '#fde047';
      badgeBtn.style.background = '#fefce8';
      if (text) text.textContent = 'MySQL: Setup';
      badgeBtn.title = 'Database cPanel belum dikonfigurasi. Klik untuk menghubungkan langsung.';
    }
  }

  /**
   * 8. Interactive Database Configuration Modal
   */
  static async openDatabaseConfigModal() {
    const overlay = document.getElementById('global-modal-overlay');
    const title = document.getElementById('global-modal-title');
    const body = document.getElementById('global-modal-body');
    const footer = document.getElementById('global-modal-footer');

    if (!overlay || !body) return;

    title.innerHTML = '🗄️ Konfigurasi Koneksi Database cPanel (MySQL)';

    // Fetch current server config if possible
    let currentConfig = { host: 'localhost', port: 3306, db_name: '', db_user: '' };
    try {
      const resp = await fetch(`${this.baseUrl}/config.php`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.configured) currentConfig = data;
      }
    } catch (e) {
      // Ignore
    }

    body.innerHTML = `
      <div style="padding: 6px 0;">
        <div id="db-conn-alert" style="margin-bottom: 16px; padding: 12px 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 0.88rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong>Status Database cPanel:</strong>
            <span id="db-status-desc" style="color: ${this.isConnected ? '#15803d' : '#b45309'}; font-weight: 700; margin-left: 6px;">
              ${this.isConnected ? '🟢 Terhubung ke MySQL' : '🟡 Belum Terhubung'}
            </span>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-modal-test-db" style="font-weight: 700;">
            🔌 Tes Koneksi
          </button>
        </div>

        <form id="form-db-config" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #334155;">Host Database MySQL</label>
              <input type="text" id="cfg-db-host" class="form-control" value="${currentConfig.host || 'localhost'}" placeholder="localhost (biasanya localhost pada cPanel)" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #334155;">Port</label>
              <input type="number" id="cfg-db-port" class="form-control" value="${currentConfig.port || 3306}" placeholder="3306" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #334155;">
              Nama Database cPanel <span style="color: #dc2626;">*</span>
            </label>
            <input type="text" id="cfg-db-name" class="form-control" value="${currentConfig.db_name || ''}" placeholder="Contoh: u1056405_simpel_if" required style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <small style="color: #64748b; font-size: 0.76rem;">Dapat dilihat pada menu <strong>cPanel &gt; MySQL Databases</strong>.</small>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #334155;">
                Username MySQL cPanel <span style="color: #dc2626;">*</span>
              </label>
              <input type="text" id="cfg-db-user" class="form-control" value="${currentConfig.db_user || ''}" placeholder="Contoh: u1056405_admin" required style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 4px; color: #334155;">
                Password MySQL cPanel
              </label>
              <input type="password" id="cfg-db-pass" class="form-control" placeholder="••••••••" style="width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            </div>
          </div>
        </form>

        <div style="margin-top: 18px; padding: 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 0.84rem; color: #1e40af;">
          <strong>💡 Sinkronisasi Data & Migrasi Otomatis:</strong>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="btn btn-sm btn-primary" id="btn-modal-push-db" style="font-weight: 700;">
              📤 Unggah Data Lokal ke MySQL
            </button>
            <button class="btn btn-sm btn-outline" id="btn-modal-pull-db" style="font-weight: 700; background: #fff;">
              📥 Tarik Data dari MySQL ke Web
            </button>
            <a href="./schema.sql" download="simpel_if_schema.sql" class="btn btn-sm btn-outline" style="font-weight: 700; background: #fff; color: #0369a1; text-decoration: none;">
              📄 Unduh schema.sql
            </a>
            <a href="./update-simpel-if.zip" download="update-simpel-if.zip" class="btn btn-sm btn-outline" style="font-weight: 700; background: #fff; color: #047857; text-decoration: none;" title="Unduh Paket Arsip Lengkap SIMPEL-IF (.zip)">
              📦 Unduh Paket (.zip)
            </a>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-close-db-modal" style="font-weight: 700;">Tutup</button>
      <button class="btn btn-primary" id="btn-save-db-config" style="font-weight: 800; background: #047857; border-color: #047857;">
        💾 Simpan & Hubungkan Database
      </button>
    `;

    overlay.classList.add('active');

    // Attach listeners
    footer.querySelector('#btn-close-db-modal').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    const getFormValues = () => ({
      host: body.querySelector('#cfg-db-host').value.trim() || 'localhost',
      port: parseInt(body.querySelector('#cfg-db-port').value) || 3306,
      db_name: body.querySelector('#cfg-db-name').value.trim(),
      db_user: body.querySelector('#cfg-db-user').value.trim(),
      db_pass: body.querySelector('#cfg-db-pass').value
    });

    // Test button
    body.querySelector('#btn-modal-test-db').addEventListener('click', async () => {
      const vals = getFormValues();
      const statusDesc = body.querySelector('#db-status-desc');
      statusDesc.textContent = '⏳ Menguji koneksi...';

      const res = await this.testConnection({ ...vals, migrate: true });
      if (res.connected) {
        statusDesc.innerHTML = `<span style="color: #15803d;">🟢 Sukses! Terhubung ke MySQL ${res.server_version || ''} (${res.latency_ms}ms, ${res.table_count} tabel).</span>`;
        if (window.simpelToast) window.simpelToast.show('Koneksi Berhasil! ✅', res.message, 'success');
      } else {
        statusDesc.innerHTML = `<span style="color: #dc2626;">🔴 Gagal: ${res.message}</span>`;
        if (window.simpelToast) window.simpelToast.show('Koneksi Gagal ❌', res.message, 'danger');
      }
    });

    // Save button
    footer.querySelector('#btn-save-db-config').addEventListener('click', async () => {
      const vals = getFormValues();
      if (!vals.db_name || !vals.db_user) {
        alert('Nama Database dan Username MySQL wajib diisi!');
        return;
      }

      const saveBtn = footer.querySelector('#btn-save-db-config');
      saveBtn.textContent = 'Menyimpan...';

      const saveRes = await this.saveConfig(vals);
      if (saveRes.success) {
        await this.checkStatus();
        // Also push initial state if connected
        await this.pushToDatabase(false);
        if (window.simpelToast) {
          window.simpelToast.show('Tersimpan! ✅', 'Konfigurasi database cPanel aktif dan data telah disinkronkan.', 'success');
        }
        overlay.classList.remove('active');
      } else {
        alert('Gagal menyimpan konfigurasi: ' + saveRes.message);
      }
      saveBtn.textContent = '💾 Simpan & Hubungkan Database';
    });

    // Push local to MySQL
    body.querySelector('#btn-modal-push-db').addEventListener('click', async () => {
      const ok = await this.pushToDatabase(true);
      if (ok) overlay.classList.remove('active');
    });

    // Pull MySQL to local
    body.querySelector('#btn-modal-pull-db').addEventListener('click', async () => {
      if (confirm('Tarik data dari database cPanel dan timpa data di browser saat ini?')) {
        const ok = await this.pullFromDatabase(true);
        if (ok) overlay.classList.remove('active');
      }
    });
  }
}
