/**
 * SIMPEL-IF Kalender Akademik & Jadwal Finansial
 * STIT Ihsanul Fikri
 * Mendukung Tampilan Kalender Bulanan Interaktif, Gesture Geser (Swipe/Drag), & Linimasa Agenda
 */

import { appState } from '../state.js';
import { formatDate } from '../utils/formatters.js';
import { DragScrollHelper } from '../utils/drag-scroll.js';

export function renderKalenderView(container) {
  const state = appState.getState();
  const isAdmin = state.currentRole === 'ADMIN';
  const currentStudent = state.currentRole === 'MAHASISWA' ? state.currentUser : null;
  const events = state.academicCalendar || [];

  // Local View State
  let currentViewMode = 'calendar'; // Default to calendar view so swipe is immediately prominent
  let selectedCategory = 'ALL';
  let selectedSemester = 'ALL';
  let searchQuery = '';
  
  // Date state for interactive monthly calendar view
  let calendarYear = 2026;
  let calendarMonth = 8; // September (0-indexed: 8 = September)
  let slideDirection = 'none'; // 'left', 'right', or 'none' for swipe animation

  // List of all months in Academic Year 2026/2027
  const ACADEMIC_MONTHS = [
    { year: 2026, month: 7, name: 'Agustus', short: "Agu '26", sem: '2026/2027 Ganjil' },
    { year: 2026, month: 8, name: 'September', short: "Sep '26", sem: '2026/2027 Ganjil' },
    { year: 2026, month: 9, name: 'Oktober', short: "Okt '26", sem: '2026/2027 Ganjil' },
    { year: 2026, month: 10, name: 'November', short: "Nov '26", sem: '2026/2027 Ganjil' },
    { year: 2026, month: 11, name: 'Desember', short: "Des '26", sem: '2026/2027 Ganjil' },
    { year: 2027, month: 0, name: 'Januari', short: "Jan '27", sem: '2026/2027 Ganjil' },
    { year: 2027, month: 1, name: 'Februari', short: "Feb '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 2, name: 'Maret', short: "Mar '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 3, name: 'April', short: "Apr '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 4, name: 'Mei', short: "Mei '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 5, name: 'Juni', short: "Jun '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 6, name: 'Juli', short: "Jul '27", sem: '2026/2027 Genap' },
    { year: 2027, month: 7, name: 'Agustus', short: "Agu '27", sem: '2026/2027 Genap' }
  ];

  // Category Configuration
  const CATEGORY_CONFIG = {
    KEUANGAN: {
      name: 'Keuangan & SPP',
      badge: '💰 Keuangan',
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#10b981',
      icon: '💰'
    },
    AKADEMIK: {
      name: 'Perkuliahan & Ujian',
      badge: '📚 Akademik',
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#3b82f6',
      icon: '📚'
    },
    KEGIATAN: {
      name: 'Kegiatan & Wisuda',
      badge: '🎉 Kegiatan',
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#f59e0b',
      icon: '🎉'
    },
    LIBUR: {
      name: 'Libur & Cuti',
      badge: '🌴 Hari Libur',
      color: '#e11d48',
      bgColor: '#fff1f2',
      borderColor: '#f43f5e',
      icon: '🌴'
    }
  };

  function getEventStatus(startDateStr, endDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDateStr || startDateStr);
    end.setHours(23, 59, 59, 999);

    if (today >= start && today <= end) {
      return {
        label: 'Sedang Berlangsung',
        class: 'status-active',
        badgeColor: '#15803d',
        bgColor: '#dcfce7',
        icon: '🟢',
        countdown: 'Hari Ini'
      };
    } else if (today < start) {
      const diffTime = start - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        label: `${diffDays} Hari Lagi`,
        class: 'status-upcoming',
        badgeColor: '#1d4ed8',
        bgColor: '#dbeafe',
        icon: '⏳',
        countdown: `${diffDays} hari lagi`
      };
    } else {
      return {
        label: 'Telah Selesai',
        class: 'status-completed',
        badgeColor: '#64748b',
        bgColor: '#f1f5f9',
        icon: '✓',
        countdown: 'Selesai'
      };
    }
  }

  function getFilteredEvents() {
    return events.filter(e => {
      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchSem = selectedSemester === 'ALL' || e.semester === selectedSemester;
      const matchSearch = !searchQuery || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSem && matchSearch;
    });
  }

  function renderView() {
    const filteredEvents = getFilteredEvents();

    // Stats Calculation
    const totalCount = events.length;
    const keuanganCount = events.filter(e => e.category === 'KEUANGAN').length;
    const akademikCount = events.filter(e => e.category === 'AKADEMIK').length;
    const kegiatanCount = events.filter(e => e.category === 'KEGIATAN').length;

    // Nearest / Active event
    const activeOrUpcoming = events.filter(e => {
      const end = new Date(e.endDate || e.startDate);
      end.setHours(23, 59, 59, 999);
      return end >= new Date();
    });
    const nearestEvent = activeOrUpcoming.length > 0 ? activeOrUpcoming[0] : events[0];

    container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; animation: fadeIn 0.25s ease;">
        
        <!-- Header Banner & Action Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 1.45rem; font-weight: 900; color: var(--primary-950); letter-spacing: -0.3px; margin: 0;">
                📅 Kalender Akademik & Jadwal Finansial
              </h2>
              <span class="badge" style="background: #eff6ff; color: #1e40af; font-size: 0.76rem; font-weight: 800; padding: 4px 10px; border: 1px solid #bfdbfe;">
                ${state.activeSemester}
              </span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-muted); margin: 4px 0 0;">
              Pedoman resmi perkuliahan, pengisian KRS, pembayaran SPP/Heregistrasi, ujian semester, dan kegiatan akademik STIT Ihsanul Fikri
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            ${isAdmin ? `
              <button class="btn btn-primary btn-sm" id="btn-add-academic-event" style="font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
                <span>➕</span> Tambah Agenda Baru
              </button>
            ` : `
              <a href="javascript:void(0)" id="btn-quick-goto-bayar" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #1e40af, #0284c7); font-weight: 800; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
                <span>💳</span> Bayar SPP Sekarang
              </a>
            `}
            <button class="btn btn-outline btn-sm" id="btn-export-ical" title="Unduh Kalender untuk Google Calendar / iCal" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              <span>📥</span> Unduh .ICS
            </button>
            <button class="btn btn-outline btn-sm" id="btn-print-calendar" title="Cetak Kalender Akademik" style="font-weight: 700;">
              🖨️ Cetak
            </button>
          </div>
        </div>

        <!-- Official SK Decree Banner -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-left: 5px solid var(--primary-800); border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #1e3a8a, #0284c7); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; box-shadow: 0 4px 10px rgba(30, 58, 138, 0.2);">
              📜
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 0.72rem; font-weight: 800; background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
                  SURAT KEPUTUSAN RESMI
                </span>
                <span style="font-size: 0.78rem; font-weight: 800; color: var(--primary-900);">
                  Nomor: SK.01/051/STIT-IF/VIII/2026
                </span>
              </div>
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); margin-top: 3px;">
                Penetapan Kalender Akademik STIT Ihsanul Fikri Tahun Akademik 2026/2027
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                Ditetapkan di Magelang pada <strong>21 Agustus 2026</strong> oleh Ketua STIT-IF: <strong>Dr. Akhmad Kasban, Lc., M.S.I.</strong> (NIDN. 2103117902)
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-weight: 800; font-size: 0.74rem; padding: 6px 12px;">
              ✓ Status: Berlaku & Sah
            </span>
          </div>
        </div>

        <!-- Role-Specific Announcement Callout -->
        ${!isAdmin && currentStudent ? `
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-left: 5px solid #2563eb; border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: var(--shadow-sm); flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                🎓
              </div>
              <div>
                <div style="font-size: 0.82rem; font-weight: 800; color: #1e3a8a;">
                  Pemberitahuan Mahasiswa: ${currentStudent.name} (${currentStudent.prodi} - Semester ${currentStudent.semester})
                </div>
                <div style="font-size: 0.76rem; color: #1e40af; margin-top: 2px;">
                  Periode Aktif: <strong>Pengisian KRS Online & Pembayaran SPP Semester Ganjil</strong>. Pastikan administrasi keuangan selesai sebelum batas waktu <strong>12 September 2026</strong>.
                </div>
              </div>
            </div>
            <a href="javascript:void(0)" id="btn-banner-tagihan" class="btn btn-sm" style="background: #1e40af; color: #ffffff; font-weight: 800; font-size: 0.75rem; text-decoration: none; padding: 6px 14px; border-radius: var(--radius-md); white-space: nowrap;">
              Periksa Tagihan Saya ➔
            </a>
          </div>
        ` : ''}

        <!-- 1. KPI Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 22px;">
          
          <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-left: 4px solid var(--primary-600);">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: #eff6ff; color: var(--primary-700); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
              📅
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Total Agenda</div>
              <div style="font-size: 1.3rem; font-weight: 900; color: var(--text-dark);">${totalCount} Kegiatan</div>
            </div>
          </div>

          <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-left: 4px solid #10b981;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
              💰
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Jadwal Keuangan & SPP</div>
              <div style="font-size: 1.3rem; font-weight: 900; color: #065f46;">${keuanganCount} Deadline</div>
            </div>
          </div>

          <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-left: 4px solid #3b82f6;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
              📚
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Perkuliahan & Ujian</div>
              <div style="font-size: 1.3rem; font-weight: 900; color: #1e40af;">${akademikCount} Periode</div>
            </div>
          </div>

          <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 12px; border-left: 4px solid #f59e0b;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-lg); background: #fffbeb; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
              ⏳
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--text-light); font-weight: 700; text-transform: uppercase;">Agenda Terdekat</div>
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${nearestEvent ? nearestEvent.title : '-'}">
                ${nearestEvent ? nearestEvent.title : '-'}
              </div>
            </div>
          </div>

        </div>

        <!-- 2. Interactive Draggable Month Slider Ribbon (Slider Bulan yang Dapat Digeser) -->
        <div class="card" style="padding: 14px 16px; margin-bottom: 20px; background: #ffffff; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1rem;">🗓️</span>
              <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-dark);">Pilih / Geser Bulan (T.A. 2026/2027)</span>
              <span class="badge" style="font-size: 0.68rem; background: #f1f5f9; color: var(--text-muted); padding: 2px 8px; border-radius: 999px;">
                🖱️ Drag Mouse / 📱 Swipe Layar
              </span>
            </div>
            <div style="font-size: 0.74rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
              <button type="button" id="btn-quick-prev-m" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.72rem; border-radius: var(--radius-sm);" title="Bulan Sebelumnya">◀</button>
              <span style="font-weight: 800; color: var(--primary-900);">Bulan Terpilih: ${ACADEMIC_MONTHS.find(m => m.year === calendarYear && m.month === calendarMonth)?.name || ''} ${calendarYear}</span>
              <button type="button" id="btn-quick-next-m" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.72rem; border-radius: var(--radius-sm);" title="Bulan Selanjutnya">▶</button>
            </div>
          </div>

          <!-- Draggable Month Pills Track -->
          <div class="horizontal-scroll month-slider-track" id="month-slider-track" data-scroll-x style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 8px; cursor: grab; user-select: none; scrollbar-width: thin;">
            ${ACADEMIC_MONTHS.map(m => {
              const isSelected = m.year === calendarYear && m.month === calendarMonth;
              
              // Count events in this month
              const monthEventsCount = events.filter(e => {
                const start = new Date(e.startDate);
                const end = new Date(e.endDate || e.startDate);
                const mStart = new Date(m.year, m.month, 1);
                const mEnd = new Date(m.year, m.month + 1, 0, 23, 59, 59);
                return start <= mEnd && end >= mStart;
              }).length;

              return `
                <button type="button" class="btn-month-pill" data-year="${m.year}" data-month="${m.month}" style="flex: 0 0 auto; min-width: 100px; padding: 8px 12px; border-radius: var(--radius-lg); text-align: center; border: 1px solid ${isSelected ? 'var(--primary-700)' : 'var(--border-light)'}; background: ${isSelected ? 'linear-gradient(135deg, #1e40af, #0284c7)' : '#f8fafc'}; color: ${isSelected ? '#ffffff' : 'var(--text-dark)'}; cursor: pointer; transition: all 0.2s ease; box-shadow: ${isSelected ? '0 4px 12px rgba(30, 64, 175, 0.25)' : 'none'};">
                  <div style="font-size: 0.82rem; font-weight: 800; line-height: 1.2;">
                    ${m.short}
                  </div>
                  <div style="font-size: 0.65rem; margin-top: 3px; font-weight: 700; color: ${isSelected ? '#e0f2fe' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isSelected ? '#38bdf8' : (monthEventsCount > 0 ? '#10b981' : '#cbd5e1')};"></span>
                    ${monthEventsCount} Agenda
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Controls & Interactive Filter Toolbar -->
        <div class="card" style="padding: 18px; margin-bottom: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            
            <!-- View Mode Switcher (Timeline vs Monthly Calendar) -->
            <div style="display: inline-flex; background: #f1f5f9; padding: 4px; border-radius: var(--radius-md); gap: 4px;">
              <button type="button" id="btn-mode-calendar" class="btn btn-sm" style="border-radius: var(--radius-sm); font-weight: 800; font-size: 0.78rem; padding: 6px 14px; ${currentViewMode === 'calendar' ? 'background: #ffffff; color: var(--primary-800); box-shadow: var(--shadow-sm);' : 'background: transparent; color: var(--text-muted);'} border: none; cursor: pointer;">
                📅 Kalender Bulanan
              </button>
              <button type="button" id="btn-mode-timeline" class="btn btn-sm" style="border-radius: var(--radius-sm); font-weight: 800; font-size: 0.78rem; padding: 6px 14px; ${currentViewMode === 'timeline' ? 'background: #ffffff; color: var(--primary-800); box-shadow: var(--shadow-sm);' : 'background: transparent; color: var(--text-muted);'} border: none; cursor: pointer;">
                📋 Linimasa Agenda
              </button>
            </div>

            <!-- Semester & Search Filters -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <select id="select-semester-filter" class="form-control" style="font-size: 0.8rem; padding: 6px 12px; width: auto; font-weight: 700;">
                <option value="ALL" ${selectedSemester === 'ALL' ? 'selected' : ''}>Semua Semester</option>
                <option value="2026/2027 Ganjil" ${selectedSemester === '2026/2027 Ganjil' ? 'selected' : ''}>2026/2027 Ganjil</option>
                <option value="2026/2027 Genap" ${selectedSemester === '2026/2027 Genap' ? 'selected' : ''}>2026/2027 Genap</option>
              </select>

              <div style="position: relative;">
                <input type="text" id="input-search-events" class="form-control" placeholder="Cari nama agenda / kegiatan..." value="${searchQuery}" style="font-size: 0.8rem; padding: 6px 12px 6px 32px; width: 230px;">
                <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-light); font-size: 0.8rem;">🔍</span>
              </div>
            </div>

          </div>

          <!-- Category Quick Filter Pills (Draggable on mobile) -->
          <div class="horizontal-scroll cat-filter-track" data-scroll-x style="display: flex; gap: 8px; margin-top: 14px; overflow-x: auto; padding-bottom: 4px;">
            <button type="button" class="btn btn-sm cat-filter-btn" data-cat="ALL" style="flex: 0 0 auto; border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 4px 12px; ${selectedCategory === 'ALL' ? 'background: var(--primary-800); color: #ffffff;' : 'background: #f8fafc; color: var(--text-muted); border: 1px solid var(--border-light);'}">
              Semua Kategori (${events.length})
            </button>
            <button type="button" class="btn btn-sm cat-filter-btn" data-cat="KEUANGAN" style="flex: 0 0 auto; border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 4px 12px; ${selectedCategory === 'KEUANGAN' ? 'background: #059669; color: #ffffff;' : 'background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0;'}">
              💰 Keuangan & SPP (${keuanganCount})
            </button>
            <button type="button" class="btn btn-sm cat-filter-btn" data-cat="AKADEMIK" style="flex: 0 0 auto; border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 4px 12px; ${selectedCategory === 'AKADEMIK' ? 'background: #2563eb; color: #ffffff;' : 'background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;'}">
              📚 Perkuliahan & Ujian (${akademikCount})
            </button>
            <button type="button" class="btn btn-sm cat-filter-btn" data-cat="KEGIATAN" style="flex: 0 0 auto; border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 4px 12px; ${selectedCategory === 'KEGIATAN' ? 'background: #d97706; color: #ffffff;' : 'background: #fffbeb; color: #92400e; border: 1px solid #fde68a;'}">
              🎉 Kegiatan & Wisuda (${kegiatanCount})
            </button>
            <button type="button" class="btn btn-sm cat-filter-btn" data-cat="LIBUR" style="flex: 0 0 auto; border-radius: 999px; font-size: 0.74rem; font-weight: 800; padding: 4px 12px; ${selectedCategory === 'LIBUR' ? 'background: #e11d48; color: #ffffff;' : 'background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3;'}">
              🌴 Hari Libur (${events.filter(e=>e.category==='LIBUR').length})
            </button>
          </div>
        </div>

        <!-- 4. Dynamic Content Rendering: Calendar Grid vs Timeline -->
        <div id="calendar-content-container">
          ${currentViewMode === 'calendar' ? renderMonthlyCalendarView(filteredEvents) : renderTimelineView(filteredEvents)}
        </div>

      </div>
    `;

    bindEventListeners();
  }

  // --- SUB-RENDERER: 1. Timeline List View ---
  function renderTimelineView(eventList) {
    if (eventList.length === 0) {
      return `
        <div class="card" style="padding: 48px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 2.4rem; margin-bottom: 10px;">📅</div>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-dark); margin: 0;">Tidak Ada Agenda Ditemukan</h3>
          <p style="font-size: 0.8rem; margin: 6px 0 16px;">Tidak ada jadwal akademik yang cocok dengan filter yang dipilih.</p>
          <button class="btn btn-sm btn-outline" id="btn-reset-filters">Reset Filter</button>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${eventList.map((evt, idx) => {
          const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.AKADEMIK;
          const status = getEventStatus(evt.startDate, evt.endDate);
          const isSameDay = evt.startDate === evt.endDate;

          return `
            <div class="card event-timeline-card" data-id="${evt.id}" style="padding: 20px; border-left: 6px solid ${cat.borderColor}; transition: transform 0.2s, box-shadow 0.2s; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
                
                <div style="flex: 1; min-width: 280px;">
                  
                  <!-- Badges header -->
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                    <span class="badge" style="background: ${cat.bgColor}; color: ${cat.color}; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border: 1px solid ${cat.borderColor}40;">
                      ${cat.badge}
                    </span>
                    <span class="badge" style="background: ${status.bgColor}; color: ${status.badgeColor}; font-size: 0.72rem; font-weight: 800; padding: 3px 8px;">
                      ${status.icon} ${status.label}
                    </span>
                    ${evt.isMandatory ? `
                      <span class="badge" style="background: #fef2f2; color: #dc2626; font-size: 0.68rem; font-weight: 800; padding: 2px 6px; border: 1px solid #fca5a5;">
                        WAJIB
                      </span>
                    ` : ''}
                    <span style="font-size: 0.72rem; color: var(--text-light); font-family: var(--font-mono);">
                      Semester: ${evt.semester}
                    </span>
                  </div>

                  <!-- Event Title -->
                  <h3 style="font-size: 1.08rem; font-weight: 800; color: var(--text-dark); margin: 0 0 6px;">
                    ${evt.title}
                  </h3>

                  <!-- Event Description -->
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 10px; line-height: 1.45;">
                    ${evt.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <!-- Event Meta Information -->
                  <div style="display: flex; align-items: center; gap: 16px; font-size: 0.76rem; color: var(--text-muted); flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 5px;">
                      <span>📍</span>
                      <span>${evt.location || 'Kampus STIT Ihsanul Fikri'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                      <span>👥</span>
                      <span>Sasaran: <strong>${evt.targetRoles.includes('ALL') ? 'Semua Mahasiswa & Civitas' : evt.targetRoles.join(', ')}</strong></span>
                    </div>
                  </div>

                </div>

                <!-- Right Side: Date Block & Actions -->
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                  
                  <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 10px 16px; text-align: center; min-width: 140px;">
                    <div style="font-size: 0.70rem; color: var(--text-light); text-transform: uppercase; font-weight: 700;">Periode Pelaksanaan</div>
                    <div style="font-size: 0.88rem; font-weight: 900; color: var(--primary-900); font-family: var(--font-mono); margin-top: 2px;">
                      ${formatDate(evt.startDate)}
                    </div>
                    ${!isSameDay ? `
                      <div style="font-size: 0.70rem; color: var(--text-muted);">s/d</div>
                      <div style="font-size: 0.84rem; font-weight: 800; color: var(--primary-800); font-family: var(--font-mono);">
                        ${formatDate(evt.endDate)}
                      </div>
                    ` : ''}
                  </div>

                  ${isAdmin ? `
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline btn-edit-event" data-id="${evt.id}" style="padding: 4px 10px; font-size: 0.74rem;" title="Sunting Agenda">
                        ✏️ Edit
                      </button>
                      <button class="btn btn-sm btn-outline btn-delete-event" data-id="${evt.id}" style="padding: 4px 8px; font-size: 0.74rem; color: #dc2626; border-color: #fca5a5; background: #fff1f2;" title="Hapus Agenda">
                        🗑️
                      </button>
                    </div>
                  ` : ''}

                </div>

              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- SUB-RENDERER: 2. Interactive Monthly Calendar Grid with Swipe Support ---
  function renderMonthlyCalendarView(eventList) {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const today = new Date();
    const isCurrentActualMonth = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;
    const currentActualDate = today.getDate();

    // Animation class based on swipe direction
    const animStyle = slideDirection === 'left' 
      ? 'animation: slideInRight 0.25s ease;' 
      : slideDirection === 'right' 
      ? 'animation: slideInLeft 0.25s ease;' 
      : 'animation: fadeIn 0.25s ease;';

    // Generate Calendar Day Cells
    let daysHtml = '';

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysHtml += `
        <div class="calendar-cell other-month" style="padding: 8px; min-height: 90px; background: #f8fafc; border: 1px solid #f1f5f9; color: #cbd5e1; font-size: 0.78rem;">
          ${prevMonthDays - i}
        </div>
      `;
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isToday = isCurrentActualMonth && day === currentActualDate;

      // Find events on this date
      const dayEvents = eventList.filter(e => {
        const start = e.startDate;
        const end = e.endDate || e.startDate;
        return dateStr >= start && dateStr <= end;
      });

      daysHtml += `
        <div class="calendar-cell ${isToday ? 'today-cell' : ''}" style="padding: 8px; min-height: 95px; background: ${isToday ? '#eff6ff' : '#ffffff'}; border: 1px solid var(--border-light); position: relative; transition: background 0.15s;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: ${isToday ? '900' : '700'}; font-size: 0.82rem; color: ${isToday ? '#1e40af' : 'var(--text-dark)'}; ${isToday ? 'background: #3b82f6; color:#ffffff; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center;' : ''}">
              ${day}
            </span>
            ${dayEvents.length > 0 ? `
              <span style="font-size: 0.65rem; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 1px 5px; border-radius: 4px;">
                ${dayEvents.length}
              </span>
            ` : ''}
          </div>

          <!-- Event Badges in Cell -->
          <div style="display: flex; flex-direction: column; gap: 3px; max-height: 70px; overflow-y: auto;">
            ${dayEvents.map(evt => {
              const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.AKADEMIK;
              return `
                <div class="cal-mini-event" data-id="${evt.id}" style="background: ${cat.bgColor}; border-left: 3px solid ${cat.borderColor}; padding: 2px 4px; border-radius: 3px; font-size: 0.66rem; font-weight: 700; color: ${cat.color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${evt.title} (${cat.name})">
                  ${cat.icon} ${evt.title}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="card" id="calendar-swipe-zone" style="padding: 22px; ${animStyle} touch-action: pan-y;">
        
        <!-- Month Navigation Bar with Gesture Guidance -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-prev-month" style="font-weight: 800; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
              <span>◀</span> <span>Bulan Lalu</span>
            </button>
            <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--primary-950); margin: 0; min-width: 170px;">
              ${monthNames[calendarMonth]} ${calendarYear}
            </h3>
            <button type="button" class="btn btn-outline btn-sm" id="btn-next-month" style="font-weight: 800; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
              <span>Bulan Depan</span> <span>▶</span>
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; font-size: 0.72rem; font-weight: 800; padding: 4px 10px;">
              🖐️ Geser / Swipe Kalender
            </span>
            <button type="button" class="btn btn-outline btn-sm" id="btn-today-month" style="font-size: 0.74rem; font-weight: 800;">
              Hari Ini
            </button>
          </div>
        </div>

        <!-- Swipe Guidance Hint -->
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 6px 14px; margin-bottom: 14px; font-size: 0.74rem; color: var(--text-muted);">
          <span>👈 <strong>Geser / Drag ke Kiri</strong> untuk Bulan Depan</span>
          <span>👉 <strong>Geser / Drag ke Kanan</strong> untuk Bulan Lalu</span>
        </div>

        <!-- Horizontal Scrollable Matrix Container (Mobile Responsive Drag-Scroll) -->
        <div class="horizontal-scroll calendar-matrix-wrapper" data-scroll-x style="overflow-x: auto; -webkit-overflow-scrolling: touch; cursor: grab; padding-bottom: 4px;">
          <div style="min-width: 680px;">
            
            <!-- Days of Week Header (Sun to Sat) -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 800; font-size: 0.76rem; color: var(--text-muted); background: #f8fafc; border: 1px solid var(--border-light); border-bottom: none; border-radius: var(--radius-md) var(--radius-md) 0 0; padding: 8px 0;">
              <div style="color: #dc2626;">Ahad</div>
              <div>Senin</div>
              <div>Selasa</div>
              <div>Rabu</div>
              <div>Kamis</div>
              <div>Jumat</div>
              <div style="color: #0284c7;">Sabtu</div>
            </div>

            <!-- Calendar Matrix Grid -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); border-radius: 0 0 var(--radius-md) var(--radius-md); overflow: hidden;">
              ${daysHtml}
            </div>

          </div>
        </div>

        <!-- Legend Footer -->
        <div style="display: flex; align-items: center; gap: 16px; margin-top: 18px; font-size: 0.74rem; color: var(--text-muted); flex-wrap: wrap; justify-content: center; border-top: 1px solid var(--border-light); padding-top: 14px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #059669;"></span>
            <span>Keuangan & SPP</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #2563eb;"></span>
            <span>Perkuliahan & Ujian</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #d97706;"></span>
            <span>Kegiatan & Wisuda</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #e11d48;"></span>
            <span>Hari Libur</span>
          </div>
        </div>

      </div>
    `;
  }

  // --- INTERACTIVE SWIPE / DRAG GESTURE CONTROLLER ---
  function changeMonth(direction) {
    if (direction === 'next') {
      slideDirection = 'left';
      if (calendarMonth === 11) {
        calendarMonth = 0;
        calendarYear++;
      } else {
        calendarMonth++;
      }
    } else if (direction === 'prev') {
      slideDirection = 'right';
      if (calendarMonth === 0) {
        calendarMonth = 11;
        calendarYear--;
      } else {
        calendarMonth--;
      }
    }
    renderView();
    // Scroll active month pill into view on slider
    setTimeout(() => {
      const activePill = container.querySelector(`.btn-month-pill[data-year="${calendarYear}"][data-month="${calendarMonth}"]`);
      if (activePill) {
        activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);
  }

  function bindSwipeGestures(element) {
    if (!element || element._hasSwipeGestures) return;
    element._hasSwipeGestures = true;

    let touchStartX = 0;
    let touchStartY = 0;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDown = false;

    // 1. Touch Events (Mobile / Tablet)
    element.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only trigger if horizontal swipe is greater than vertical and exceeds threshold
      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          changeMonth('next');
        } else {
          changeMonth('prev');
        }
      }
    }, { passive: true });

    // 2. Mouse Drag Events (Desktop)
    element.addEventListener('mousedown', (e) => {
      if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });

    element.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const diffX = e.clientX - mouseStartX;
      const diffY = e.clientY - mouseStartY;

      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < 0) {
          changeMonth('next');
        } else {
          changeMonth('prev');
        }
      }
    });

    element.addEventListener('mouseleave', () => {
      isMouseDown = false;
    });
  }

  // --- EVENT LISTENERS & MODALS ---
  function bindEventListeners() {
    // Universal DragScroll on horizontal elements
    DragScrollHelper.init(container);

    const monthSlider = container.querySelector('#month-slider-track');
    if (monthSlider) {
      DragScrollHelper.attach(monthSlider);
    }

    // Attach Swipe / Drag Gestures on Calendar View Card
    const swipeZone = container.querySelector('#calendar-swipe-zone');
    if (swipeZone) {
      bindSwipeGestures(swipeZone);
    }

    // Month Slider Pills Click Handlers
    container.querySelectorAll('.btn-month-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const y = parseInt(btn.getAttribute('data-year'), 10);
        const m = parseInt(btn.getAttribute('data-month'), 10);
        slideDirection = (y > calendarYear || (y === calendarYear && m > calendarMonth)) ? 'left' : 'right';
        calendarYear = y;
        calendarMonth = m;
        renderView();
      });
    });

    // Quick Month Prev/Next in Month Slider Header
    const btnQuickPrev = container.querySelector('#btn-quick-prev-m');
    const btnQuickNext = container.querySelector('#btn-quick-next-m');
    if (btnQuickPrev) {
      btnQuickPrev.addEventListener('click', () => changeMonth('prev'));
    }
    if (btnQuickNext) {
      btnQuickNext.addEventListener('click', () => changeMonth('next'));
    }

    // Mode Switchers
    const btnTimeline = container.querySelector('#btn-mode-timeline');
    const btnCalendar = container.querySelector('#btn-mode-calendar');

    if (btnTimeline) {
      btnTimeline.addEventListener('click', () => {
        currentViewMode = 'timeline';
        renderView();
      });
    }

    if (btnCalendar) {
      btnCalendar.addEventListener('click', () => {
        currentViewMode = 'calendar';
        renderView();
      });
    }

    // Category Filter Buttons
    container.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-cat');
        renderView();
      });
    });

    // Semester Dropdown Filter
    const selectSemester = container.querySelector('#select-semester-filter');
    if (selectSemester) {
      selectSemester.addEventListener('change', (e) => {
        selectedSemester = e.target.value;
        renderView();
      });
    }

    // Search input
    const inputSearch = container.querySelector('#input-search-events');
    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        const contentContainer = container.querySelector('#calendar-content-container');
        if (contentContainer) {
          const filtered = getFilteredEvents();
          contentContainer.innerHTML = currentViewMode === 'timeline' 
            ? renderTimelineView(filtered) 
            : renderMonthlyCalendarView(filtered);
          bindItemListeners();
          const newSwipeZone = container.querySelector('#calendar-swipe-zone');
          if (newSwipeZone) bindSwipeGestures(newSwipeZone);
        }
      });
    }

    // Reset filters button
    const btnReset = container.querySelector('#btn-reset-filters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        selectedCategory = 'ALL';
        selectedSemester = 'ALL';
        searchQuery = '';
        renderView();
      });
    }

    // Monthly Calendar Navigation Buttons
    const btnPrevMonth = container.querySelector('#btn-prev-month');
    const btnNextMonth = container.querySelector('#btn-next-month');
    const btnTodayMonth = container.querySelector('#btn-today-month');

    if (btnPrevMonth) {
      btnPrevMonth.addEventListener('click', () => changeMonth('prev'));
    }

    if (btnNextMonth) {
      btnNextMonth.addEventListener('click', () => changeMonth('next'));
    }

    if (btnTodayMonth) {
      btnTodayMonth.addEventListener('click', () => {
        const now = new Date();
        slideDirection = (now.getFullYear() > calendarYear || (now.getFullYear() === calendarYear && now.getMonth() > calendarMonth)) ? 'left' : 'right';
        calendarYear = now.getFullYear();
        calendarMonth = now.getMonth();
        renderView();
      });
    }

    // Quick Payment Navigate
    const btnQuickBayar = container.querySelector('#btn-quick-goto-bayar');
    if (btnQuickBayar) {
      btnQuickBayar.addEventListener('click', () => {
        if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
      });
    }

    const btnBannerTagihan = container.querySelector('#btn-banner-tagihan');
    if (btnBannerTagihan) {
      btnBannerTagihan.addEventListener('click', () => {
        if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
      });
    }

    // Add Academic Event (Admin only)
    const btnAddEvent = container.querySelector('#btn-add-academic-event');
    if (btnAddEvent) {
      btnAddEvent.addEventListener('click', () => {
        openAddEditEventModal();
      });
    }

    // Export iCal (.ics) file
    const btnExportIcal = container.querySelector('#btn-export-ical');
    if (btnExportIcal) {
      btnExportIcal.addEventListener('click', () => {
        exportEventsToICS(events);
      });
    }

    // Print calendar
    const btnPrint = container.querySelector('#btn-print-calendar');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    bindItemListeners();
  }

  function bindItemListeners() {
    // Mini event click on calendar cell
    container.querySelectorAll('.cal-mini-event').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        openEventDetailModal(id);
      });
    });

    // Timeline Edit & Delete
    container.querySelectorAll('.btn-edit-event').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const evt = events.find(item => item.id === id);
        if (evt) openAddEditEventModal(evt);
      });
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const evt = events.find(item => item.id === id);
        if (!evt) return;

        if (confirm(`Apakah Anda yakin ingin menghapus agenda "${evt.title}"?`)) {
          appState.deleteAcademicEvent(id);
          window.simpelToast.show('Agenda Dihapus', `Agenda "${evt.title}" berhasil dihapus.`, 'success');
          renderView();
        }
      });
    });
  }

  // --- MODAL 1: Detail Agenda Modal ---
  function openEventDetailModal(eventId) {
    const evt = events.find(e => e.id === eventId);
    if (!evt || !window.simpelModals) return;

    const cat = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.AKADEMIK;
    const status = getEventStatus(evt.startDate, evt.endDate);

    const { overlay, card, title, body, footer } = window.simpelModals.getModalElements();
    title.innerHTML = `${cat.icon} Detail Agenda Akademik`;
    body.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <span class="badge" style="background: ${cat.bgColor}; color: ${cat.color}; font-weight: 800; font-size: 0.76rem;">${cat.badge}</span>
          <span class="badge" style="background: ${status.bgColor}; color: ${status.badgeColor}; font-weight: 800; font-size: 0.76rem;">${status.icon} ${status.label}</span>
          ${evt.isMandatory ? '<span class="badge" style="background:#fee2e2; color:#dc2626; font-weight:800; font-size:0.72rem;">WAJIB</span>' : ''}
        </div>
        
        <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--text-dark); margin: 0 0 10px;">
          ${evt.title}
        </h3>

        <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 16px;">
          ${evt.description || 'Tidak ada deskripsi.'}
        </p>

        <div style="background: #f8fafc; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 14px; display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Periode:</span>
            <span style="font-weight: 800; font-family: var(--font-mono); color: var(--text-dark);">
              ${formatDate(evt.startDate)} ${evt.startDate !== evt.endDate ? 's/d ' + formatDate(evt.endDate) : ''}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Semester:</span>
            <span style="font-weight: 700; color: var(--text-dark);">${evt.semester}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Lokasi:</span>
            <span style="font-weight: 700; color: var(--text-dark);">${evt.location || 'Kampus STIT IF'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-light);">Sasaran Peserta:</span>
            <span style="font-weight: 700; color: var(--text-dark);">${evt.targetRoles.includes('ALL') ? 'Semua Civitas Akademika' : evt.targetRoles.join(', ')}</span>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      ${!isAdmin && evt.category === 'KEUANGAN' ? `
        <button class="btn btn-primary btn-sm" id="btn-modal-pay-spp" style="background:#059669; border:none; font-weight:800;">
          💳 Buka Menu Pembayaran
        </button>
      ` : ''}
      <button class="btn btn-secondary" onclick="window.simpelModals.closeModal()">Tutup</button>
    `;

    const btnModalPay = footer.querySelector('#btn-modal-pay-spp');
    if (btnModalPay) {
      btnModalPay.addEventListener('click', () => {
        window.simpelModals.closeModal();
        if (window.simpelRouter) window.simpelRouter.navigateTo('view-mahasiswa');
      });
    }

    if (overlay) overlay.classList.add('active');
  }

  // --- MODAL 2: Tambah / Sunting Agenda Akademik (Admin Only) ---
  function openAddEditEventModal(eventToEdit = null) {
    if (!window.simpelModals) return;

    const isEdit = !!eventToEdit;
    const { overlay, card, title, body, footer } = window.simpelModals.getModalElements();

    title.innerHTML = isEdit ? '✏️ Sunting Agenda Akademik' : '➕ Tambah Agenda Akademik Baru';
    body.innerHTML = `
      <form id="form-academic-event">
        
        <div class="form-group">
          <label class="form-label" for="event-title">Nama / Judul Agenda <span class="required">*</span></label>
          <input type="text" class="form-control" id="event-title" required placeholder="Contoh: Pembayaran SPP & Her-Registrasi Gasal" value="${isEdit ? eventToEdit.title : ''}">
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="event-category">Kategori Agenda <span class="required">*</span></label>
            <select class="form-control" id="event-category" required>
              <option value="KEUANGAN" ${isEdit && eventToEdit.category === 'KEUANGAN' ? 'selected' : ''}>💰 Keuangan & SPP</option>
              <option value="AKADEMIK" ${isEdit && eventToEdit.category === 'AKADEMIK' ? 'selected' : (!isEdit ? 'selected' : '')}>📚 Perkuliahan & Ujian</option>
              <option value="KEGIATAN" ${isEdit && eventToEdit.category === 'KEGIATAN' ? 'selected' : ''}>🎉 Kegiatan & Wisuda</option>
              <option value="LIBUR" ${isEdit && eventToEdit.category === 'LIBUR' ? 'selected' : ''}>🌴 Hari Libur & Cuti</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="event-semester">Semester Berlaku <span class="required">*</span></label>
            <select class="form-control" id="event-semester" required>
              <option value="2026/2027 Ganjil" ${isEdit && eventToEdit.semester === '2026/2027 Ganjil' ? 'selected' : 'selected'}>2026/2027 Ganjil</option>
              <option value="2026/2027 Genap" ${isEdit && eventToEdit.semester === '2026/2027 Genap' ? 'selected' : ''}>2026/2027 Genap</option>
            </select>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="event-start-date">Tanggal Mulai <span class="required">*</span></label>
            <input type="date" class="form-control" id="event-start-date" required value="${isEdit ? eventToEdit.startDate : new Date().toISOString().split('T')[0]}">
          </div>

          <div class="form-group">
            <label class="form-label" for="event-end-date">Tanggal Selesai <span class="required">*</span></label>
            <input type="date" class="form-control" id="event-end-date" required value="${isEdit ? eventToEdit.endDate : new Date().toISOString().split('T')[0]}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="event-location">Lokasi / Media Pelaksanaan</label>
          <input type="text" class="form-control" id="event-location" placeholder="Contoh: Kampus STIT IF / Online SIMPEL-IF" value="${isEdit ? eventToEdit.location : 'Kampus STIT Ihsanul Fikri'}">
        </div>

        <div class="form-group">
          <label class="form-label" for="event-description">Deskripsi & Catatan Penting</label>
          <textarea class="form-control" id="event-description" rows="3" placeholder="Rincian prosedur, persyaratan berkas, atau info penting...">${isEdit ? (eventToEdit.description || '') : ''}</textarea>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.84rem; font-weight: 700; color: var(--text-dark);">
            <input type="checkbox" id="event-mandatory" ${isEdit && eventToEdit.isMandatory ? 'checked' : ''}>
            Agenda Bersifat Wajib Bagi Mahasiswa
          </label>
        </div>

      </form>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="window.simpelModals.closeModal()">Batal</button>
      <button class="btn btn-primary" id="btn-save-event" style="font-weight: 800;">
        💾 ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Agenda'}
      </button>
    `;

    const btnSave = footer.querySelector('#btn-save-event');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const titleVal = body.querySelector('#event-title').value.trim();
        const categoryVal = body.querySelector('#event-category').value;
        const semesterVal = body.querySelector('#event-semester').value;
        const startDateVal = body.querySelector('#event-start-date').value;
        const endDateVal = body.querySelector('#event-end-date').value;
        const locationVal = body.querySelector('#event-location').value.trim();
        const descVal = body.querySelector('#event-description').value.trim();
        const isMandatoryVal = body.querySelector('#event-mandatory').checked;

        if (!titleVal || !startDateVal || !endDateVal) {
          window.simpelToast.show('Validasi Gagal', 'Mohon lengkapi judul dan rentang tanggal agenda.', 'warning');
          return;
        }

        if (endDateVal < startDateVal) {
          window.simpelToast.show('Validasi Gagal', 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.', 'warning');
          return;
        }

        if (isEdit) {
          appState.updateAcademicEvent(eventToEdit.id, {
            title: titleVal,
            category: categoryVal,
            semester: semesterVal,
            startDate: startDateVal,
            endDate: endDateVal,
            location: locationVal,
            description: descVal,
            isMandatory: isMandatoryVal
          });
          window.simpelToast.show('Agenda Diperbarui', `Agenda "${titleVal}" berhasil diperbarui.`, 'success');
        } else {
          appState.addAcademicEvent({
            title: titleVal,
            category: categoryVal,
            semester: semesterVal,
            startDate: startDateVal,
            endDate: endDateVal,
            location: locationVal,
            description: descVal,
            isMandatory: isMandatoryVal,
            targetRoles: ['ALL']
          });
          window.simpelToast.show('Agenda Diterbitkan', `Agenda baru "${titleVal}" berhasil ditambahkan ke kalender akademik.`, 'success');
        }

        window.simpelModals.closeModal();
        renderView();
      });
    }

    if (overlay) overlay.classList.add('active');
  }

  // --- UTILITY: Export to iCalendar (.ICS) format ---
  function exportEventsToICS(eventList) {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//STIT Ihsanul Fikri//SIMPEL-IF Academic Calendar//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Kalender Akademik STIT Ihsanul Fikri',
      'X-WR-TIMEZONE:Asia/Jakarta'
    ];

    eventList.forEach(evt => {
      const startClean = evt.startDate.replace(/-/g, '');
      // In iCal, multi-day DTEND is exclusive so add 1 day
      const endDateObj = new Date(evt.endDate || evt.startDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      const endClean = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${evt.id}-${startClean}@stit-ihsanulfikri.ac.id`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${startClean}`);
      icsContent.push(`DTEND;VALUE=DATE:${endClean}`);
      icsContent.push(`SUMMARY:${evt.title.replace(/[,;]/g, ' ')}`);
      icsContent.push(`DESCRIPTION:${(evt.description || '').replace(/[,;\n]/g, ' ')}`);
      icsContent.push(`LOCATION:${(evt.location || 'STIT Ihsanul Fikri').replace(/[,;]/g, ' ')}`);
      icsContent.push(`CATEGORIES:${evt.category}`);
      icsContent.push('STATUS:CONFIRMED');
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kalender-Akademik-STIT-IF-${state.activeSemester.replace(/[\/\s]/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.simpelToast.show('Unduhan Berhasil', 'Berkas kalender (.ics) berhasil diunduh. Anda dapat membukanya di Google Calendar, Outlook, atau Apple Calendar.', 'success');
  }

  // Initial Render
  renderView();

  // Subscribe to state changes
  const unsubscribe = appState.subscribe(() => {
    renderView();
  });

  return unsubscribe;
}
