param($port = 3001)

Write-Host "Forcefully killing all processes on port $port..." -ForegroundColor Yellow

# TCP 연결 확인
$tcpConnections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcpConnections) {
    $tcpConnections | ForEach-Object {
        $processId = $_.OwningProcess
        if ($processId -gt 0) {
            Write-Host "Killing process $processId (TCP)" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

# UDP 연결 확인 (필요한 경우)
$udpEndpoints = Get-NetUDPEndpoint -LocalPort $port -ErrorAction SilentlyContinue
if ($udpEndpoints) {
    $udpEndpoints | ForEach-Object {
        $processId = $_.OwningProcess
        if ($processId -gt 0) {
            Write-Host "Killing process $processId (UDP)" -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

# Node.js 프로세스 중 해당 포트를 사용하는 것 모두 종료
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    $connections = Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue
    if ($connections | Where-Object { $_.LocalPort -eq $port }) {
        Write-Host "Killing Node.js process $($_.Id)" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Port $port cleanup complete!" -ForegroundColor Green