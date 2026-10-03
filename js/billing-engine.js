/**
 * SIMPEL-IF Billing & Scholarship Engine
 * STIT Ihsanul Fikri
 */

import { appState } from './state.js';
import { STATUS_TAGIHAN } from './models.js';

export class BillingEngine {
  /**
   * Calculate invoice breakdown for a specific student tailored to scholarship scheme
   */
  static calculateInvoice(student, semester, options = {}) {
    const state = appState.getState();
    const feeComponents = state.feeComponents || [];
    const scholarshipSchemes = state.scholarshipSchemes || [];
    const individualOverrides = state.individualOverrides || [];

    const effectiveScholarshipId = options.scholarshipId || student.scholarshipId;
    const scholarship = scholarshipSchemes.find(s => s.id === effectiveScholarshipId) || scholarshipSchemes[0] || { id: 'REGULER', discountType: 'PERCENT', discountValue: 0 };
    const studentOverride = individualOverrides.find(
      ov => ov.studentNim === student.nim && ov.semester === semester && ov.status === 'ACTIVE'
    );

    const items = [];
    let grossAmount = 0;
    let totalDiscount = 0;

    const shouldInclude = (id) => !options.selectedComponentIds || options.selectedComponentIds.includes(id);

    // 1. SPP / UKT Pokok
    if (shouldInclude('SPP')) {
      const sppComp = feeComponents.find(c => c.id === 'SPP') || { name: 'SPP / UKT Pokok Semester', defaultAmount: 2400000 };
      let sppDiscount = 0;
      if (scholarship.id !== 'REGULER') {
        if (scholarship.discountType === 'PERCENT') {
          sppDiscount = (sppComp.defaultAmount * scholarship.discountValue) / 100;
        } else if (scholarship.discountType === 'FIXED') {
          sppDiscount = Math.min(scholarship.discountValue, sppComp.defaultAmount);
        }
      }

      // Check additional discount from individual override or options.extraDiscount
      if (studentOverride && studentOverride.overrideType === 'ADDITIONAL_DISCOUNT') {
        sppDiscount += studentOverride.discountAmount || 0;
      }
      if (options.extraDiscount) {
        sppDiscount += Number(options.extraDiscount) || 0;
      }

      // Max discount cannot exceed base
      sppDiscount = Math.min(sppDiscount, sppComp.defaultAmount);

      const sppFinal = sppComp.defaultAmount - sppDiscount;
      items.push({
        componentId: 'SPP',
        name: sppComp.name,
        baseAmount: sppComp.defaultAmount,
        discount: sppDiscount,
        finalAmount: sppFinal
      });

      grossAmount += sppComp.defaultAmount;
      totalDiscount += sppDiscount;
    }

    // 2. Daftar Ulang (Every semester)
    if (shouldInclude('DAFTAR_ULANG')) {
      const duComp = feeComponents.find(c => c.id === 'DAFTAR_ULANG') || { name: 'Biaya Daftar Ulang / Heregistrasi', defaultAmount: 450000 };
      items.push({
        componentId: 'DAFTAR_ULANG',
        name: duComp.name,
        baseAmount: duComp.defaultAmount,
        discount: 0,
        finalAmount: duComp.defaultAmount
      });
      grossAmount += duComp.defaultAmount;
    }

    // 3. Pendaftaran Maba (Semester 1 only unless forced or explicitly selected)
    if (shouldInclude('PENDAFTARAN') && (options.forceAllComponents || student.semester === 1 || options.selectedComponentIds)) {
      const pendComp = feeComponents.find(c => c.id === 'PENDAFTARAN') || { name: 'Biaya Pendaftaran & Formulir PMB', defaultAmount: 200000 };
      items.push({
        componentId: 'PENDAFTARAN',
        name: pendComp.name,
        baseAmount: pendComp.defaultAmount,
        discount: 0,
        finalAmount: pendComp.defaultAmount
      });
      grossAmount += pendComp.defaultAmount;
    }

    // 4. Wisuda / Munaqosyah (Semester 7 or 8 unless forced or explicitly selected)
    if (shouldInclude('WISUDA') && (options.forceAllComponents || student.semester >= 7 || options.selectedComponentIds)) {
      const wisudaComp = feeComponents.find(c => c.id === 'WISUDA') || { name: 'Biaya Munaqosyah & Wisuda', defaultAmount: 1500000 };
      items.push({
        componentId: 'WISUDA',
        name: wisudaComp.name,
        baseAmount: wisudaComp.defaultAmount,
        discount: 0,
        finalAmount: wisudaComp.defaultAmount
      });
      grossAmount += wisudaComp.defaultAmount;
    }

    // 5. Asrama Pesantren (If selected or explicitly included)
    if (shouldInclude('ASRAMA') && options.selectedComponentIds) {
      const asramaBase = Number(options.asramaAmount) || 500000;
      items.push({
        componentId: 'ASRAMA',
        name: 'Iuran Asrama Santri Mukim As-Syamil',
        baseAmount: asramaBase,
        discount: 0,
        finalAmount: asramaBase
      });
      grossAmount += asramaBase;
    }

    // Custom items if provided
    if (Array.isArray(options.customItems)) {
      options.customItems.forEach(ci => {
        const base = Number(ci.baseAmount) || 0;
        const disc = Number(ci.discount) || 0;
        const fin = Math.max(0, base - disc);
        if (base > 0) {
          items.push({
            componentId: ci.componentId || 'CUSTOM',
            name: ci.name || 'Tagihan Lainnya',
            baseAmount: base,
            discount: disc,
            finalAmount: fin
          });
          grossAmount += base;
          totalDiscount += disc;
        }
      });
    }

    const netAmount = Math.max(0, grossAmount - totalDiscount);

    // Virtual Account Resmi Bank Syariah Indonesia (BSI) STIT-IF
    const virtualAccount = '1056405743';

    return {
      items,
      grossAmount,
      totalDiscount,
      netAmount,
      virtualAccount,
      studentOverride,
      scholarship
    };
  }

