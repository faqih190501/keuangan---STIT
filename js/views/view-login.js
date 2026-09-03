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
        <div class="student-demo-card interactive-hover-card" data-nim="${s.nim}" style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #ffffff; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: linear-gradient(135deg, ${s.gender === 'L' ? '#1e40af, #0284c7' : '#be185d, #f472b6'}); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.84rem; flex-shrink: 0; box-shadow: 0 2px 6px ${s.gender === 'L' ? 'rgba(37,99,235,0.3)' : 'rgba(236,72,153,0.3)'};">
              ${s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style="font-size: 0.86rem; font-weight: 800; color: var(--text-dark);">
                ${s.name}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-family: var(--font-mono); margin-top: 1px;">
                NIM: ${s.nim} &bull; Sem ${s.semester}
              </div>
            </div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${getProdiBadge(s.prodi)}
            <span style="font-size: 0.68rem; color: #0284c7; font-weight: 700; background: #f0f9ff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e0f2fe;">${sch ? sch.name.split('(')[0] : 'Reguler'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div style="max-width: 1060px; margin: 12px auto 40px; animation: fadeInScale 0.35s ease;">
      
      <!-- Top Branding Hero -->
      <div style="text-align: center; margin-bottom: 26px; position: relative;">
        
        <!-- Glowing Ambient Halo -->
        <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 280px; height: 120px; background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(14,165,233,0.05) 50%, transparent 80%); filter: blur(20px); pointer-events: none; z-index: 0;"></div>

        <div style="position: relative; z-index: 1;">
          <div style="display: inline-block; position: relative; margin-bottom: 12px;">
            <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" style="width: 84px; height: 84px; border-radius: 22px; object-fit: contain; box-shadow: 0 10px 25px -5px rgba(15, 30, 60, 0.4), 0 0 0 3px rgba(255,255,255,0.9); background: #0f1e3c; padding: 5px; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span class="pulsing-dot pulsing-dot-green" style="position: absolute; bottom: 4px; right: 4px; border: 2px solid #ffffff;" title="Sistem Aktif Online"></span>
          </div>

          <h1 style="font-size: 1.55rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.4px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>SIMPEL-IF</span>
            <span style="font-size: 1rem; color: #94a3b8; font-weight: 400;">&bull;</span>
            <span class="gradient-text-primary">STIT Ihsanul Fikri</span>
          </h1>

          <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 600px; margin: 5px auto 0; line-height: 1.5;">
            Sistem Informasi Manajemen Pembayaran Elektronik, Tata Kelola Beasiswa & Portal Akademik Kampus
          </p>
          
          <!-- Admin Hotline & Online Status Badge -->
          <div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 10px; background: rgba(240, 253, 244, 0.9); backdrop-filter: blur(8px); border: 1px solid #86efac; border-radius: 999px; padding: 5px 16px; font-size: 0.76rem; color: #166534; box-shadow: 0 2px 6px rgba(34,197,94,0.12); flex-wrap: wrap; justify-content: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="pulsing-dot pulsing-dot-green"></span>
              <span>WhatsApp Admin:</span>
              <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20login%20SIMPEL-IF" target="_blank" rel="noopener" style="font-weight: 800; color: #15803d; text-decoration: none; font-family: var(--font-mono); letter-spacing: 0.3px;">
                082342307414 💬
              </a>
            </div>
            <span style="color: #86efac;">&bull;</span>
            <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px; color: #15803d; font-weight: 800; text-decoration: underline;" title="Buka Website Resmi STIT Ihsanul Fikri">
              <span>🌐</span> <span>www.stitihsanulfikri.ac.id ↗</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Main Container Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(370px, 1fr)); gap: 28px; align-items: start;">
        
        <!-- Left Column: Authentication & Registration Card -->
        <div class="card" style="padding: 30px; box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(37,99,235,0.1); border-top: 5px solid var(--primary-700); border-radius: var(--radius-2xl);">
          
          <!-- Segmented Navigation Tabs -->
          <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-xl); margin-bottom: 24px; gap: 4px; border: 1px solid #e2e8f0;">
            <button type="button" id="tab-btn-student" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.80rem; padding: 10px 8px; background: #ffffff; color: var(--primary-800); box-shadow: 0 2px 5px rgba(0,0,0,0.08); border: none; cursor: pointer; transition: all 0.25s ease; white-space: nowrap; text-align: center;">
              🎓 Masuk Mahasiswa
            </button>
            <button type="button" id="tab-btn-admin" class="btn btn-sm" style="flex: 1; border-radius: var(--radius-lg); font-weight: 700; font-size: 0.80rem; padding: 10px 8px; background: transparent; color: var(--text-muted); border: none; cursor: pointer; transition: all 0.25s ease; white-space: nowrap; text-align: center;">
              👑 Masuk Admin
            </button>
            <button type="button" id="tab-btn-register" class="btn btn-sm btn-shimmer" style="flex: 1.1; border-radius: var(--radius-lg); font-weight: 800; font-size: 0.80rem; padding: 10px 8px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); color: #1d4ed8; border: 1px dashed #60a5fa; cursor: pointer; transition: all 0.25s ease; white-space: nowrap; text-align: center; box-shadow: 0 1px 3px rgba(37,99,235,0.1);">
              ✨ Buat Akun Baru
            </button>
          </div>

          <!-- PANE 1: LOGIN MAHASISWA -->
          <div id="pane-student-login">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0;">Portal Login Mahasiswa</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Gunakan NIM dan PIN untuk mengakses dashboard akademik & keuangan</p>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 2px 6px rgba(37,99,235,0.15);">
                🎓
              </div>
            </div>

            <form id="form-student-login">
              <div class="form-group">
                <label class="form-label" for="login-nim" style="font-weight: 700;">NIM atau Username Mahasiswa <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="login-nim" placeholder="Masukkan NIM atau Username..." required style="font-family: var(--font-mono); font-size: 0.95rem; padding-left: 38px; border-radius: var(--radius-md); border-color: #cbd5e1;" value="202486209012">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #64748b;">👤</span>
                </div>
                <span class="input-help-text">Gunakan NIM resmi atau Username akun mahasiswa STIT-IF</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="login-password" style="font-weight: 700;">PIN / Password <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="password" class="form-control" id="login-password" placeholder="Masukkan password atau PIN" required style="padding-left: 38px; padding-right: 44px; border-radius: var(--radius-md); border-color: #cbd5e1;" value="123456">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #64748b;">🔒</span>
                  <button type="button" id="btn-toggle-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.15rem; color: #64748b; padding: 4px;" title="Lihat Password">
                    👁️
                  </button>
                </div>
                <span class="input-help-text">Default PIN simulasi mahasiswa: <code>123456</code></span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; font-size: 0.78rem; flex-wrap: wrap; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted); font-weight: 600;">
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

              <button type="submit" class="btn btn-primary btn-lg btn-shimmer" style="width: 100%; font-size: 0.96rem; font-weight: 800; padding: 12px 20px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); border: none; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">
                🚀 Masuk ke Portal Mahasiswa
              </button>
            </form>

            <!-- VIP Student Self-Registration CTA Card -->
            <div class="vip-register-card" style="margin-top: 18px; padding: 16px 18px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="font-size: 0.88rem; font-weight: 900; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
                  <span>✨</span> Belum Memiliki Akun Mahasiswa?
                </div>
                <span class="badge" style="background: #ffffff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
                  PMB 2026/2027
                </span>
              </div>
              <p style="font-size: 0.75rem; color: #1e40af; margin: 0 0 10px; line-height: 1.4;">
                Daftar akun mandiri dalam 1 menit: dapatkan <strong>Nomor Virtual Account Bank BSI</strong>, jadwal kuliah, dan klaim skema beasiswa.
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px; font-size: 0.72rem; color: #1e3a8a; font-weight: 600;">
                <div style="display: flex; align-items: center; gap: 4px;"><span>✓</span> BSI VA 1056405743</div>
                <div style="display: flex; align-items: center; gap: 4px;"><span>✓</span> Skema Beasiswa Santri</div>
                <div style="display: flex; align-items: center; gap: 4px;"><span>✓</span> Portal KRS Terintegrasi</div>
                <div style="display: flex; align-items: center; gap: 4px;"><span>✓</span> Akun Langsung Aktif</div>
              </div>
              <button type="button" id="btn-open-student-register" class="btn btn-sm btn-shimmer" style="width: 100%; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 800; font-size: 0.84rem; padding: 10px 14px; border-radius: var(--radius-md); border: none; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>📝</span> <span>Buat Akun Mahasiswa Baru Sekarang ➔</span>
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
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
              <div>
                <h2 style="font-size: 1.2rem; font-weight: 800; color: var(--text-dark); margin: 0;">Login Admin / Pengelola</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Akses pusat komando keuangan & tata kelola beasiswa</p>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #0f172a; color: #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                👑
              </div>
            </div>

            <form id="form-admin-login">
              <div class="form-group">
                <label class="form-label" for="admin-username" style="font-weight: 700;">Username / Email Admin <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="text" class="form-control" id="admin-username" placeholder="Masukkan username admin" required style="font-size: 0.95rem; padding-left: 38px; border-radius: var(--radius-md);" value="admin">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">💼</span>
                </div>
                <span class="input-help-text">Username admin: <code>admin</code> atau <code>bendahara</code></span>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-password" style="font-weight: 700;">Password Admin <span class="required">*</span></label>
                <div style="position: relative;">
                  <input type="password" class="form-control" id="admin-password" placeholder="Masukkan password admin" required style="padding-left: 38px; padding-right: 44px; border-radius: var(--radius-md);" value="admin123">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: var(--text-light);">🔑</span>
                  <button type="button" id="btn-toggle-admin-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.15rem; color: var(--text-light); padding: 4px;">
                    👁️
                  </button>
                </div>
                <span class="input-help-text">Password admin simulasi: <code>admin123</code></span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; font-size: 0.78rem;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted); font-weight: 600;">
                  <input type="checkbox" id="remember-admin" checked> Ingat sesi di perangkat ini
                </label>
                <span style="color: #0284c7; font-weight: 700;">Hak Akses: Pengelola Penuh</span>
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-shimmer" style="width: 100%; font-size: 0.96rem; font-weight: 800; padding: 12px 20px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); border: none; box-shadow: 0 4px 12px rgba(15,23,42,0.3);">
                👑 Masuk ke Dashboard Admin
              </button>
            </form>

            <!-- Admin Help / Support hotline -->
            <div style="margin-top: 16px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 0.76rem; color: var(--text-muted);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem;">📞</span>
                <span>Bantuan Teknis Admin: <strong style="font-family: var(--font-mono); color: var(--text-dark);">082342307414</strong></span>
              </div>
              <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20bantuan%20akses%20admin%20SIMPEL-IF" target="_blank" rel="noopener" style="color: #0284c7; font-weight: 800; text-decoration: none;">Hubungi WA ➔</a>
            </div>

            <div style="margin-top: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-lg); font-size: 0.76rem; color: var(--text-muted);">
              <strong>🛡️ Keamanan Sistem:</strong> Halaman Dashboard Admin memiliki hak akses penuh atas penerbitan tagihan, konfirmasi transfer manual, serta konfigurasi skema beasiswa.
            </div>
          </div>

        </div>

        <!-- Right Column: Demo Accounts & Quick Selection Card -->
        <div class="card" style="padding: 26px; box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.08); border-top: 5px solid #0284c7; border-radius: var(--radius-2xl);">

          <!-- Keterangan Akun Demo / Default Credentials -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: var(--radius-xl); padding: 14px 18px; margin-bottom: 16px;">
            <div style="font-size: 0.76rem; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.3px;">🔑 Kredensial Login Terdaftar di Sistem:</div>
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
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: var(--radius-xl); padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: var(--shadow-sm); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: #22c55e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 2px 6px rgba(34,197,94,0.35);">
                📱
              </div>
              <div>
                <div style="font-size: 0.76rem; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.3px;">Kontak & Helpdesk Admin</div>
                <div style="font-size: 0.95rem; font-weight: 900; color: #14532d; font-family: var(--font-mono); margin-top: 1px;">
                  082342307414
                </div>
                <div style="font-size: 0.70rem; color: #15803d;">WhatsApp / Telepon &bull; <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" style="color: #15803d; font-weight: 700; text-decoration: underline;">stitihsanulfikri.ac.id</a></div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <a href="https://www.stitihsanulfikri.ac.id/" target="_blank" rel="noopener" class="btn btn-sm btn-shimmer" style="background: #ffffff; color: #166534; border: 1px solid #86efac; font-weight: 800; font-size: 0.74rem; padding: 7px 12px; border-radius: var(--radius-md); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span>🌐 Web ↗</span>
              </a>
              <a href="https://wa.me/6282342307414?text=Halo%20Admin%20STIT%20Ihsanul%20Fikri,%20saya%20butuh%20bantuan%20layanan%20SIMPEL-IF" target="_blank" rel="noopener" class="btn btn-sm btn-shimmer" style="background: #16a34a; color: #ffffff; font-weight: 800; font-size: 0.74rem; padding: 7px 12px; border-radius: var(--radius-md); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(22,163,74,0.3); border: none;">
                <span>WA 💬</span>
              </a>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 8px;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">Pilih Cepat Akun Mahasiswa</h3>
              <p style="font-size: 0.76rem; color: var(--text-light); margin: 2px 0 0;">Klik akun untuk simulasi login instan satu per satu</p>
            </div>
            <button type="button" id="btn-quick-register-student" class="btn btn-outline btn-sm btn-shimmer" style="font-size: 0.74rem; font-weight: 800; padding: 5px 12px; color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; display: inline-flex; align-items: center; gap: 4px; border-radius: var(--radius-md); cursor: pointer; white-space: nowrap; box-shadow: 0 1px 2px rgba(37,99,235,0.1);">
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
