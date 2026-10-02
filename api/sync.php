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

            echo json_encode([
                'success' => true,
                'source' => 'cpanel_mysql',
                'state' => $stateData,
                'version' => $snapshot['state_version'],
                'synced_at' => $snapshot['created_at'],
                'counts' => [
                    'students' => (int)$countStudents,
                    'invoices' => (int)$countInvoices,
                    'transactions' => (int)$countTrans
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

        // 2. Sync students table
        if (!empty($state['students']) && is_array($state['students'])) {
            $studentStmt = $pdo->prepare("
                INSERT INTO students (nim, nama, prodi, angkatan, semester, jalur_beasiswa, status_akademik, email, phone, nik, pin)
                VALUES (:nim, :nama, :prodi, :angkatan, :semester, :jalur, :status, :email, :phone, :nik, :pin)
                ON DUPLICATE KEY UPDATE
                    nama = VALUES(nama),
                    prodi = VALUES(prodi),
                    angkatan = VALUES(angkatan),
                    semester = VALUES(semester),
                    jalur_beasiswa = VALUES(jalur_beasiswa),
                    status_akademik = VALUES(status_akademik),
                    email = VALUES(email),
                    phone = VALUES(phone),
                    nik = VALUES(nik),
                    pin = VALUES(pin)
            ");

            foreach ($state['students'] as $s) {
                if (empty($s['nim'])) continue;
                $studentStmt->execute([
                    ':nim' => $s['nim'],
                    ':nama' => $s['nama'] ?? 'Tanpa Nama',
                    ':prodi' => $s['prodi'] ?? 'BKPI',
                    ':angkatan' => $s['angkatan'] ?? '2026',
                    ':semester' => (int)($s['semester'] ?? 1),
                    ':jalur' => $s['jalurBeasiswa'] ?? 'REGULER',
                    ':status' => $s['statusAkademik'] ?? 'AKTIF',
                    ':email' => $s['email'] ?? null,
                    ':phone' => $s['phone'] ?? null,
                    ':nik' => $s['nik'] ?? null,
                    ':pin' => $s['pin'] ?? '123456'
                ]);
            }
        }

        // 3. Sync invoices table
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
                $invStmt->execute([
                    ':id' => $inv['id'],
                    ':nim' => $inv['studentNim'],
                    ':sem' => $inv['semester'] ?? '2026/2027 Ganjil',
                    ':gross' => (float)($inv['grossAmount'] ?? $inv['totalAmount'] ?? 0),
                    ':disc' => (float)($inv['discountAmount'] ?? 0),
                    ':total' => (float)($inv['totalAmount'] ?? 0),
                    ':paid' => (float)($inv['paidAmount'] ?? 0),
                    ':rem' => (float)($inv['remainingAmount'] ?? 0),
                    ':status' => $inv['status'] ?? 'BELUM_BAYAR',
                    ':due' => !empty($inv['dueDate']) ? date('Y-m-d', strtotime($inv['dueDate'])) : null,
                    ':comp' => !empty($inv['components']) ? json_encode($inv['components']) : null,
                    ':notes' => $inv['notes'] ?? null
                ]);
            }
        }

        // 4. Sync transactions table
        if (!empty($state['transactions']) && is_array($state['transactions'])) {
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
                    ':by' => $t['verifiedBy'] ?? null,
                    ':at' => !empty($t['verifiedAt']) ? date('Y-m-d H:i:s', strtotime($t['verifiedAt'])) : null,
                    ':notes' => $t['notes'] ?? null
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
                'transactions' => count($state['transactions'] ?? [])
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
