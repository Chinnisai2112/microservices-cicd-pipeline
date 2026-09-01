param(
    [Parameter(Mandatory = $true)]
    [string]$DockerHubUsername
)

Write-Host "Deploying microservices with Docker Hub user: $DockerHubUsername"

kubectl apply -f k8s/namespace.yaml

Get-ChildItem k8s/services/*.yaml | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'DOCKERHUB_USERNAME', $DockerHubUsername
    $content | kubectl apply -f -
}

kubectl apply -f k8s/monitoring/

Write-Host "Waiting for deployments..."
kubectl rollout status deployment/user-service -n microservices --timeout=120s
kubectl rollout status deployment/product-service -n microservices --timeout=120s
kubectl rollout status deployment/order-service -n microservices --timeout=120s

kubectl get pods -n microservices
Write-Host "Deployment complete!"
