function Test-PortQuickly([string]$ip, [int]$port, [int]$timeoutMs = 300) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $iar = $tcpClient.BeginConnect($ip, $port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)
        if (-not $wait) {
            $tcpClient.Close()
            return $false
        }
        $tcpClient.EndConnect($iar)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "CLINICA VETERINARIA PATITAS ALEGRE - ESTADO INTEGRAL" -ForegroundColor Cyan
Write-Host "==========================================================`n" -ForegroundColor Cyan

$sections = @(
    @{
        Title = "[1] BASE DE DATOS"
        Items = @(
            @{ Name = "MySQL Server (Multi-Schema)"; Port = 3306; Role = "Persistencia general" }
        )
    },
    @{
        Title = "[2] MICROSERVICIOS INDIVIDUALES"
        Items = @(
            @{ Name = "01-registro (Spring Boot)"; Port = 8080; Role = "Registro usuarios" },
            @{ Name = "02-auth (Python Flask)"; Port = 5000; Role = "Autenticacion JWT" },
            @{ Name = "03-propietarios (PHP)"; Port = 8003; Role = "Gestion de dueños" },
            @{ Name = "04-mascotas (Spring Boot)"; Port = 8081; Role = "Expediente mascotas" },
            @{ Name = "05-personal (Python Flask)"; Port = 8005; Role = "Personal medico" },
            @{ Name = "06-venta-node (Node.js)"; Port = 3000; Role = "Pet shop / accesorios" },
            @{ Name = "07-citas (PHP)"; Port = 8007; Role = "Agenda medica" },
            @{ Name = "08-farmacia (Spring Boot)"; Port = 8008; Role = "Farmacia veterinaria" },
            @{ Name = "10-notificaciones (PHP)"; Port = 8010; Role = "Alertas y emails" }
        )
    },
    @{
        Title = "[3] ORQUESTACION (ESB / WSO2)"
        Items = @(
            @{ Name = "WSO2 ESB Gateway"; Port = 8280; Role = "Proxy / Synapse Services" },
            @{ Name = "WSO2 Carbon Admin Console"; Port = 9443; Role = "BPS / Admin Console" }
        )
    },
    @{
        Title = "[4] COREOGRAFIA (ActiveMQ Broker)"
        Items = @(
            @{ Name = "ActiveMQ OpenWire (Java JMS)"; Port = 61616; Role = "Eventos Farmacia / Pagos" },
            @{ Name = "ActiveMQ STOMP (PHP Listener)"; Port = 61613; Role = "Eventos Notificaciones" },
            @{ Name = "ActiveMQ Web Console"; Port = 8161; Role = "Panel de Topics / Colas" }
        )
    }
)

foreach ($sec in $sections) {
    Write-Host $sec.Title -ForegroundColor White
    Write-Host ("-" * 58) -ForegroundColor DarkGray
    foreach ($item in $sec.Items) {
        $isOpen = Test-PortQuickly "127.0.0.1" $item.Port
        $statusText = if ($isOpen) { " ACTIVO  " } else { " INACTIVO" }
        $statusColor = if ($isOpen) { "Green" } else { "DarkYellow" }

        Write-Host -NoNewline "  Puerto $($item.Port.ToString().PadRight(5)) | " -ForegroundColor Gray
        Write-Host -NoNewline "[$statusText]" -ForegroundColor $statusColor
        Write-Host " | $($item.Name.PadRight(30)) | $($item.Role)" -ForegroundColor Gray
    }
    Write-Host ""
}

