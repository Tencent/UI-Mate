# Deploy all CUA-Gym-Hub mock apps on a single Windows server.
# Each mock runs as a separate vite preview process on consecutive ports.
#
# Prerequisites: Node.js (npm)
# Usage: .\deploy-all.ps1 [-SkipInstall] [-SkipBuild]
#   -SkipInstall  Skip npm install (use when deps are already installed)
#   -SkipBuild     Skip npm run build (use when dist/ already exists)

param(
    [switch]$SkipInstall,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$WebsitesDir = Join-Path $Root "websites"
$BasePort = 8000
$LogDir = Join-Path $Root ".deploy-logs"
$ManifestFile = Join-Path $Root ".deploy-manifest.json"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm not found. Install Node.js first."
}

$Mocks = Get-ChildItem $WebsitesDir -Directory -Filter "*_mock" |
    Sort-Object Name |
    ForEach-Object { $_.Name }

$Total = $Mocks.Count
if ($Total -eq 0) {
    Write-Error "No mock apps found under $WebsitesDir"
}

Write-Host "Found $Total mock apps — deploying on ports $BasePort-$($BasePort + $Total - 1)"

if (-not $SkipInstall) {
    Write-Host "Installing dependencies..."
    foreach ($Mock in $Mocks) {
        Push-Location (Join-Path $WebsitesDir $Mock)
        try { npm install --silent 2>&1 | Out-Null } catch { }
        finally { Pop-Location }
    }
}

if (-not $SkipBuild) {
    Write-Host "Installing Windows platform packages..."
    foreach ($Mock in $Mocks) {
        Push-Location (Join-Path $WebsitesDir $Mock)
        try {
            # 安装 Windows 平台原生包（不修改 package.json）
            npm install @rollup/rollup-win32-x64-msvc@^4.62.2 --no-save --prefer-offline 2>$null
            npm install lightningcss-win32-x64-msvc@^1.32.0 --no-save --prefer-offline 2>$null
        } finally { Pop-Location }
    }

    Write-Host "Building all mocks in parallel..."
    $BuildLogDir = Join-Path $env:TEMP ("cua-gym-build-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Force -Path $BuildLogDir | Out-Null
    $buildJobs = @()
    foreach ($Mock in $Mocks) {
        $mockPath = Join-Path $WebsitesDir $Mock
        $logFile = Join-Path $BuildLogDir "$Mock.log"
        $buildJobs += Start-Job -ScriptBlock {
            param($Path, $Log)
            Set-Location $Path
            npm run build --silent *> $Log
            if ($LASTEXITCODE -eq 0) { "OK" } else { "ERR" }
        } -ArgumentList $mockPath, $logFile
    }
    $buildJobs | Wait-Job | Out-Null
    for ($i = 0; $i -lt $Mocks.Count; $i++) {
        $status = Receive-Job $buildJobs[$i]
        Remove-Job $buildJobs[$i]
        if ($status -eq "OK") { Write-Host "  [OK]  $($Mocks[$i])" }
        else { Write-Host "  [ERR] $($Mocks[$i]) (see $(Join-Path $BuildLogDir "$($Mocks[$i]).log"))" }
    }
    Write-Host "Build complete (logs: $BuildLogDir)"
}

$MissingDist = @()
foreach ($Mock in $Mocks) {
    if (-not (Test-Path (Join-Path $WebsitesDir "$Mock\dist"))) {
        $MissingDist += $Mock
    }
}
if ($MissingDist.Count -gt 0) {
    Write-Host "WARNING: $($MissingDist.Count) mock(s) have no dist/ — their preview will fail:"
    foreach ($M in $MissingDist) { Write-Host "  - $M" }
}

# Stop previous deployment on the same port range.
for ($port = $BasePort; $port -lt ($BasePort + $Total); $port++) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($conn) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path $ManifestFile) {
    $old = Get-Content $ManifestFile -Raw | ConvertFrom-Json
    foreach ($entry in $old) {
        if ($entry.pid) {
            Stop-Process -Id $entry.pid -Force -ErrorAction SilentlyContinue
        }
    }
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
Get-ChildItem $LogDir -Filter "*.log" | Remove-Item -Force -ErrorAction SilentlyContinue

$NpmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $NpmCmd) { $NpmCmd = (Get-Command npm).Source }

$Manifest = @()
Write-Host "Starting preview servers..."
for ($i = 0; $i -lt $Total; $i++) {
    $Mock = $Mocks[$i]
    $Port = $BasePort + $i
    $mockPath = Join-Path $WebsitesDir $Mock
    $stdout = Join-Path $LogDir "$Mock.out.log"
    $stderr = Join-Path $LogDir "$Mock.err.log"

    $proc = Start-Process -FilePath $NpmCmd `
        -ArgumentList @("run", "preview", "--", "--host", "0.0.0.0", "--port", "$Port") `
        -WorkingDirectory $mockPath `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru

    $Manifest += [PSCustomObject]@{
        mock = $Mock
        port = $Port
        pid  = $proc.Id
        path = $mockPath
    }

    if ($i % 10 -eq 9) { Start-Sleep -Milliseconds 500 }
}

$Manifest | ConvertTo-Json -Depth 3 | Set-Content $ManifestFile -Encoding UTF8

$ServerIp = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
    Select-Object -First 1 -ExpandProperty IPAddress
)
if (-not $ServerIp) { $ServerIp = "127.0.0.1" }

Write-Host ""
Write-Host "=========================================="
Write-Host "All mocks started (manifest: $ManifestFile)"
Write-Host "Logs: $LogDir"
Write-Host "=========================================="
for ($i = 0; $i -lt $Total; $i++) {
    Write-Host ("  {0,-35} http://{1}:{2}" -f "$($Mocks[$i]):", $ServerIp, ($BasePort + $i))
}
Write-Host ""
Write-Host "Stop all: Get-Content '$ManifestFile' | ConvertFrom-Json | ForEach-Object { Stop-Process -Id `$_.pid -Force -ErrorAction SilentlyContinue }"
