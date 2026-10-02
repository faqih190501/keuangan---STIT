<?php
/**
 * SIMPEL-IF cPanel Database Configuration Bridge
 * STIT Ihsanul Fikri
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('CONFIG_FILE', __DIR__ . '/db-config.json');

function getDatabaseConfig() {
    // 1. Check if db-config.json exists
    if (file_exists(CONFIG_FILE)) {
        $content = file_get_contents(CONFIG_FILE);
        $data = json_decode($content, true);
        if (is_array($data) && !empty($data['db_name'])) {
            return [
                'host' => $data['host'] ?? 'localhost',
                'port' => $data['port'] ?? 3306,
                'name' => $data['db_name'],
                'user' => $data['db_user'] ?? '',
                'pass' => $data['db_pass'] ?? '',
                'configured' => true
            ];
        }
    }

    // 2. Check environment variables (e.g. from .htaccess or cPanel env)
    $envHost = getenv('CPANEL_DB_HOST') ?: getenv('DB_HOST');
    $envName = getenv('CPANEL_DB_NAME') ?: getenv('DB_NAME');
    $envUser = getenv('CPANEL_DB_USER') ?: getenv('DB_USER');
    $envPass = getenv('CPANEL_DB_PASS') ?: getenv('DB_PASS');

    if ($envName) {
        return [
            'host' => $envHost ?: 'localhost',
            'port' => 3306,
            'name' => $envName,
            'user' => $envUser ?: '',
            'pass' => $envPass ?: '',
            'configured' => true
        ];
    }

    // Default unconfigured placeholder
    return [
        'host' => 'localhost',
        'port' => 3306,
        'name' => '',
        'user' => '',
        'pass' => '',
        'configured' => false
    ];
}

// Handle POST to save configuration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && basename($_SERVER['SCRIPT_FILENAME']) === 'config.php') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!$input || empty($input['db_name']) || empty($input['db_user'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Parameter db_name dan db_user wajib diisi.'
        ]);
        exit;
    }

    $configData = [
        'host' => !empty($input['host']) ? trim($input['host']) : 'localhost',
        'port' => !empty($input['port']) ? (int)$input['port'] : 3306,
        'db_name' => trim($input['db_name']),
        'db_user' => trim($input['db_user']),
        'db_pass' => isset($input['db_pass']) ? (string)$input['db_pass'] : '',
        'updated_at' => date('Y-m-d H:i:s')
    ];

    $saved = @file_put_contents(CONFIG_FILE, json_encode($configData, JSON_PRETTY_PRINT));
    if ($saved === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Gagal menyimpan konfigurasi ke db-config.json. Pastikan folder api/ memiliki izin tulis (chmod 755).'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Konfigurasi database cPanel berhasil disimpan.',
        'config' => [
            'host' => $configData['host'],
            'port' => $configData['port'],
            'db_name' => $configData['db_name'],
            'db_user' => $configData['db_user']
        ]
    ]);
    exit;
}

// Handle GET to check status
if ($_SERVER['REQUEST_METHOD'] === 'GET' && basename($_SERVER['SCRIPT_FILENAME']) === 'config.php') {
    $conf = getDatabaseConfig();
    echo json_encode([
        'success' => true,
        'configured' => $conf['configured'],
        'host' => $conf['host'],
        'port' => $conf['port'],
        'db_name' => $conf['name'],
        'db_user' => $conf['user']
    ]);
    exit;
}
