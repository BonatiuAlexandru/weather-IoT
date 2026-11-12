# Gaseste IP-ul calculatorului in retea si il pune in aplicatia mobila (mobile\src\config.ts).
# Fisierul config.ts este ignorat de Git: fiecare student are IP-ul lui.
$f = Join-Path $PSScriptRoot "..\mobile\src\config.ts"
$ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } | Select-Object -First 1).IPv4Address.IPAddress
if (-not $ip) {
  $ip = "192.168.1.50"
  Write-Host "Nu am gasit IP-ul automat. Am pus unul de exemplu. Editeaza manual mobile\src\config.ts"
}
$line = 'export const API_URL = "http://' + $ip + ':3000";'
Set-Content -Path $f -Value $line -Encoding ASCII
Write-Host "IP setat in aplicatie: $ip"
