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
    <div style="max-width: 980px; margin: 16px auto 40px; animation: fadeIn 0.3s ease;">
      
      <!-- Top Branding Hero -->
      <div style="text-align: center; margin-bottom: 28px;">
        <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" style="width: 80px; height: 80px; border-radius: var(--radius-xl); object-fit: contain; box-shadow: var(--shadow-md); margin-bottom: 12px; border: 2px solid #ffffff; background: #0f1e3c; padding: 4px;">
        <h1 style="font-size: 1.45rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.3px; margin: 0;">
          SIMPEL-IF &bull; STIT Ihsanul Fikri
        </h1>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 580px; margin: 4px auto 0;">
          Sistem Informasi Manajemen Pembayaran Elektronik, Beasiswa & Portal Akademik Mahasiswa
        </p>
      </div>

      <!-- Main Container Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 28px; align-items: start;">
        
        <!-- Left Column: Student Login & Registration Card -->
        <div class="card" style="padding: 28px; box-shadow: var(--shadow-lg); border-top: 5px solid var(--primary-700);">
          
          <!-- Mode Tabs (Login vs Register) -->
          <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-lg); margin-bottom: 22px; gap: 4px;">
            <button type="button" id="tab-btn-login" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 800; font-size: 0.82rem; padding: 8px 12px; background: #ffffff; color: var(--primary-800); box-shadow: var(--shadow-sm); border: none; cursor: pointer; transition: all 0.2s;">
              🔑 Masuk Mahasiswa
            </button>
            <button type="button" id="tab-btn-register" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-md); font-weight: 700; font-size: 0.82rem; padding: 8px 12px; background: transparent; color: var(--text-muted); border: none; cursor: pointer; transition: all 0.2s;">
              📝 Daftar Mahasiswa Baru
            </button>
          </div>

          <!-- PANE 1: LOGIN MAHASISWA -->
          <div id="pane-student-login">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
              <div>
                <h2 style="font-size: 1.15rem; font-weight: 800; color: var(--text-dark); margin: 0;">Portal Login Mahasiswa</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Masukkan NIM dan PIN/Password akun Anda</p>
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
                <span class="input-help-text">Gunakan NIM resmi yang terdaftar di STIT-IF</span>
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
                <span class="input-help-text">Default PIN simulasi: <code>123456</code> atau NIM</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 0.78rem;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted);">
                  <input type="checkbox" id="remember-nim" checked> Ingat NIM di perangkat ini
                </label>
                <a href="javascript:void(0)" id="link-forgot-pin" style="color: var(--primary-700); font-weight: 600; text-decoration: none;">Bantuan Login?</a>
              </div>

              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 0.95rem; font-weight: 700;">
                🚀 Masuk ke Portal Mahasiswa
              </button>
            </form>

            <!-- Callout: Pendaftaran Mahasiswa Baru -->
            <div style="margin-top: 18px; padding: 14px 16px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px dashed #059669; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div>
                <div style="font-size: 0.82rem; font-weight: 800; color: #065f46;">Belum Memiliki Akun Mahasiswa?</div>
                <div style="font-size: 0.72rem; color: #047857;">Daftarkan diri Anda sebagai Mahasiswa Baru (PMB) & terbitkan tagihan awal.</div>
              </div>
              <button type="button" id="btn-quick-goto-register" class="btn btn-sm" style="background: #059669; color: #ffffff; font-weight: 800; white-space: nowrap; border: none; box-shadow: var(--shadow-sm); cursor: pointer;">
                Daftar Sekarang ✨
              </button>
            </div>

            <!-- Quick Notice -->
            <div style="margin-top: 16px; padding: 12px 14px; background: var(--primary-50); border: 1px solid var(--primary-100); border-radius: var(--radius-md); font-size: 0.76rem; color: var(--primary-900); line-height: 1.45;">
              <strong>💡 Informasi:</strong> Mahasiswa aktif prodi BKPI dan PIAUD dapat memeriksa rincian tagihan, skema beasiswa, dan pembayaran Virtual Account.
            </div>
          </div>

          <!-- PANE 2: PENDAFTARAN MAHASISWA BARU (PMB) -->
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
                <div style="position: relative;">
                  <input type="text" class="form-control" id="reg-name" placeholder="Contoh: Muhammad Raihan Al-Ghifari" required style="padding-left: 36px;">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.95rem; color: var(--text-light);">✏️</span>
                </div>
              </div>

              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label" for="reg-gender">Jenis Kelamin <span class="required">*</span></label>
                  <select class="filter-select" id="reg-gender" style="width: 100%;">
                    <option value="L" selected>Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="reg-prodi">Program Studi <span class="required">*</span></label>
                  <select class="filter-select" id="reg-prodi" style="width: 100%;">
                    <option value="PIAUD" selected>PIAUD (PAUD Islam)</option>
                    <option value="BKPI">BKPI (Bimbingan Konseling)</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="reg-nim">NIM / Nomor Pendaftaran PMB <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="reg-nim" value="${defaultNim}" required style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; padding-left: 36px;">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.95rem; color: var(--text-light);">🆔</span>
                </div>
                <span class="input-help-text">Nomor Induk Mahasiswa otomatis STIT Ihsanul Fikri</span>
              </div>

              <!-- Skema Beasiswa -->
              <div class="form-group">
                <label class="form-label" for="reg-scholarship">Skema Pembiayaan / Beasiswa <span class="required">*</span></label>
                <select class="filter-select" id="reg-scholarship" style="width: 100%;">
                  ${state.scholarshipSchemes.map(sc => `
                    <option value="${sc.id}" ${sc.id === 'PAUD_LAKI' ? 'selected' : ''}>
                      ${sc.name} (${sc.id === 'REGULER' ? 'Tarif Standar' : sc.discountType === 'PERCENT' ? 'Diskon SPP ' + sc.discountValue + '%' : 'Subsidi ' + formatRupiah(sc.discountValue)})
                    </option>
                  `).join('')}
                </select>
                
                <!-- Auto-tagging notification highlight -->
                <div id="reg-auto-tag-alert" style="margin-top: 8px; padding: 8px 12px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: var(--radius-md); font-size: 0.74rem; color: #be185d; line-height: 1.4; display: block;">
                  ✨ <strong>Rekomendasi Cerdas:</strong> Terdeteksi mahasiswa putra prodi PIAUD. Skema <em>Beasiswa Afirmasi PAUD Laki-laki (Diskon SPP 60%)</em> otomatis diterapkan!
                </div>
              </div>

              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label" for="reg-phone">No. WhatsApp / HP <span class="required">*</span></label>
                  <input type="tel" class="form-control" id="reg-phone" value="0812-7788-9900" placeholder="0812-xxxx-xxxx" required style="font-size: 0.84rem;">
                </div>
                <div class="form-group">
                  <label class="form-label" for="reg-password">PIN / Password Login <span class="required">*</span></label>
                  <div style="position: relative;">
                    <input type="password" class="form-control" id="reg-password" value="123456" required style="padding-right: 36px; font-size: 0.84rem;">
                    <button type="button" id="btn-toggle-reg-pwd" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1rem; color: var(--text-light);">
                      👁️
                    </button>
                  </div>
                </div>
              </div>

              <!-- Live Tuition Fee Breakdown Simulation Card -->
              <div style="margin: 16px 0; padding: 14px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-dark);">📊 Simulasi Tagihan Semester 1 (Maba)</span>
                  <span class="badge badge-scholarship" id="reg-sim-badge">PAUD Laki-laki</span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; color: var(--text-muted);">
                  <div style="display: flex; justify-content: space-between;">
                    <span>SPP Pokok Semester:</span>
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
                    <span style="font-family: var(--font-mono);" id="reg-sim-discount">-Rp 1.500.000</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; color: var(--primary-900); font-weight: 800; font-size: 0.88rem; border-top: 1px solid var(--border-light); padding-top: 6px; margin-top: 4px;">
                    <span>Estimasi Total Tagihan:</span>
                    <span style="font-family: var(--font-mono); color: #0f172a;" id="reg-sim-total">Rp 1.650.000</span>
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

        <!-- Right Column: Quick Demo Selectors for Testing Individual Students -->
        <div class="card" style="padding: 28px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">Pilih Cepat Akun Mahasiswa</h3>
              <p style="font-size: 0.76rem; color: var(--text-light); margin: 2px 0 0;">Klik akun untuk simulasi login instan satu per satu</p>
            </div>
            <span class="badge badge-scholarship">Demo Mode</span>
          </div>

          <div id="student-demo-list-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto; padding-right: 4px;">
            ${renderStudentDemoCards(students, state)}
          </div>

          <!-- Staff Login Alternative -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px dashed var(--border-color); text-align: center;">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Bukan Mahasiswa? </span>
            <button class="btn btn-outline btn-sm" id="btn-login-as-bendahara" style="margin-left: 6px; font-weight: 700;">
              👑 Masuk Sebagai Admin
            </button>
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

  // 1. Tab Switching (Login vs Register)
  const tabBtnLogin = container.querySelector('#tab-btn-login');
  const tabBtnRegister = container.querySelector('#tab-btn-register');
  const paneLogin = container.querySelector('#pane-student-login');
  const paneRegister = container.querySelector('#pane-student-register');

  function setMode(mode) {
    if (mode === 'register') {
      tabBtnLogin.style.background = 'transparent';
      tabBtnLogin.style.color = 'var(--text-muted)';
      tabBtnLogin.style.boxShadow = 'none';

      tabBtnRegister.style.background = '#ffffff';
      tabBtnRegister.style.color = 'var(--primary-800)';
      tabBtnRegister.style.boxShadow = 'var(--shadow-sm)';

      paneLogin.style.display = 'none';
      paneRegister.style.display = 'block';
    } else {
      tabBtnRegister.style.background = 'transparent';
      tabBtnRegister.style.color = 'var(--text-muted)';
      tabBtnRegister.style.boxShadow = 'none';

      tabBtnLogin.style.background = '#ffffff';
      tabBtnLogin.style.color = 'var(--primary-800)';
      tabBtnLogin.style.boxShadow = 'var(--shadow-sm)';

      paneRegister.style.display = 'none';
      paneLogin.style.display = 'block';
    }
  }

  tabBtnLogin.addEventListener('click', () => setMode('login'));
  tabBtnRegister.addEventListener('click', () => setMode('register'));

  const btnQuickRegister = container.querySelector('#btn-quick-goto-register');
  if (btnQuickRegister) {
    btnQuickRegister.addEventListener('click', () => setMode('register'));
  }

  const linkGotoLogin = container.querySelector('#link-goto-login');
  if (linkGotoLogin) {
    linkGotoLogin.addEventListener('click', () => setMode('login'));
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

  regGender.addEventListener('change', () => {
    updateRegistrationSimulation();
  });

  regProdi.addEventListener('change', () => {
    // Generate new NIM on prodi change
    regNim.value = generateNewNim(regProdi.value);
    updateRegistrationSimulation();
  });

  regScholarship.addEventListener('change', () => {
    // If user manually changes away from PAUD_LAKI when male PIAUD
    if (regScholarship.value !== 'PAUD_LAKI' && regGender.value === 'L' && regProdi.value === 'PIAUD') {
      regAutoTagAlert.style.display = 'none';
    }
    updateRegistrationSimulation();
  });

  // 4. Submit Registration Form
  const formRegister = container.querySelector('#form-student-register');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = container.querySelector('#reg-name').value.trim();
      const nim = regNim.value.trim();
      const gender = regGender.value;
      const prodi = regProdi.value;
      const scholarshipId = regScholarship.value;
      const phone = container.querySelector('#reg-phone').value.trim();
      const password = regPwdInput.value.trim();

      if (!name || !nim) {
        window.simpelToast.show('Data Belum Lengkap', 'Nama dan NIM mahasiswa wajib diisi.', 'warning');
        return;
      }

      // Check duplicate NIM
      const currentState = appState.getState();
      if (currentState.students.some(s => s.nim === nim)) {
        window.simpelToast.show('NIM Sudah Terdaftar', `NIM ${nim} sudah ada di database. Silakan gunakan NIM lain atau login langsung.`, 'danger');
        return;
      }

      const newStudent = {
        nim,
        name,
        gender,
        prodi,
        semester: 1,
        classYear: '2026',
        statusAkademik: 'Aktif',
        scholarshipId,
        phone: phone || '0812-0000-0000',
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mahasiswa.stit-ihsanulfikri.ac.id`
      };

      // Add to state students
      currentState.students.unshift(newStudent);

      // Automatically generate initial invoice for Semester 1 (Maba)
      const calc = BillingEngine.calculateInvoice(newStudent, currentState.activeSemester);
      const newInv = {
        id: `INV-${Date.now().toString().slice(-6)}-${newStudent.nim.slice(-3)}`,
        studentNim: newStudent.nim,
        semester: currentState.activeSemester,
        createdDate: new Date().toISOString().slice(0, 10),
        dueDate: '2026-09-10',
        items: calc.items,
        grossAmount: calc.grossAmount,
        totalDiscount: calc.totalDiscount,
        netAmount: calc.netAmount,
        paidAmount: 0,
        status: 'BELUM_BAYAR',
        paymentMethod: null,
        receiptNumber: null,
        paymentDate: null,
        virtualAccount: calc.virtualAccount,
        notes: `Pendaftaran mandiri mahasiswa baru. Tagihan semester 1 (${currentState.activeSemester}) otomatis diterbitkan.`
      };
      currentState.invoices.unshift(newInv);

      // Add Audit Log
      appState.addAuditLog(
        'REGISTRASI_MAHASISWA_BARU',
        `${name} (${nim})`,
        `Pendaftaran mandiri mahasiswa baru prodi ${prodi} dengan skema ${scholarshipId}. Tagihan awal semester 1 sebesar ${formatRupiah(calc.netAmount)} diterbitkan.`
      );

      // Save and notify state
      appState.notify();

      window.simpelToast.show(
        'Pendaftaran Mahasiswa Berhasil!',
        `Selamat datang di STIT Ihsanul Fikri, ${name}! Akun mahasiswa & tagihan awal Anda telah aktif.`,
        'success',
        5000
      );

      // Automatically login as the new student and enter Portal Mahasiswa
      appState.setRole('MAHASISWA', newStudent.nim);
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  // 5. Submit Login Form
  const formLogin = container.querySelector('#form-student-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const nim = container.querySelector('#login-nim').value.trim();
      const currentStudents = appState.getState().students;

      const student = currentStudents.find(s => s.nim === nim);
      if (!student) {
        window.simpelToast.show('NIM Tidak Ditemukan', `NIM ${nim} belum terdaftar di sistem STIT Ihsanul Fikri. Silakan gunakan tab Pendaftaran Mahasiswa Baru.`, 'danger');
        return;
      }

      // Login success
      appState.setRole('MAHASISWA', student.nim);
      window.simpelToast.show('Login Berhasil', `Selamat datang di SIMPEL-IF, ${student.name}!`, 'success');
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  }

  // 6. Login as Admin button
  const btnBendahara = container.querySelector('#btn-login-as-bendahara');
  if (btnBendahara) {
    btnBendahara.addEventListener('click', () => {
      appState.setRole('ADMIN');
      window.simpelToast.show('Login Admin Berhasil', 'Masuk sebagai Admin SIMPEL-IF STIT Ihsanul Fikri.', 'info');
      if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
    });
  }

  // 7. Forgot PIN help
  const linkHelp = container.querySelector('#link-forgot-pin');
  if (linkHelp) {
    linkHelp.addEventListener('click', () => {
      alert('Informasi Bantuan Login:\n\nUntuk simulasi, Anda dapat menggunakan NIM yang terdaftar dengan PIN: 123456.\n\nJika baru ingin mendaftar sebagai mahasiswa baru, silakan klik tab "Daftar Mahasiswa Baru".\n\nUntuk bantuan BAAK, silakan hubungi Bagian Akademik & Keuangan STIT Ihsanul Fikri.');
    });
  }
}
