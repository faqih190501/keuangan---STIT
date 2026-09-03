# PowerShell verification of student registration logic
$stateJs = Get-Content "d:\SIMPEL-IF\js\state.js" -Raw
$modalsJs = Get-Content "d:\SIMPEL-IF\js\modals.js" -Raw
$loginJs = Get-Content "d:\SIMPEL-IF\js\views\view-login.js" -Raw
$mahasiswaJs = Get-Content "d:\SIMPEL-IF\js\views\view-mahasiswa.js" -Raw

$checks = @(
    @{ Name = "registerStudent method in state.js"; Condition = $stateJs.Contains("registerStudent(studentData)") },
    @{ Name = "NIM collision check in state.js"; Condition = $stateJs.Contains("existingNim") },
    @{ Name = "Automatic invoice generation in state.js"; Condition = $stateJs.Contains("INV-2026-") -and $stateJs.Contains("REGISTER_STUDENT_SELF") },
    @{ Name = "openStudentRegistrationModal in modals.js"; Condition = $modalsJs.Contains("openStudentRegistrationModal") },
    @{ Name = "Live fee calculation in modals.js"; Condition = $modalsJs.Contains("updateLiveFeeBreakdown") },
    @{ Name = "Auto NIM generator in modals.js"; Condition = $modalsJs.Contains("generateRecommendedNim") },
    @{ Name = "Registration CTA card in view-login.js"; Condition = $loginJs.Contains("btn-open-student-register") },
    @{ Name = "Register tab in view-login.js"; Condition = $loginJs.Contains("tab-btn-register") },
    @{ Name = "Quick register button in view-login.js"; Condition = $loginJs.Contains("btn-quick-register-student") },
    @{ Name = "Inline register link in view-login.js form"; Condition = $loginJs.Contains("link-inline-register") },
    @{ Name = "Register button in view-mahasiswa.js topbar"; Condition = $mahasiswaJs.Contains("btn-topbar-register-student") }
)

$allPassed = $true
foreach ($check in $checks) {
    if ($check.Condition) {
        Write-Host "PASSED: $($check.Name)"
    } else {
        Write-Host "FAILED: $($check.Name)"
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`nAll 9 Registration Feature Verification Checks Passed!"
} else {
    Write-Host "`nSome checks failed."
}
