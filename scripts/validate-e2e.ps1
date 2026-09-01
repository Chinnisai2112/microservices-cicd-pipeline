param(
    [string]$GatewayUrl = "http://localhost:8080"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting End-to-End Validation Tests" -ForegroundColor Yellow
Write-Host "  Gateway URL: $GatewayUrl" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Test-Endpoint {
    param($Name, $Url, $Method = "GET", $Body = $null)
    Write-Host "Testing $Name... " -NoNewline
    try {
        if ($Body) {
            $res = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec 5
        } else {
            $res = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 5
        }
        Write-Host "[PASSED]" -ForegroundColor Green
        $script:passed++
        return $res
    } catch {
        Write-Host "[FAILED] ($_)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# 1. Gateway Health
Test-Endpoint -Name "Gateway Health" -Url "$GatewayUrl/health"

# 2. User Service Endpoints
$user = Test-Endpoint -Name "Create User" -Url "$GatewayUrl/api/users" -Method "POST" -Body '{"name":"DevOps Intern","email":"intern@example.com"}'
Test-Endpoint -Name "List Users" -Url "$GatewayUrl/api/users"

# 3. Product Service Endpoints
$product = Test-Endpoint -Name "Create Product" -Url "$GatewayUrl/api/products" -Method "POST" -Body '{"name":"Cloud Kubernetes Guide","price":29.99,"stock":100}'
Test-Endpoint -Name "List Products" -Url "$GatewayUrl/api/products"

# 4. Order Service Endpoints
Test-Endpoint -Name "Create Order" -Url "$GatewayUrl/api/orders" -Method "POST" -Body '{"userId":"1","productId":"1","quantity":2}'
Test-Endpoint -Name "List Orders" -Url "$GatewayUrl/api/orders"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Validation Summary: $passed Passed, $failed Failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor Cyan

if ($failed -gt 0) { exit 1 }
