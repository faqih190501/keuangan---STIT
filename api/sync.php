<?php
/**
 * SIMPEL-IF State Synchronization with cPanel MySQL
 * STIT Ihsanul Fikri
 */

require_once __DIR__ . '/db.php';

$conn = getDbConnection();
if (!$conn['status']) {
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'connected' => false,
        'message' => $conn['error']
    ]);
    exit;
}

$pdo = $conn['pdo'];

// Auto-migrate tables to ensure they exist
try {
    autoMigrateTables($pdo);
} catch (Exception $e) {
    // Ignore if already migrated
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Pull latest state from MySQL
if ($method === 'GET') {
    try {
        // First check if we have a state snapshot
        $stmt = $pdo->query("SELECT snapshot_json, state_version, created_at FROM app_state_snapshots ORDER BY id DESC LIMIT 1");
        $snapshot = $stmt->fetch();

        if ($snapshot && !empty($snapshot['snapshot_json'])) {
            $stateData = json_decode($snapshot['snapshot_json'], true);

            // Also count relational records
            $countStudents = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
            $countInvoices = $pdo->query("SELECT COUNT(*) FROM invoices")->fetchColumn();
            $countTrans = $pdo->query("SELECT COUNT(*) FROM transactions")->fetchColumn();
            $countVerif = 0;
            try {
                $countVerif = $pdo->query("SELECT COUNT(*) FROM payment_verifications")->fetchColumn();
            } catch (Exception $e) {}

            echo json_encode([
                'success' => true,
                'source' => 'cpanel_mysql',
                'state' => $stateData,
                'version' => $snapshot['state_version'],
                'synced_at' => $snapshot['created_at'],
                'counts' => [
                    'students' => (int)$countStudents,
                    'invoices' => (int)$countInvoices,
                    'transactions' => (int)$countTrans,
                    'verifications' => (int)$countVerif
                ]
            ]);
            exit;
        }

        // If no snapshot yet, return empty but connected
        echo json_encode([
            'success' => true,
            'source' => 'cpanel_mysql_empty',
            'state' => null,
            'message' => 'Database terhubung namun belum ada data tersimpan di cPanel.'
        ]);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Gagal membaca data dari database: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 2. POST: Push local state into MySQL
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input || empty($input['state'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payload state tidak valid atau kosong.'
        ]);
        exit;
    }

    $state = $input['state'];
    $version = $input['version'] ?? 'SIMPEL_IF_STATE_V10_SINGLE_ADMIN';
    $user = $input['user'] ?? 'ADMIN';

    try {
        $pdo->beginTransaction();

        // 1. Save full state snapshot
        $snapStmt = $pdo->prepare("INSERT INTO app_state_snapshots (state_version, snapshot_json, created_by, created_at) VALUES (?, ?, ?, NOW())");
        $snapStmt->execute([$version, json_encode($state, JSON_UNESCAPED_UNICODE), $user]);

        // Keep only latest 10 snapshots to prevent database bloat
        $pdo->exec("DELETE FROM app_state_snapshots WHERE id NOT IN (SELECT id FROM (SELECT id FROM app_state_snapshots ORDER BY id DESC LIMIT 10) as t)");

        // 2. Sync students table (Support both camelCase and snake_case properties)
        if (!empty($state['students']) && is_array($state['students'])) {
            $studentStmt = $pdo->prepare("
                INSERT INTO students (nim, nama, prodi, angkatan, semester, jalur_beasiswa, status_akademik, jenis_kelamin, email, phone, nik, pin)
                VALUES (:nim, :nama, :prodi, :angkatan, :semester, :jalur, :status, :gender, :email, :phone, :nik, :pin)
                ON DUPLICATE KEY UPDATE
                    nama = VALUES(nama),
                    prodi = VALUES(prodi),
                    angkatan = VALUES(angkatan),
                    semester = VALUES(semester),
                    jalur_beasiswa = VALUES(jalur_beasiswa),
                    status_akademik = VALUES(status_akademik),
                    jenis_kelamin = VALUES(jenis_kelamin),
                    email = VALUES(email),
                    phone = VALUES(phone),
                    nik = VALUES(nik),
                    pin = VALUES(pin)
            ");

            foreach ($state['students'] as $s) {
                if (empty($s['nim'])) continue;
                $rawGender = strtoupper($s['gender'] ?? $s['jenis_kelamin'] ?? 'L');
                $gender = in_array($rawGender, ['L', 'P']) ? $rawGender : 'L';
                $studentStmt->execute([
                    ':nim' => (string)$s['nim'],
                    ':nama' => $s['name'] ?? $s['nama'] ?? 'Tanpa Nama',
                    ':prodi' => $s['prodi'] ?? 'BKPI',
                    ':angkatan' => (string)($s['classYear'] ?? $s['angkatan'] ?? '2026'),
                    ':semester' => (int)($s['semester'] ?? 1),
                    ':jalur' => $s['scholarshipId'] ?? $s['jalurBeasiswa'] ?? $s['jalur_beasiswa'] ?? $s['jalurOriginal'] ?? 'REGULER',
                    ':status' => $s['statusAkademik'] ?? $s['status'] ?? $s['status_akademik'] ?? 'AKTIF',
                    ':gender' => $gender,
                    ':email' => $s['email'] ?? null,
                    ':phone' => $s['phone'] ?? $s['noHp'] ?? $s['no_hp'] ?? null,
                    ':nik' => $s['nik'] ?? null,
                    ':pin' => $s['pin'] ?? $s['password'] ?? '123456'
                ]);
            }
        }

        // 3. Sync invoices table (Support netAmount, grossAmount, discounts)
        if (!empty($state['invoices']) && is_array($state['invoices'])) {
            $invStmt = $pdo->prepare("
                INSERT INTO invoices (id, student_nim, semester, gross_amount, discount_amount, total_amount, paid_amount, remaining_amount, status, due_date, components_json, notes)
                VALUES (:id, :nim, :sem, :gross, :disc, :total, :paid, :rem, :status, :due, :comp, :notes)
                ON DUPLICATE KEY UPDATE
                    gross_amount = VALUES(gross_amount),
                    discount_amount = VALUES(discount_amount),
                    total_amount = VALUES(total_amount),
                    paid_amount = VALUES(paid_amount),
                    remaining_amount = VALUES(remaining_amount),
                    status = VALUES(status),
                    due_date = VALUES(due_date),
                    components_json = VALUES(components_json),
                    notes = VALUES(notes)
            ");

            foreach ($state['invoices'] as $inv) {
                if (empty($inv['id']) || empty($inv['studentNim'])) continue;
                $totalAmt = (float)($inv['netAmount'] ?? $inv['totalAmount'] ?? $inv['total_amount'] ?? 0);
                $grossAmt = (float)($inv['grossAmount'] ?? $inv['baseAmount'] ?? $totalAmt);
                $discAmt = (float)($inv['totalDiscount'] ?? $inv['discountAmount'] ?? $inv['discount_amount'] ?? max(0, $grossAmt - $totalAmt));
                $paidAmt = (float)($inv['paidAmount'] ?? $inv['paid_amount'] ?? 0);
                $remAmt = (float)($inv['remainingAmount'] ?? max(0, $totalAmt - $paidAmt));

                $invStmt->execute([
                    ':id' => $inv['id'],
                    ':nim' => $inv['studentNim'],
                    ':sem' => $inv['semester'] ?? '2026/2027 Ganjil',
                    ':gross' => $grossAmt,
                    ':disc' => $discAmt,
                    ':total' => $totalAmt,
                    ':paid' => $paidAmt,
                    ':rem' => $remAmt,
                    ':status' => $inv['status'] ?? 'BELUM_BAYAR',
                    ':due' => !empty($inv['dueDate']) ? date('Y-m-d', strtotime($inv['dueDate'])) : null,
                    ':comp' => !empty($inv['items']) ? json_encode($inv['items']) : (!empty($inv['components']) ? json_encode($inv['components']) : null),
                    ':notes' => $inv['notes'] ?? null
                ]);
            }
        }

        // 4. Sync transactions table (From state.transactions and paid invoices)
        $transStmt = $pdo->prepare("
            INSERT INTO transactions (id, invoice_id, student_nim, amount, payment_method, va_number, bank_name, status, verified_by, verified_at, notes)
            VALUES (:id, :inv_id, :nim, :amt, :method, :va, :bank, :status, :by, :at, :notes)
            ON DUPLICATE KEY UPDATE
                amount = VALUES(amount),
                status = VALUES(status),
                verified_by = VALUES(verified_by),
                verified_at = VALUES(verified_at),
                notes = VALUES(notes)
        ");

        $recordedTrans = [];

        // 4a. Explicit transactions array
        if (!empty($state['transactions']) && is_array($state['transactions'])) {
            foreach ($state['transactions'] as $t) {
                if (empty($t['id']) || empty($t['studentNim'])) continue;
                $transStmt->execute([
                    ':id' => $t['id'],
                    ':inv_id' => $t['invoiceId'] ?? '',
                    ':nim' => $t['studentNim'],
                    ':amt' => (float)($t['amount'] ?? 0),
                    ':method' => $t['paymentMethod'] ?? 'QRIS',
                    ':va' => $t['vaNumber'] ?? null,
                    ':bank' => $t['bankName'] ?? 'BSI',
                    ':status' => $t['status'] ?? 'VERIFIED',
                    ':by' => $t['verifiedBy'] ?? 'SISTEM_OTOMATIS',
                    ':at' => !empty($t['verifiedAt']) ? date('Y-m-d H:i:s', strtotime($t['verifiedAt'])) : (!empty($t['createdAt']) ? date('Y-m-d H:i:s', strtotime($t['createdAt'])) : date('Y-m-d H:i:s')),
                    ':notes' => $t['notes'] ?? null
                ]);
                $recordedTrans[$t['id']] = true;
            }
        }

        // 4b. Auto-derive transactions from paid invoices if not already present
        if (!empty($state['invoices']) && is_array($state['invoices'])) {
            foreach ($state['invoices'] as $inv) {
                if (empty($inv['id']) || empty($inv['studentNim'])) continue;
                $paid = (float)($inv['paidAmount'] ?? 0);
                if ($paid > 0 || !empty($inv['receiptNumber'])) {
                    $trxId = !empty($inv['receiptNumber'])
                        ? ('TRX-' . preg_replace('/[^a-zA-Z0-9]/', '', $inv['receiptNumber']))
                        : ('TRX-' . $inv['id']);
                    
                    if (!isset($recordedTrans[$trxId])) {
                        $transStmt->execute([
                            ':id' => $trxId,
                            ':inv_id' => $inv['id'],
                            ':nim' => $inv['studentNim'],
                            ':amt' => $paid,
                            ':method' => $inv['paymentMethod'] ?? 'QRIS',
                            ':va' => $inv['virtualAccount'] ?? null,
                            ':bank' => 'Bank Syariah Indonesia (BSI)',
                            ':status' => 'VERIFIED',
                            ':by' => 'SISTEM_OTOMATIS',
                            ':at' => !empty($inv['paymentDate']) ? date('Y-m-d H:i:s', strtotime($inv['paymentDate'])) : date('Y-m-d H:i:s'),
                            ':notes' => $inv['notes'] ?? ('Pelunasan ' . $inv['id'])
                        ]);
                        $recordedTrans[$trxId] = true;
                    }
                }
            }
        }

        // 5. Sync payment verifications table
        if (!empty($state['paymentVerifications']) && is_array($state['paymentVerifications'])) {
            $verifStmt = $pdo->prepare("
                INSERT INTO payment_verifications (id, invoice_id, student_nim, student_name, prodi, amount, transfer_date, sender_bank, sender_account_name, sender_account_number, destination_bank, proof_image, status, notes, submitted_at, verified_at, verified_by)
                VALUES (:id, :inv_id, :nim, :name, :prodi, :amt, :tdate, :sbank, :sacc_name, :sacc_no, :dbank, :proof, :status, :notes, :sub_at, :ver_at, :ver_by)
                ON DUPLICATE KEY UPDATE
                    amount = VALUES(amount),
                    status = VALUES(status),
                    notes = VALUES(notes),
                    verified_at = VALUES(verified_at),
                    verified_by = VALUES(verified_by)
            ");

            foreach ($state['paymentVerifications'] as $v) {
                if (empty($v['id']) || empty($v['studentNim'])) continue;
                $verifStmt->execute([
                    ':id' => $v['id'],
                    ':inv_id' => $v['invoiceId'] ?? null,
                    ':nim' => $v['studentNim'],
                    ':name' => $v['studentName'] ?? null,
                    ':prodi' => $v['prodi'] ?? null,
                    ':amt' => (float)($v['amount'] ?? 0),
                    ':tdate' => $v['transferDate'] ?? null,
                    ':sbank' => $v['senderBank'] ?? 'Bank BSI',
                    ':sacc_name' => $v['senderAccountName'] ?? null,
                    ':sacc_no' => $v['senderAccountNumber'] ?? null,
                    ':dbank' => $v['destinationBank'] ?? 'Bank BSI - STIT Ihsanul Fikri',
                    ':proof' => !empty($v['proofImage']) ? (strlen($v['proofImage']) > 1000 ? substr($v['proofImage'], 0, 500) . '...[COMPRESSED_DATA]' : $v['proofImage']) : null,
                    ':status' => $v['status'] ?? 'PENDING',
                    ':notes' => $v['notes'] ?? null,
                    ':sub_at' => !empty($v['submittedAt']) ? date('Y-m-d H:i:s', strtotime($v['submittedAt'])) : date('Y-m-d H:i:s'),
                    ':ver_at' => !empty($v['verifiedAt']) ? date('Y-m-d H:i:s', strtotime($v['verifiedAt'])) : null,
                    ':ver_by' => $v['verifiedBy'] ?? null
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Data SIMPEL-IF berhasil disinkronkan ke database cPanel MySQL.',
            'timestamp' => date('Y-m-d H:i:s'),
            'synced' => [
                'students' => count($state['students'] ?? []),
                'invoices' => count($state['invoices'] ?? []),
                'transactions' => count($recordedTrans),
                'verifications' => count($state['paymentVerifications'] ?? [])
            ]
        ]);
        exit;

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Gagal menyimpan ke database MySQL: ' . $e->getMessage()
        ]);
        exit;
    }
}
