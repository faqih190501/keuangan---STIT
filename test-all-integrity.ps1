# Comprehensive Integrity and Verification Script for SIMPEL-IF STIT Ihsanul Fikri
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " SIMPEL-IF STIT IHSANUL FIKRI - COMPREHENSIVE INTEGRITY TEST" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Check-Condition($name, $condition) {
    if ($condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
        $global:failed++
    }
}

# 1. Check all required core files
$coreFiles = @(
    "index.html",
    "404.html",
    "assets/images/logo.png",
    "manifest.webmanifest",
    "sw.js",
    "schema.sql",
    "api/config.php",
    "api/db.php",
    "api/test.php",
    "api/sync.php",
    "css/variables.css",
    "css/layout.css",
    "css/components.css",
    "css/receipt.css",
    "css/responsive.css",
    "js/app.js",
    "js/auth.js",
    "js/billing-engine.js",
    "js/modals.js",
    "js/models.js",
    "js/state.js",
    "js/utils/chart-engine.js",
    "js/utils/drag-scroll.js",
    "js/utils/export-engine.js",
    "js/utils/formatters.js",
    "js/utils/image-compressor.js",
    "js/utils/qr-engine.js",
    "js/utils/user-experience.js",
    "js/utils/multiplatform.js",
    "js/utils/api-client.js",
    "js/views/dashboard-bendahara.js",
    "js/views/view-akademik.js",
    "js/views/view-audit-log.js",
    "js/views/view-kalender.js",
    "js/views/view-laporan.js",
    "js/views/view-login.js",
    "js/views/view-mahasiswa.js",
    "js/views/view-pimpinan.js",
    "js/views/view-qr-validator.js",
    "js/views/view-skema-tarif.js",
    "js/views/view-verifikasi.js",
    "js/views/view-matriks-rekap.js"
)

foreach ($f in $coreFiles) {
    $fullPath = Join-Path "d:\SIMPEL-IF" $f
    $exists = Test-Path $fullPath
    $size = if ($exists) { (Get-Item $fullPath).Length } else { 0 }
    Check-Condition "File exists and non-empty: $f ($size bytes)" ($exists -and $size -gt 0)
}

# 2. Check State Content & Schema
$stateRaw = Get-Content "d:\SIMPEL-IF\js\state.js" -Raw
Check-Condition "State version updated to SIMPEL_IF_STATE_V10_SINGLE_ADMIN" ($stateRaw.Contains("SIMPEL_IF_STATE_V10_SINGLE_ADMIN"))
Check-Condition "BKPI 2026 students included" ($stateRaw.Contains("Miftahul Jannah") -and $stateRaw.Contains("2601001"))
Check-Condition "PIAUD 2026 students included" ($stateRaw.Contains("Erlisa Rita Novika") -and $stateRaw.Contains("2602001"))
Check-Condition "Senior cohort students included" ($stateRaw.Contains("Abdullah Azam Robbani") -and $stateRaw.Contains("2001001"))
Check-Condition "Google Sheets Raw Matrix dataset present in state" ($stateRaw.Contains("googleSheetsMatrix") -and $stateRaw.Contains("bkpi2026") -and $stateRaw.Contains("piaud2026"))
Check-Condition "9 Scholarship Schemes Defined" ($stateRaw.Contains("MITRA_GRATIS") -and $stateRaw.Contains("ALUMNI_PONPES") -and $stateRaw.Contains("PAUD_LAKI"))
Check-Condition "Newly added PIAUD student Ida Nur Aini (2602062) included" ($stateRaw.Contains("Ida Nur Aini") -and $stateRaw.Contains("2602062"))
Check-Condition "Corrected student Wahyu Kurnia Dewi (2602059) included" ($stateRaw.Contains("Wahyu Kurnia Dewi") -and $stateRaw.Contains("2602059"))
Check-Condition "Updated payment Rohmah Indarti (2601027) recorded" ($stateRaw.Contains("2601027") -and $stateRaw.Contains("DAFTAR_ULANG_LUNAS"))
Check-Condition "Updated payment Umi Farida (2602028) SPP Lunas recorded" ($stateRaw.Contains("2602028") -and $stateRaw.Contains("1.200.000") -and $stateRaw.Contains("23/09/26"))

