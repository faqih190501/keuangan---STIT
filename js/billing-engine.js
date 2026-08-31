/**
 * SIMPEL-IF Billing & Scholarship Engine
 * STIT Ihsanul Fikri
 */

import { appState } from './state.js';
import { STATUS_TAGIHAN } from './models.js';

export class BillingEngine {
  /**
   * Calculate invoice breakdown for a specific student
   */
  static calculateInvoice(student, semester) {
    const state = appState.getState();
    const feeComponents = state.feeComponents;
    const scholarshipSchemes = state.scholarshipSchemes;
    const individualOverrides = state.individualOverrides || [];

    const scholarship = scholarshipSchemes.find(s => s.id === student.scholarshipId) || scholarshipSchemes[0];
    const studentOverride = individualOverrides.find(
      ov => ov.studentNim === student.nim && ov.semester === semester && ov.status === 'ACTIVE'
    );

    const items = [];
    let grossAmount = 0;
    let totalDiscount = 0;

    // 1. SPP / UKT Pokok
    const sppComp = feeComponents.find(c => c.id === 'SPP');
    if (sppComp) {
      let sppDiscount = 0;
      if (scholarship.id !== 'REGULER') {
        if (scholarship.discountType === 'PERCENT') {
          sppDiscount = (sppComp.defaultAmount * scholarship.discountValue) / 100;
        } else if (scholarship.discountType === 'FIXED') {
          sppDiscount = Math.min(scholarship.discountValue, sppComp.defaultAmount);
        }
      }

      // Check additional discount from individual override
      if (studentOverride && studentOverride.overrideType === 'ADDITIONAL_DISCOUNT') {
        sppDiscount += studentOverride.discountAmount || 0;
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
    const duComp = feeComponents.find(c => c.id === 'DAFTAR_ULANG');
    if (duComp) {
      items.push({
        componentId: 'DAFTAR_ULANG',
        name: duComp.name,
        baseAmount: duComp.defaultAmount,
        discount: 0,
        finalAmount: duComp.defaultAmount
      });
      grossAmount += duComp.defaultAmount;
    }

    // 3. Pendaftaran Maba (Semester 1 only)
    if (student.semester === 1) {
      const pendComp = feeComponents.find(c => c.id === 'PENDAFTARAN');
      if (pendComp) {
        items.push({
          componentId: 'PENDAFTARAN',
          name: pendComp.name,
          baseAmount: pendComp.defaultAmount,
          discount: 0,
          finalAmount: pendComp.defaultAmount
        });
        grossAmount += pendComp.defaultAmount;
      }
    }

    // 4. Wisuda / Munaqosyah (Semester 7 or 8)
    if (student.semester >= 7) {
      const wisudaComp = feeComponents.find(c => c.id === 'WISUDA');
      if (wisudaComp) {
        items.push({
          componentId: 'WISUDA',
          name: wisudaComp.name,
          baseAmount: wisudaComp.defaultAmount,
          discount: 0,
          finalAmount: wisudaComp.defaultAmount
        });
        grossAmount += wisudaComp.defaultAmount;
      }
    }

    const netAmount = grossAmount - totalDiscount;

    // Generate unique Virtual Account based on NIM & prodi
    const prodiCode = student.prodi === 'BKPI' ? '86208' : '86209';
    const virtualAccount = `9888${prodiCode}${student.nim.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    return {
      items,
      grossAmount,
      totalDiscount,
      netAmount,
      virtualAccount,
      studentOverride
    };
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

    appState.notify();
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

    appState.notify();
    return { success: true, receiptNumber, invoice, isFullyPaid, paidAmount: actualPay, totalPaid: newTotalPaid };
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
      destinationBank: transferData.destinationBank || 'Bank BSI - STIT Ihsanul Fikri (No. Rek 1009827361)',
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

    appState.notify();
    return { success: true, verification: newVerif };
  }

  /**
   * Approve manual payment proof by Bendahara
   */
  static approveManualPayment(verificationId, bendaharaNote = '') {
    const state = appState.getState();
    const verif = state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan' };

    const invoice = state.invoices.find(i => i.id === verif.invoiceId);
    if (!invoice) return { success: false, message: 'Tagihan tidak ditemukan' };

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const receiptSerial = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `KW-IF/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${receiptSerial}`;

    verif.status = 'APPROVED';
    verif.processedAt = timeStr;
    verif.processedBy = state.currentUser.name;
    if (bendaharaNote) verif.notes = `${verif.notes} | Catatan Bendahara: ${bendaharaNote}`;

    invoice.status = STATUS_TAGIHAN.LUNAS;
    invoice.paidAmount = verif.amount;
    invoice.paymentDate = timeStr;
    invoice.receiptNumber = receiptNumber;
    invoice.notes = `Disetujui oleh Bendahara (${state.currentUser.name}). Kwitansi: ${receiptNumber}`;

    appState.addAuditLog(
      'VERIFY_TRANSFER_APPROVE',
      `${verif.id} (${verif.studentName})`,
      `Bendahara menyetujui transfer manual Rp ${verif.amount.toLocaleString('id-ID')}. Kwitansi terbit: ${receiptNumber}.`
    );

    appState.notify();
    return { success: true, receiptNumber, invoice };
  }

  /**
   * Reject manual payment proof by Bendahara
   */
  static rejectManualPayment(verificationId, rejectReason) {
    const state = appState.getState();
    const verif = state.paymentVerifications.find(v => v.id === verificationId);
    if (!verif) return { success: false, message: 'Data verifikasi tidak ditemukan' };

    const invoice = state.invoices.find(i => i.id === verif.invoiceId);
    if (invoice) {
      invoice.status = STATUS_TAGIHAN.BELUM_BAYAR;
      invoice.notes = `Bukti transfer ditolak oleh Bendahara: ${rejectReason}`;
    }

    verif.status = 'REJECTED';
    verif.processedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    verif.processedBy = state.currentUser.name;
    verif.rejectionReason = rejectReason;

    appState.addAuditLog(
      'VERIFY_TRANSFER_REJECT',
      `${verif.id} (${verif.studentName})`,
      `Bendahara menolak bukti transfer. Alasan: "${rejectReason}".`
    );

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
      `Perubahan subsidi skema dari [${oldDesc}] menjadi [${newDesc}] oleh ${state.currentUser.name}.`
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
      `Penambahan skema beasiswa baru [${newScheme.name}] dengan potongan ${newScheme.discountType === 'PERCENT' ? newScheme.discountValue + '%' : 'Rp ' + newScheme.discountValue.toLocaleString('id-ID')} oleh ${state.currentUser.name}.`
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
      approvedBy: state.currentUser.name
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
}
