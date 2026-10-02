/**
 * SIMPEL-IF Multiplatform UI & Progressive Web App (PWA) Engine
 * STIT Ihsanul Fikri
 * Cross-Platform Ergonomics: Android, iOS, Windows, macOS, Linux, Tablet, Mobile & Desktop
 */

export class MultiplatformHelper {
  static deferredInstallPrompt = null;
  static isInstalled = false;

  static init() {
    this.detectEnvironment();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkMonitor();
    this.injectPlatformIndicator();
    this.bindMultiplatformButtons();

    window.simpelMultiplatform = this;
  }

  /**
   * 1. Detect Operating System, Form Factor, and Display Mode
   */
  static getPlatformInfo() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    let os = 'Unknown';
    let device = 'desktop';

    // OS Detection
    if (/android/i.test(ua)) {
      os = 'Android';
      device = 'mobile';
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      os = 'iOS';
      device = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'tablet' : 'mobile';
    } else if (/Win/i.test(ua)) {
      os = 'Windows';
      device = 'desktop';
    } else if (/Mac/i.test(ua)) {
      os = navigator.maxTouchPoints > 1 ? 'tablet' : 'macOS';
      device = navigator.maxTouchPoints > 1 ? 'tablet' : 'desktop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
      device = 'desktop';
    }

    // Tablet check based on screen width
    const width = window.innerWidth;
    if (width >= 640 && width <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      device = 'tablet';
    } else if (width < 640) {
      device = 'mobile';
    }

    // Display mode check
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');

