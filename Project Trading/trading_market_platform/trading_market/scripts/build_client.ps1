# build_client.ps1 — Build the Windows desktop client
param(
    [string]$Configuration = "Release",
    [string]$Runtime       = "win-x64"
)

$projectPath = "$PSScriptRoot\..\client\windows_app\TradingMarket.Client.csproj"

Write-Host "==> Building Trading Market Windows Client ($Configuration / $Runtime)..." -ForegroundColor Cyan

dotnet publish $projectPath `
    --configuration $Configuration `
    --runtime $Runtime `
    --self-contained true `
    -p:PublishSingleFile=true `
    -p:PublishTrimmed=false `
    --output "$PSScriptRoot\..\dist\windows"

if ($LASTEXITCODE -eq 0) {
    Write-Host "==> Build succeeded. Output: $PSScriptRoot\..\dist\windows" -ForegroundColor Green
} else {
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
