/**
 * SIMPEL-IF Modul Direktori Mahasiswa & Pengguna Terdaftar
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { formatRupiah, getProdiBadge, getScholarshipBadge, getStatusBadge } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-engine.js';

export function renderAkademikView(container) {
  const state = appState.getState();
  const students = state.students || [];

  const countBKPI = students.filter(s => s.prodi === 'BKPI').length;
  const countPIAUD = students.filter(s => s.prodi === 'PIAUD').length;
  const countAktif = students.filter(s => s.statusAkademik === 'Aktif').length;
  const countBeasiswa = students.filter(s => s.scholarshipId !== 'REGULER').length;

  let currentCategory = 'ALL';
  let currentFiltered = [...students];

  function getStudentInvoiceSummary(studentNim) {
    const invs = (state.invoices || []).filter(i => i.studentNim === studentNim);
    const activeInv = invs.find(i => i.semester === state.activeSemester) || invs[0];
    const totalPaid = invs.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalNet = invs.reduce((sum, i) => sum + (i.netAmount || 0), 0);
    const hasRemaining = totalNet > totalPaid;
    return {
      activeInv,
      totalPaid,
      totalNet,
      hasRemaining,
      status: activeInv ? activeInv.status : 'BELUM_ADA_TAGIHAN'
    };
  }

  container.innerHTML = `
    <!-- Top Header Title & Actions -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 style="font-size: 1.28rem; font-weight: 800; color: var(--text-dark); margin: 0;">👨‍🎓 Direktori Mahasiswa & Pengguna Terdaftar SIMPEL-IF</h2>
          <span class="badge" style="background: #1e3a8a; color: #ffffff; font-weight: 800; font-size: 0.72rem;">${students.length} Akun Terdaftar</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">Pantau pangkalan data mahasiswa yang telah terdaftar di aplikasi, kontak WhatsApp aktif, skema beasiswa, dan status pembayaran.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn btn-outline" id="btn-export-students" style="font-weight: 700;">
          📥 Ekspor Data (.csv)
        </button>
        <button class="btn btn-outline" id="btn-print-students-dir" style="font-weight: 700;">
          🖨️ Cetak Direktori
        </button>
        <button class="btn btn-primary" id="btn-add-student-modal" style="font-weight: 800;">
          + Tambah Mahasiswa Baru
        </button>
      </div>
    </div>

    <!-- Top Summary Grid -->
    <div class="stats-grid">
      <div class="stat-card stat-blue">
        <div class="stat-content">
          <span class="stat-label">Total Mahasiswa Terdaftar</span>
          <span class="stat-value">${students.length} Mahasiswa</span>
          <span class="stat-subtext">Pangkalan Data SIMPEL-IF</span>
        </div>
        <div class="stat-icon-wrapper">👥</div>
      </div>

      <div class="stat-card stat-sky">
        <div class="stat-content">
          <span class="stat-label">Distribusi Prodi (BKPI / PIAUD)</span>
          <span class="stat-value">${countBKPI} / ${countPIAUD}</span>
          <span class="stat-subtext">BKPI: ${countBKPI} mhs | PIAUD: ${countPIAUD} mhs</span>
        </div>
        <div class="stat-icon-wrapper">📚</div>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-content">
          <span class="stat-label">Status Akademik Aktif</span>
          <span class="stat-value">${countAktif} Orang</span>
          <span class="stat-subtext" style="color: #15803d; font-weight: 600;">Berhak perkuliahan & ujian</span>
        </div>
        <div class="stat-icon-wrapper">🎓</div>
      </div>

      <div class="stat-card stat-purple">
        <div class="stat-content">
          <span class="stat-label">Penerima Subsidi Beasiswa</span>
          <span class="stat-value">${countBeasiswa} Orang</span>
          <span class="stat-subtext">Asrama, Mitra, PAUD Laki</span>
        </div>
        <div class="stat-icon-wrapper">⭐</div>
      </div>
    </div>

    <!-- Category Filter Pills -->
    <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
      <button type="button" class="btn btn-sm btn-category-tab active" data-category="ALL" style="border-radius: 999px; font-weight: 800; font-size: 0.76rem; padding: 6px 14px; background: var(--primary-800); color: #fff; border: none; cursor: pointer; white-space: nowrap;">
        👥 Semua Mahasiswa (${students.length})
      </button>
      <button type="button" class="btn btn-sm btn-category-tab" data-category="BKPI" style="border-radius: 999px; font-weight: 700; font-size: 0.76rem; padding: 6px 14px; background: #f1f5f9; color: var(--text-dark); border: 1px solid var(--border-light); cursor: pointer; white-space: nowrap;">
        📖 BKPI (${countBKPI})
      </button>
      <button type="button" class="btn btn-sm btn-category-tab" data-category="PIAUD" style="border-radius: 999px; font-weight: 700; font-size: 0.76rem; padding: 6px 14px; background: #f1f5f9; color: var(--text-dark); border: 1px solid var(--border-light); cursor: pointer; white-space: nowrap;">
        🧸 PIAUD (${countPIAUD})
      </button>
      <button type="button" class="btn btn-sm btn-category-tab" data-category="BEASISWA" style="border-radius: 999px; font-weight: 700; font-size: 0.76rem; padding: 6px 14px; background: #f1f5f9; color: var(--text-dark); border: 1px solid var(--border-light); cursor: pointer; white-space: nowrap;">
        🎁 Penerima Beasiswa (${countBeasiswa})
      </button>
      <button type="button" class="btn btn-sm btn-category-tab" data-category="LUNAS" style="border-radius: 999px; font-weight: 700; font-size: 0.76rem; padding: 6px 14px; background: #f1f5f9; color: var(--text-dark); border: 1px solid var(--border-light); cursor: pointer; white-space: nowrap;">
        ✅ Tagihan Lunas
      </button>
      <button type="button" class="btn btn-sm btn-category-tab" data-category="BELUM_LUNAS" style="border-radius: 999px; font-weight: 700; font-size: 0.76rem; padding: 6px 14px; background: #f1f5f9; color: var(--text-dark); border: 1px solid var(--border-light); cursor: pointer; white-space: nowrap;">
        ⚠️ Memiliki Tunggakan
      </button>
    </div>

    <!-- Master Data Mahasiswa Table Card -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title-group">
          <h3 class="card-title">📋 Daftar Mahasiswa & Rincian Akun Terdaftar</h3>
          <p class="card-subtitle">Klik nama atau tombol detail untuk melihat rincian riwayat pembayaran, kontak, dan biodata lengkap</p>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="filter-toolbar" style="padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid var(--border-light);">
        <div class="search-box-wrapper" style="flex: 1; min-width: 260px;">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="search-student-input" placeholder="Cari nama, NIM, email, atau no. HP...">
        </div>

        <div class="filter-group" style="flex-wrap: wrap;">
          <select class="filter-select" id="filter-student-prodi">
            <option value="ALL">Semua Prodi</option>
            <option value="BKPI">BKPI (Bimbingan Konseling)</option>
            <option value="PIAUD">PIAUD (PAUD Islam)</option>
          </select>

          <select class="filter-select" id="filter-student-semester">
            <option value="ALL">Semua Semester</option>
            <option value="1">Semester 1 (Maba)</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8 (Akhir)</option>
          </select>

          <select class="filter-select" id="filter-student-scholarship">
            <option value="ALL">Semua Skema Beasiswa</option>
            ${state.scholarshipSchemes.map(sc => `
              <option value="${sc.id}">${sc.name}</option>
            `).join('')}
          </select>

          <select class="filter-select" id="filter-student-status">
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Status: Aktif</option>
            <option value="Cuti">Status: Cuti</option>
            <option value="Lulus">Status: Lulus</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="custom-table" id="students-master-table">
          <thead>
            <tr>
              <th>NIM / ID Akun</th>
              <th>Nama Mahasiswa</th>
              <th>Prodi & Semester</th>
              <th>Skema Beasiswa</th>
              <th>Kontak WhatsApp & Email</th>
              <th>Status Bayar (Sem ${state.activeSemester.split(' ')[0]})</th>
              <th>Aksi Pengelolaan</th>
            </tr>
          </thead>
          <tbody>
            ${renderStudentsTableRows(currentFiltered, state, getStudentInvoiceSummary)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Event Listeners
  const btnAdd = container.querySelector('#btn-add-student-modal');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      window.simpelModals.openAddStudentModal();
    });
  }

  const btnPrint = container.querySelector('#btn-print-students-dir');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Filter Listeners
  const searchInput = container.querySelector('#search-student-input');
  const filterProdi = container.querySelector('#filter-student-prodi');
  const filterSem = container.querySelector('#filter-student-semester');
  const filterSch = container.querySelector('#filter-student-scholarship');
  const filterStatus = container.querySelector('#filter-student-status');
  const categoryTabs = container.querySelectorAll('.btn-category-tab');

  function filterStudents() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const p = filterProdi.value;
    const sem = filterSem.value;
    const sch = filterSch.value;
    const st = filterStatus.value;

    currentFiltered = state.students.filter(s => {
      const summary = getStudentInvoiceSummary(s.nim);
      const matchQ = s.name.toLowerCase().includes(q) || 
                     s.nim.includes(q) || 
                     (s.email && s.email.toLowerCase().includes(q)) || 
                     (s.phone && s.phone.includes(q));
      const matchP = p === 'ALL' || s.prodi === p;
      const matchSem = sem === 'ALL' || s.semester.toString() === sem;
      const matchSch = sch === 'ALL' || s.scholarshipId === sch;
      const matchSt = st === 'ALL' || s.statusAkademik === st;

      // Category filter
      let matchCat = true;
      if (currentCategory === 'BKPI') matchCat = s.prodi === 'BKPI';
      else if (currentCategory === 'PIAUD') matchCat = s.prodi === 'PIAUD';
      else if (currentCategory === 'BEASISWA') matchCat = s.scholarshipId !== 'REGULER';
      else if (currentCategory === 'LUNAS') matchCat = summary.status === 'LUNAS' || !summary.hasRemaining;
      else if (currentCategory === 'BELUM_LUNAS') matchCat = summary.hasRemaining;

      return matchQ && matchP && matchSem && matchSch && matchSt && matchCat;
    });

    const tbody = container.querySelector('#students-master-table tbody');
    if (tbody) {
      tbody.innerHTML = renderStudentsTableRows(currentFiltered, state, getStudentInvoiceSummary);
      attachStudentRowActions(container);
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterStudents);
  if (filterProdi) filterProdi.addEventListener('change', filterStudents);
  if (filterSem) filterSem.addEventListener('change', filterStudents);
  if (filterSch) filterSch.addEventListener('change', filterStudents);
  if (filterStatus) filterStatus.addEventListener('change', filterStudents);

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => {
        t.style.background = '#f1f5f9';
        t.style.color = 'var(--text-dark)';
        t.style.border = '1px solid var(--border-light)';
        t.classList.remove('active');
      });
      tab.style.background = 'var(--primary-800)';
      tab.style.color = '#fff';
      tab.style.border = 'none';
      tab.classList.add('active');

      currentCategory = tab.getAttribute('data-category');
      filterStudents();
    });
  });

  // Export Students
  const btnExport = container.querySelector('#btn-export-students');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const headers = ['NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Program Studi', 'Semester', 'Angkatan', 'Status Akademik', 'Skema Beasiswa', 'No WhatsApp', 'Email', 'Status Tagihan'];
      const rows = currentFiltered.map(s => {
        const sch = state.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
        const summary = getStudentInvoiceSummary(s.nim);
        return [
          s.nim,
          s.name,
          s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          s.prodi,
          s.semester,
          s.classYear,
          s.statusAkademik,
          sch ? sch.name : 'Reguler',
          s.phone || '-',
          s.email || '-',
          summary.status
        ];
      });

      exportToCSV(`Direktori_Mahasiswa_STIT_IF_${new Date().toISOString().slice(0, 10)}`, headers, rows);
      window.simpelToast.show('Ekspor Berhasil', `${currentFiltered.length} data mahasiswa berhasil diekspor.`, 'success');
    });
  }

  attachStudentRowActions(container);
}

function renderStudentsTableRows(students, state, getStudentInvoiceSummary) {
  if (students.length === 0) {
    return `
      <tr>
        <td colspan="7" class="table-empty-state" style="padding: 40px 20px; text-align: center;">
          <div class="table-empty-icon" style="font-size: 2.6rem; margin-bottom: 8px;">📂</div>
          <h4 style="margin: 0; color: var(--text-dark); font-weight: 800;">Tidak Ditemukan Data Mahasiswa</h4>
          <p style="margin: 4px 0 0; color: var(--text-light); font-size: 0.82rem;">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
        </td>
      </tr>
    `;
  }

  return students.map(s => {
    const summary = getStudentInvoiceSummary(s.nim);
    const cleanPhone = (s.phone || '082342307414').replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 800; color: var(--primary-700); font-size: 0.82rem;">
          ${s.nim}
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: ${s.gender === 'L' ? '#dbeafe' : '#fce7f3'}; color: ${s.gender === 'L' ? '#1e40af' : '#9d174d'}; font-weight: 800; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
            </div>
            <div>
              <div class="table-student-name" style="font-weight: 800; cursor: pointer; color: var(--text-dark);" data-student-nim="${s.nim}">
                ${s.name}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-light);">${s.gender === 'L' ? 'Laki-laki (Ikhwan)' : 'Perempuan (Akhwat)'}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${getProdiBadge(s.prodi)}</div>
          <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">
            Semester ${s.semester} &bull; Angk. ${s.classYear}
          </div>
        </td>
        <td>
          ${getScholarshipBadge(s.scholarshipId)}
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--text-dark);">${s.phone || '-'}</span>
              <a href="https://wa.me/${waNumber}?text=Assalamu'alaikum%20${encodeURIComponent(s.name)},%20ini%20dari%20Admin%20Keuangan%20STIT%20Ihsanul%20Fikri." target="_blank" rel="noopener" class="btn btn-sm" style="background: #16a34a; color: #fff; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; text-decoration: none; font-weight: 800; line-height: 1;" title="Chat WhatsApp">
                WA 💬
              </a>
            </div>
            <div style="font-size: 0.70rem; color: var(--text-light); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${s.email || '-'}
            </div>
          </div>
        </td>
        <td>
          <div>
            ${summary.status === 'LUNAS' 
              ? '<span class="badge" style="background:#dcfce7; color:#15803d; font-weight:800;">✅ Lunas</span>'
              : summary.status === 'DICICIL'
                ? '<span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800;">🔄 Dicicil</span>'
                : '<span class="badge" style="background:#fef2f2; color:#b91c1c; font-weight:800;">⏳ Belum Lunas</span>'}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
            Terbayar: ${formatRupiah(summary.totalPaid)}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm btn-detail-student" data-student-nim="${s.nim}" title="Lihat Profil Lengkap & Histori Tagihan" style="font-weight: 700;">
              👁️ Detail
            </button>
            <button class="btn btn-outline btn-sm btn-pwd-student" data-student-nim="${s.nim}" title="Ganti Password / PIN Mahasiswa Ini" style="color: #0284c7; border-color: #bae6fd; background: #f0f9ff; font-weight: 700;">
              🔑
            </button>
            <button class="btn btn-outline btn-sm btn-edit-student" data-student-nim="${s.nim}" title="Edit Data & Akun Mahasiswa">
              ✏️
            </button>
            <button class="btn btn-ghost btn-sm btn-login-as-student" data-student-nim="${s.nim}" title="Buka Portal Mahasiswa Ini">
              🎓
            </button>
            <button class="btn btn-sm btn-delete-student" data-student-nim="${s.nim}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-weight:700; cursor:pointer;" title="Hapus Data Mahasiswa Ini">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function attachStudentRowActions(container) {
  // Detail button handler
  container.querySelectorAll('.btn-detail-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const nim = btn.getAttribute('data-student-nim');
      window.simpelModals.openStudentDetailModal(nim);
    });
  });

  // Name click handler to open detail
  container.querySelectorAll('.table-student-name').forEach(nameEl => {
    nameEl.addEventListener('click', () => {
      const nim = nameEl.getAttribute('data-student-nim');
      if (nim) window.simpelModals.openStudentDetailModal(nim);
    });
  });

  // Quick Password Change button handler
  container.querySelectorAll('.btn-pwd-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const nim = btn.getAttribute('data-student-nim');
      window.simpelModals.openChangeStudentPasswordModal(nim);
    });
  });

  container.querySelectorAll('.btn-edit-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const nim = btn.getAttribute('data-student-nim');
      window.simpelModals.openEditStudentModal(nim);
    });
  });

  container.querySelectorAll('.btn-login-as-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const nim = btn.getAttribute('data-student-nim');
      appState.setRole('MAHASISWA', nim);
      if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
    });
  });

  container.querySelectorAll('.btn-delete-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const nim = btn.getAttribute('data-student-nim');
      const student = appState.getState().students.find(s => s.nim === nim);
      if (!student) return;

      const confirmMsg = `⚠️ KONFIRMASI HAPUS DATA MAHASISWA\n\nApakah Anda yakin ingin menghapus data mahasiswa berikut?\n\n• Nama: ${student.name}\n• NIM: ${student.nim}\n• Program Studi: ${student.prodi}\n• Semester: ${student.semester}\n\nPerhatian: Seluruh data tagihan dan verifikasi pembayaran terkait mahasiswa ini juga akan dibersihkan dari sistem.`;

      if (confirm(confirmMsg)) {
        const res = appState.deleteStudent(nim);
        if (res.success) {
          window.simpelToast.show('Mahasiswa Berhasil Dihapus', res.message, 'success');
          renderAkademikView(container);
        }
      }
    });
  });
}
