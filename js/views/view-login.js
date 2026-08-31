/**
 * SIMPEL-IF Portal Login & Pendaftaran Mahasiswa
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { getProdiBadge, getScholarshipBadge, formatRupiah } from '../utils/formatters.js';
import { AuthManager } from '../auth.js';
import { BillingEngine } from '../billing-engine.js';
import { PRODI, SCHOLARSHIP_TYPES } from '../models.js';

export function renderLoginView(container) {
  const state = appState.getState();
  const students = state.students;

  function generateNewNim(prodiCode) {
    const code = prodiCode === 'BKPI' ? '86208' : '86209';
    const prefix = `2026${code}`;
    const existingNims = state.students.map(s => s.nim);
    for (let i = 1; i <= 999; i++) {
      const candidate = `${prefix}${i.toString().padStart(3, '0')}`;
      if (!existingNims.includes(candidate)) {
        return candidate;
      }
    }
    return `${prefix}${Math.floor(100 + Math.random() * 900)}`;
  }

  function renderStudentDemoCards(studentList, st) {
    return studentList.map(s => {
      const sch = st.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
      const isNew = s.classYear === '2026' && s.semester === 1;
      return `
        <div class="student-demo-card" data-nim="${s.nim}" style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 38px; height: 38px; border-radius: var(--radius-full); background: linear-gradient(135deg, ${s.gender === 'L' ? '#1e40af, #0284c7' : '#be185d, #f472b6'}); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.82rem; flex-shrink: 0;">
              ${s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style="font-size: 0.84rem; font-weight: 800; color: var(--text-dark);">
                ${s.name} ${isNew ? '<span class="badge" style="background:#ecfdf5; color:#059669; font-size:0.62rem; padding:1px 6px;">MABA</span>' : ''}
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

  const defaultNim = generateNewNim('PIAUD');

  container.innerHTML = `
    <div style="max-width: 1020px; margin: 16px auto 40px; animation: fadeIn 0.3s ease;">
      
      <!-- Top Branding Hero -->
      <div style="text-align: center; margin-bottom: 28px;">
        <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" style="width: 80px; height: 80px; border-radius: var(--radius-xl); object-fit: contain; box-shadow: var(--shadow-md); margin-bottom: 12px; border: 2px solid #ffffff; background: #0f1e3c; padding: 4px;">
        <h1 style="font-size: 1.45rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.3px; margin: 0;">
          SIMPEL-IF &bull; STIT Ihsanul Fikri
        </h1>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 580px; margin: 4px auto 0;">
          Sistem Informasi Manajemen Pembayaran Elektronik, Tata Kelola Beasiswa & Portal Akademik
        </p>
      </div>

      <!-- Main Container Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 28px; align-items: start;">
        
        <!-- Left Column: Authentication & Registration Card -->
        <div class="card" style="padding: 28px; box-shadow: var(--shadow-lg); border-top: 5px solid var(--primary-700);">
          
          <!-- Mode Tabs (Mahasiswa vs Admin vs Register) -->
          <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-lg); margin-bottom: 22px; gap: 4px; overflow-x: auto;">
            <button type="button" id="tab-btn-student" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 800; font-size: 0.78rem; padding: 8px 10px; background: #ffffff; color: var(--primary-800); box-shadow: var(--shadow-sm); border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
              🎓 Masuk Mahasiswa
            </button>
            <button type="button" id="tab-btn-admin" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 700; font-size: 0.78rem; padding: 8px 10px; background: transparent; color: var(--text-muted); border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
              👑 Masuk Admin
            </button>
            <button type="button" id="tab-btn-register" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 700; font-size: 0.78rem; padding: 8px 10px; background: transparent; color: var(--text-muted); border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
              📝 Daftar PMB
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
                <label class="form-label" for="login-nim">Nomor Induk Mahasiswa (NIM) <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="login-nim" placeholder="Contoh: 202486209012" required style="font-family: var(--font-mono); font-size: 0.95rem; padding-left: 38px;" value="202486209012">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">👤</span>
                </div>
                <span class="input-help-text">Gunakan NIM resmi STIT Ihsanul Fikri (atau pilih akun cepat di samping)</span>
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

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 0.78rem;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted);">
                  <input type="checkbox" id="remember-nim" checked> Ingat di perangkat ini
                </label>
                <a href="javascript:void(0)" id="link-forgot-pin" style="color: var(--primary-700); font-weight: 600; text-decoration: none;">Bantuan Akun?</a>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem; font-weight: 800;">
                🚀 Masuk ke Portal Mahasiswa
              </button>
            </form>

            <!-- Callout: Pendaftaran Mahasiswa Baru -->
            <div style="margin-top: 18px; padding: 14px 16px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px dashed #059669; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div>
                <div style="font-size: 0.82rem; font-weight: 800; color: #065f46;">Mahasiswa Baru (Belum Punya Akun)?</div>
                <div style="font-size: 0.72rem; color: #047857;">Daftarkan diri Anda (PMB) & terbitkan tagihan awal.</div>
              </div>
              <button type="button" id="btn-quick-goto-register" class="btn btn-sm" style="background: #059669; color: #ffffff; font-weight: 800; white-space: nowrap; border: none; box-shadow: var(--shadow-sm); cursor: pointer;">
                Daftar PMB ✨
              </button>
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
                <span class="input-help-text">Password default: <code>admin123</code> atau <code>admin</code></span>
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

            <div style="margin-top: 18px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md); font-size: 0.76rem; color: var(--text-muted);">
              <strong>🛡️ Keamanan Sistem:</strong> Halaman Dashboard Admin memiliki hak akses penuh atas penerbitan tagihan, konfirmasi transfer manual, serta konfigurasi skema beasiswa.
            </div>
          </div>

          <!-- PANE 3: PENDAFTARAN MAHASISWA BARU (PMB) -->
          <div id="pane-student-register" style="display: none;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0;">Pendaftaran Mahasiswa Baru</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Registrasi akun mandiri & penerbitan tagihan semester awal (Maba)</p>
              </div>
              <span style="font-size: 1.8rem;">📝</span>
            </div>

            <form id="form-student-register">
              <div class="form-group">
                <label class="form-label" for="reg-name">Nama Lengkap Mahasiswa <span class="required">*</span></label>
                <input type="text" class="form-control" id="reg-name" placeholder="Contoh: Muhammad Ihsan Kamil" required>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="reg-gender">Jenis Kelamin <span class="required">*</span></label>
                  <select class="form-control" id="reg-gender" required>
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-prodi">Program Studi <span class="required">*</span></label>
                  <select class="form-control" id="reg-prodi" required>
                    <option value="PIAUD">Pendidikan Islam Anak Usia Dini (PIAUD)</option>
                    <option value="BKPI">Bimbingan Konseling Pendidikan Islam (BKPI)</option>
                  </select>
                </div>
              </div>

              <!-- Auto-Tagging Notice -->
              <div id="reg-auto-tag-alert" style="display: none; background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: var(--radius-md); margin-bottom: 14px; font-size: 0.78rem; color: #1e40af;">
                <strong>🎯 Auto-Tagging Beasiswa Aktif:</strong> Pendaftar <strong>Laki-laki</strong> di Prodi <strong>PIAUD</strong> otomatis mendapatkan afirmasi <strong>Beasiswa PAUD Laki-laki (Diskon SPP 60%)</strong>!
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="reg-nim">NIM Otomatis Generated <span class="required">*</span></label>
                  <input type="text" class="form-control" id="reg-nim" value="${defaultNim}" readonly style="background: #f8fafc; font-family: var(--font-mono); font-weight: 700; color: var(--primary-800);">
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-scholarship">Pilihan Skema Beasiswa <span class="required">*</span></label>
                  <select class="form-control" id="reg-scholarship" required>
                    ${state.scholarshipSchemes.map(sch => `
                      <option value="${sch.id}" ${sch.id === 'REGULER' ? 'selected' : ''}>${sch.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label" for="reg-email">Alamat Email Aktif <span class="required">*</span></label>
                  <input type="email" class="form-control" id="reg-email" placeholder="nama@gmail.com" required>
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-password">Buat Password / PIN <span class="required">*</span></label>
                  <div style="position: relative;">
                    <input type="password" class="form-control" id="reg-password" placeholder="Minimal 6 karakter" required value="123456" style="padding-right: 38px;">
                    <button type="button" id="btn-toggle-reg-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-light);">
                      👁️
                    </button>
                  </div>
                </div>
              </div>

              <!-- Live Simulation Preview for Registration -->
              <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 14px 16px; margin: 16px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.76rem; font-weight: 800; color: var(--text-dark); text-transform: uppercase;">Simulasi Tagihan Semester 1:</span>
                  <span class="badge badge-scholarship" id="reg-sim-badge" style="font-size: 0.68rem;">Reguler</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>SPP Pokok:</span>
                    <span style="font-family: var(--font-mono); color: var(--text-dark);" id="reg-sim-spp">Rp 2.500.000</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Daftar Ulang & Heregistrasi:</span>
                    <span style="font-family: var(--font-mono); color: var(--text-dark);">Rp 300.000</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>Formulir & Orientasi Maba (Sem 1):</span>
                    <span style="font-family: var(--font-mono); color: var(--text-dark);">Rp 350.000</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; color: #0284c7; font-weight: 700; border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 2px;">
                    <span>Potongan Subsidi Beasiswa:</span>
                    <span style="font-family: var(--font-mono);" id="reg-sim-discount">-Rp 0</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; color: var(--primary-900); font-weight: 800; font-size: 0.88rem; border-top: 1px solid var(--border-light); padding-top: 6px; margin-top: 4px;">
                    <span>Estimasi Total Tagihan:</span>
                    <span style="font-family: var(--font-mono); color: #0f172a;" id="reg-sim-total">Rp 3.150.000</span>
                  </div>
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem; font-weight: 800; background: linear-gradient(135deg, #1e40af, #0284c7);">
                🚀 Daftar & Buat Akun Mahasiswa
              </button>

              <div style="text-align: center; margin-top: 14px; font-size: 0.78rem; color: var(--text-muted);">
                Sudah memiliki akun? 
                <a href="javascript:void(0)" id="link-goto-login" style="color: var(--primary-700); font-weight: 800; text-decoration: none; margin-left: 4px;">
                  Masuk di sini ➔
                </a>
              </div>
            </form>
          </div>

        </div>

        <!-- Right Column: Quick Demo Selectors & Credentials Guide -->
        <div class="card" style="padding: 28px;">
          
          <!-- Keterangan Akun Demo / Default Credentials -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 20px;">
            <div style="font-size: 0.76rem; font-weight: 800; color: #1e40af; text-transform: uppercase;">🔑 Kredensial Login Sistem:</div>
            <div style="font-size: 0.76rem; color: #1e3a8a; margin-top: 6px; display: flex; flex-direction: column; gap: 4px;">
              <div><strong>👑 Admin:</strong> Username: <code>admin</code> &bull; Password: <code>admin123</code></div>
              <div><strong>🎓 Mahasiswa:</strong> Masukkan <strong>NIM</strong> terdaftar &bull; Password: <code>123456</code></div>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">Pilih Cepat Akun Mahasiswa</h3>
              <p style="font-size: 0.76rem; color: var(--text-light); margin: 2px 0 0;">Klik akun untuk simulasi login instan satu per satu</p>
            </div>
            <span class="badge badge-scholarship">Demo Mode</span>
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

  // 1. Tab Switching (Mahasiswa vs Admin vs Register)
  const tabBtnStudent = container.querySelector('#tab-btn-student');
  const tabBtnAdmin = container.querySelector('#tab-btn-admin');
  const tabBtnRegister = container.querySelector('#tab-btn-register');

  const paneStudent = container.querySelector('#pane-student-login');
  const paneAdmin = container.querySelector('#pane-admin-login');
  const paneRegister = container.querySelector('#pane-student-register');

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
    [paneStudent, paneAdmin, paneRegister].forEach(p => {
      if (p) p.style.display = 'none';
    });

    if (mode === 'admin') {
      tabBtnAdmin.style.background = '#ffffff';
      tabBtnAdmin.style.color = 'var(--primary-800)';
      tabBtnAdmin.style.boxShadow = 'var(--shadow-sm)';
      tabBtnAdmin.style.fontWeight = '800';
      paneAdmin.style.display = 'block';
    } else if (mode === 'register') {
      tabBtnRegister.style.background = '#ffffff';
      tabBtnRegister.style.color = 'var(--primary-800)';
      tabBtnRegister.style.boxShadow = 'var(--shadow-sm)';
      tabBtnRegister.style.fontWeight = '800';
      paneRegister.style.display = 'block';
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
  tabBtnRegister.addEventListener('click', () => setMode('register'));

  const btnQuickRegister = container.querySelector('#btn-quick-goto-register');
  if (btnQuickRegister) {
    btnQuickRegister.addEventListener('click', () => setMode('register'));
  }

  const linkGotoLogin = container.querySelector('#link-goto-login');
  if (linkGotoLogin) {
    linkGotoLogin.addEventListener('click', () => setMode('student'));
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

  const regPwdInput = container.querySelector('#reg-password');
  const btnToggleRegPwd = container.querySelector('#btn-toggle-reg-pwd');
  if (btnToggleRegPwd && regPwdInput) {
    btnToggleRegPwd.addEventListener('click', () => {
      const isPwd = regPwdInput.type === 'password';
      regPwdInput.type = isPwd ? 'text' : 'password';
      btnToggleRegPwd.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // 3. Register Form Auto-Tagging & Real-time Live Fee Simulation
  const regGender = container.querySelector('#reg-gender');
  const regProdi = container.querySelector('#reg-prodi');
  const regNim = container.querySelector('#reg-nim');
  const regScholarship = container.querySelector('#reg-scholarship');
  const regAutoTagAlert = container.querySelector('#reg-auto-tag-alert');

  const simBadge = container.querySelector('#reg-sim-badge');
  const simSpp = container.querySelector('#reg-sim-spp');
  const simDiscount = container.querySelector('#reg-sim-discount');
  const simTotal = container.querySelector('#reg-sim-total');

  function updateRegistrationSimulation() {
    const gender = regGender.value;
    const prodi = regProdi.value;
    let scholarshipId = regScholarship.value;

    // Smart Auto-Tagging condition
    if (gender === 'L' && prodi === 'PIAUD') {
      regAutoTagAlert.style.display = 'block';
      if (regScholarship.value !== 'PAUD_LAKI') {
        regScholarship.value = 'PAUD_LAKI';
        scholarshipId = 'PAUD_LAKI';
      }
    } else {
      regAutoTagAlert.style.display = 'none';
      if (regScholarship.value === 'PAUD_LAKI') {
        regScholarship.value = 'REGULER';
        scholarshipId = 'REGULER';
      }
    }

    // Temporary mock student for Semester 1 calculation
    const mockStudent = {
      nim: regNim.value || '202600000000',
      name: 'Simulasi Maba',
      gender,
      prodi,
      semester: 1,
      scholarshipId
    };

    const calc = BillingEngine.calculateInvoice(mockStudent, state.activeSemester);
    const schDef = state.scholarshipSchemes.find(sc => sc.id === scholarshipId);

    if (simBadge && schDef) {
      simBadge.textContent = schDef.name.split('(')[0];
    }
    if (simDiscount) {
      simDiscount.textContent = calc.totalDiscount > 0 ? `-${formatRupiah(calc.totalDiscount)}` : '-Rp 0';
    }
    if (simTotal) {
      simTotal.textContent = formatRupiah(calc.netAmount);
    }
  }

  if (regGender && regProdi && regScholarship) {
    regGender.addEventListener('change', () => {
      regNim.value = generateNewNim(regProdi.value);
      updateRegistrationSimulation();
    });
    regProdi.addEventListener('change', () => {
      regNim.value = generateNewNim(regProdi.value);
      updateRegistrationSimulation();
    });
    regScholarship.addEventListener('change', () => {
      updateRegistrationSimulation();
    });
  }

  // 4. Submit Registration Form
  const formRegister = container.querySelector('#form-student-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#reg-name').value.trim();
      const gender = regGender.value;
      const prodi = regProdi.value;
      const nim = regNim.value.trim();
      const scholarshipId = regScholarship.value;
      const email = container.querySelector('#reg-email').value.trim();

      if (!name) {
        window.simpelToast.show('Validasi Gagal', 'Silakan masukkan nama lengkap mahasiswa.', 'warning');
        return;
      }

      // 1. Create student model
      const newStudent = {
        nim,
        name,
        gender,
        prodi,
        classYear: '2026',
        semester: 1,
        statusAkademik: 'AKTIF',
        scholarshipId,
        email
      };

      // Add to global state
      appState.addStudent(newStudent);

      // 2. Generate initial Semester 1 Invoice with Auto-Tagging discount
      const calculatedInvoice = BillingEngine.calculateInvoice(newStudent, 1);
      
      const newInvoice = {
        id: `INV-2026-1-${nim.slice(-4)}`,
        studentNim: nim,
        semester: 1,
        academicYear: '2026/2027 Ganjil',
        items: calculatedInvoice.items,
        grossAmount: calculatedInvoice.grossAmount,
        totalDiscount: calculatedInvoice.totalDiscount,
        netAmount: calculatedInvoice.netAmount,
        paidAmount: 0,
        status: 'BELUM_BAYAR',
        dueDate: '2026-09-30',
        paymentDate: null,
        paymentMethod: null,
        virtualAccount: '1056405743',
        receiptNumber: null,
        notes: 'Tagihan Awal PMB Mahasiswa Baru 2026/2027'
      };

      appState.addInvoice(newInvoice);

      window.simpelToast.show(
        'Pendaftaran Berhasil!',
        `Selamat Datang ${name}! Akun Mahasiswa Baru & Tagihan Semester 1 Anda telah dibuat.`,
        'success',
        5000
      );

      // Automatically login as the new student and enter Portal Mahasiswa
      appState.setRole('MAHASISWA', newStudent.nim);
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  // 5. Submit Student Login Form
  const formLogin = container.querySelector('#form-student-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const nim = container.querySelector('#login-nim').value.trim();
      const pwd = container.querySelector('#login-password').value.trim();
      const currentStudents = appState.getState().students;

      const student = currentStudents.find(s => s.nim === nim);
      if (!student) {
        window.simpelToast.show('NIM Tidak Ditemukan', `NIM ${nim} belum terdaftar di sistem STIT Ihsanul Fikri. Silakan gunakan tab Pendaftaran Mahasiswa Baru.`, 'danger');
        return;
      }

      if (!pwd) {
        window.simpelToast.show('Password Kosong', 'Silakan masukkan password atau PIN akun Anda.', 'warning');
        return;
      }

      // Login success
      appState.setRole('MAHASISWA', student.nim);
      window.simpelToast.show('Login Berhasil', `Selamat datang di SIMPEL-IF, ${student.name}!`, 'success');
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  // 6. Submit Admin Login Form (Username & Password Validation)
  const formAdminLogin = container.querySelector('#form-admin-login');
  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = container.querySelector('#admin-username').value.trim().toLowerCase();
      const password = container.querySelector('#admin-password').value.trim();

      const validUsernames = ['admin', 'bendahara', 'stit-if', 'admin@stit-if.ac.id', 'admin@stit-ihsanulfikri.ac.id'];
      const validPasswords = ['admin', 'admin123', '123456', 'stit123', 'adminstit'];

      if (validUsernames.includes(username) && validPasswords.includes(password)) {
        appState.setRole('ADMIN');
        window.simpelToast.show('Login Admin Berhasil', 'Selamat datang di Pusat Komando SIMPEL-IF STIT Ihsanul Fikri.', 'success');
        if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
      } else {
        window.simpelToast.show(
          'Login Admin Gagal',
          'Username atau Password Admin salah. Gunakan username: admin dan password: admin123',
          'danger'
        );
      }
    });
  }

  // 7. Forgot PIN help
  const linkHelp = container.querySelector('#link-forgot-pin');
  if (linkHelp) {
    linkHelp.addEventListener('click', () => {
      alert('Informasi Bantuan Login:\n\n1. Login Mahasiswa: Masukkan NIM dan PIN: 123456.\n2. Login Admin: Gunakan Username: admin dan Password: admin123.\n3. Pendaftaran Mahasiswa Baru: Silakan klik tab "Daftar PMB".\n\nUntuk bantuan BAAK, hubungi Bagian Akademik & Keuangan STIT Ihsanul Fikri.');
    });
  }
}
