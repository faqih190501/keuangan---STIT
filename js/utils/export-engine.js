/**
 * SIMPEL-IF Export & Print Utilities
 * STIT Ihsanul Fikri
 */

/**
 * Export data array to Excel/CSV with UTF-8 BOM for perfect Microsoft Excel rendering
 * Supports multiple call signatures:
 * 1. exportToCSV(dataArrayOfObjects, filename)
 * 2. exportToCSV(filename, dataArrayOfObjects)
 * 3. exportToCSV(filename, headersArray, rowsArrayOfArrays)
 */
export function exportToCSV(arg1, arg2, arg3) {
  let filename = 'SIMPEL_IF_Export';
  let headers = [];
  let rows = [];

  // Case 1: exportToCSV(dataArrayOfObjects, filename)
  if (Array.isArray(arg1) && arg1.length > 0 && typeof arg1[0] === 'object' && !Array.isArray(arg1[0])) {
    filename = (typeof arg2 === 'string' && arg2.trim()) ? arg2.trim() : `Export_${new Date().toISOString().slice(0, 10)}`;
    headers = Object.keys(arg1[0]);
    rows = arg1.map(item => headers.map(key => item[key] !== undefined && item[key] !== null ? item[key] : ''));
  }
  // Case 2: exportToCSV(filename, dataArrayOfObjects)
  else if (typeof arg1 === 'string' && Array.isArray(arg2) && arg2.length > 0 && typeof arg2[0] === 'object' && !Array.isArray(arg2[0])) {
    filename = arg1.trim();
    headers = Object.keys(arg2[0]);
    rows = arg2.map(item => headers.map(key => item[key] !== undefined && item[key] !== null ? item[key] : ''));
  }
  // Case 3: exportToCSV(filename, headersArray, rowsArrayOfArrays)
  else if (typeof arg1 === 'string' && Array.isArray(arg2) && Array.isArray(arg3)) {
    filename = arg1.trim();
    headers = arg2;
    rows = arg3;
  }
  // Fallback / Empty
  else if (Array.isArray(arg1) && arg1.length === 0) {
    filename = (typeof arg2 === 'string' && arg2.trim()) ? arg2.trim() : 'Export_Kosong';
    headers = ['Data'];
    rows = [['Tidak ada data untuk diekspor']];
  } else {
    filename = typeof arg1 === 'string' ? arg1 : 'Export_Data';
    headers = Array.isArray(arg2) ? arg2 : ['Data'];
    rows = Array.isArray(arg3) ? arg3 : [];
  }

  // Ensure clean filename (strip .csv if already present)
  const cleanFilename = filename.replace(/\.csv$/i, '');

  let csvContent = '\uFEFF'; // UTF-8 BOM for Indonesian characters and Microsoft Excel

  // Format Headers
  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

  // Format Rows
  rows.forEach(row => {
    if (Array.isArray(row)) {
      const line = row.map(val => {
        if (val === null || val === undefined) return '""';
        const text = String(val).replace(/"/g, '""');
        return `"${text}"`;
      }).join(',');
      csvContent += line + '\r\n';
    }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${cleanFilename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

/**
 * Print Official Receipt
 */
export function printReceiptElement() {
  window.print();
}
