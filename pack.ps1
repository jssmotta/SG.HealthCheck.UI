# Requires: .NET SDK, Node.js (HealthChecks.UI runs npm before pack).
param(
    [string]$Configuration = "Release",
    [string]$OutputDir = "./artifacts/nuget"
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Packing src/src.sln -> $OutputDir"
if ($env:PACKAGE_VERSION) {
    dotnet pack (Join-Path $PSScriptRoot "src/src.sln") -c $Configuration -o $OutputDir -p:Version=$env:PACKAGE_VERSION -p:PackageVersion=$env:PACKAGE_VERSION --verbosity minimal
} else {
    dotnet pack (Join-Path $PSScriptRoot "src/src.sln") -c $Configuration -o $OutputDir --verbosity minimal
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Packing SG.HealthCheck.csproj (meta-package SG.HealthChecks) -> $OutputDir"
if ($env:PACKAGE_VERSION) {
    dotnet pack (Join-Path $PSScriptRoot "SG.HealthCheck.csproj") -c $Configuration -o $OutputDir -p:Version=$env:PACKAGE_VERSION -p:PackageVersion=$env:PACKAGE_VERSION --verbosity minimal
} else {
    dotnet pack (Join-Path $PSScriptRoot "SG.HealthCheck.csproj") -c $Configuration -o $OutputDir --verbosity minimal
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Packages:"
Get-ChildItem $OutputDir -Filter "*.nupkg" | ForEach-Object { Write-Host "  $($_.Name)" }
