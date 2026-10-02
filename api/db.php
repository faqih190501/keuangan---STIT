<?php
/**
 * SIMPEL-IF PDO MySQL Database Connection & Auto-Migration
 * STIT Ihsanul Fikri
 */

require_once __DIR__ . '/config.php';

function getDbConnection($customConfig = null) {
    $config = $customConfig ?: getDatabaseConfig();

    if (empty($config['name'])) {
        return [
            'status' => false,
            'pdo' => null,
            'error' => 'Nama database cPanel belum dikonfigurasi.'
        ];
    }

    $host = $config['host'] ?? 'localhost';
    $port = $config['port'] ?? 3306;
    $dbname = $config['name'];
    $user = $config['user'] ?? '';
    $pass = $config['pass'] ?? '';

    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        return [
            'status' => true,
            'pdo' => $pdo,
            'error' => null
        ];
    } catch (PDOException $e) {
        return [
            'status' => false,
            'pdo' => null,
            'error' => 'Koneksi gagal: ' . $e->getMessage()
        ];
    }
}

/**
 * Otomatis membuat tabel-tabel penting jika belum ada di database cPanel
 */
function autoMigrateTables($pdo) {
    $queries = [
        "CREATE TABLE IF NOT EXISTS `students` (
            `nim` VARCHAR(30) NOT NULL,
            `nama` VARCHAR(150) NOT NULL,
            `prodi` VARCHAR(30) NOT NULL,
            `angkatan` VARCHAR(10) NOT NULL,
            `semester` INT(11) NOT NULL DEFAULT 1,
            `jalur_beasiswa` VARCHAR(50) NOT NULL DEFAULT 'REGULER',
            `status_akademik` VARCHAR(30) NOT NULL DEFAULT 'AKTIF',
            `jenis_kelamin` ENUM('L', 'P') NOT NULL DEFAULT 'L',
            `email` VARCHAR(100) DEFAULT NULL,
            `phone` VARCHAR(25) DEFAULT NULL,
            `nik` VARCHAR(30) DEFAULT NULL,
            `tempat_lahir` VARCHAR(80) DEFAULT NULL,
            `tanggal_lahir` DATE DEFAULT NULL,
            `alamat` TEXT DEFAULT NULL,
            `nama_wali` VARCHAR(120) DEFAULT NULL,
            `phone_wali` VARCHAR(25) DEFAULT NULL,
            `pin` VARCHAR(10) NOT NULL DEFAULT '123456',
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`nim`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `invoices` (
            `id` VARCHAR(50) NOT NULL,
            `student_nim` VARCHAR(30) NOT NULL,
            `semester` VARCHAR(30) NOT NULL,
            `gross_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            `discount_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            `total_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            `paid_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            `remaining_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
            `status` VARCHAR(30) NOT NULL DEFAULT 'BELUM_BAYAR',
            `due_date` DATE DEFAULT NULL,
            `components_json` LONGTEXT DEFAULT NULL,
            `scholarship_info_json` TEXT DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `transactions` (
            `id` VARCHAR(50) NOT NULL,
            `invoice_id` VARCHAR(50) NOT NULL,
            `student_nim` VARCHAR(30) NOT NULL,
            `amount` DECIMAL(14,2) NOT NULL,
            `payment_method` VARCHAR(30) NOT NULL DEFAULT 'QRIS',
            `va_number` VARCHAR(50) DEFAULT NULL,
            `bank_name` VARCHAR(50) DEFAULT 'BSI',
            `status` VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
            `proof_image` LONGTEXT DEFAULT NULL,
            `verified_by` VARCHAR(100) DEFAULT NULL,
            `verified_at` DATETIME DEFAULT NULL,
            `notes` TEXT DEFAULT NULL,
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `audit_logs` (
            `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `user` VARCHAR(100) NOT NULL,
            `role` VARCHAR(30) NOT NULL,
            `action` VARCHAR(60) NOT NULL,
            `details` TEXT DEFAULT NULL,
            `ip_address` VARCHAR(45) DEFAULT NULL,
            `user_agent` VARCHAR(255) DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `system_settings` (
            `setting_key` VARCHAR(80) NOT NULL,
            `setting_value` LONGTEXT NOT NULL,
            `description` VARCHAR(255) DEFAULT NULL,
            `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`setting_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        "CREATE TABLE IF NOT EXISTS `app_state_snapshots` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `state_version` VARCHAR(50) NOT NULL,
            `snapshot_json` LONGTEXT NOT NULL,
            `created_by` VARCHAR(100) DEFAULT 'SYSTEM',
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    foreach ($queries as $sql) {
        $pdo->exec($sql);
    }
}
