# ============================================================
# start-all.ps1
# Levanta toda la Clínica Veterinaria Patitas Alegres
# Uso: .\scripts\start-all.ps1
# ============================================================

param(
    [switch]$SkipDocker,   # Omitir Docker (MySQL y ActiveMQ)
    [switch]$SkipWait,     # No esperar entre servicios
    [switch]$OnlyServices  # Solo los servicios, sin Docker
)

$ErrorActionPreference = "Continue"

# ──────────────────────────────────────────────────────────
# Detectar la raíz del proyecto (donde está este script)
# ──────────────────────────────────────────────────────────
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $scriptPath

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🐾 CLÍNICA VETERINARIA PATITAS ALEGRES - INICIO" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📂 Raíz del proyecto: $root" -ForegroundColor Gray
Write-Host ""

# ──────────────────────────────────────────────────────────
# 1. Verificar Docker (MySQL y ActiveMQ)
# ──────────────────────────────────────────────────────────
if (-not $SkipDocker -and -not $OnlyServices) {
    Write-Host "🐳 [1/3] Verificando Docker..." -ForegroundColor Yellow
    $dockerRunning = $false
    try {
        docker info 2>$null | Out-Null
        $dockerRunning = $true
    }
    catch { }

    if ($dockerRunning) {
        Write-Host "  ✅ Docker corriendo" -ForegroundColor Green
        Write-Host "  🚀 Levantando infraestructura base (MySQL y ActiveMQ)..." -ForegroundColor Yellow

        Push-Location $root
        # Corregido: sintaxis moderna 'docker compose' y solo levanta mysql y activemq
        docker compose up -d mysql activemq 2>&1 | Out-Null
        Pop-Location

        if (-not $SkipWait) {
            Write-Host "  ⏳ Esperando 10s a que MySQL termine de inicializar..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        }
        Write-Host "  ✅ Infraestructura lista" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  Docker Desktop no está corriendo. Omitiendo infraestructura." -ForegroundColor Yellow
        Write-Host "  (Asegúrate de que MySQL local esté activo)" -ForegroundColor Gray
    }
    Write-Host ""
}

# ──────────────────────────────────────────────────────────
# 2. Liberar puertos si están ocupados
# ──────────────────────────────────────────────────────────
Write-Host "🔧 [2/3] Liberando puertos locales..." -ForegroundColor Yellow

$puertosServicios = @(8080, 5000, 8003, 8081, 8005, 3000, 8007, 8008, 8089, 8010, 8091, 8092, 8290)

foreach ($p in $puertosServicios) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        # Corregido: usar $procId en vez de la variable reservada de PowerShell $pid
        $procId = $conn.OwningProcess | Select-Object -First 1
        Write-Host "  🔪 Liberando puerto $p (PID $procId)..." -ForegroundColor DarkYellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 300
    }
}

Write-Host "  ✅ Puertos verificados y listos" -ForegroundColor Green
Write-Host ""

# ──────────────────────────────────────────────────────────
# 3. Levantar los 9 servicios
# ──────────────────────────────────────────────────────────
Write-Host "🚀 [3/3] Levantando servicios..." -ForegroundColor Yellow
Write-Host ""

function Start-Servicio {
    param(
        [string]$Nombre,
        [string]$Carpeta,
        [string]$Comando,
        [int]$Puerto
    )

    Write-Host "  ▶  $Nombre (puerto $Puerto)..." -ForegroundColor Cyan

    $rutaCompleta = Join-Path $root "services\$Carpeta"
    $fullCommand = "cd '$rutaCompleta'; Write-Host '=== $Nombre ===' -ForegroundColor Cyan; $Comando"

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand -WindowStyle Normal

    if (-not $SkipWait) {
        Start-Sleep -Seconds 1
    }
}

# ── Servicios B2B Externos (PseudoRENIEC y PseudoSUNAT) ───
Write-Host "🌐 Levantando servicios externos B2B..." -ForegroundColor Yellow

$parentDir = Split-Path -Parent $root

$rutaPseudoReniec = Join-Path $parentDir "PseudoReniec"
if (Test-Path $rutaPseudoReniec) {
    Write-Host "  ▶  PseudoRENIEC (Node.js - puerto 8091)..." -ForegroundColor Magenta
    $cmdReniec = "cd '$rutaPseudoReniec'; Write-Host '=== PseudoRENIEC (B2B Externo - 8091) ===' -ForegroundColor Magenta; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdReniec -WindowStyle Normal
    if (-not $SkipWait) { Start-Sleep -Seconds 1 }
}

