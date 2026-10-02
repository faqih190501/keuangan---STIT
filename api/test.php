<?php
/**
 * SIMPEL-IF Database Connection Test Endpoint
 * STIT Ihsanul Fikri
 */

require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$customConfig = null;

if (!empty($rawInput)) {
    $input = json_decode($rawInput, true);
    if (is_array($input) && !empty($input['db_name'])) {
        $customConfig = [
            'host' => !empty($input['host']) ? trim($input['host']) : 'localhost',
            'port' => !empty($input['port']) ? (int)$input['port'] : 3306,
            'name' => trim($input['db_name']),
            'user' => trim($input['db_user'] ?? ''),
            'pass' => (string)($input['db_pass'] ?? '')
        ];
    }
}

$startTime = microtime(true);
$conn = getDbConnection($customConfig);
$elapsedMs = round((microtime(true) - $startTime) * 1000, 2);

if (!$conn['status']) {
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'connected' => false,
        'message' => $conn['error'],
        'latency_ms' => $elapsedMs
    ]);
    exit;
}

$pdo = $conn['pdo'];

// Auto migrate if needed
$autoMigrate = isset($_GET['migrate']) || (isset($input['migrate']) && $input['migrate'] === true);
if ($autoMigrate) {
    try {
        autoMigrateTables($pdo);
    } catch (Exception $e) {
        // Log migration error
    }
}

// Fetch list of tables in database
try {
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    $versionStmt = $pdo->query("SELECT VERSION()");
    $serverVersion = $versionStmt->fetchColumn();

    $studentCount = 0;
    if (in_array('students', $tables)) {
        $countStmt = $pdo->query("SELECT COUNT(*) FROM students");
        $studentCount = (int)$countStmt->fetchColumn();
    }

    echo json_encode([
        'success' => true,
        'connected' => true,
        'message' => 'Berhasil terhubung ke database cPanel MySQL!',
        'database' => $customConfig['name'] ?? getDatabaseConfig()['name'],
        'server_version' => $serverVersion,
        'tables' => $tables,
        'table_count' => count($tables),
        'student_count' => $studentCount,
        'latency_ms' => $elapsedMs
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => true,
        'connected' => true,
        'message' => 'Terhubung ke database, namun terjadi kendala pembacaan tabel: ' . $e->getMessage(),
        'latency_ms' => $elapsedMs
    ]);
}
