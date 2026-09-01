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

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
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
    return `<span class="badge badge-scholarship"><span class="badge-dot"></span>${s.name}</span>`;
  }
  try {
    const state = appState.getState();
    if (state && state.scholarshipSchemes) {
      const dynamicScheme = state.scholarshipSchemes.find(sc => sc.id === scholarshipId);
      if (dynamicScheme) {
        const shortName = dynamicScheme.name.split('(')[0].trim();
        return `<span class="badge badge-scholarship"><span class="badge-dot"></span>${shortName}</span>`;
      }
    }
  } catch (e) {
    // state fallback
  }
  return `<span class="badge badge-scholarship"><span class="badge-dot"></span>${scholarshipId}</span>`;
}
