/**
 * SIMPEL-IF Portal Login Mahasiswa & Admin
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { AuthManager } from '../auth.js';

export function renderLoginView(container) {

  container.innerHTML = `
    <div style="max-width: 1060px; margin: 12px auto 40px; animation: fadeInScale 0.35s ease; position: relative;">
      
      <!-- Decorative Corner Ambient Glow Orbs -->
      <div style="position: absolute; top: -50px; left: -60px; width: 320px; height: 320px; background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%); filter: blur(50px); pointer-events: none; z-index: 0;"></div>
      <div style="position: absolute; top: 120px; right: -60px; width: 340px; height: 340px; background: radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 70%); filter: blur(60px); pointer-events: none; z-index: 0;"></div>

      <!-- Top Branding Hero -->
      <div style="text-align: center; margin-bottom: 26px; position: relative; z-index: 1;">
        
        <!-- Glowing Ambient Halo -->
        <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 320px; height: 130px; background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(14,165,233,0.06) 50%, transparent 80%); filter: blur(24px); pointer-events: none; z-index: 0;"></div>

        <div style="position: relative; z-index: 1;">
          <div style="display: inline-block; position: relative; margin-bottom: 12px;">
            <img src="./assets/images/logo.png" alt="Logo STIT Ihsanul Fikri" style="width: 84px; height: 84px; border-radius: 22px; object-fit: contain; box-shadow: 0 10px 25px -5px rgba(15, 30, 60, 0.4), 0 0 0 3px rgba(255,255,255,0.9); background: #0f1e3c; padding: 5px; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <span class="pulsing-dot pulsing-dot-green" style="position: absolute; bottom: 4px; right: 4px; border: 2px solid #ffffff;" title="Sistem Aktif Online"></span>
          </div>

          <!-- Basmalah Calligraphy Ornament -->
          <div class="islamic-basmalah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div class="islamic-basmalah-sub">Dengan Menyebut Nama Allah Yang Maha Pengasih Lagi Maha Penyayang</div>

          <h1 style="font-size: 1.55rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.4px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>SIMPEL-IF</span>
            <span style="font-size: 1rem; color: #94a3b8; font-weight: 400;">&bull;</span>
            <span class="gradient-text-primary">STIT Ihsanul Fikri</span>
          </h1>

          <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 600px; margin: 5px auto 0; line-height: 1.5;">
            Sistem Informasi Manajemen Pembayaran Elektronik, Tata Kelola Beasiswa & Portal Akademik Kampus
          </p>

          <!-- Decorative Feature Chips -->
          <div style="margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
            <span class="ornament-feature-chip" style="border-color: #a7f3d0; color: #065f46;"><span style="color: #059669;">🕌</span> STIT Ihsanul Fikri Magelang</span>
            <span class="ornament-feature-chip">💳 BSI Virtual Account (1056405743)</span>
            <span class="ornament-feature-chip">🎓 9 Skema Subsidi Beasiswa</span>
            <span class="ornament-feature-chip" style="border-color: #fde68a; color: #92400e;"><span style="color: #d97706;">۞</span> Amanah, Syar'i & Berkah</span>
          </div>
          
          <!-- Admin Hotline & Online Status Badge -->
          <div style="margin-top: 12px; display: inline-flex; align-items: center; gap: 10px; background: rgba(240, 253, 244, 0.95); backdrop-filter: blur(8px); border: 1px solid #86efac; border-radius: 999px; padding: 5px 16px; font-size: 0.76rem; color: #166534; box-shadow: 0 2px 6px rgba(34,197,94,0.12); flex-wrap: wrap; justify-content: center;">
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



          <div class="ornament-pinstripe" style="max-width: 480px; margin: 18px auto 0;"></div>
        </div>
      </div>

      <!-- Main Container Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(370px, 1fr)); gap: 28px; align-items: start; position: relative; z-index: 1;">
        
        <!-- Left Column: Authentication & Registration Card -->
        <div class="card card-islamic-trim" style="padding: 30px; box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(37,99,235,0.1); border-radius: var(--radius-2xl); position: relative; background: #ffffff;">
          <div class="ornament-corner-star"></div>
          
          <div style="position: relative; z-index: 1;">
            <!-- Header Kartu Login Terpadu -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;">
              <div>
                <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark); margin: 0;">Portal Masuk SIMPEL-IF</h2>
                <p style="font-size: 0.78rem; color: var(--text-light); margin: 3px 0 0;">Gunakan NIM Mahasiswa atau Akun Admin untuk masuk</p>
              </div>
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 2px 6px rgba(37,99,235,0.15);">
                🔐
              </div>
            </div>

            <!-- Single Unified Login Pane -->
            <div id="pane-student-login">
              <form id="form-student-login">
                <div class="form-group">
                  <label class="form-label" for="login-nim" style="font-weight: 700;">NIM atau Username <span class="required">*</span></label>
                  <div style="position: relative;">
                    <input type="text" class="form-control" id="login-nim" placeholder="Masukkan NIM Mahasiswa atau Username..." required autocomplete="username" style="font-family: var(--font-mono); font-size: 0.95rem; padding-left: 38px; border-radius: var(--radius-md); border-color: #cbd5e1;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #64748b;">👤</span>
                  </div>
                  <span class="input-help-text">Gunakan NIM mahasiswa atau Username akun pengelola</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="login-password" style="font-weight: 700;">Password / PIN <span class="required">*</span></label>
                  <div style="position: relative;">
                    <input type="password" class="form-control" id="login-password" placeholder="Masukkan password atau PIN..." required autocomplete="current-password" style="padding-left: 38px; padding-right: 44px; border-radius: var(--radius-md); border-color: #cbd5e1;">
                    <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #64748b;">🔒</span>
                    <button type="button" id="btn-toggle-pwd" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.15rem; color: #64748b; padding: 4px;" title="Lihat Password">
                      👁️
                    </button>
                  </div>
                  <span class="input-help-text">Masukkan PIN atau kata sandi akun Anda</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; font-size: 0.78rem; flex-wrap: wrap; gap: 8px;">
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-muted); font-weight: 600;">
                    <input type="checkbox" id="remember-nim"> Ingat di perangkat ini
                  </label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <a href="javascript:void(0)" id="link-inline-register" style="color: #2563eb; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                      <span>📝</span> <span>Buat Akun Baru</span>
                    </a>
                    <span style="color: #cbd5e1;">&bull;</span>
                    <a href="javascript:void(0)" id="link-forgot-pin" style="color: var(--primary-700); font-weight: 600; text-decoration: none;">Bantuan?</a>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-lg btn-shimmer" style="width: 100%; font-size: 0.96rem; font-weight: 800; padding: 12px 20px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); border: none; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                  🚀 Masuk ke Sistem SIMPEL-IF
                </button>

                <!-- Quick Demo Account Fillers -->
                <div style="margin-top: 16px; padding: 12px 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                    <span>⚡ Masuk Cepat / Akun Demo</span>
                    <span style="font-size: 0.68rem; color: #64748b; font-weight: 600;">Klik untuk isi otomatis</span>
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button type="button" class="btn btn-sm btn-outline btn-demo-fill" data-user="admin" data-pwd="admin123" style="font-size: 0.74rem; font-weight: 800; padding: 5px 10px; border-color: #93c5fd; background: #eff6ff; color: #1e40af; border-radius: var(--radius-sm); cursor: pointer;">
                      👑 Bendahara (Admin)
                    </button>
                    <button type="button" class="btn btn-sm btn-outline btn-demo-fill" data-user="2601001" data-pwd="123456" style="font-size: 0.74rem; font-weight: 800; padding: 5px 10px; border-color: #cbd5e1; background: #ffffff; color: #334155; border-radius: var(--radius-sm); cursor: pointer;">
                      🎓 Mhs BKPI (2601001)
                    </button>
                    <button type="button" class="btn btn-sm btn-outline btn-demo-fill" data-user="2602001" data-pwd="123456" style="font-size: 0.74rem; font-weight: 800; padding: 5px 10px; border-color: #fbcfe8; background: #fdf2f8; color: #be185d; border-radius: var(--radius-sm); cursor: pointer;">
                      🎓 Mhs PIAUD (2602001)
                    </button>
                  </div>
                </div>
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
                <button type="button" id="tab-btn-register" style="display: none;" aria-hidden="true"></button>
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
          </div>

        </div>

        <!-- Right Column: Institutional Info & Student Services Guide -->
        <div class="card card-academic-trim" style="padding: 26px; box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.08); border-radius: var(--radius-2xl); position: relative; background: #ffffff;">
          <div class="ornament-corner-star"></div>
          
          <div style="position: relative; z-index: 1;">
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

            <!-- Panduan Layanan Mahasiswa & Pembayaran Terintegrasi -->
            <div style="margin-top: 8px;">
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                <span>📘</span> <span>Panduan Pembayaran & Layanan Mahasiswa</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #f8fafc; display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: #fff; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-dark);">Akses Portal & Cek Tagihan</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Masuk menggunakan NIM terdaftar untuk melihat status rincian biaya semester, riwayat pembayaran, serta besaran subsidi beasiswa.</div>
                  </div>
                </div>

                <div style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #f8fafc; display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #0284c7; color: #fff; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-dark);">Pembayaran BSI Virtual Account / QRIS</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Gunakan Nomor Virtual Account Bank BSI resmi atau pindai QRIS dinamis untuk pembayaran instan kapan saja.</div>
                  </div>
                </div>

                <div style="padding: 12px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: #f8fafc; display: flex; gap: 12px; align-items: flex-start;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; color: #fff; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-dark);">Verifikasi & Kwitansi Ber-QR Sah</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Setelah diverifikasi, kwitansi digital resmi ber-QR Code otomatis terbit sebagai bukti sah registrasi akademik.</div>
                  </div>
                </div>
              </div>

              <!-- Button CTA Buat Akun Baru / Pendaftaran PMB -->
              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div>
                  <div style="font-size: 0.80rem; font-weight: 800; color: var(--text-dark);">Mahasiswa Baru / Belum Ada Akun?</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Daftar akun mandiri secara online untuk mendapatkan NIM & VA</div>
                </div>
                <button type="button" id="btn-quick-register-student" class="btn btn-primary btn-sm btn-shimmer" style="font-size: 0.78rem; font-weight: 800; padding: 7px 16px; border-radius: var(--radius-md); cursor: pointer; white-space: nowrap;">
                  <span>➕ Buat Akun Baru</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Decorative Institutional Footer Ornament -->
      <div style="margin-top: 36px; text-align: center; position: relative; z-index: 1;">
        <div class="ornament-pinstripe" style="max-width: 600px; margin: 0 auto 16px;"></div>
        <div style="font-size: 1.35rem; font-family: var(--font-arabic); font-weight: 700; color: #064e3b; letter-spacing: 0.5px; line-height: 1.8; direction: rtl;">
          "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ"
        </div>
        <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 4px;">
          "Barangsiapa menempuh jalan untuk menuntut ilmu, maka Allah akan memudahkan baginya jalan menuju surga." (HR. Muslim No. 2699)
        </div>
        <div style="margin-top: 10px; font-size: 0.72rem; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <span>📍 Pabelan, Magelang, Jawa Tengah</span>
          <span>&bull;</span>
          <span>🏛️ Prodi: BKPI & PIAUD</span>
          <span>&bull;</span>
          <span>🔒 Keuangan Terintegrasi & QR Sah</span>
        </div>
      </div>

    </div>
  `;





  // 1. Register Button Handlers (Student Self-Registration)
  const tabBtnRegister = container.querySelector('#tab-btn-register');
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

  // 2. Password Visibility Toggle
  const pwdInput = container.querySelector('#login-password');
  const btnToggle = container.querySelector('#btn-toggle-pwd');
  if (btnToggle && pwdInput) {
    btnToggle.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      btnToggle.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // 2b. Quick Demo Fill Handlers
  container.querySelectorAll('.btn-demo-fill').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-user');
      const p = btn.getAttribute('data-pwd');
      const inputU = container.querySelector('#login-nim');
      const inputP = container.querySelector('#login-password');
      if (inputU && inputP) {
        inputU.value = u;
        inputP.value = p;
        inputU.focus();
        if (window.simpelToast) {
          window.simpelToast.show('Akun Dipilih', `Data login terisi untuk ${btn.textContent.trim()}. Silakan klik tombol Masuk.`, 'info', 2500);
        }
      }
    });
  });

  // 3. Submit Unified Login Form (Auto-detect Admin or Student)
  const formLogin = container.querySelector('#form-student-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = container.querySelector('#login-nim').value.trim().toLowerCase();
      const pwd = container.querySelector('#login-password').value.trim();
      const remember = container.querySelector('#remember-nim')?.checked || false;

      if (!identifier) {
        window.simpelToast.show('NIM/Username Kosong', 'Silakan masukkan NIM mahasiswa atau username admin.', 'warning');
        return;
      }

      if (!pwd) {
        window.simpelToast.show('Password Kosong', 'Silakan masukkan password atau PIN akun Anda.', 'warning');
        return;
      }

      const state = appState.getState();

      // Check Admin users first (Single Admin account)
      const currentAdminUsers = state.adminUsers || [];
      const matchedAdmin = currentAdminUsers.find(a =>
        a.username.toLowerCase() === identifier ||
        (a.email && a.email.toLowerCase() === identifier)
      );

      if (matchedAdmin) {
        // Strict Password Check
        if (pwd !== matchedAdmin.password) {
          window.simpelToast.show(
            'Password Admin Salah',
            'Password yang Anda masukkan tidak sesuai untuk akun @' + matchedAdmin.username + '.',
            'danger'
          );
          return;
        }

        // Active Status Check
        if (matchedAdmin.status === 'NON_AKTIF') {
          window.simpelToast.show(
            'Akun Admin Dinonaktifkan',
            `Akun admin "${matchedAdmin.name}" sedang berstatus non-aktif.`,
            'warning'
          );
          return;
        }

        // Login as Admin
        appState.loginAsAdmin(matchedAdmin, remember);
        AuthManager.renderRoleBar();
        AuthManager.updateSidebarNav();
        window.simpelToast.show(
          'Login Admin Berhasil',
          `Selamat datang di Pusat Komando SIMPEL-IF, ${matchedAdmin.name}!`,
          'success'
        );
        if (window.simpelRouter) window.simpelRouter.navigateTo('dashboard-bendahara');
        return;
      }

      // Check Student users
      const currentStudents = state.students || [];
      const student = currentStudents.find(s => 
        s.nim.toLowerCase() === identifier || 
        (s.username && s.username.toLowerCase() === identifier) ||
        (s.email && s.email.toLowerCase() === identifier)
      );

      if (student) {
        const expectedPwd = student.password || student.pin || '123456';
        if (pwd !== expectedPwd) {
          window.simpelToast.show(
            'Password Salah',
            'Password / PIN yang Anda masukkan tidak sesuai. Hubungi Admin di 082342307414 jika lupa PIN.',
            'danger'
          );
          return;
        }

        // Login as Student
        appState.loginAsStudent(student, remember);
        AuthManager.renderRoleBar();
        AuthManager.updateSidebarNav();
        window.simpelToast.show('Login Berhasil', `Selamat datang di SIMPEL-IF, ${student.name}!`, 'success');
        if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
        return;
      }

      // If neither matches
      window.simpelToast.show(
        'Akun Tidak Ditemukan',
        `NIM atau Username "${identifier}" belum terdaftar di sistem STIT Ihsanul Fikri. Silakan hubungi Admin di 082342307414.`,
        'danger'
      );
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
              <strong>🎓 Login Mahasiswa:</strong> Masukkan <strong>NIM</strong> resmi dan kata sandi / PIN akun Anda yang telah terdaftar.
            </div>
            <div>
              <strong>👑 Login Admin:</strong> Masuk menggunakan akun admin resmi yang telah diberikan oleh pihak BAAK / Institut.
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
        alert('Informasi Bantuan Login & Akun STIT Ihsanul Fikri:\n\n1. Login Mahasiswa: Masukkan NIM dan password akun Anda.\n2. Login Admin: Masukkan username dan password admin resmi.\n\nUntuk bantuan login, reset password, dan administrasi hubungi Admin di nomor:\n082342307414 (WhatsApp / Telepon)');
      }
    });
  }
}
