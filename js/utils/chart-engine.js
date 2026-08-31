/**
 * SIMPEL-IF Chart Engine (Canvas-based Visual Analytics)
 * STIT Ihsanul Fikri
 */

import { formatRupiah } from './formatters.js';

export class ChartEngine {
  /**
   * Render Bar Chart: Comparison BKPI vs PIAUD
   */
  static renderBarChart(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 500;
    const height = canvas.height = 280;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 50, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const categories = data.categories; // ['Penerimaan Kas', 'Tunggakan / Piutang', 'Subsidi Beasiswa']
    const series1 = data.series1;       // BKPI values
    const series2 = data.series2;       // PIAUD values

    const allValues = [...series1.values, ...series2.values];
    const maxValue = Math.max(...allValues, 1000000) * 1.15;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = maxValue * (1 - i / gridLines);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatRupiah(val).replace('Rp', '').trim(), padding.left - 8, y + 4);
    }

    // Draw bars
    const groupWidth = chartWidth / categories.length;
    const barWidth = Math.min(36, (groupWidth - 30) / 2);

    categories.forEach((cat, idx) => {
      const groupX = padding.left + idx * groupWidth;

      // Bar 1: BKPI (Royal Blue)
      const val1 = series1.values[idx];
      const barHeight1 = (val1 / maxValue) * chartHeight;
      const x1 = groupX + (groupWidth / 2) - barWidth - 4;
      const y1 = padding.top + chartHeight - barHeight1;

      const grad1 = ctx.createLinearGradient(0, y1, 0, y1 + barHeight1);
      grad1.addColorStop(0, '#1e40af');
      grad1.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.roundRect(x1, y1, barWidth, barHeight1, [4, 4, 0, 0]);
      ctx.fill();

      // Bar 2: PIAUD (Rose / Magenta)
      const val2 = series2.values[idx];
      const barHeight2 = (val2 / maxValue) * chartHeight;
      const x2 = groupX + (groupWidth / 2) + 4;
      const y2 = padding.top + chartHeight - barHeight2;

      const grad2 = ctx.createLinearGradient(0, y2, 0, y2 + barHeight2);
      grad2.addColorStop(0, '#0284c7');
      grad2.addColorStop(1, '#38bdf8');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.roundRect(x2, y2, barWidth, barHeight2, [4, 4, 0, 0]);
      ctx.fill();

      // Label X
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cat, groupX + (groupWidth / 2), height - 20);
    });
  }

  /**
   * Render Donut Chart: Scholarship Category Distribution
   */
  static renderDonutChart(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 320;
    const height = canvas.height = 260;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.58;

    const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${total}`, centerX, centerY - 8);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Mahasiswa', centerX, centerY + 12);
  }

  /**
   * Render Cashflow Trend Line Chart
   */
  static renderTrendChart(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 500;
    const height = canvas.height = 240;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const labels = data.labels; // ['Mei', 'Jun', 'Jul', 'Agu', 'Sep']
    const values = data.values;

    const maxValue = Math.max(...values, 1000000) * 1.2;

    // Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Points
    const stepX = chartWidth / (labels.length - 1);
    const points = values.map((val, idx) => ({
      x: padding.left + idx * stepX,
      y: padding.top + chartHeight - (val / maxValue) * chartHeight
    }));

    // Fill Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
    gradient.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Circles and labels
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx], pt.x, height - 12);
    });
  }
}
