# Test script for Phase 2 Authentication Verification

$baseUrl = "http://localhost:8080/api/auth"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  BEHAVIORLOCK PHASE 2 AUTH TEST SUITE   " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Test Valid Registration
Write-Host "`n[1/7] Testing User Registration (POST /api/auth/register)..." -ForegroundColor Yellow
$regBody = @{
    name = "Elena Rostova"
    email = "elena@behaviorlock.io"
    password = "Password123!"
    confirmPassword = "Password123!"
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "✓ Registration Successful!" -ForegroundColor Green
    Write-Host "   Token: $($regResponse.token.Substring(0, 25))..."
    Write-Host "   User ID: $($regResponse.id), Name: $($regResponse.name), Role: $($regResponse.role)"
    $script:jwtToken = $regResponse.token
} catch {
    Write-Host "✗ Registration Failed: $_" -ForegroundColor Red
}

# 2. Test Duplicate Email Registration Prevention
Write-Host "`n[2/7] Testing Duplicate Email Prevention..." -ForegroundColor Yellow
try {
    $dupResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "✗ Unexpected success on duplicate registration!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly Rejected Duplicate Registration with HTTP 400: $_" -ForegroundColor Green
}

# 3. Test Password Mismatch
Write-Host "`n[3/7] Testing Password Mismatch Validation..." -ForegroundColor Yellow
$mismatchBody = @{
    name = "Test User"
    email = "test@behaviorlock.io"
    password = "Password123!"
    confirmPassword = "DifferentPassword!"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Body $mismatchBody -ContentType "application/json"
    Write-Host "✗ Unexpected success on password mismatch!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly Rejected Password Mismatch: $_" -ForegroundColor Green
}

# 4. Test Valid Login
Write-Host "`n[4/7] Testing User Login (POST /api/auth/login)..." -ForegroundColor Yellow
$loginBody = @{
    email = "elena@behaviorlock.io"
    password = "Password123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login Successful!" -ForegroundColor Green
    Write-Host "   Issued Token: $($loginResponse.token.Substring(0, 25))..."
    $script:jwtToken = $loginResponse.token
} catch {
    Write-Host "✗ Login Failed: $_" -ForegroundColor Red
}

# 5. Test Invalid Password Login
Write-Host "`n[5/7] Testing Invalid Login Password..." -ForegroundColor Yellow
$badLoginBody = @{
    email = "elena@behaviorlock.io"
    password = "WrongPassword999"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body $badLoginBody -ContentType "application/json"
    Write-Host "✗ Unexpected success on bad credentials!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly Rejected Invalid Login Credentials (HTTP 401): $_" -ForegroundColor Green
}

# 6. Test Protected Endpoint GET /api/auth/me WITHOUT Token
Write-Host "`n[6/7] Testing Protected Endpoint (GET /api/auth/me) WITHOUT Token..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/me" -Method Get
    Write-Host "✗ Unexpected success without token!" -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly Blocked Unauthorized Request with HTTP 401: $_" -ForegroundColor Green
}

# 7. Test Protected Endpoint GET /api/auth/me WITH Valid JWT Token
Write-Host "`n[7/7] Testing Protected Endpoint (GET /api/auth/me) WITH Bearer Token..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $script:jwtToken" }
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/me" -Method Get -Headers $headers
    Write-Host "✓ Access Granted to Protected Resource!" -ForegroundColor Green
    Write-Host "   User ID: $($meResponse.id), Name: $($meResponse.name), Email: $($meResponse.email), Role: $($meResponse.role)"
} catch {
    Write-Host "✗ Failed to Access Protected Endpoint: $_" -ForegroundColor Red
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   ALL AUTHENTICATION TESTS COMPLETED    " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
