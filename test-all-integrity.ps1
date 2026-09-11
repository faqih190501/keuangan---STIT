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
    "js/utils/qr-engine.js",
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
Check-Condition "State version updated to SIMPEL_IF_STATE_V6_PROD" ($stateRaw.Contains("SIMPEL_IF_STATE_V6_PROD"))
Check-Condition "BKPI 2026 students included" ($stateRaw.Contains("Miftahul Jannah") -and $stateRaw.Contains("2601001"))
Check-Condition "PIAUD 2026 students included" ($stateRaw.Contains("Erlisa Rita Novika") -and $stateRaw.Contains("2602001"))
Check-Condition "Senior cohort students included" ($stateRaw.Contains("Abdullah Azam Robbani") -and $stateRaw.Contains("2001001"))
Check-Condition "Google Sheets Raw Matrix dataset present in state" ($stateRaw.Contains("googleSheetsMatrix") -and $stateRaw.Contains("bkpi2026") -and $stateRaw.Contains("piaud2026"))
Check-Condition "9 Scholarship Schemes Defined" ($stateRaw.Contains("MITRA_GRATIS") -and $stateRaw.Contains("ALUMNI_PONPES") -and $stateRaw.Contains("PAUD_LAKI"))

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

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host " INTEGRITY TEST RESULT: $passed PASSED, $failed FAILED" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