  /**
   * Create and record a new student invoice tailored to their scholarship track
   */
  static createStudentInvoice({
    studentNim,
    semester,
    scholarshipId,
    items,
    grossAmount,
    totalDiscount,
    netAmount,
    dueDate,
    notes = '',
    customVirtualAccount = '1056405743'
  }) {
    const state = appState.getState();
    const student = (state.students || []).find(s => s.nim === studentNim);
    if (!student) return { success: false, message: 'Mahasiswa tidak ditemukan' };

    const scholarshipSchemes = state.scholarshipSchemes || [];
    const scholarship = scholarshipSchemes.find(s => s.id === scholarshipId) || scholarshipSchemes[0] || { id: 'REGULER', name: 'Reguler' };

    const invId = `INV-${Date.now().toString().slice(-6)}-${student.nim.slice(-3)}`;
    const isZeroBill = netAmount <= 0;

    const pad = (n) => n.toString().padStart(2, '0');
    const now = new Date();
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const autoReceipt = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    const newInvoice = {
      id: invId,
      studentNim: student.nim,
      studentName: student.name,
      semester: semester || state.activeSemester || '2026/2027 Ganjil',
      createdDate: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      items: items || [],
      grossAmount: Number(grossAmount) || 0,
      totalDiscount: Number(totalDiscount) || 0,
      netAmount: Math.max(0, Number(netAmount) || 0),
      paidAmount: isZeroBill ? 0 : 0,
      status: isZeroBill ? STATUS_TAGIHAN.LUNAS : STATUS_TAGIHAN.BELUM_BAYAR,
      paymentMethod: isZeroBill ? 'SUBSIDI_BEASISWA_100' : 'VA_BSI',
      receiptNumber: isZeroBill ? autoReceipt : null,
      paymentDate: isZeroBill ? new Date().toISOString().slice(0, 10) : null,
      virtualAccount: customVirtualAccount,
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      notes: notes || `Tagihan semester ${semester} (Jalur Beasiswa: ${scholarship.name})`
    };

    if (!state.invoices) state.invoices = [];
    state.invoices.unshift(newInvoice);

    appState.addAuditLog(
      'CREATE_INVOICE_SCHOLARSHIP',
      `${newInvoice.id} (${student.name} - ${student.nim})`,
      `Penerbitan tagihan semester ${newInvoice.semester} dengan Skema ${scholarship.name}. Tarif Bruto: Rp ${grossAmount.toLocaleString('id-ID')}, Subsidi Beasiswa: Rp ${totalDiscount.toLocaleString('id-ID')}, Wajib Bayar: Rp ${newInvoice.netAmount.toLocaleString('id-ID')}.`
    );

    appState.saveState();
    appState.notify();

    return { success: true, invoice: newInvoice, student, scholarship };
  }

  /**
   * Batch generate invoices for all active students in current semester
   */
  static generateBatchInvoices() {
    const state = appState.getState();
    const activeSemester = state.activeSemester;
    let createdCount = 0;

    state.students.forEach(student => {
      if (student.statusAkademik !== 'Aktif') return;

      const exists = state.invoices.find(inv => inv.studentNim === student.nim && inv.semester === activeSemester);
      if (!exists) {
        const calc = this.calculateInvoice(student, activeSemester);
        const newInvoice = {
          id: `INV-${Date.now().toString().slice(-6)}-${student.nim.slice(-3)}`,
          studentNim: student.nim,
          semester: activeSemester,
          createdDate: new Date().toISOString().slice(0, 10),
          dueDate: '2026-09-10',
          items: calc.items,
          grossAmount: calc.grossAmount,
          totalDiscount: calc.totalDiscount,
          netAmount: calc.netAmount,
          paidAmount: 0,
          status: STATUS_TAGIHAN.BELUM_BAYAR,
          paymentMethod: null,
          receiptNumber: null,
          paymentDate: null,
          virtualAccount: calc.virtualAccount,
          notes: `Tagihan semester ${activeSemester} diterbitkan secara otomatis.`
        };
        state.invoices.push(newInvoice);
        createdCount++;
      }
    });

    appState.addAuditLog(
      'GENERATE_TAGIHAN_MASSAL',
      `Tagihan ${activeSemester}`,
      `Berhasil menerbitkan ${createdCount} tagihan baru untuk mahasiswa aktif.`
    );

    appState.notify();
    return createdCount;
  }