$rutaPseudoSunat = Join-Path $parentDir "PseudoSunat"
if (Test-Path $rutaPseudoSunat) {
    Write-Host "  ▶  PseudoSUNAT (PHP - puerto 8092)..." -ForegroundColor Magenta
    $cmdSunat = "cd '$rutaPseudoSunat'; Write-Host '=== PseudoSUNAT (B2B Externo - 8092) ===' -ForegroundColor Magenta; php -S 0.0.0.0:8092 -t public public/router.php"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdSunat -WindowStyle Normal
    if (-not $SkipWait) { Start-Sleep -Seconds 1 }
}

# ── ESB Gateway (Node.js - Puerto 8290) ────────────────────
Write-Host "🔀 Levantando ESB Gateway (puerto 8290)..." -ForegroundColor Yellow
Start-Servicio -Nombre "esb-gateway" `
    -Carpeta "esb-gateway" `
    -Comando "npm start" `
    -Puerto 8290

# ── Servicio 09 Pagos (Node.js - Puerto 8089) ──────────────
Write-Host "💳 Levantando 09-pagos (puerto 8089)..." -ForegroundColor Yellow
Start-Servicio -Nombre "09-pagos" `
    -Carpeta "09-pagos" `
    -Comando "npm start" `
    -Puerto 8089

# ── Servicios Java ─────────────────────────────────────────
Start-Servicio -Nombre "01-registro" `
    -Carpeta "01-registro" `
    -Comando ".\mvnw.cmd spring-boot:run" `
    -Puerto 8080

Start-Servicio -Nombre "04-mascotas" `
    -Carpeta "04-mascotas" `
    -Comando ".\mvnw.cmd spring-boot:run" `
    -Puerto 8081

Start-Servicio -Nombre "08-farmacia" `
    -Carpeta "08-farmacia" `
    -Comando ".\mvn spring-boot:run" `
    -Puerto 8088

# ── Servicios Python ───────────────────────────────────────
Start-Servicio -Nombre "02-auth" `
    -Carpeta "02-auth" `
    -Comando "python app.py" `
    -Puerto 5000

Start-Servicio -Nombre "05-personal" `
    -Carpeta "05-personal" `
    -Comando "python app.py" `
    -Puerto 8005

# ── Servicios Node.js ──────────────────────────────────────
Start-Servicio -Nombre "06-venta-node" `
    -Carpeta "06-venta-node" `
    -Comando "npm start" `
    -Puerto 3000

# ── Servicios PHP ──────────────────────────────────────────
Start-Servicio -Nombre "03-propietarios" `
    -Carpeta "03-propietarios" `
    -Comando "php -S 0.0.0.0:8003 -t public" `
    -Puerto 8003

Start-Servicio -Nombre "07-citas" `
    -Carpeta "07-citas" `
    -Comando "php -S 0.0.0.0:8007 -t public" `
    -Puerto 8007

Start-Servicio -Nombre "10-notificaciones" `
    -Carpeta "10-notificaciones" `
    -Comando "php -S 0.0.0.0:8010 -t public" `
    -Puerto 8010

# ──────────────────────────────────────────────────────────
# 4. Esperar y verificar
# ──────────────────────────────────────────────────────────
if (-not $SkipWait) {
    Write-Host ""
    Write-Host "⏳ Esperando 30s a que los servicios terminen de inicializar..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📊 ESTADO DE LOS SERVICIOS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$servicios = @(
    @{ Nombre = "pseudo-reniec"; Puerto = 8091 },
    @{ Nombre = "pseudo-sunat"; Puerto = 8092 },
    @{ Nombre = "esb-gateway"; Puerto = 8290 },
    @{ Nombre = "01-registro"; Puerto = 8080 },
    @{ Nombre = "02-auth"; Puerto = 5000 },
    @{ Nombre = "03-propietarios"; Puerto = 8003 },
    @{ Nombre = "04-mascotas"; Puerto = 8081 },
    @{ Nombre = "05-personal"; Puerto = 8005 },
    @{ Nombre = "06-venta-node"; Puerto = 3000 },
    @{ Nombre = "07-citas"; Puerto = 8007 },
    @{ Nombre = "08-farmacia"; Puerto = 8008 },
    @{ Nombre = "09-pagos"; Puerto = 8089 },
    @{ Nombre = "10-notificaciones"; Puerto = 8010 }
)

$activos = 0; $inactivos = 0

foreach ($s in $servicios) {
    $ok = Test-NetConnection localhost -Port$s.Puerto -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($ok) {
        Write-Host "  ✅ $($s.Nombre.PadRight(20)) → puerto $($s.Puerto)" -ForegroundColor Green
        $activos++
    }
    else {
        Write-Host "  ❌ $($s.Nombre.PadRight(20)) → puerto $($s.Puerto)" -ForegroundColor Red
        $inactivos++
    }
}

Write-Host ""
Write-Host "  Total: $activos activos,$inactivos inactivos" -ForegroundColor $(if ($inactivos -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "✅ LISTO. Las ventanas de cada servicio han sido abiertas." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""