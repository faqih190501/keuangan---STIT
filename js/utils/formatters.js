/**
 * SIMPEL-IF Formatting Utilities
 * STIT Ihsanul Fikri
 */

import { PRODI, STATUS_TAGIHAN, SCHOLARSHIP_TYPES } from '../models.js';
import { appState } from '../state.js';

export function formatRupiah(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function parseRupiah(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const clean = str.toString().replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

export function parseFlexibleDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  const str = String(dateInput).trim();
  if (!str || str === '-') return null;

  // Check DD/MM/YY or DD/MM/YYYY format with optional time
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) {
      year = year > 50 ? 1900 + year : 2000 + year;
    }
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const standard = new Date(str);
  if (!isNaN(standard.getTime())) return standard;
  return null;
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  const date = parseFlexibleDate(dateStr);
  if (!date) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  const date = parseFlexibleDate(dateStr);
  if (!date) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date) + ' WIB';
}

/**
 * Konversi tanggal Masehi ke Penanggalan Kalender Hijriyah (Umm al-Qura / Kemenag)
 * Menggunakan standar ECMAScript Intl API
 */
export function getHijriDate(dateInput = new Date()) {
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return 'Kalender Hijriyah';
    
    // Gunakan Intl DateTimeFormat standar ECMAScript dengan kalender Islamic Umalqura
    const formatter = new Intl.DateTimeFormat('id-TN-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let formatted = formatter.format(d);
    // Bersihkan karakter aneh atau standarkan akhiran H
    formatted = formatted.replace(/AH|BH/g, '').trim();
    if (!formatted.toLowerCase().includes('h')) {
      return `${formatted} H`;
    }
    return formatted;
  } catch (e) {
    try {
      const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return `${formatter.format(d)} H`;
    } catch (err) {
      return '1448 H';
    }
  }
}

/**
 * Konversi angka rupiah ke kalimat terbilang bahasa Indonesia
 */
export function terbilang(angka) {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  angka = Math.floor(Math.abs(Number(angka)));

  if (angka < 12) {
    return bilangan[angka];
  } else if (angka < 20) {
    return terbilang(angka - 10) + ' Belas';
  } else if (angka < 100) {
    return terbilang(Math.floor(angka / 10)) + ' Puluh ' + terbilang(angka % 10);
  } else if (angka < 200) {
    return 'Seratus ' + terbilang(angka - 100);
  } else if (angka < 1000) {
    return terbilang(Math.floor(angka / 100)) + ' Ratus ' + terbilang(angka % 100);
  } else if (angka < 2000) {
    return 'Seribu ' + terbilang(angka - 1000);
  } else if (angka < 1000000) {
    return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  } else if (angka < 1000000000) {
    return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  } else if (angka < 1000000000000) {
    return terbilang(Math.floor(angka / 1000000000)) + ' Milyar ' + terbilang(angka % 1000000000);
  } else {
    return 'Jumlah Terlalu Besar';
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case STATUS_TAGIHAN.LUNAS:
      return `<span class="badge badge-paid"><span class="badge-dot"></span>Lunas</span>`;
    case STATUS_TAGIHAN.MENUNGGU_VERIFIKASI:
      return `<span class="badge badge-pending"><span class="badge-dot"></span>Verifikasi</span>`;
    case STATUS_TAGIHAN.BELUM_BAYAR:
      return `<span class="badge badge-unpaid"><span class="badge-dot"></span>Belum Bayar</span>`;
    case STATUS_TAGIHAN.DICICIL:
      return `<span class="badge badge-installment"><span class="badge-dot"></span>Dispensasi/Cicilan</span>`;
    default:
      return `<span class="badge badge-unpaid">${status || '-'}</span>`;
  }
}

export function getProdiBadge(prodiId) {
  const p = PRODI[prodiId];
  if (!p) return `<span class="badge">${prodiId}</span>`;
  return `<span class="badge ${p.badgeClass}">${p.shortName}</span>`;
}

export function getScholarshipBadge(scholarshipId) {
  if (!scholarshipId || scholarshipId === 'REGULER') {
    return `<span class="badge badge-unpaid">Reguler</span>`;
  }
  const s = SCHOLARSHIP_TYPES[scholarshipId];
  if (s) {
    return `<span class="badge badge-scholarship"><span class="badge-dot"></span>${s.shortName || s.name}</span>`;
  }
  try {
    const state = appState.getState();
    if (state && state.scholarshipSchemes) {
      const dynamicScheme = state.scholarshipSchemes.find(sc => sc.id === scholarshipId);
      if (dynamicScheme) {
        const shortName = (dynamicScheme.shortName || dynamicScheme.name.split('(')[0]).trim();
        return `<span class="badge badge-scholarship"><span class="badge-dot"></span>${shortName}</span>`;
      }
    }
  } catch (e) {
    // Fallback
  }
  return `<span class="badge badge-scholarship">${scholarshipId}</span>`;
}
