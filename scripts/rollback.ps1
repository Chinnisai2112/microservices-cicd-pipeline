param(
    [string]$Service = "user-service",
    [string]$Namespace = "microservices"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Executing Rollback for $Service in $Namespace" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Check rollout history
Write-Host "Fetching rollout history..."
kubectl rollout history deployment/$Service -n $Namespace

# Undo rollout to previous stable revision
Write-Host "Rolling back to previous revision..." -ForegroundColor Magenta
kubectl rollout undo deployment/$Service -n $Namespace

# Check rollout status
Write-Host "Monitoring rollout status..."
kubectl rollout status deployment/$Service -n $Namespace --timeout=60s

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Rollback completed successfully for $Service!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Rollback failed or timed out!" -ForegroundColor Red
    exit 1
}
