param(
    [string]$BaseUrl = 'http://127.0.0.1:8080'
)

$BaseUrl = $BaseUrl.TrimEnd('/')

$paths = @(
    '/',
    '/index.html',
    '/404.html',
    '/assets/images/logo.png',
    '/css/variables.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/receipt.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/billing-engine.js',
    '/js/modals.js',
    '/js/models.js',
    '/js/state.js',
    '/js/utils/chart-engine.js',
    '/js/utils/drag-scroll.js',
    '/js/utils/export-engine.js',
    '/js/utils/formatters.js',
    '/js/utils/image-compressor.js',
    '/js/utils/qr-engine.js',
    '/js/views/dashboard-bendahara.js',
    '/js/views/view-akademik.js',
    '/js/views/view-audit-log.js',
    '/js/views/view-kalender.js',
    '/js/views/view-laporan.js',
    '/js/views/view-login.js',
    '/js/views/view-mahasiswa.js',
    '/js/views/view-pimpinan.js',
    '/js/views/view-qr-validator.js',
    '/js/views/view-skema-tarif.js',
    '/js/views/view-verifikasi.js',
    '/js/views/view-matriks-rekap.js'
)

$urls = $paths | ForEach-Object { "$BaseUrl$_" }

$passed = 0
$failed = 0

foreach ($u in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 6
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
