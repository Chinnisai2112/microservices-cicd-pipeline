param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("blue", "green")]
    [string]$TargetVersion,

    [string]$ServiceName = "user-service-active",
    [string]$Namespace = "microservices"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Switching Traffic to $TargetVersion Version" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Patch the service selector to point to the desired deployment version
kubectl patch service $ServiceName -n $Namespace -p "{\`"spec\`":{\`"selector\`":{\`"version\`":\`"$TargetVersion\`"}}}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Traffic actively routed to $TargetVersion deployment!" -ForegroundColor Green
    kubectl get service $ServiceName -n $Namespace -o wide
} else {
    Write-Host "[ERROR] Failed to switch traffic!" -ForegroundColor Red
    exit 1
}
