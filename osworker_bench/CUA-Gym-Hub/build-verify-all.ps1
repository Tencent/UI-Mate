$ErrorActionPreference = "Continue"
$root = "C:\Users\Administrator\Documents\CUA-Gym-Hub"
$skip = @("github_mock", "trello_mock")
$resultsFile = Join-Path $root "build-verify-results.jsonl"
$logDir = Join-Path $root "build-verify-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
if (Test-Path $resultsFile) { Remove-Item $resultsFile -Force }

$mocks = Get-ChildItem (Join-Path $root "websites") -Directory |
    Where-Object { $_.Name -notin $skip -and (Test-Path (Join-Path $_.FullName "package.json")) } |
    Sort-Object Name

$batchSize = 6
Write-Host "Building $($mocks.Count) mocks (batch=$batchSize, skipping: $($skip -join ', '))..."

$buildScript = {
    param([string]$MockName, [string]$MockPath, [string]$LogDir)
    $logFile = Join-Path $LogDir "$MockName.log"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $output = @()
    try {
        Set-Location $MockPath
        $output += "=== npm install ==="
        $output += (npm install 2>&1 | Out-String)
        if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE)" }
        $output += "=== npm run build ==="
        $output += (npm run build 2>&1 | Out-String)
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed (exit $LASTEXITCODE)" }
        $sw.Stop()
        [PSCustomObject]@{ mock = $MockName; status = "PASS"; durationSec = [math]::Round($sw.Elapsed.TotalSeconds, 1); error = $null }
    }
    catch {
        $sw.Stop()
        $err = $_.Exception.Message
        $text = $output -join "`n"
        $lines = $text -split "`n" | Where-Object { $_ -match "error|Error|ERROR|failed|Failed|Cannot find module|SyntaxError" } | Select-Object -Last 3
        if ($lines) { $err = ($lines | ForEach-Object { $_.Trim() }) -join " | " }
        [PSCustomObject]@{ mock = $MockName; status = "FAIL"; durationSec = [math]::Round($sw.Elapsed.TotalSeconds, 1); error = $err }
    }
    finally {
        ($output -join "`n") | Set-Content -Path $logFile -Encoding UTF8
    }
}

$allResults = @()
for ($i = 0; $i -lt $mocks.Count; $i += $batchSize) {
    $batch = $mocks[$i..([Math]::Min($i + $batchSize - 1, $mocks.Count - 1))]
    Write-Host "Batch $([int]($i/$batchSize + 1)): $($batch.Name -join ', ')"
    $jobs = @()
    foreach ($m in $batch) {
        $jobs += Start-Job -ScriptBlock $buildScript -ArgumentList $m.Name, $m.FullName, $logDir
    }
    $jobs | Wait-Job | Out-Null
    foreach ($job in $jobs) {
        $result = Receive-Job $job
        Remove-Job $job
        $allResults += $result
        $result | ConvertTo-Json -Compress | Add-Content -Path $resultsFile -Encoding UTF8
        Write-Host "  $($result.mock): $($result.status)"
    }
}

$passed = ($allResults | Where-Object { $_.status -eq "PASS" }).Count
$failed = ($allResults | Where-Object { $_.status -eq "FAIL" }).Count
Write-Host "DONE: PASS=$passed FAIL=$failed TOTAL=$($allResults.Count)"

$summary = [PSCustomObject]@{
    timestamp = (Get-Date -Format "o")
    branch = (git -C $root branch --show-current)
    skipped = $skip
    passed = $passed
    failed = $failed
    total = $allResults.Count + $skip.Count
    results = $allResults | Sort-Object mock
}
$summary | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root "build-verify-summary.json") -Encoding UTF8