  /**
   * Process Instant QRIS Payment Simulation (Full or Installment)
   */
  static processQRISPayment(invoiceId, payAmount = null, planType = 'FULL') {
    const state = appState.getState();
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Tagihan tidak ditemukan' };

    const student = state.students.find(s => s.nim === invoice.studentNim);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const currentPaid = invoice.paidAmount || 0;
    const remainingBefore = invoice.netAmount - currentPaid;
    const actualPay = payAmount ? Math.min(Number(payAmount), remainingBefore) : remainingBefore;
    const newTotalPaid = currentPaid + actualPay;

    const isFullyPaid = newTotalPaid >= invoice.netAmount;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    invoice.paidAmount = newTotalPaid;
    invoice.status = isFullyPaid ? STATUS_TAGIHAN.LUNAS : STATUS_TAGIHAN.DICICIL;
    invoice.paymentMethod = 'QRIS_NATIONAL';
    invoice.paymentDate = timeStr;
    invoice.receiptNumber = receiptNumber;
    invoice.notes = isFullyPaid 
      ? `Pelunasan via QRIS Standar Nasional (${planType === 'FULL' ? 'Lunas Sekaligus' : 'Pelunasan Termin Akhir'})` 
      : `Pembayaran Angsuran Cicilan via QRIS Nasional (Terbayar Rp ${newTotalPaid.toLocaleString('id-ID')} dari Rp ${invoice.netAmount.toLocaleString('id-ID')})`;

    appState.addAuditLog(
      isFullyPaid ? 'PAYMENT_QRIS_LUNAS' : 'PAYMENT_QRIS_CICILAN',
      `${invoice.id} (${student ? student.name : invoice.studentNim})`,
      `${isFullyPaid ? 'Pelunasan tagihan' : 'Pembayaran angsuran cicilan'} sebesar Rp ${actualPay.toLocaleString('id-ID')} via QRIS. Kwitansi terbit: ${receiptNumber}.`
    );

    if (!state.transactions) state.transactions = [];
    state.transactions.unshift({
      id: `TRX-${Date.now()}-${receiptSerial}`,
      invoiceId: invoice.id,
      studentNim: invoice.studentNim,
      amount: actualPay,
      paymentMethod: 'QRIS',
      vaNumber: null,
      bankName: 'QRIS Standar Nasional',
      status: 'VERIFIED',
      receiptNumber: receiptNumber,
      verifiedBy: 'SISTEM_QRIS_OTOMATIS',
      verifiedAt: timeStr,
      notes: invoice.notes,
      createdAt: timeStr
    });

    appState.notify({ type: 'PAYMENT_QRIS_PROCESSED', invoiceId: invoice.id, receiptNumber, isFullyPaid });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync('PAYMENT_QRIS_PROCESSED');
      }
    } catch (e) {}

    return { success: true, receiptNumber, invoice, isFullyPaid, paidAmount: actualPay, totalPaid: newTotalPaid };
  }

  /**
   * Process Instant Virtual Account Simulation Payment (Full or Installment)
   */
  static processVAPayment(invoiceId, bankName = 'Bank BSI (Bank Syariah Indonesia)', payAmount = null, planType = 'FULL') {
    const state = appState.getState();
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Tagihan tidak ditemukan' };

    const student = state.students.find(s => s.nim === invoice.studentNim);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const currentPaid = invoice.paidAmount || 0;
    const remainingBefore = invoice.netAmount - currentPaid;
    const actualPay = payAmount ? Math.min(Number(payAmount), remainingBefore) : remainingBefore;
    const newTotalPaid = currentPaid + actualPay;

    const isFullyPaid = newTotalPaid >= invoice.netAmount;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    invoice.paidAmount = newTotalPaid;
    invoice.status = isFullyPaid ? STATUS_TAGIHAN.LUNAS : STATUS_TAGIHAN.DICICIL;
    invoice.paymentMethod = bankName.includes('BSI') ? 'VA_BSI' : (bankName.includes('Mandiri') ? 'VA_MANDIRI' : bankName.includes('BRI') ? 'VA_BRI' : 'VA_MUAMALAT');
    invoice.paymentDate = timeStr;
    invoice.receiptNumber = receiptNumber;
    invoice.notes = isFullyPaid 
      ? `Lunas via ${bankName} Virtual Account (Auto-Reconciled)` 
      : `Pembayaran Cicilan via ${bankName} Virtual Account (Terbayar Rp ${newTotalPaid.toLocaleString('id-ID')})`;

    appState.addAuditLog(
      isFullyPaid ? 'PAYMENT_VA_LUNAS' : 'PAYMENT_VA_CICILAN',
      `${invoice.id} (${student ? student.name : invoice.studentNim})`,
      `${isFullyPaid ? 'Pelunasan tagihan' : 'Pembayaran angsuran cicilan'} sebesar Rp ${actualPay.toLocaleString('id-ID')} via ${bankName}. Kwitansi terbit: ${receiptNumber}.`
    );

    if (!state.transactions) state.transactions = [];
    state.transactions.unshift({
      id: `TRX-${Date.now()}-${receiptSerial}`,
      invoiceId: invoice.id,
      studentNim: invoice.studentNim,
      amount: actualPay,
      paymentMethod: 'VA',
      vaNumber: '1056405743',
      bankName: bankName,
      status: 'VERIFIED',
      receiptNumber: receiptNumber,
      verifiedBy: 'SISTEM_VA_OTOMATIS',
      verifiedAt: timeStr,
      notes: invoice.notes,
      createdAt: timeStr
    });

    appState.notify({ type: 'PAYMENT_VA_PROCESSED', invoiceId: invoice.id, receiptNumber, isFullyPaid });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync('PAYMENT_VA_PROCESSED');
      }
    } catch (e) {}

    return { success: true, receiptNumber, invoice, isFullyPaid, paidAmount: actualPay, totalPaid: newTotalPaid };
  }

  /**
   * Process Self-Service Independent Payment (Tanpa Tagihan / Pembayaran Mandiri Bebas)
   * e.g., Tabungan SPP, Infaq Kampus, Uang Muka, Heregistrasi Mandiri
   */
  static processMandiriPayment({
    studentNim,
    categoryName = 'SPP_MANDIRI',
    categoryLabel = 'Pembayaran Mandiri SPP / Biaya Kuliah',
    amount,
    paymentChannel = 'QRIS', // 'QRIS', 'VA_BSI', 'TRANSFER_MANUAL'
    senderData = null,
    notes = ''
  }) {
    const state = appState.getState();
    const student = state.students.find(s => s.nim === studentNim);
    if (!student) return { success: false, message: 'Data mahasiswa tidak ditemukan' };

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const invoiceId = `INV-MND-${Date.now().toString().slice(-6)}-${student.nim.slice(-3)}`;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    const isInstant = paymentChannel === 'QRIS' || paymentChannel === 'VA_BSI';

    const newInvoice = {
      id: invoiceId,
      studentNim: student.nim,
      semester: state.activeSemester,
      createdDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      items: [
        {
          componentId: categoryName,
          name: categoryLabel,
          baseAmount: amount,
          discount: 0,
          finalAmount: amount
        }
      ],
      grossAmount: amount,
      totalDiscount: 0,
      netAmount: amount,
      paidAmount: isInstant ? amount : 0,
      status: isInstant ? STATUS_TAGIHAN.LUNAS : STATUS_TAGIHAN.MENUNGGU_VERIFIKASI,
      paymentMethod: paymentChannel === 'QRIS' ? 'QRIS_NATIONAL' : (paymentChannel === 'VA_BSI' ? 'VA_BSI' : 'TRANSFER_MANUAL'),
      receiptNumber: isInstant ? receiptNumber : null,
      paymentDate: isInstant ? timeStr : null,
      virtualAccount: '1056405743',
      notes: notes || `Pembayaran mandiri mahasiswa (${categoryLabel}) via ${paymentChannel === 'QRIS' ? 'QRIS' : paymentChannel === 'VA_BSI' ? 'BSI VA' : 'Transfer BSI'}.`
    };

    state.invoices.unshift(newInvoice);

    // If manual transfer, also create a verification queue entry
    if (!isInstant && senderData) {
      const scholarship = state.scholarshipSchemes.find(sc => sc.id === student.scholarshipId);
      const newVerif = {
        id: `VERIF-${Date.now().toString().slice(-4)}`,
        invoiceId: invoiceId,
        studentNim: student.nim,
        studentName: student.name,
        prodi: student.prodi,
        semester: student.semester,
        scholarshipName: scholarship ? scholarship.name : 'Reguler',
        amount: amount,
        transferDate: timeStr,
        senderBank: senderData.senderBank || 'Bank BSI',
        senderAccountName: senderData.senderAccountName || student.name.toUpperCase(),
        senderAccountNumber: senderData.senderAccountNumber || '1056405743',
        destinationBank: 'Bank BSI - STIT Ihsanul Fikri (No. Rek 1056405743)',
        proofImage: senderData.proofImage || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        status: 'PENDING',
        notes: `Pembayaran Mandiri: ${categoryLabel}. ${notes}`,
        submittedAt: timeStr
      };
      state.paymentVerifications.unshift(newVerif);
    }

    appState.addAuditLog(
      isInstant ? 'PAYMENT_MANDIRI_SUCCESS' : 'SUBMIT_MANDIRI_TRANSFER',
      `${invoiceId} (${student.name})`,
      `Mahasiswa melakukan pembayaran mandiri ${categoryLabel} sebesar Rp ${amount.toLocaleString('id-ID')} via ${paymentChannel}.`
    );

    if (isInstant) {
      if (!state.transactions) state.transactions = [];
      state.transactions.unshift({
        id: `TRX-${Date.now()}-${receiptSerial}`,
        invoiceId: newInvoice.id,
        studentNim: student.nim,
        amount: amount,
        paymentMethod: paymentChannel,
        vaNumber: paymentChannel === 'VA_BSI' ? '1056405743' : null,
        bankName: paymentChannel === 'VA_BSI' ? 'Bank BSI' : 'QRIS Nasional',
        status: 'VERIFIED',
        receiptNumber: receiptNumber,
        verifiedBy: 'SISTEM_MANDIRI_OTOMATIS',
        verifiedAt: timeStr,
        notes: newInvoice.notes,
        createdAt: timeStr
      });
    }

    appState.notify({ type: isInstant ? 'PAYMENT_MANDIRI_SUCCESS' : 'SUBMIT_MANDIRI_TRANSFER', invoiceId: newInvoice.id, receiptNumber });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync(isInstant ? 'PAYMENT_MANDIRI_SUCCESS' : 'SUBMIT_MANDIRI_TRANSFER');
      }
    } catch (e) {}

    return { success: true, invoice: newInvoice, receiptNumber: isInstant ? receiptNumber : null, isInstant };
  }

  /**
   * Submit manual transfer proof by Mahasiswa
   */
  static submitManualTransfer(invoiceId, transferData) {
    const state = appState.getState();
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Tagihan tidak ditemukan' };

    const student = state.students.find(s => s.nim === invoice.studentNim);
    const scholarship = state.scholarshipSchemes.find(sc => sc.id === student?.scholarshipId);

    invoice.status = STATUS_TAGIHAN.MENUNGGU_VERIFIKASI;
    invoice.paymentMethod = 'TRANSFER_MANUAL';
    invoice.notes = 'Bukti transfer manual diunggah. Menunggu verifikasi Bendahara.';

    const newVerif = {
      id: `VERIF-${Date.now().toString().slice(-4)}`,
      invoiceId: invoice.id,
      studentNim: student.nim,
      studentName: student.name,
      prodi: student.prodi,
      semester: student.semester,
      scholarshipName: scholarship ? scholarship.name : 'Reguler',
      amount: transferData.amount || invoice.netAmount,
      transferDate: transferData.transferDate || new Date().toISOString().slice(0, 16).replace('T', ' '),
      senderBank: transferData.senderBank || 'Bank BSI',
      senderAccountName: transferData.senderAccountName || student.name.toUpperCase(),
      senderAccountNumber: transferData.senderAccountNumber || '1234567890',
      destinationBank: transferData.destinationBank || 'Bank BSI - STIT Ihsanul Fikri (No. Rek 1056405743)',
      proofImage: transferData.proofImage || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      status: 'PENDING',
      notes: transferData.notes || 'Pembayaran SPP dan Heregistrasi Semester Aktif',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    state.paymentVerifications.unshift(newVerif);

    appState.addAuditLog(
      'SUBMIT_TRANSFER_PROOF',
      `${newVerif.id} (${student.name})`,
      `Mahasiswa mengunggah bukti transfer manual sebesar Rp ${(transferData.amount || invoice.netAmount).toLocaleString('id-ID')}.`
    );

    appState.notify({ type: 'VERIFICATION_SUBMITTED', verification: newVerif });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync('VERIFICATION_SUBMITTED');
      }
    } catch (e) {}

    return { success: true, verification: newVerif };
  }

  /**
   * Approve manual payment proof by Bendahara (ADMIN ONLY)
   */
  static approveManualPayment(verificationId, bendaharaNote = '') {
    const state = appState.getState();
    if (state.currentRole !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Admin / Bendahara STIT Ihsanul Fikri yang berwenang menyetujui pembayaran dan menerbitkan kwitansi resmi.' 
      };
    }

    const verif = state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan' };

    let invoice = state.invoices.find(i => i.id === verif.invoiceId);
    if (!invoice && verif.studentNim) {
      invoice = state.invoices.find(i => i.studentNim === verif.studentNim);
    }
    if (!invoice) {
      // Fallback: auto-create invoice record if missing
      const student = state.students.find(s => s.nim === verif.studentNim);
      invoice = {
        id: `INV-AUTO-${Date.now()}`,
        studentNim: verif.studentNim,
        studentName: verif.studentName || (student ? student.name : 'Mahasiswa'),
        semester: state.activeSemester || '2026/2027 Ganjil',
        baseAmount: Number(verif.amount) || 0,
        discountAmount: 0,
        netAmount: Number(verif.amount) || 0,
        paidAmount: 0,
        status: STATUS_TAGIHAN.BELUM_BAYAR,
        items: [{ code: 'PAY-MANUAL', name: 'Pembayaran Registrasi/SPP', nominal: Number(verif.amount) || 0, isMandatory: true }]
      };
      state.invoices.push(invoice);
    }

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    const adminName = state.currentUser?.name || (state.adminProfile?.name) || 'Bendahara STIT-IF';

    verif.status = 'APPROVED';
    verif.processedAt = timeStr;
    verif.processedBy = adminName;
    verif.verifiedAt = timeStr;
    verif.verifiedBy = adminName;
    verif.receiptNumber = receiptNumber;
    if (bendaharaNote) verif.notes = `${verif.notes ? verif.notes + ' | ' : ''}Catatan Bendahara: ${bendaharaNote}`;

    const prevPaid = Number(invoice.paidAmount) || 0;
    const addAmt = Number(verif.amount) || 0;
    const newPaid = Math.min(Number(invoice.netAmount) || addAmt, prevPaid + addAmt);
    invoice.paidAmount = newPaid;
    if (newPaid >= (Number(invoice.netAmount) || addAmt)) {
      invoice.status = STATUS_TAGIHAN.LUNAS;
    } else {
      invoice.status = STATUS_TAGIHAN.DICICIL;
    }
    invoice.paymentDate = timeStr;
    invoice.receiptNumber = receiptNumber;
    invoice.notes = `Disetujui oleh Bendahara (${adminName}). Kwitansi: ${receiptNumber}`;

    appState.addAuditLog(
      'VERIFY_TRANSFER_APPROVE',
      `${verif.id} (${verif.studentName || verif.studentNim})`,
      `Bendahara (${adminName}) menyetujui transfer manual Rp ${addAmt.toLocaleString('id-ID')}. Kwitansi terbit: ${receiptNumber}. Status: ${invoice.status}.`
    );

    if (!state.transactions) state.transactions = [];
    state.transactions.unshift({
      id: `TRX-${Date.now()}-${receiptSerial}`,
      invoiceId: invoice.id,
      studentNim: invoice.studentNim,
      amount: addAmt,
      paymentMethod: 'TRANSFER_MANUAL',
      vaNumber: null,
      bankName: verif.senderBank || 'Bank BSI',
      status: 'VERIFIED',
      receiptNumber: receiptNumber,
      verifiedBy: adminName,
      verifiedAt: timeStr,
      notes: invoice.notes,
      createdAt: timeStr
    });

    appState.saveState();
    appState.notify({ type: 'PAYMENT_APPROVED', verificationId, invoiceId: invoice.id });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync('PAYMENT_APPROVED');
      }
    } catch (e) {}

    return { success: true, receiptNumber, invoice };
  }

  /**
   * Reject manual payment proof by Bendahara (ADMIN ONLY)
   */
  static rejectManualPayment(verificationId, rejectReason) {
    const state = appState.getState();
    if (state.currentRole !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Admin / Bendahara STIT Ihsanul Fikri yang berwenang menolak verifikasi pembayaran.' 
      };
    }

    const verif = state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan' };

    const invoice = state.invoices.find(i => i.id === verif.invoiceId || (verif.studentNim && i.studentNim === verif.studentNim));
    if (invoice && invoice.status !== STATUS_TAGIHAN.LUNAS) {
      invoice.status = STATUS_TAGIHAN.BELUM_BAYAR;
      invoice.notes = `Bukti transfer ditolak oleh Bendahara: ${rejectReason}`;
    }

    const adminName = state.currentUser?.name || (state.adminProfile?.name) || 'Bendahara STIT-IF';
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    verif.status = 'REJECTED';
    verif.processedAt = timeStr;
    verif.processedBy = adminName;
    verif.verifiedAt = timeStr;
    verif.verifiedBy = adminName;
    verif.rejectionReason = rejectReason;
    verif.rejectedReason = rejectReason;

    appState.addAuditLog(
      'VERIFY_TRANSFER_REJECT',
      `${verif.id} (${verif.studentName || verif.studentNim})`,
      `Bendahara (${adminName}) menolak bukti transfer. Alasan: "${rejectReason}".`
    );

    appState.saveState();
    appState.notify();
    return { success: true };
  }

  /**
   * Update Scholarship Scheme by Bendahara / Admin
   */
  static updateScholarshipScheme(schemeId, updateData) {
    const state = appState.getState();
    const scheme = state.scholarshipSchemes.find(s => s.id === schemeId);
    if (!scheme) return { success: false, message: 'Skema beasiswa tidak ditemukan' };

    const oldDesc = `${scheme.discountType === 'PERCENT' ? scheme.discountValue + '%' : 'Rp ' + scheme.discountValue.toLocaleString('id-ID')}`;
    
    scheme.name = updateData.name || scheme.name;
    scheme.description = updateData.description || scheme.description;
    scheme.discountType = updateData.discountType || scheme.discountType;
    scheme.discountValue = Number(updateData.discountValue) || 0;
    if (updateData.eligibleProdi) scheme.eligibleProdi = updateData.eligibleProdi;
    if (updateData.targetComponents) scheme.targetComponents = updateData.targetComponents;

    const newDesc = `${scheme.discountType === 'PERCENT' ? scheme.discountValue + '%' : 'Rp ' + scheme.discountValue.toLocaleString('id-ID')}`;

    // Recalculate unpaid invoices of students with this scholarship
    state.invoices.forEach(inv => {
      if (inv.status === STATUS_TAGIHAN.BELUM_BAYAR) {
        const student = state.students.find(s => s.nim === inv.studentNim);
        if (student && student.scholarshipId === schemeId) {
          const reCalc = this.calculateInvoice(student, inv.semester);
          inv.items = reCalc.items;
          inv.grossAmount = reCalc.grossAmount;
          inv.totalDiscount = reCalc.totalDiscount;
          inv.netAmount = reCalc.netAmount;
        }
      }
    });

    appState.addAuditLog(
      'UPDATE_SKEMA_BEASISWA',
      scheme.name,
      `Perubahan subsidi skema dari [${oldDesc}] menjadi [${newDesc}] oleh ${state.currentUser?.name || 'Admin Bendahara'}.`
    );

    appState.notify();
    return { success: true, scheme };
  }

  /**
   * Create New Scholarship Scheme by Admin
   */
  static createScholarshipScheme(newSchemeData) {
    const state = appState.getState();
    const id = (newSchemeData.id || `SCH_${Date.now().toString().slice(-4)}`).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    
    if (state.scholarshipSchemes.some(s => s.id === id)) {
      return { success: false, message: 'ID Skema Beasiswa sudah digunakan.' };
    }

    const newScheme = {
      id,
      name: newSchemeData.name,
      description: newSchemeData.description || 'Skema beasiswa resmi STIT Ihsanul Fikri',
      discountType: newSchemeData.discountType || 'PERCENT',
      discountValue: Number(newSchemeData.discountValue) || 0,
      targetComponents: newSchemeData.targetComponents || ['SPP'],
      eligibleProdi: newSchemeData.eligibleProdi || ['BKPI', 'PIAUD'],
      activeStudentsCount: 0
    };

    state.scholarshipSchemes.push(newScheme);

    appState.addAuditLog(
      'CREATE_SKEMA_BEASISWA',
      newScheme.name,
      `Penambahan skema beasiswa baru [${newScheme.name}] dengan potongan ${newScheme.discountType === 'PERCENT' ? newScheme.discountValue + '%' : 'Rp ' + newScheme.discountValue.toLocaleString('id-ID')} oleh ${state.currentUser?.name || 'Admin Bendahara'}.`
    );

    appState.notify();
    return { success: true, scheme: newScheme };
  }

  /**
   * Delete Scholarship Scheme by Admin
   */
  static deleteScholarshipScheme(schemeId) {
    const state = appState.getState();
    if (schemeId === 'REGULER') {
      return { success: false, message: 'Skema Reguler adalah skema dasar sistem dan tidak dapat dihapus.' };
    }

    const index = state.scholarshipSchemes.findIndex(s => s.id === schemeId);
    if (index === -1) return { success: false, message: 'Skema beasiswa tidak ditemukan.' };

    const schemeName = state.scholarshipSchemes[index].name;

    // Check if students are using it, fallback to REGULER
    let affectedCount = 0;
    state.students.forEach(s => {
      if (s.scholarshipId === schemeId) {
        s.scholarshipId = 'REGULER';
        affectedCount++;
      }
    });

    state.scholarshipSchemes.splice(index, 1);

    // Recalculate invoices for affected students
    if (affectedCount > 0) {
      state.invoices.forEach(inv => {
        if (inv.status === STATUS_TAGIHAN.BELUM_BAYAR) {
          const student = state.students.find(s => s.nim === inv.studentNim);
          if (student && student.scholarshipId === 'REGULER') {
            const reCalc = this.calculateInvoice(student, inv.semester);
            inv.items = reCalc.items;
            inv.grossAmount = reCalc.grossAmount;
            inv.totalDiscount = reCalc.totalDiscount;
            inv.netAmount = reCalc.netAmount;
          }
        }
      });
    }

    appState.addAuditLog(
      'DELETE_SKEMA_BEASISWA',
      schemeName,
      `Penghapusan skema beasiswa [${schemeName}]. Sebanyak ${affectedCount} mahasiswa dialihkan ke skema Reguler.`
    );

    appState.notify();
    return { success: true, affectedCount };
  }

  /**
   * Add Individual Override or Dispensasi by Bendahara
   */
  static addIndividualOverride(overrideData) {
    const state = appState.getState();
    const newOverride = {
      id: `OVR-${Date.now().toString().slice(-4)}`,
      studentNim: overrideData.studentNim,
      semester: state.activeSemester,
      overrideType: overrideData.overrideType, // ADDITIONAL_DISCOUNT or INSTALLMENT_PLAN
      discountAmount: Number(overrideData.discountAmount) || 0,
      reason: overrideData.reason,
      status: 'ACTIVE',
      approvedBy: state.currentUser?.name || 'Admin Bendahara'
    };

    if (!state.individualOverrides) state.individualOverrides = [];
    state.individualOverrides.push(newOverride);

    // Apply to student's invoice
    const student = state.students.find(s => s.nim === overrideData.studentNim);
    if (student) {
      const inv = state.invoices.find(i => i.studentNim === student.nim && i.semester === state.activeSemester);
      if (inv && inv.status === STATUS_TAGIHAN.BELUM_BAYAR) {
        const reCalc = this.calculateInvoice(student, state.activeSemester);
        inv.items = reCalc.items;
        inv.grossAmount = reCalc.grossAmount;
        inv.totalDiscount = reCalc.totalDiscount;
        inv.netAmount = reCalc.netAmount;
        inv.notes = `Diberikan override khusus: ${overrideData.reason}`;
      }
    }

    appState.addAuditLog(
      'CREATE_OVERRIDE',
      `Override Mahasiswa (${student ? student.name : overrideData.studentNim})`,
      `Pemberian override khusus/dispensasi: "${overrideData.reason}".`
    );

    appState.notify();
    return { success: true, override: newOverride };
  }

  /**
   * Delete Individual Override by Bendahara
   */
  static deleteIndividualOverride(overrideId) {
    const state = appState.getState();
    if (!state.individualOverrides) return { success: false, message: 'Data override tidak ditemukan.' };

    const index = state.individualOverrides.findIndex(o => o.id === overrideId);
    if (index === -1) return { success: false, message: 'Data override tidak ditemukan.' };

    const ovr = state.individualOverrides[index];
    const student = state.students.find(s => s.nim === ovr.studentNim);
    const studentName = student ? student.name : ovr.studentNim;

    state.individualOverrides.splice(index, 1);

    // Recalculate student's invoice if unpaid
    if (student) {
      const inv = state.invoices.find(i => i.studentNim === student.nim && i.semester === ovr.semester);
      if (inv && (inv.status === STATUS_TAGIHAN.BELUM_BAYAR || inv.status === STATUS_TAGIHAN.DICICIL)) {
        const reCalc = this.calculateInvoice(student, ovr.semester);
        inv.items = reCalc.items;
        inv.grossAmount = reCalc.grossAmount;
        inv.totalDiscount = reCalc.totalDiscount;
        inv.netAmount = reCalc.netAmount;
        inv.notes = `Override dicabut. Tagihan dikembalikan ke skema reguler/beasiswa aktif.`;
      }
    }

    appState.addAuditLog(
      'DELETE_OVERRIDE',
      `Override Mahasiswa (${studentName})`,
      `Pencabutan override/dispensasi [${ovr.id}]: "${ovr.reason}".`
    );

    appState.notify();
    return { success: true, message: `Override ${ovr.id} berhasil dihapus.` };
  }

  /**
   * Process Direct Manual/Cashier Payment by Admin (ADMIN ONLY - Kasir Kampus / Loket Bendahara)
   */
  static processManualPayment({ invoiceId, amount = null, method = 'KASIR_TUNAI', verifiedBy = null, notes = '' }) {
    const state = appState.getState();
    if (state.currentRole !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Admin / Bendahara STIT Ihsanul Fikri yang berwenang mengesahkan pelunasan pembayaran kasir.' 
      };
    }

    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false, message: 'Tagihan tidak ditemukan.' };

    const student = state.students.find(s => s.nim === invoice.studentNim);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const currentPaid = Number(invoice.paidAmount) || 0;
    const remainingBefore = invoice.netAmount - currentPaid;
    const actualPay = amount !== null && amount !== undefined ? Math.min(Number(amount), remainingBefore) : remainingBefore;
    const newTotalPaid = currentPaid + actualPay;

    const isFullyPaid = newTotalPaid >= invoice.netAmount;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    invoice.paidAmount = newTotalPaid;
    invoice.status = isFullyPaid ? STATUS_TAGIHAN.LUNAS : STATUS_TAGIHAN.DICICIL;
    invoice.paymentMethod = method;
    invoice.paymentDate = timeStr;
    invoice.receiptNumber = receiptNumber;
    invoice.notes = isFullyPaid
      ? (notes || `Pelunasan langsung via ${method === 'KASIR_TUNAI' ? 'Kasir Tunai Kampus' : 'Bank Manual'}. Diverifikasi oleh ${verifiedBy}.`)
      : (notes || `Pembayaran angsuran Rp ${actualPay.toLocaleString('id-ID')} via ${method}. Total terbayar Rp ${newTotalPaid.toLocaleString('id-ID')} dari Rp ${invoice.netAmount.toLocaleString('id-ID')}.`);

    appState.addAuditLog(
      isFullyPaid ? 'PAYMENT_MANUAL_LUNAS' : 'PAYMENT_MANUAL_CICILAN',
      `${invoice.id} (${student ? student.name : invoice.studentNim})`,
      `Penerimaan pembayaran ${isFullyPaid ? 'lunas' : 'angsuran'} sebesar Rp ${actualPay.toLocaleString('id-ID')} via ${method} oleh ${verifiedBy}. Kwitansi resmi terbit: ${receiptNumber}.`
    );

    if (!state.transactions) state.transactions = [];
    state.transactions.unshift({
      id: `TRX-${Date.now()}-${receiptSerial}`,
      invoiceId: invoice.id,
      studentNim: invoice.studentNim,
      amount: actualPay,
      paymentMethod: method,
      vaNumber: null,
      bankName: 'KASIR_TUNAI',
      status: 'VERIFIED',
      receiptNumber: receiptNumber,
      verifiedBy: verifiedBy || 'KASIR_BENDAHARA',
      verifiedAt: timeStr,
      notes: invoice.notes,
      createdAt: timeStr
    });

    appState.notify({ type: 'PAYMENT_MANUAL_PROCESSED', invoiceId: invoice.id, receiptNumber });
    try {
      if (window.simpelApi && typeof window.simpelApi.triggerAutoSync === 'function') {
        window.simpelApi.triggerAutoSync('PAYMENT_MANUAL_PROCESSED');
      }
    } catch (e) {}

    return {
      success: true,
      receiptNumber,
      invoice,
      isFullyPaid,
      paidAmount: actualPay,
      totalPaid: newTotalPaid
    };
  }
}
