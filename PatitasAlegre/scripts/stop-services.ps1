# =============================================================================
# Clinica Veterinaria Patitas Alegre (VetCare)
# Script para Detener los 9 Microservicios
# =============================================================================

[CmdletBinding()]
param(
    [switch]$IncludeDatabase # Opcionalmente detiene también MySQL si se indica
)

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   🛑 PATITAS ALEGRE - DETENER MICROSERVICIOS                  " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$servicePorts = @(
    @{ Port = 8080; Name = "01-registro (Spring Boot)" },
    @{ Port = 5000; Name = "02-auth (Flask)" },
    @{ Port = 8003; Name = "03-propietarios (PHP)" },
    @{ Port = 8081; Name = "04-mascotas (Spring Boot)" },
    @{ Port = 8005; Name = "05-personal (Flask)" },
    @{ Port = 3000; Name = "06-venta-node (Node.js)" },
    @{ Port = 8007; Name = "07-citas (PHP)" },
    @{ Port = 8008; Name = "08-farmacia (Spring Boot)" },
    @{ Port = 8010; Name = "10-notificaciones (PHP)" }
)

$stoppedCount = 0

foreach ($svc in $servicePorts) {
    $port = $svc.Port
    $name = $svc.Name
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($p in $pids) {
                $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($proc) {
                    $procName = $proc.ProcessName
                    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                    Write-Host "  🛑 [$port] ${name}: Proceso $procName (PID $p) detenido." -ForegroundColor Green
                    $stoppedCount++
                }
            }
        }
        else {
            Write-Host "  ⚪ [$port] ${name}: No estaba activo." -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Warning "No se pudo detener el proceso en el puerto ${port}: $_"
    }
}

Write-Host "-----------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Total de procesos detenidos: $stoppedCount`n" -ForegroundColor Cyan
