/**
 * SIMPEL-IF Dashboard Eksekutif Pimpinan & Keuangan (Terpadu)
 * STIT Ihsanul Fikri
 * Modul ini terintegrasi penuh menjadi Dashboard Terpadu (Unified Dashboard).
 */

import { renderDashboardBendahara } from './dashboard-bendahara.js';

export function renderPimpinanView(container) {
  renderDashboardBendahara(container);
}
