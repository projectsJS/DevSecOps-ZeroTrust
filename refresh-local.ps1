param(
    [string]$ImageTag = "devsecops-app:v2",
    [string]$DeploymentName = "devsecops-app"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot

try {
    Write-Host "Building image $ImageTag from ./app ..."
    & docker build -t $ImageTag ./app
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed."
    }

    Write-Host "Loading image into Minikube ..."
    & minikube image load $ImageTag
    if ($LASTEXITCODE -ne 0) {
        throw "Minikube image load failed."
    }

    Write-Host "Restarting deployment $DeploymentName ..."
    & kubectl rollout restart deployment/$DeploymentName
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment restart failed."
    }

    & kubectl rollout status deployment/$DeploymentName --timeout=180s
    if ($LASTEXITCODE -ne 0) {
        throw "Rollout did not complete successfully."
    }

    Write-Host "Refresh complete. If you use port-forward, keep it running or start it with: kubectl port-forward service/devsecops-service 8080:80"
}
finally {
    Pop-Location
}