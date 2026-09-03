/**
 * SIMPEL-IF Portal Login Mahasiswa & Admin
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { AuthManager } from '../auth.js';

export function renderLoginView(container) {
  const state = appState.getState();
  const students = state.students;

  function renderStudentDemoCards(studentList, st) {
    return studentList.map(s => {
      const sch = st.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
      return `
        <div class="student-demo-card" data-nim="${s.nim}" style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: var(--radius-full); background: linear-gradient(135deg, ${s.gender === 'L' ? '#1e40af, #0284c7' : '#be185d, #f472b6'}); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.82rem; flex-shrink: 0;">
              ${s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-dark);">
                ${s.name}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-family: var(--font-mono);">
                NIM: ${s.nim} &bull; Sem ${s.semester}
              </div>
            </div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${getProdiBadge(s.prodi)}
            <span style="font-size: 0.68rem; color: #0284c7; font-weight: 700;">${sch ? sch.name.split('(')[0] : 'Reguler'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div style="max-width: 1020px; margin: 16px auto 40px; animation: fadeIn 0.3s ease;">
      
      <!-- Top Branding Hero -->
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" style="width: 80px; height: 80px; border-radius: var(--radius-xl); object-fit: contain; box-shadow: var(--shadow-md); margin-bottom: 12px; border: 2px solid #ffffff; background: #0f1e3c; padding: 4px;">
        <h1 style="font-size: 1.45rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.3px; margin: 0;">
          SIMPEL-IF &bull; STIT Ihsanul Fikri
        </h1>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 580px; margin: 4px auto 0;">
          Sistem Informasi Manajemen Pembayaran Elektronik, Tata Kelola Beasiswa & Portal Akademik
        </p>
        
        <!-- Admin Contact Badge -->
        <div style="margin-top: 10px; display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px; padding: 4px 14px; font-size: 0.76rem; color: #166534; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <span>💬 Layanan Bantuan & Admin STIT IF:</span>
          <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20login%20SIMPEL-IF" target="_blank" rel="noopener" style="font-weight: 800; color: #15803d; text-decoration: none; font-family: var(--font-mono); letter-spacing: 0.3px;">082342307414 (WhatsApp)</a>
        </div>
      </div>

      <!-- Main Container Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 28px; align-items: start;">
        
        <!-- Left Column: Authentication Card -->
        <div class="card" style="padding: 28px; box-shadow: var(--shadow-lg); border-top: 5px solid var(--primary-700);">
          
          <!-- Mode Tabs (Mahasiswa vs Admin vs Daftar) -->
          <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-lg); margin-bottom: 22px; gap: 4px;">
            <button type="button" id="tab-btn-student" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 800; font-size: 0.80rem; padding: 10px 10px; background: #ffffff; color: var(--primary-800); box-shadow: var(--shadow-sm); border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-align: center;">
              🎓 Masuk Mahasiswa
            </button>
            <button type="button" id="tab-btn-admin" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 700; font-size: 0.80rem; padding: 10px 10px; background: transparent; color: var(--text-muted); border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-align: center;">
              👑 Masuk Admin
            </button>
            <button type="button" id="tab-btn-register" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 800; font-size: 0.80rem; padding: 10px 10px; background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1d4ed8; border: 1px dashed #93c5fd; cursor: pointer; transition: all 0.2s; white-space: nowrap; text-align: center;">
              📝 Buat Akun Baru
            </button>
          </div>

          <!-- PANE 1: LOGIN MAHASISWA -->
          <div id="pane-student-login">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
              <div>
                <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0;">Portal Login Mahasiswa</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Masukkan NIM dan PIN/Password akun mahasiswa</p>
              </div>
              <span style="font-size: 1.8rem;">🎓</span>
            </div>

            <form id="form-student-login">
              <div class="form-group">
                <label class="form-label" for="login-nim">NIM atau Username Mahasiswa <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="login-nim" placeholder="Masukkan NIM atau Username..." required style="font-family: var(--font-mono); font-size: 0.95rem; padding-left: 38px;" value="202486209012">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">👤</span>
                </div>
                <span class="input-help-text">Gunakan NIM resmi atau Username akun mahasiswa STIT-IF</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="login-password">PIN / Password <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="password" class="form-control" id="login-password" placeholder="Masukkan password atau PIN" required style="padding-left: 38px; padding-right: 42px;" value="123456">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">🔒</span>
                  <button type="button" id="btn-toggle-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                    👁️
                  </button>
                </div>
                <span class="input-help-text">Default PIN simulasi: <code>123456</code></span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 0.78rem; flex-wrap: wrap; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted);">
                  <input type="checkbox" id="remember-nim" checked> Ingat di perangkat ini
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <a href="javascript:void(0)" id="link-inline-register" style="color: #2563eb; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                    <span>📝</span> <span>Buat Akun Baru</span>
                  </a>
                  <span style="color: #cbd5e1;">&bull;</span>
                  <a href="javascript:void(0)" id="link-forgot-pin" style="color: var(--primary-700); font-weight: 600; text-decoration: none;">Bantuan?</a>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem; font-weight: 800;">
                🚀 Masuk ke Portal Mahasiswa
              </button>
            </form>

            <!-- Student Self-Registration CTA Card -->
            <div style="margin-top: 14px; padding: 14px 16px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px dashed #3b82f6; border-radius: var(--radius-lg); text-align: center;">
              <div style="font-size: 0.86rem; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>✨</span> Belum Memiliki Akun Mahasiswa?
              </div>
              <p style="font-size: 0.74rem; color: #1e40af; margin: 4px 0 10px;">
                Buat akun mandiri & dapatkan nomor Virtual Account BSI serta jadwal perkuliahan langsung aktif.
              </p>
              <button type="button" id="btn-open-student-register" class="btn btn-sm" style="width: 100%; background: #2563eb; color: #ffffff; font-weight: 800; font-size: 0.82rem; padding: 9px 14px; border-radius: var(--radius-md); border: none; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25); cursor: pointer;">
                📝 Buat Akun Mahasiswa Baru Sekarang ➔
              </button>
            </div>

            <!-- Callout: Kontak Admin & Bantuan Login -->
            <div style="margin-top: 14px; padding: 12px 14px; background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 36px; height: 36px; border-radius: var(--radius-full); background: #22c55e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 2px 4px rgba(34,197,94,0.3);">
                  📞
                </div>
                <div>
                  <div style="font-size: 0.78rem; font-weight: 800; color: #166534;">Kendala Login / Butuh Bantuan?</div>
                  <div style="font-size: 0.74rem; color: #15803d;">Admin: <strong style="font-family: var(--font-mono); font-weight: 800; letter-spacing: 0.3px;">082342307414</strong></div>
                </div>
              </div>
              <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20login%20SIMPEL-IF" target="_blank" rel="noopener" class="btn btn-sm" style="background: #16a34a; color: #ffffff; font-weight: 800; font-size: 0.72rem; padding: 6px 12px; border-radius: var(--radius-md); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; border: none; box-shadow: var(--shadow-sm);">
                <span>Chat WA 💬</span>
              </a>
            </div>
          </div>

          <!-- PANE 2: LOGIN ADMIN (USERNAME & PASSWORD) -->
          <div id="pane-admin-login" style="display: none;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
              <div>
                <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0;">Login Admin / Pengelola</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Akses pusat komando keuangan & tata kelola beasiswa</p>
              </div>
              <span style="font-size: 1.8rem;">👑</span>
            </div>

            <form id="form-admin-login">
              <div class="form-group">
                <label class="form-label" for="admin-username">Username / Email Admin <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="admin-username" placeholder="Masukkan username admin" required style="font-size: 0.95rem; padding-left: 38px;" value="admin">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">💼</span>
                </div>
                <span class="input-help-text">Username admin: <code>admin</code> atau <code>bendahara</code></span>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-password">Password Admin <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="password" class="form-control" id="admin-password" placeholder="Masukkan password admin" required style="padding-left: 38px; padding-right: 42px;" value="admin123">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">🔑</span>
                  <button type="button" id="btn-toggle-admin-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--text-light); padding: 4px;">
                    👁️
                  </button>
                </div>
                <span class="input-help-text">Password admin simulasi: <code>admin123</code></span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 0.78rem;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted);">
                  <input type="checkbox" id="remember-admin" checked> Ingat sesi di perangkat ini
                </label>
                <span style="color: #0284c7; font-weight: 700;">Hak Akses: Pengelola Penuh</span>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, #1e3a8a, #0f172a); border: none;">
                👑 Masuk ke Dashboard Admin
              </button>
            </form>

            <!-- Admin Help / Support hotline -->
            <div style="margin-top: 16px; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 0.76rem; color: var(--text-muted);">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>📞</span>
                <span>Bantuan Teknis Admin: <strong style="font-family: var(--font-mono); color: var(--text-dark);">082342307414</strong></span>
              </div>
              <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20bantuan%20akses%20admin%20SIMPEL-IF" target="_blank" rel="noopener" style="color: #0284c7; font-weight: 700; text-decoration: none;">Hubungi WA ➔</a>
            </div>

            <div style="margin-top: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); font-size: 0.76rem; color: var(--text-muted);">
              <strong>🛡️ Keamanan Sistem:</strong> Halaman Dashboard Admin memiliki hak akses penuh atas penerbitan tagihan, konfirmasi transfer manual, serta konfigurasi skema beasiswa.
            </div>
          </div>

        </div>

        <!-- Right Column: Demo Accounts & Quick Selection Card -->
        <div class="card" style="padding: 24px; box-shadow: var(--shadow-md); border-top: 5px solid #0284c7;">

          <!-- Keterangan Akun Demo / Default Credentials -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 16px;">
            <div style="font-size: 0.76rem; font-weight: 800; color: #1e40af; text-transform: uppercase;">🔑 Kredensial Login Terdaftar di Sistem:</div>
            <div style="font-size: 0.76rem; color: #1e3a8a; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
              <div><strong>👑 Akun Admin (${(state.adminUsers || []).length} Akun):</strong></div>
              <div style="padding-left: 8px; display: flex; flex-direction: column; gap: 2px;">
                ${(state.adminUsers || []).slice(0, 3).map(a => `<div>&bull; <strong>${a.name.split(',')[0]}:</strong> User <code>${a.username}</code> &bull; Pass <code>${a.password || 'admin123'}</code></div>`).join('')}
                ${(state.adminUsers || []).length > 3 ? `<div style="font-size: 0.70rem; color: #3b82f6;">+ ${(state.adminUsers || []).length - 3} admin lainnya terdaftar</div>` : ''}
              </div>
              <div style="margin-top: 4px;"><strong>🎓 Mahasiswa:</strong> Masukkan <strong>NIM</strong> terdaftar &bull; Password: <code>123456</code></div>
            </div>
          </div>

          <!-- Dedicated Admin Support Card with WhatsApp & Phone -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: #22c55e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 2px 6px rgba(34,197,94,0.35);">
                📱
              </div>
              <div>
                <div style="font-size: 0.76rem; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.3px;">Kontak & Helpdesk Admin</div>
                <div style="font-size: 0.95rem; font-weight: 900; color: #14532d; font-family: var(--font-mono); margin-top: 1px;">
                  082342307414
                </div>
                <div style="font-size: 0.70rem; color: #15803d;">WhatsApp / Telepon Layanan STIT Ihsanul Fikri</div>
              </div>
            </div>
            <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20layanan%20SIMPEL-IF" target="_blank" rel="noopener" class="btn btn-sm" style="background: #16a34a; color: #ffffff; font-weight: 800; font-size: 0.76rem; padding: 8px 14px; border-radius: var(--radius-md); text-decoration: none; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; box-shadow: 0 2px 4px rgba(22,163,74,0.3); border: none;">
              <span>Hubungi WA 💬</span>
            </a>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 8px;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">Pilih Cepat Akun Mahasiswa</h3>
              <p style="font-size: 0.76rem; color: var(--text-light); margin: 2px 0 0;">Klik akun untuk simulasi login instan satu per satu</p>
            </div>
            <button type="button" id="btn-quick-register-student" class="btn btn-outline btn-sm" style="font-size: 0.72rem; font-weight: 800; padding: 4px 10px; color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; display: inline-flex; align-items: center; gap: 4px; border-radius: var(--radius-md); cursor: pointer; white-space: nowrap;">
              <span>➕</span> <span>Buat Akun</span>
            </button>
          </div>

          <div id="student-demo-list-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
            ${renderStudentDemoCards(students, state)}
          </div>
        </div>

      </div>

    </div>
  `;

  function bindDemoCardListeners() {
    container.querySelectorAll('.student-demo-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--primary-600)';
        card.style.background = '#f0f9ff';
        card.style.transform = 'translateX(4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border-light)';
        card.style.background = '#ffffff';
        card.style.transform = 'translateX(0)';
      });
      card.addEventListener('click', () => {
        const nim = card.getAttribute('data-nim');
        const student = appState.getState().students.find(s => s.nim === nim);
        if (student) {
          container.querySelector('#login-nim').value = student.nim;
          container.querySelector('#login-password').value = '123456';
          
          // Instant login
          appState.setRole('MAHASISWA', student.nim);
          window.simpelToast.show('Login Berhasil', `Masuk sebagai ${student.name} (${student.prodi})`, 'success');
          if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
        }
      });
    });
  }

  bindDemoCardListeners();

  // 1. Tab Switching (Mahasiswa vs Admin vs Buat Akun)
  const tabBtnStudent = container.querySelector('#tab-btn-student');
  const tabBtnAdmin = container.querySelector('#tab-btn-admin');
  const tabBtnRegister = container.querySelector('#tab-btn-register');

  const paneStudent = container.querySelector('#pane-student-login');
  const paneAdmin = container.querySelector('#pane-admin-login');

  function setMode(mode) {
    // Reset all tabs
    [tabBtnStudent, tabBtnAdmin, tabBtnRegister].forEach(b => {
      if (b) {
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.style.boxShadow = 'none';
        b.style.fontWeight = '700';
      }
    });

    // Hide all panes
    [paneStudent, paneAdmin].forEach(p => {
      if (p) p.style.display = 'none';
    });

    if (mode === 'admin') {
      tabBtnAdmin.style.background = '#ffffff';
      tabBtnAdmin.style.color = 'var(--primary-800)';
      tabBtnAdmin.style.boxShadow = 'var(--shadow-sm)';
      tabBtnAdmin.style.fontWeight = '800';
      paneAdmin.style.display = 'block';
    } else {
      tabBtnStudent.style.background = '#ffffff';
      tabBtnStudent.style.color = 'var(--primary-800)';
      tabBtnStudent.style.boxShadow = 'var(--shadow-sm)';
      tabBtnStudent.style.fontWeight = '800';
      paneStudent.style.display = 'block';
    }
  }

  tabBtnStudent.addEventListener('click', () => setMode('student'));
  tabBtnAdmin.addEventListener('click', () => setMode('admin'));
  
  if (tabBtnRegister) {
    tabBtnRegister.addEventListener('click', () => {
      if (window.simpelModals) window.simpelModals.openStudentRegistrationModal();
    });
  }

  const btnOpenRegister = container.querySelector('#btn-open-student-register');
  if (btnOpenRegister) {
    btnOpenRegister.addEventListener('click', () => {
      if (window.simpelModals) window.simpelModals.openStudentRegistrationModal();
    });
  }

  const btnQuickRegister = container.querySelector('#btn-quick-register-student');
  if (btnQuickRegister) {
    btnQuickRegister.addEventListener('click', () => {
      if (window.simpelModals) window.simpelModals.openStudentRegistrationModal();
    });
  }

  const linkInlineRegister = container.querySelector('#link-inline-register');
  if (linkInlineRegister) {
    linkInlineRegister.addEventListener('click', () => {
      if (window.simpelModals) window.simpelModals.openStudentRegistrationModal();
    });
  }

  // 2. Password Visibility Toggles
  const pwdInput = container.querySelector('#login-password');
  const btnToggle = container.querySelector('#btn-toggle-pwd');
  if (btnToggle && pwdInput) {
    btnToggle.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      btnToggle.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  const adminPwdInput = container.querySelector('#admin-password');
  const btnToggleAdminPwd = container.querySelector('#btn-toggle-admin-pwd');
  if (btnToggleAdminPwd && adminPwdInput) {
    btnToggleAdminPwd.addEventListener('click', () => {
      const isPwd = adminPwdInput.type === 'password';
      adminPwdInput.type = isPwd ? 'text' : 'password';
      btnToggleAdminPwd.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // 3. Submit Student Login Form
  const formLogin = container.querySelector('#form-student-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = container.querySelector('#login-nim').value.trim().toLowerCase();
      const pwd = container.querySelector('#login-password').value.trim();
      const currentStudents = appState.getState().students;

      const student = currentStudents.find(s => 
        s.nim.toLowerCase() === identifier || 
        (s.username && s.username.toLowerCase() === identifier) ||
        (s.email && s.email.toLowerCase() === identifier)
      );

      if (!student) {
        window.simpelToast.show('Akun Tidak Ditemukan', `NIM atau Username "${identifier}" belum terdaftar di sistem STIT Ihsanul Fikri. Silakan hubungi Admin Keuangan di 082342307414.`, 'danger');
        return;
      }

      if (!pwd) {
        window.simpelToast.show('Password Kosong', 'Silakan masukkan password atau PIN akun Anda.', 'warning');
        return;
      }

      const expectedPwd = student.password || student.pin || '123456';
      if (pwd !== expectedPwd && pwd !== '123456' && pwd !== 'admin') {
        window.simpelToast.show('Password Salah', 'Password / PIN yang Anda masukkan tidak sesuai. Hubungi Admin Keuangan di 082342307414 jika lupa PIN.', 'danger');
        return;
      }

      // Login success
      appState.setRole('MAHASISWA', student.nim);
      window.simpelToast.show('Login Berhasil', `Selamat datang di SIMPEL-IF, ${student.name}!`, 'success');
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  // 4. Submit Admin Login Form (Dynamic Admin Validation)
  const formAdminLogin = container.querySelector('#form-admin-login');
  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = container.querySelector('#admin-username').value.trim().toLowerCase();
      const password = container.querySelector('#admin-password').value.trim();
      const currentAdminUsers = appState.getState().adminUsers || [];

      // Find matched admin account by username or email
      const matchedAdmin = currentAdminUsers.find(a =>
        a.username.toLowerCase() === username ||
        (a.email && a.email.toLowerCase() === username)
      );

      // Fallback aliases for default admin
      const isFallbackDefault = (username === 'admin' || username === 'bendahara' || username === 'stit-if') &&
                                (password === 'admin' || password === 'admin123' || password === '123456');

      if (matchedAdmin) {
        // Verify Password
        const expectedPwd = matchedAdmin.password || 'admin123';
        if (password !== expectedPwd && password !== 'admin123' && password !== 'admin') {
          window.simpelToast.show(
            'Password Admin Salah',
            'Password yang Anda masukkan tidak sesuai untuk akun @' + matchedAdmin.username + '.',
            'danger'
          );
          return;
        }

        // Verify Active Status
        if (matchedAdmin.status === 'NON_AKTIF') {
          window.simpelToast.show(
            'Akun Admin Dinonaktifkan',
            `Akun admin "${matchedAdmin.name}" sedang berstatus non-aktif. Silakan hubungi Super Admin untuk mengaktifkan kembali.`,
            'warning'
          );
          return;
        }

        // Login Success
        appState.setActiveAdmin(matchedAdmin.id);
        window.simpelToast.show(
          'Login Admin Berhasil',
          `Selamat datang di Pusat Komando SIMPEL-IF, ${matchedAdmin.name}!`,
          'success'
        );
        if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
      } else if (isFallbackDefault) {
        appState.setRole('ADMIN');
        window.simpelToast.show('Login Admin Berhasil', 'Selamat datang di Pusat Komando SIMPEL-IF STIT Ihsanul Fikri.', 'success');
        if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
      } else {
        window.simpelToast.show(
          'Login Admin Gagal',
          `Username "${username}" tidak ditemukan dalam daftar admin terdaftar. Pastikan username dan password sudah benar.`,
          'danger'
        );
      }
    });
  }

  // 5. Forgot PIN & Account Help
  const linkHelp = container.querySelector('#link-forgot-pin');
  if (linkHelp) {
    linkHelp.addEventListener('click', () => {
      if (window.simpelModals) {
        const { overlay, title, body, footer } = window.simpelModals.getModalElements();
        title.innerHTML = '💬 Pusat Bantuan Akun & Kontak Admin';
        body.innerHTML = `
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #22c55e; color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; box-shadow: 0 4px 12px rgba(34,197,94,0.3);">
              📞
            </div>
            <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-dark); margin: 0;">Butuh Bantuan Akses SIMPEL-IF?</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 6px 0 0;">Layanan Administrasi BAAK & Keuangan STIT Ihsanul Fikri</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 18px; font-size: 0.84rem; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <strong>🎓 Login Mahasiswa:</strong> Masukkan <strong>NIM</strong> Anda dan default password/PIN <code>123456</code>.
            </div>
            <div>
              <strong>👑 Login Admin:</strong> Gunakan Username <code>admin</code> dan Password <code>admin123</code>.
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: var(--radius-lg); padding: 18px; text-align: center;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #166534;">Nomor Resmi Hotline Admin / BAAK:</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: #14532d; font-family: var(--font-mono); margin: 6px 0; letter-spacing: 0.5px;">
              082342307414
            </div>
            <div style="font-size: 0.76rem; color: #15803d; margin-bottom: 14px;">Tersedia untuk panggilan telepon dan konsultasi via WhatsApp</div>
            <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20login%20atau%20reset%20password%20SIMPEL-IF" target="_blank" rel="noopener" class="btn btn-primary" style="background: #16a34a; border: none; font-weight: 800; font-size: 0.88rem; padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; border-radius: var(--radius-md); text-decoration: none; color: #ffffff; box-shadow: 0 2px 6px rgba(22,163,74,0.35);">
              <span>💬 Chat WhatsApp Sekarang</span>
            </a>
          </div>
        `;
        footer.innerHTML = `
          <button class="btn btn-secondary" id="btn-close-help-modal">Tutup</button>
        `;
        const btnClose = footer.querySelector('#btn-close-help-modal');
        if (btnClose) {
          btnClose.addEventListener('click', () => window.simpelModals.closeModal());
        }
        if (overlay) overlay.classList.add('active');
      } else {
        alert('Informasi Bantuan Login & Akun STIT Ihsanul Fikri:\n\n1. Login Mahasiswa: Masukkan NIM dan default PIN: 123456.\n2. Login Admin: Username: admin dan Password: admin123.\n\nUntuk bantuan login, reset password, dan administrasi hubungi Admin di nomor:\n082342307414 (WhatsApp / Telepon)');
      }
    });
  }
}
