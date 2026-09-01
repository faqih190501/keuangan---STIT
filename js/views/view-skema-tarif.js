/**
 * SIMPEL-IF Modul Konfigurasi Skema Beasiswa & Tarif (Fitur Utama Bendahara / Admin)
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, getScholarshipBadge, getProdiBadge } from '../utils/formatters.js';
import { BillingEngine } from '../billing-engine.js';

export function renderSkemaTarifView(container) {
  const state = appState.getState();
  const feeComponents = state.feeComponents;
  const scholarshipSchemes = state.scholarshipSchemes;
  const individualOverrides = state.individualOverrides || [];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-dark);">⚙️ Konfigurasi Tarif Komponen & Skema Beasiswa</h2>
        <p style="font-size: 0.8rem; color: var(--text-light);">Admin/Bendahara dapat mengedit nama, regulasi, persentase diskon, menambah skema program beasiswa baru, serta menetapkan dispensasi cicilan mahasiswa.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-open-add-scheme">
          + Tambah Skema Beasiswa Baru
        </button>
        <button class="btn btn-outline" id="btn-open-add-override">
          ✍️ Tambah Override / Dispensasi
        </button>
      </div>
    </div>

    <!-- Section 1: Skema Program Beasiswa -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title-group">
          <h3 class="card-title">🎓 Pengaturan Skema Program Beasiswa Kampus (${scholarshipSchemes.length} Skema Aktif)</h3>
          <p class="card-subtitle">Menentukan besaran potongan subsidi biaya SPP per semester (Persentase % atau Nominal Tetap Rp)</p>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-add-scheme-card-header">
          + Skema Baru
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        ${scholarshipSchemes.map(scheme => {
          const discountDisplay = scheme.id === 'REGULER' 
            ? 'Tanpa Potongan (0%)' 
            : scheme.discountType === 'PERCENT'
              ? `${scheme.discountValue}% (${formatRupiah((2500000 * scheme.discountValue) / 100)} / sem)`
              : `${formatRupiah(scheme.discountValue)} (Subsidi Tetap)`;

          const studentCount = state.students.filter(s => s.scholarshipId === scheme.id).length;
          const prodiBadges = scheme.eligibleProdi && scheme.eligibleProdi.length > 0
            ? scheme.eligibleProdi.map(p => getProdiBadge(p)).join(' ')
            : '<span class="badge badge-scholarship">Semua Prodi</span>';

          const topBorderColor = scheme.id === 'PAUD_LAKI' ? '#be185d' : 
                                 scheme.id === 'ASRAMA' ? '#1e40af' : 
                                 scheme.id === 'MITRA' ? '#0284c7' : 
                                 scheme.id === 'REGULER' ? '#64748b' : '#10b981';

          return `
            <div style="border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 20px; background: #ffffff; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid ${topBorderColor};">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 8px;">
                  <h4 style="font-size: 0.96rem; font-weight: 800; color: var(--text-dark); margin: 0;">${scheme.name}</h4>
                  ${getScholarshipBadge(scheme.id)}
                </div>
                
                <div style="margin-bottom: 10px; display: flex; gap: 4px; align-items: center;">
                  <span style="font-size: 0.72rem; color: var(--text-light); font-weight: 600;">Prodi:</span>
                  ${prodiBadges}
                </div>

                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px; min-height: 48px;">
                  ${scheme.description}
                </p>

                <div style="background: #f8fafc; border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 600; text-transform: uppercase;">Besaran Subsidi SPP</div>
                  <div style="font-size: 1.12rem; font-weight: 800; color: var(--primary-800); margin-top: 2px;">
                    ${discountDisplay}
                  </div>
                </div>

                <div style="font-size: 0.74rem; color: var(--text-light); display: flex; justify-content: space-between; align-items: center;">
                  <span>👥 Mahasiswa Terdaftar:</span>
                  <strong style="color: var(--text-dark); font-size: 0.82rem;">${studentCount} Orang</strong>
                </div>
              </div>

              <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9;">
                <button class="btn btn-outline btn-sm btn-edit-scheme" style="width: 100%; font-weight: 700;" data-scheme-id="${scheme.id}">
                  ✏️ Edit Skema & Regulasi
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Section 2: Komponen Biaya Dasar -->
    <div class="card" style="margin-bottom: 28px;">
      <div class="card-header">
        <div class="card-title-group">
          <h3 class="card-title">💰 Komponen Biaya Pokok Perguruan Tinggi</h3>
          <p class="card-subtitle">Tarif acuan sebelum diterapkan skema subsidi beasiswa mahasiswa</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Komponen Biaya</th>
              <th>Kategori Waktu</th>
              <th>Program Studi</th>
              <th>Tarif Dasar (Rp)</th>
              <th>Hak Beasiswa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${feeComponents.map(comp => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.78rem;">
                  ${comp.id}
                </td>
                <td style="font-weight: 700; color: var(--text-dark);">
                  ${comp.name}
                  <div style="font-size: 0.72rem; color: var(--text-light); font-weight: normal;">${comp.description}</div>
                </td>
                <td>
                  <span class="badge" style="background:#f1f5f9; color:#475569;">${comp.category}</span>
                </td>
                <td>
                  ${comp.applicableProdi.map(p => getProdiBadge(p)).join(' ')}
                </td>
                <td style="font-size: 0.95rem; font-weight: 800; color: var(--text-dark);">
                  ${formatRupiah(comp.defaultAmount)}
                </td>
                <td>
                  ${comp.allowScholarshipDiscount 
                    ? '<span class="badge badge-scholarship">Dapat Potongan</span>' 
                    : '<span class="badge badge-unpaid">Tarif Tetap</span>'}
                </td>
                <td>
                  <button class="btn btn-outline btn-sm btn-edit-fee-comp" data-comp-id="${comp.id}">
                    ✏️ Ubah Nominal
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 3: Override Individual & Dispensasi Cicilan -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <h3 class="card-title">🎯 Daftar Override Individual & Dispensasi Cicilan Aktif</h3>
          <p class="card-subtitle">Pengecualian khusus / subsidi tambahan yang ditetapkan oleh Bendahara per mahasiswa</p>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-add-override-table">
          + Beri Override Baru
        </button>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID Override</th>
              <th>Mahasiswa</th>
              <th>Semester</th>
              <th>Jenis Override</th>
              <th>Penyesuaian Biaya</th>
              <th>Alasan & Rujukan SK</th>
              <th>Ditetapkan Oleh</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${individualOverrides.length === 0 ? `
              <tr>
                <td colspan="9" class="table-empty-state">
                  <div class="table-empty-icon">📂</div>
                  <p>Belum ada penetapan override individual untuk semester ini.</p>
                </td>
              </tr>
            ` : individualOverrides.map(ovr => {
              const student = state.students.find(s => s.nim === ovr.studentNim) || { name: 'Mahasiswa', prodi: 'BKPI', nim: ovr.studentNim };
              return `
                <tr>
                  <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.78rem;">
                    ${ovr.id}
                  </td>
                  <td>
                    <div class="table-student-name">${student.name}</div>
                    <div class="table-student-nim">NIM: ${student.nim} | ${student.prodi}</div>
                  </td>
                  <td style="font-size: 0.78rem; font-weight: 600;">${ovr.semester}</td>
                  <td>
                    ${ovr.overrideType === 'ADDITIONAL_DISCOUNT' 
                      ? '<span class="badge badge-scholarship">Potongan Tambahan</span>' 
                      : '<span class="badge badge-installment">Rencana Angsuran</span>'}
                  </td>
                  <td style="font-weight: 700; color: #1e40af;">
                    ${ovr.overrideType === 'ADDITIONAL_DISCOUNT' 
                      ? `-${formatRupiah(ovr.discountAmount)}` 
                      : `${ovr.installmentCount || 2}x Cicilan`}
                  </td>
                  <td style="font-size: 0.8rem; color: var(--text-dark);">
                    ${ovr.reason}
                  </td>
                  <td style="font-size: 0.76rem; color: var(--text-light);">
                    ${ovr.approvedBy}
                  </td>
                  <td>
                    <span class="badge badge-paid">Aktif</span>
                  </td>
                  <td>
                    <button class="btn btn-outline btn-sm btn-delete-override" data-ovr-id="${ovr.id}" data-student="${student.name}" style="color: #b91c1c; border-color: #fca5a5; background: #fff1f2; font-weight: 700;" title="Hapus / Batalkan Override">
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelectorAll('.btn-edit-scheme').forEach(btn => {
    btn.addEventListener('click', () => {
      const schemeId = btn.getAttribute('data-scheme-id');
      window.simpelModals.openEditSchemeModal(schemeId);
    });
  });

  const btnAddScheme1 = container.querySelector('#btn-open-add-scheme');
  const btnAddScheme2 = container.querySelector('#btn-add-scheme-card-header');
  if (btnAddScheme1) btnAddScheme1.addEventListener('click', () => window.simpelModals.openAddSchemeModal());
  if (btnAddScheme2) btnAddScheme2.addEventListener('click', () => window.simpelModals.openAddSchemeModal());

  container.querySelectorAll('.btn-edit-fee-comp').forEach(btn => {
    btn.addEventListener('click', () => {
      const compId = btn.getAttribute('data-comp-id');
      window.simpelModals.openEditFeeCompModal(compId);
    });
  });

  const btnAddOvr1 = container.querySelector('#btn-open-add-override');
  const btnAddOvr2 = container.querySelector('#btn-add-override-table');
  if (btnAddOvr1) btnAddOvr1.addEventListener('click', () => window.simpelModals.openOverrideModal());
  if (btnAddOvr2) btnAddOvr2.addEventListener('click', () => window.simpelModals.openOverrideModal());

  // Delete Override Handlers
  container.querySelectorAll('.btn-delete-override').forEach(btn => {
    btn.addEventListener('click', () => {
      const ovrId = btn.getAttribute('data-ovr-id');
      const studentName = btn.getAttribute('data-student');
      if (confirm(`Apakah Anda yakin ingin menghapus override "${ovrId}" untuk ${studentName}?\n\nTagihan mahasiswa akan otomatis dihitung ulang sesuai skema tarif normal.`)) {
        const res = BillingEngine.deleteIndividualOverride(ovrId);
        if (res.success) {
          window.simpelToast.show('Override Dihapus', res.message, 'info');
          renderSkemaTarifView(container);
        }
      }
    });
  });
}