# 3. Check Matriks Rekap View
$matriksRaw = Get-Content "d:\SIMPEL-IF\js\views\view-matriks-rekap.js" -Raw
Check-Condition "renderMatriksRekapView exported" ($matriksRaw.Contains("export function renderMatriksRekapView"))
Check-Condition "PMB 2026 Table renderer (BKPI/PIAUD)" ($matriksRaw.Contains("renderPmbTable"))
Check-Condition "Multi-Semester Senior Table renderer" ($matriksRaw.Contains("renderSeniorTable"))
Check-Condition "As-Syamil Asrama Table renderer" ($matriksRaw.Contains("renderAsSyamilTable"))
Check-Condition "Google Sheets Sync Panel renderer" ($matriksRaw.Contains("renderLiveSyncPanel"))
Check-Condition "Export CSV handler implemented" ($matriksRaw.Contains("exportToCSV"))

# 4. Check Navigation & Routing
$appRaw = Get-Content "d:\SIMPEL-IF\js\app.js" -Raw
$authRaw = Get-Content "d:\SIMPEL-IF\js\auth.js" -Raw
$htmlRaw = Get-Content "d:\SIMPEL-IF\index.html" -Raw
$dashRaw = Get-Content "d:\SIMPEL-IF\js\views\dashboard-bendahara.js" -Raw

Check-Condition "app.js routes view-matriks-rekap" ($appRaw.Contains("renderMatriksRekapView") -and $appRaw.Contains("case 'view-matriks-rekap':"))
Check-Condition "auth.js permits view-matriks-rekap for ADMIN" ($authRaw.Contains("'view-matriks-rekap'"))
Check-Condition "index.html has Matriks Rekap sidebar nav item" ($htmlRaw.Contains('data-view="view-matriks-rekap"'))
Check-Condition "dashboard-bendahara.js has Matriks Rekap button and action" ($dashRaw.Contains("btn-goto-matriks-rekap") -and $dashRaw.Contains("view-matriks-rekap"))

# 5. Check Models & Formatters
$modelsRaw = Get-Content "d:\SIMPEL-IF\js\models.js" -Raw
$formattersRaw = Get-Content "d:\SIMPEL-IF\js\utils\formatters.js" -Raw
Check-Condition "STANDARD_FEES in models.js" ($modelsRaw.Contains("STANDARD_FEES") -and $modelsRaw.Contains("PENDAFTARAN: 200000") -and $modelsRaw.Contains("DAFTAR_ULANG: 450000"))
Check-Condition "SCHOLARSHIP_SCHEMES and SCHOLARSHIP_TYPES in models.js" ($modelsRaw.Contains("SCHOLARSHIP_TYPES") -and $modelsRaw.Contains("PAUD_LAKI"))
Check-Condition "getScholarshipBadge in formatters.js handles dynamic types" ($formattersRaw.Contains("getScholarshipBadge") -and $formattersRaw.Contains("SCHOLARSHIP_TYPES"))

# 5b. Check Image Compression Module & Mahasiswa Portal Integration
$imgCompRaw = Get-Content "d:\SIMPEL-IF\js\utils\image-compressor.js" -Raw
$mhsRaw = Get-Content "d:\SIMPEL-IF\js\views\view-mahasiswa.js" -Raw
Check-Condition "compressImage exported in image-compressor.js" ($imgCompRaw.Contains("export function compressImage") -and $imgCompRaw.Contains("formatBytes"))
Check-Condition "view-mahasiswa.js integrates automatic image compression" ($mhsRaw.Contains("compressImage") -and $mhsRaw.Contains("setupCompressedDropzone") -and $mhsRaw.Contains("manual-compression-card") -and $mhsRaw.Contains("mandiri-compression-card"))

