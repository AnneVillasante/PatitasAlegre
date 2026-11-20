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
        Title = "[2] MICROSERVICIOS INTERNOS Y ENTIDADES EXTERNAS"
        Items = @(
            @{ Name = "01-registro (Spring Boot)"; Port = 8080; Role = "Registro usuarios" },
            @{ Name = "02-auth (Python Flask)"; Port = 5000; Role = "Autenticacion JWT" },
            @{ Name = "03-propietarios (PHP)"; Port = 8003; Role = "Gestion de duenos" },
            @{ Name = "04-mascotas (Spring Boot)"; Port = 8081; Role = "Expediente mascotas" },
            @{ Name = "05-personal (Python Flask)"; Port = 8005; Role = "Personal medico" },
            @{ Name = "06-venta-node (Node.js)"; Port = 3000; Role = "Pet shop / accesorios" },
            @{ Name = "07-citas (PHP)"; Port = 8007; Role = "Agenda medica" },
            @{ Name = "08-farmacia (Spring Boot)"; Port = 8008; Role = "Farmacia veterinaria" },
            @{ Name = "09-pagos (Node.js)"; Port = 8089; Role = "Procesamiento de pagos" },
            @{ Name = "10-notificaciones (PHP)"; Port = 8010; Role = "Alertas y emails" },
            @{ Name = "PseudoRENIEC (B2B Externo)"; Port = 8091; Role = "Padron DNI / Ciudadanos" },
            @{ Name = "PseudoSUNAT (B2B Externo)"; Port = 8092; Role = "Facturacion CPE y RUC" }
        )
    },
    @{
        Title = "[3] ORQUESTACION Y GATEWAY SOA"
        Items = @(
            @{ Name = "ESB Gateway & Orquestador"; Port = 8290; Role = "Mediador, Proxies B2B y Sagas" },
            @{ Name = "WSO2 ESB Gateway (Opcional)"; Port = 8280; Role = "Synapse Services clasico" }
        )
    },
    @{
        Title = "[4] MENSAJERIA Y BROKERS"
        Items = @(
            @{ Name = "RabbitMQ AMQP"; Port = 5672; Role = "Broker de eventos SOA (patitas.eventos)" },
            @{ Name = "RabbitMQ Panel Web"; Port = 15672; Role = "Administracion RabbitMQ" },
            @{ Name = "ActiveMQ OpenWire"; Port = 61616; Role = "Eventos Farmacia / Pagos" },
            @{ Name = "ActiveMQ Web Console"; Port = 8161; Role = "Panel ActiveMQ" }
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

