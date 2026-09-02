# Start all microservices and the dashboard locally on Windows

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Starting Microservices Stack Locally (Windows)  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot

# 1. Start User Service (Port 3001)
Write-Host "Starting User Service on http://localhost:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\services\user-service'; Write-Host '--- USER SERVICE (3001) ---' -ForegroundColor Green; npm run dev"

# 2. Start Product Service (Port 3002)
Write-Host "Starting Product Service on http://localhost:3002..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\services\product-service'; Write-Host '--- PRODUCT SERVICE (3002) ---' -ForegroundColor Green; npm run dev"

# 3. Start Order Service (Port 8000)
Write-Host "Starting Order Service on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\services\order-service'; Write-Host '--- ORDER SERVICE (8000) ---' -ForegroundColor Green; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 4. Start Dashboard / API Gateway (Port 8080)
Write-Host "Starting Dashboard Gateway on http://localhost:8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\dashboard'; Write-Host '--- DASHBOARD GATEWAY (8080) ---' -ForegroundColor Green; node server.js"

Write-Host ""
Write-Host "All services have been launched in separate terminal windows!" -ForegroundColor Green
Write-Host "Open Dashboard: http://localhost:8080" -ForegroundColor Cyan
Write-Host "User Service:    http://localhost:3001/health" -ForegroundColor Gray
Write-Host "Product Service: http://localhost:3002/health" -ForegroundColor Gray
Write-Host "Order Service:   http://localhost:8000/health" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
