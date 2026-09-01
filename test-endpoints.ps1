$urls = @(
    'http://127.0.0.1:8080/',
    'http://127.0.0.1:8080/index.html',
    'http://127.0.0.1:8080/404.html',
    'http://127.0.0.1:8080/assets/images/logo.png',
    'http://127.0.0.1:8080/css/variables.css',
    'http://127.0.0.1:8080/css/layout.css',
    'http://127.0.0.1:8080/css/components.css',
    'http://127.0.0.1:8080/css/receipt.css',
    'http://127.0.0.1:8080/css/responsive.css',
    'http://127.0.0.1:8080/js/app.js',
    'http://127.0.0.1:8080/js/auth.js',
    'http://127.0.0.1:8080/js/billing-engine.js',
    'http://127.0.0.1:8080/js/modals.js',
    'http://127.0.0.1:8080/js/models.js',
    'http://127.0.0.1:8080/js/state.js',
    'http://127.0.0.1:8080/js/utils/chart-engine.js',
    'http://127.0.0.1:8080/js/utils/drag-scroll.js',
    'http://127.0.0.1:8080/js/utils/export-engine.js',
    'http://127.0.0.1:8080/js/utils/formatters.js',
    'http://127.0.0.1:8080/js/utils/qr-engine.js',
    'http://127.0.0.1:8080/js/views/dashboard-bendahara.js',
    'http://127.0.0.1:8080/js/views/view-akademik.js',
    'http://127.0.0.1:8080/js/views/view-audit-log.js',
    'http://127.0.0.1:8080/js/views/view-laporan.js',
    'http://127.0.0.1:8080/js/views/view-login.js',
    'http://127.0.0.1:8080/js/views/view-mahasiswa.js',
    'http://127.0.0.1:8080/js/views/view-pimpinan.js',
    'http://127.0.0.1:8080/js/views/view-qr-validator.js',
    'http://127.0.0.1:8080/js/views/view-skema-tarif.js',
    'http://127.0.0.1:8080/js/views/view-verifikasi.js'
)

$passed = 0
$failed = 0

foreach ($u in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 3
        if ($res.StatusCode -eq 200) {
            Write-Host "[200 OK] $u" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "[$($res.StatusCode)] $u" -ForegroundColor Yellow
            $failed++
        }
    } catch {
        Write-Host "[FAIL] $u : $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nTest Result: $passed Passed, $failed Failed." -ForegroundColor Cyan
