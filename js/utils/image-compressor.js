/**
 * SIMPEL-IF Image Compression Utility
 * STIT Ihsanul Fikri
 * 
 * Mengompresi file foto/gambar di sisi klien (browser) secara otomatis
 * sebelum disimpan ke state / localStorage / database, menjaga keterbacaan
 * struk transaksi perbankan dengan konsumsi memori dan kuota yang sangat hemat.
 */

/**
 * Format bytes menjadi teks ukuran file yang mudah dibaca (B, KB, MB)
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Memperkirakan ukuran byte dari dataURL base64
 * @param {string} dataUrl 
 * @returns {number}
 */
export function estimateBase64SizeBytes(dataUrl) {
  if (!dataUrl) return 0;
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

/**
 * Mengompresi berkas gambar / foto bukti transfer
 * @param {File|Blob} file 
 * @param {Object} options 
 * @param {number} [options.maxWidth=1280] - Lebar maksimum gambar
 * @param {number} [options.maxHeight=1280] - Tinggi maksimum gambar
 * @param {number} [options.quality=0.80] - Kualitas kompresi JPEG (0.1 - 1.0)
 * @param {number} [options.targetMaxKB=350] - Target ukuran berkas maksimum dalam KB
 * @param {string} [options.mimeType='image/jpeg'] - Format target output kompresi
 * @returns {Promise<Object>}
 */
export function compressImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Berkas tidak ditemukan.'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Format berkas harus berupa gambar (JPG, PNG, WEBP, dll).'));
    }

    const maxWidth = options.maxWidth || 1280;
    const maxHeight = options.maxHeight || 1280;
    const quality = typeof options.quality === 'number' ? options.quality : 0.80;
    const targetMaxKB = options.targetMaxKB || 350;
    const mimeType = options.mimeType || 'image/jpeg';

    const originalBytes = file.size || 0;
    const fileName = file.name || 'foto-bukti-transfer.jpg';

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const originalWidth = width;
      const originalHeight = height;

      // Hitung dimensi baru proporsional
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        return reject(new Error('Gagal menginisialisasi context canvas browser.'));
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Latar belakang putih jika gambar asal memiliki transparansi PNG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Gambar ke kanvas terkompresi
      ctx.drawImage(img, 0, 0, width, height);

      // Pass pertama kompresi
      let currentQuality = quality;
      let dataUrl = canvas.toDataURL(mimeType, currentQuality);
      let compressedBytes = estimateBase64SizeBytes(dataUrl);

      // Pass adaptif kedua jika ukuran masih di atas target KB dan kualitas masih bisa diturunkan sedikit
      if (compressedBytes > targetMaxKB * 1024 && currentQuality > 0.65) {
        currentQuality = 0.65;
        dataUrl = canvas.toDataURL(mimeType, currentQuality);
        compressedBytes = estimateBase64SizeBytes(dataUrl);
      }

      const savingsBytes = Math.max(0, originalBytes - compressedBytes);
      const savingsPercent = originalBytes > 0
        ? Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100))
        : 0;

      resolve({
        success: true,
        dataUrl,
        fileName,
        originalSizeBytes: originalBytes,
        compressedSizeBytes: compressedBytes,
        originalSizeFormatted: formatBytes(originalBytes),
        compressedSizeFormatted: formatBytes(compressedBytes),
        savingsBytes,
        savingsBytesFormatted: formatBytes(savingsBytes),
        savingsPercent: `${savingsPercent}%`,
        originalWidth,
        originalHeight,
        compressedWidth: width,
        compressedHeight: height,
        quality: currentQuality,
        mimeType
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal memproses dan membaca berkas gambar yang dipilih.'));
    };

    img.src = objectUrl;
  });
}
