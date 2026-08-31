/**
 * SIMPEL-IF Export & Print Utilities
 * STIT Ihsanul Fikri
 */

/**
 * Export data array to Excel/CSV with UTF-8 BOM for perfect Microsoft Excel rendering
 */
export function exportToCSV(filename, headers, rows) {
  let csvContent = '\uFEFF'; // UTF-8 BOM

  // Headers
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

  // Rows
  rows.forEach(row => {
    const line = row.map(val => {
      if (val === null || val === undefined) return '""';
      const text = val.toString().replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
    csvContent += line + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print Official Receipt
 */
export function printReceiptElement() {
  window.print();
}
