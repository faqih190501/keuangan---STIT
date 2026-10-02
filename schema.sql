-- ==============================================================================
-- SIMPEL-IF STIT Ihsanul Fikri Magelang
-- Database Schema for cPanel MySQL / MariaDB
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

-- ------------------------------------------------------------------------------
-- 1. Table: students (Data Induk Mahasiswa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `nim` VARCHAR(30) NOT NULL,
  `nama` VARCHAR(150) NOT NULL,
  `prodi` ENUM('BKPI', 'PIAUD') NOT NULL,
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
  PRIMARY KEY (`nim`),
  INDEX `idx_prodi_angkatan` (`prodi`, `angkatan`),
  INDEX `idx_jalur_beasiswa` (`jalur_beasiswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: invoices (Data Tagihan Kuliah & Beasiswa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) NOT NULL,
  `student_nim` VARCHAR(30) NOT NULL,
  `semester` VARCHAR(30) NOT NULL,
  `gross_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('BELUM_BAYAR', 'SEBAGIAN', 'LUNAS', 'EXPIRED') NOT NULL DEFAULT 'BELUM_BAYAR',
  `due_date` DATE DEFAULT NULL,
  `components_json` LONGTEXT DEFAULT NULL,
  `scholarship_info_json` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_invoice_student` (`student_nim`),
  INDEX `idx_invoice_semester` (`semester`),
  INDEX `idx_invoice_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: transactions (Histori Transaksi Pembayaran & Verifikasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) NOT NULL,
  `invoice_id` VARCHAR(50) NOT NULL,
  `student_nim` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(14,2) NOT NULL,
  `payment_method` VARCHAR(30) NOT NULL DEFAULT 'QRIS',
  `va_number` VARCHAR(50) DEFAULT NULL,
  `bank_name` VARCHAR(50) DEFAULT 'BSI',
  `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'VERIFIED',
  `proof_image` LONGTEXT DEFAULT NULL,
  `verified_by` VARCHAR(100) DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_trans_invoice` (`invoice_id`),
  INDEX `idx_trans_student` (`student_nim`),
  INDEX `idx_trans_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: audit_logs (Rekam Jejak Keamanan & Finansial)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` VARCHAR(100) NOT NULL,
  `role` VARCHAR(30) NOT NULL,
  `action` VARCHAR(60) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: admin_users (Data Pengelola Keuangan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(30) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `role` VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(25) DEFAULT NULL,
  `title` VARCHAR(100) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'AKTIF',
  `is_super_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: system_settings (Konfigurasi Tarif, Beasiswa, & Semester)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: app_state_snapshots (Backup Penuh JSON State SIMPEL-IF)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_state_snapshots` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `state_version` VARCHAR(50) NOT NULL,
  `snapshot_json` LONGTEXT NOT NULL,
  `created_by` VARCHAR(100) DEFAULT 'SYSTEM',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_snapshot_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
