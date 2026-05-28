# Install ClickUp CLI as a global `clickup` command (Windows)
# Run with: powershell -ExecutionPolicy Bypass -File scripts\install.ps1

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

Write-Host ""
Write-Host "  ClickUp CLI -- Install" -ForegroundColor Cyan
Write-Host "  -----------------------------------------"
Write-Host ""

# 1. Install dependencies if needed
if (-Not (Test-Path "node_modules")) {
  Write-Host "  [1/3] Installing dependencies..."
  npm install --silent
} else {
  Write-Host "  [1/3] Dependencies already installed."
}

# 2. Build
Write-Host "  [2/3] Building..."
npm run build --silent
if ($LASTEXITCODE -ne 0) { exit 1 }

# 3. Link globally (npm creates clickup.cmd + clickup.ps1 in global bin)
Write-Host "  [3/3] Linking as global command..."
npm link --silent
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "  Done!" -ForegroundColor Green
Write-Host ""
Write-Host "  You can now run from anywhere:"
Write-Host "    clickup --help"
Write-Host "    clickup auth add"
Write-Host "    clickup browse"
Write-Host ""
Write-Host "  To uninstall later:"
Write-Host "    npm unlink -g clickup-cli"
Write-Host ""