    // Touch capability
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      os,
      device,
      isStandalone,
      isTouch,
      isOnline: navigator.onLine,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }

  static detectEnvironment() {
    const info = this.getPlatformInfo();
    const docEl = document.documentElement;

    // Apply attributes to <html> for tailored multiplatform styling
    docEl.setAttribute('data-platform-os', info.os.toLowerCase());
    docEl.setAttribute('data-device-form', info.device);
    docEl.setAttribute('data-display-mode', info.isStandalone ? 'standalone' : 'browser');
    docEl.setAttribute('data-touch-enabled', info.isTouch ? 'true' : 'false');

    if (info.isStandalone) {
      this.isInstalled = true;
      document.body.classList.add('is-pwa-standalone');
    }
  }

  /**
   * 2. Progressive Web App (PWA) Service Worker Registration
   */
  static registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker terdaftar dengan scope:', registration.scope);

            // Listen for waiting workers and updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.showUpdateBanner(newWorker);
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker gagal didaftarkan:', error);
          });
      });
    }
  }

  static showUpdateBanner(worker) {
    if (document.getElementById('simpel-pwa-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'simpel-pwa-update-banner';
    banner.className = 'pwa-update-banner';
    banner.innerHTML = `
      <div class="pwa-update-content">
        <span class="pwa-update-icon">🚀</span>
        <div class="pwa-update-text">
          <strong>Pembaruan Sistem Tersedia!</strong>
          <small>Versi terbaru SIMPEL-IF telah siap diterapkan.</small>
        </div>
      </div>
      <div class="pwa-update-actions">
        <button class="btn btn-sm btn-primary" id="btn-pwa-reload-now" style="font-weight: 700;">Segarkan Sekarang</button>
        <button class="btn btn-sm btn-outline" id="btn-pwa-dismiss-banner" style="color: #fff; border-color: rgba(255,255,255,0.4);">Nanti</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('#btn-pwa-reload-now').addEventListener('click', () => {
      worker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

    banner.querySelector('#btn-pwa-dismiss-banner').addEventListener('click', () => {
      banner.remove();
    });
  }

  /**
   * 3. PWA Installation Event Listener & Prompt Handler
   */
  static setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.updateInstallButtonsVisibility(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      this.isInstalled = true;
      this.updateInstallButtonsVisibility(false);
      if (window.simpelToast) {
        window.simpelToast.show('Aplikasi Terpasang! 📲', 'SIMPEL-IF berhasil dipasang di perangkat Anda.', 'success');
      }
    });
  }

  static updateInstallButtonsVisibility(canInstall) {
    const installBtns = document.querySelectorAll('.btn-multiplatform-install, #btn-topbar-install-app, #nav-install-app');
    installBtns.forEach(btn => {
      if (this.isInstalled) {
        btn.style.display = 'none';
      } else {
        btn.style.display = canInstall || this.getPlatformInfo().os === 'iOS' ? 'inline-flex' : 'inline-flex';
      }
    });
  }

  static triggerInstall() {
    const info = this.getPlatformInfo();

    // Chromium/Edge/Android native prompt
    if (this.deferredInstallPrompt) {
      this.deferredInstallPrompt.prompt();
      this.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Pengguna menerima pemasangan aplikasi');
        }
        this.deferredInstallPrompt = null;
      });
      return;
    }

    // Modal panduan instalasi multiplatform
    this.openInstallGuideModal(info);
  }

  static openInstallGuideModal(info) {
    const overlay = document.getElementById('global-modal-overlay');
    const title = document.getElementById('global-modal-title');
    const body = document.getElementById('global-modal-body');
    const footer = document.getElementById('global-modal-footer');

    if (!overlay || !body) return;

    title.innerHTML = '📲 Pasang SIMPEL-IF di Perangkat Anda';

    let guideHtml = '';

    if (info.os === 'iOS') {
      guideHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="./assets/images/logo.png" style="width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="App Icon">
          <h4 style="margin: 12px 0 4px; font-weight: 800; color: #1e3a8a;">SIMPEL-IF untuk iPhone & iPad</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Pasang aplikasi web resmi langsung ke Layar Utama (Home Screen) tanpa App Store.</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <ol style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.8; color: #334155;">
            <li>Buka situs ini di browser <strong>Safari</strong>.</li>
            <li>Ketuk tombol <strong>Bagikan / Share</strong> <span style="font-size: 1.1rem;">⎋</span> di bilah navigasi bawah Safari.</li>
            <li>Gulir ke bawah dan pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <span style="font-weight: 800;">➕</span>.</li>
            <li>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
          </ol>
        </div>
        <div style="padding: 10px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 0.82rem; color: #047857; display: flex; align-items: center; gap: 8px;">
          <span>✅</span>
          <span>Aplikasi akan muncul di layar utama layaknya aplikasi iOS native dengan performa cepat dan bebas bilah URL browser!</span>
        </div>
      `;
    } else if (info.os === 'Android') {
      guideHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="./assets/images/logo.png" style="width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="App Icon">
          <h4 style="margin: 12px 0 4px; font-weight: 800; color: #1e3a8a;">SIMPEL-IF untuk Android</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Pasang langsung ke ponsel Android Anda melalui Google Chrome / Browser.</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <ol style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.8; color: #334155;">
            <li>Ketuk ikon <strong>Tiga Titik (Menu) ⋮</strong> di pojok kanan atas Google Chrome.</li>
            <li>Pilih opsi <strong>"Pasang aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
            <li>Konfirmasi dengan memilih <strong>Pasang / Tambah</strong>.</li>
          </ol>
        </div>
        <div style="padding: 10px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; font-size: 0.82rem; color: #1d4ed8; display: flex; align-items: center; gap: 8px;">
          <span>📱</span>
          <span>Aplikasi terinstal otomatis di laci aplikasi (App Drawer) Anda dengan ikon resmi STIT Ihsanul Fikri.</span>
        </div>
      `;
    } else {
      guideHtml = `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="./assets/images/logo.png" style="width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" alt="App Icon">
          <h4 style="margin: 12px 0 4px; font-weight: 800; color: #1e3a8a;">SIMPEL-IF untuk Desktop (${info.os})</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Gunakan sebagai aplikasi Desktop Mandiri di Windows, macOS, atau Linux.</p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem; line-height: 1.8; color: #334155;">
            <li><strong>Google Chrome:</strong> Klik ikon <strong>Pasang (Komputer kecil dengan panah bawah)</strong> di sebelah kanan bilah alamat (URL bar) atau pilih Menu ⋮ > Simpan dan bagikan > Pasang halaman sebagai aplikasi.</li>
            <li><strong>Microsoft Edge:</strong> Klik ikon <strong>Aplikasi (App)</strong> di address bar atau pilih Menu ... > Aplikasi > Pasang situs ini sebagai aplikasi.</li>
          </ul>
        </div>
        <div style="padding: 10px 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 0.82rem; color: #047857; display: flex; align-items: center; gap: 8px;">
          <span>💻</span>
          <span>SIMPEL-IF akan terbuka di jendela desktop khusus tanpa tab browser, lengkap dengan shortcut di Desktop dan Taskbar/Dock!</span>
        </div>
      `;
    }

    body.innerHTML = `
      <div style="padding: 10px 0;">
        ${guideHtml}
        
        <div style="margin-top: 18px; border-top: 1px dashed #cbd5e1; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 0.8rem; color: #64748b;">
            <span>Perangkat Anda saat ini: </span>
            <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 800;">${info.os} &bull; ${info.device.toUpperCase()}</span>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-open-multiplatform-info" style="font-weight: 700;">
            🔍 Info Lingkungan Perangkat
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-primary" id="btn-close-install-guide" style="font-weight: 700;">Tutup Panduan</button>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-close-install-guide').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    const btnInfo = body.querySelector('#btn-open-multiplatform-info');
    if (btnInfo) {
      btnInfo.addEventListener('click', () => {
        this.openPlatformSpecsModal();
      });
    }
  }

  /**
   * 4. Multiplatform Environment Specs & Diagnostics Modal
   */
  static openPlatformSpecsModal() {
    const overlay = document.getElementById('global-modal-overlay');
    const title = document.getElementById('global-modal-title');
    const body = document.getElementById('global-modal-body');
    const footer = document.getElementById('global-modal-footer');

    if (!overlay || !body) return;

    const info = this.getPlatformInfo();

    title.innerHTML = '⚙️ Diagnostik Multiplatform UI SIMPEL-IF';

    body.innerHTML = `
      <div style="padding: 10px 0;">
        <p style="font-size: 0.88rem; color: #475569; margin-bottom: 16px;">
          Sistem Multiplatform UI SIMPEL-IF secara dinamis menyesuaikan tata letak, ukuran tombol sentuh, navigasi, dan caching sesuai perangkat yang Anda gunakan:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Sistem Operasi (OS)</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #1e3a8a; margin-top: 4px;">${info.os}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Form Factor Perangkat</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #047857; margin-top: 4px;">${info.device.toUpperCase()}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Mode Tampilan</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: ${info.isStandalone ? '#15803d' : '#2563eb'}; margin-top: 4px;">
              ${info.isStandalone ? '📱 Standalone PWA App' : '🌐 Browser Window'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Layar & Resolusi</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #0284c7; margin-top: 4px;">${window.innerWidth} &times; ${window.innerHeight} px</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Interaksi Layar Sentuh</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #b45309; margin-top: 4px;">${info.isTouch ? 'Aktif (Touch Ergonomics)' : 'Mouse / Trackpad'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Status Jaringan</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: ${navigator.onLine ? '#16a34a' : '#dc2626'}; margin-top: 4px;">
              ${navigator.onLine ? '🟢 Terhubung (Online)' : '🔴 Terputus (Offline)'}
            </div>
          </div>
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; font-size: 0.85rem; color: #1e40af;">
          <strong>🎯 Fitur Multiplatform Aktif:</strong>
          <ul style="margin: 8px 0 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>iPhone / iPad:</strong> Dukungan penuh Notch, Dynamic Island, dan Safe Area Insets.</li>
            <li><strong>Android Phone & Tablet:</strong> Navigasi jempol (Bottom Bar) dan swipe horizontal tabel.</li>
            <li><strong>Laptop & Desktop:</strong> Navigasi Sidebar luas, tombol cepat Keyboard (Ctrl+K, Esc), dan Cetak Dokumen responsif.</li>
            <li><strong>Offline Resilience:</strong> Caching Service Worker lokal untuk akses data cepat.</li>
          </ul>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-outline" id="btn-specs-open-install" style="font-weight: 700;">📲 Pasang Aplikasi</button>
      <button class="btn btn-primary" id="btn-close-specs" style="font-weight: 700;">Tutup</button>
    `;

    overlay.classList.add('active');

    footer.querySelector('#btn-close-specs').addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    footer.querySelector('#btn-specs-open-install').addEventListener('click', () => {
      this.openInstallGuideModal(info);
    });
  }

  /**
   * 5. Network Connectivity Monitor (Online/Offline)
   */
  static setupNetworkMonitor() {
    window.addEventListener('online', () => {
      this.updateOfflineBadge(true);
      if (window.simpelToast) {
        window.simpelToast.show('Terhubung Kembali 🟢', 'Koneksi internet Anda telah aktif kembali.', 'success', 3000);
      }
    });

    window.addEventListener('offline', () => {
      this.updateOfflineBadge(false);
      if (window.simpelToast) {
        window.simpelToast.show('Mode Offline ⚡', 'Anda sedang offline. Data lokal tetap dapat diakses melalui cache perangkat.', 'warning', 5000);
      }
    });

    if (!navigator.onLine) {
      this.updateOfflineBadge(false);
    }
  }

  static updateOfflineBadge(isOnline) {
    let badge = document.getElementById('simpel-offline-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'simpel-offline-badge';
      badge.className = 'network-offline-badge';
      badge.innerHTML = `
        <span>⚡ Mode Offline</span>
        <small style="opacity: 0.9;">(Data lokal aman)</small>
      `;
      document.body.appendChild(badge);
    }

    if (isOnline) {
      badge.classList.remove('active');
    } else {
      badge.classList.add('active');
    }
  }

  /**
   * 6. Inject Platform Indicator & Quick Action in UI
   */
  static injectPlatformIndicator() {
    // Add install app trigger button to sidebar navigation if not present
    const sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav && !document.getElementById('nav-install-app')) {
      const installNavItem = document.createElement('a');
      installNavItem.className = 'nav-item nav-item-install-pwa';
      installNavItem.id = 'nav-install-app';
      installNavItem.title = 'Pasang SIMPEL-IF di HP atau Laptop';
      installNavItem.style.color = '#38bdf8';
      installNavItem.style.fontWeight = '700';
      installNavItem.innerHTML = `
        <span class="nav-icon">📲</span>
        <span>Pasang Aplikasi</span>
        <span class="badge" style="background: #0369a1; color: #fff; font-size: 0.65rem; padding: 1px 5px; border-radius: 4px;">PWA</span>
      `;
      sidebarNav.appendChild(installNavItem);

      installNavItem.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerInstall();
      });
    }

    // Add quick install button to Topbar
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !document.getElementById('btn-topbar-install-app')) {
      const btnTopInstall = document.createElement('button');
      btnTopInstall.id = 'btn-topbar-install-app';
      btnTopInstall.className = 'btn btn-outline btn-sm btn-multiplatform-install';
      btnTopInstall.title = 'Pasang Aplikasi SIMPEL-IF di Perangkat Anda';
      btnTopInstall.style.fontWeight = '700';
      btnTopInstall.style.display = 'inline-flex';
      btnTopInstall.style.alignItems = 'center';
      btnTopInstall.style.gap = '5px';
      btnTopInstall.style.padding = '6px 12px';
      btnTopInstall.style.borderRadius = 'var(--radius-md)';
      btnTopInstall.style.background = 'var(--bg-surface)';
      btnTopInstall.style.color = '#0284c7';
      btnTopInstall.style.borderColor = '#bae6fd';
      btnTopInstall.innerHTML = `
        <span>📲</span>
        <span class="btn-topbar-install-label">Pasang App</span>
      `;

      // Insert before profile button or at start of topbar actions
      const profileBtn = document.getElementById('btn-topbar-profile');
      if (profileBtn) {
        topbarRight.insertBefore(btnTopInstall, profileBtn);
      } else {
        topbarRight.appendChild(btnTopInstall);
      }

      btnTopInstall.addEventListener('click', () => {
        this.triggerInstall();
      });
    }
  }

  static bindMultiplatformButtons() {
    document.querySelectorAll('.btn-multiplatform-install').forEach(btn => {
      btn.addEventListener('click', () => {
        this.triggerInstall();
      });
    });
  }
}