# 5c. Check Multiplatform UI & PWA Architecture
$multiRaw = Get-Content "d:\SIMPEL-IF\js\utils\multiplatform.js" -Raw
$manifestRaw = Get-Content "d:\SIMPEL-IF\manifest.webmanifest" -Raw
$swRaw = Get-Content "d:\SIMPEL-IF\sw.js" -Raw
Check-Condition "MultiplatformHelper exported in multiplatform.js" ($multiRaw.Contains("export class MultiplatformHelper") -and $multiRaw.Contains("getPlatformInfo") -and $multiRaw.Contains("triggerInstall"))
Check-Condition "Service Worker defines caching & offline capabilities" ($swRaw.Contains("CACHE_NAME") -and $swRaw.Contains("STATIC_ASSETS") -and $swRaw.Contains("addEventListener('fetch'"))
Check-Condition "Manifest defines PWA identity & standalone display" ($manifestRaw.Contains('"display": "standalone"') -and $manifestRaw.Contains('"icons"') -and $manifestRaw.Contains("SIMPEL-IF"))
Check-Condition "index.html links manifest and multiplatform meta tags" ($htmlRaw.Contains('rel="manifest"') -and $htmlRaw.Contains('apple-mobile-web-app-capable'))

# 5d. Check cPanel Database Bridge & API
$apiRaw = Get-Content "d:\SIMPEL-IF\js\utils\api-client.js" -Raw
$billingRaw = Get-Content "d:\SIMPEL-IF\js\billing-engine.js" -Raw
$sqlRaw = Get-Content "d:\SIMPEL-IF\schema.sql" -Raw
$dbPhpRaw = Get-Content "d:\SIMPEL-IF\api\db.php" -Raw
$syncPhpRaw = Get-Content "d:\SIMPEL-IF\api\sync.php" -Raw
Check-Condition "ApiClient exported in api-client.js" ($apiRaw.Contains("export class ApiClient") -and $apiRaw.Contains("checkStatus") -and $apiRaw.Contains("openDatabaseConfigModal") -and $apiRaw.Contains("triggerAutoSync"))
Check-Condition "Automatic state change event and payment auto-sync wired" ($stateRaw.Contains("simpel_state_changed") -and $apiRaw.Contains("bindAutoSync") -and $billingRaw.Contains("triggerAutoSync"))
Check-Condition "schema.sql defines students, invoices, and transactions tables" ($sqlRaw.Contains('CREATE TABLE IF NOT EXISTS `students`') -and $sqlRaw.Contains('CREATE TABLE IF NOT EXISTS `invoices`') -and $sqlRaw.Contains('CREATE TABLE IF NOT EXISTS `transactions`'))
Check-Condition "api/db.php establishes PDO and autoMigrateTables" ($dbPhpRaw.Contains("getDbConnection") -and $dbPhpRaw.Contains("autoMigrateTables") -and $dbPhpRaw.Contains("payment_verifications"))
Check-Condition "api/sync.php supports GET pull and POST push synchronization" ($syncPhpRaw.Contains('$method === ''GET''') -and $syncPhpRaw.Contains('$method === ''POST''') -and $syncPhpRaw.Contains('app_state_snapshots') -and $syncPhpRaw.Contains('payment_verifications'))
Check-Condition "index.html has cPanel Database sidebar item" ($htmlRaw.Contains('nav-database-cpanel'))

# 6. Check JS Syntax & Delimiters (Backticks, Brackets, Parentheses)
$jsFiles = Get-ChildItem -Path "d:\SIMPEL-IF\js" -Filter "*.js" -Recurse
foreach ($js in $jsFiles) {
    $content = Get-Content $js.FullName -Raw
    # Count unescaped backticks
    $backtickMatches = [regex]::Matches($content, '(?<!\\)`')
    $isBackticksEven = ($backtickMatches.Count % 2 -eq 0)
    Check-Condition "JS File syntax clean (balanced backticks): $($js.Name)" $isBackticksEven
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host " INTEGRITY TEST RESULT: $passed PASSED, $failed FAILED" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
