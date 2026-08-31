/**
 * SIMPEL-IF Modul Master Data Mahasiswa & Akademik
 * STIT Ihsanul Fikri
 */

import { appState } from '../state.js';
import { getProdiBadge, getScholarshipBadge } from '../utils/formatters.js';
import { exportToCSV } from '../utils/export-engine.js';

export function renderAkademikView(container) {
  const state = appState.getState();
  const students = state.students;

  const countBKPI = students.filter(s => s.prodi === 'BKPI').length;
  const countPIAUD = students.filter(s => s.prodi === 'PIAUD').length;
  const countAktif = students.filter(s => s.statusAkademik === 'Aktif').length;
  const countBeasiswa = students.filter(s => s.scholarshipId !== 'REGULER').length;

  let currentFiltered = [...students];

  container.innerHTML = `
    <!-- Top Summary Grid -->
    <div class="stats-grid">
      <div class="stat-card stat-blue">
        <div class="stat-content">
          <span class="stat-label">Total Mahasiswa Terdaftar</span>
          <span class="stat-value">${students.length} Mahasiswa</span>
          <span class="stat-subtext">Pangkalan Data STIT-IF</span>
        </div>
        <div class="stat-icon-wrapper">👥</div>
      </div>

      <div class="stat-card stat-sky">
        <div class="stat-content">
          <span class="stat-label">Prodi BKPI & PIAUD</span>
          <span class="stat-value">${countBKPI} / ${countPIAUD}</span>
          <span class="stat-subtext">BKPI: ${countBKPI} mhs | PIAUD: ${countPIAUD} mhs</span>
        </div>
        <div class="stat-icon-wrapper">📚</div>
      </div>

      <div class="stat-card stat-green">
        <div class="stat-content">
          <span class="stat-label">Status Akademik Aktif</span>
          <span class="stat-value">${countAktif} Orang</span>
          <span class="stat-subtext" style="color: #15803d; font-weight: 600;">Berhak diterbitkan tagihan</span>
        </div>
        <div class="stat-icon-wrapper">🎓</div>
      </div>

      <div class="stat-card stat-purple">
        <div class="stat-content">
          <span class="stat-label">Penerima Beasiswa</span>
          <span class="stat-value">${countBeasiswa} Orang</span>
          <span class="stat-subtext">Asrama, Mitra, & PAUD Laki</span>
        </div>
        <div class="stat-icon-wrapper">⭐</div>
      </div>
    </div>

    <!-- Master Data Mahasiswa Table Card -->
    <div class="card">
      <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
        <div class="card-title-group">
          <h3 class="card-title">👨‍🎓 Master Data Induk Mahasiswa STIT Ihsanul Fikri</h3>
          <p class="card-subtitle">Pengelompokan Prodi BKPI, PIAUD, Semester, Status Keaktifan & Skema Beasiswa</p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-outline" id="btn-export-students">
            📥 Ekspor Data (.csv)
          </button>
          <button class="btn btn-primary" id="btn-add-student-modal">
            + Tambah Mahasiswa Baru (Auto-Tagging)
          </button>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="filter-toolbar">
        <div class="search-box-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="search-student-input" placeholder="Cari nama mahasiswa atau NIM...">
        </div>

        <div class="filter-group">
          <select class="filter-select" id="filter-student-prodi">
            <option value="ALL">Semua Prodi</option>
            <option value="BKPI">BKPI (Bimbingan Konseling)</option>
            <option value="PIAUD">PIAUD (PAUD Islam)</option>
          </select>

          <select class="filter-select" id="filter-student-semester">
            <option value="ALL">Semua Semester</option>
            <option value="1">Semester 1 (Maba)</option>
            <option value="3">Semester 3</option>
            <option value="5">Semester 5</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8 (Akhir)</option>
          </select>

          <select class="filter-select" id="filter-student-status">
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Lulus">Lulus</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="custom-table" id="students-master-table">
          <thead>
            <tr>
              <th>NIM</th>
              <th>Nama Mahasiswa</th>
              <th>JK</th>
              <th>Program Studi</th>
              <th>Semester</th>
              <th>Angkatan</th>
              <th>Status Akademik</th>
              <th>Skema Beasiswa</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${renderStudentsTableRows(currentFiltered, state)}
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

  // Filter Listeners
  const searchInput = container.querySelector('#search-student-input');
  const filterProdi = container.querySelector('#filter-student-prodi');
  const filterSem = container.querySelector('#filter-student-semester');
  const filterStatus = container.querySelector('#filter-student-status');

  function filterStudents() {
    const q = (searchInput.value || '').toLowerCase().trim();
    const p = filterProdi.value;
    const sem = filterSem.value;
    const st = filterStatus.value;

    currentFiltered = state.students.filter(s => {
      const matchQ = s.name.toLowerCase().includes(q) || s.nim.includes(q);
      const matchP = p === 'ALL' || s.prodi === p;
      const matchSem = sem === 'ALL' || s.semester.toString() === sem;
      const matchSt = st === 'ALL' || s.statusAkademik === st;
      return matchQ && matchP && matchSem && matchSt;
    });

    const tbody = container.querySelector('#students-master-table tbody');
    if (tbody) {
      tbody.innerHTML = renderStudentsTableRows(currentFiltered, state);
      attachStudentRowActions(container);
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterStudents);
  if (filterProdi) filterProdi.addEventListener('change', filterStudents);
  if (filterSem) filterSem.addEventListener('change', filterStudents);
  if (filterStatus) filterStatus.addEventListener('change', filterStudents);

  // Export Students
  const btnExport = container.querySelector('#btn-export-students');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const headers = ['NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Program Studi', 'Semester', 'Angkatan', 'Status Akademik', 'Skema Beasiswa', 'Email', 'No Telepon'];
      const rows = currentFiltered.map(s => {
        const sch = state.scholarshipSchemes.find(sc => sc.id === s.scholarshipId);
        return [
          s.nim,
          s.name,
          s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
          s.prodi,
          s.semester,
          s.classYear,
          s.statusAkademik,
          sch ? sch.name : 'Reguler',
          s.email || '-',
          s.phone || '-'
        ];
      });

      exportToCSV(`Master_Data_Mahasiswa_STIT_IF_${new Date().toISOString().slice(0, 10)}`, headers, rows);
      window.simpelToast.show('Ekspor Berhasil', `${currentFiltered.length} data mahasiswa berhasil diekspor.`, 'success');
    });
  }

  attachStudentRowActions(container);
}

function renderStudentsTableRows(students, state) {
  if (students.length === 0) {
    return `
      <tr>
        <td colspan="9" class="table-empty-state">
          <div class="table-empty-icon">📂</div>
          <p>Tidak ditemukan data mahasiswa yang sesuai filter.</p>
        </td>
      </tr>
    `;
  }

  return students.map(s => {
    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-700); font-size: 0.8rem;">
          ${s.nim}
        </td>
        <td>
          <div class="table-student-name">${s.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-light);">${s.email}</div>
        </td>
        <td style="font-weight: 700; color: ${s.gender === 'L' ? '#1e40af' : '#be185d'};">
          ${s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </td>
        <td>
          ${getProdiBadge(s.prodi)}
        </td>
        <td style="font-weight: 600; text-align: center;">
          Sem ${s.semester}
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.78rem;">
          ${s.classYear}
        </td>
        <td>
          ${s.statusAkademik === 'Aktif' ? '<span class="badge badge-paid">Aktif</span>' :
            s.statusAkademik === 'Cuti' ? '<span class="badge badge-pending">Cuti</span>' :
            '<span class="badge" style="background:#f1f5f9; color:#475569;">Lulus</span>'}
        </td>
        <td>
          ${getScholarshipBadge(s.scholarshipId)}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm btn-edit-student" data-student-nim="${s.nim}" title="Edit Data Mahasiswa">
              ✏️ Edit
            </button>
            <button class="btn btn-ghost btn-sm btn-login-as-student" data-student-nim="${s.nim}" title="Buka Portal Mahasiswa Ini">
              🎓 Portal
            </button>
            <button class="btn btn-sm btn-delete-student" data-student-nim="${s.nim}" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-weight:700; cursor:pointer;" title="Hapus Data Mahasiswa Ini">
              🗑️ Hapus
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function attachStudentRowActions(container) {
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
