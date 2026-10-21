$ErrorActionPreference = 'Stop'

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "SMOKE TEST INTEGRAL - 9 MICROSERVICIOS (FASE 1)" -ForegroundColor Cyan
Write-Host "==========================================================`n" -ForegroundColor Cyan

$services = @(
    @{ Name = '01-registro'; Port = 8080; Url = 'http://127.0.0.1:8080/api/registro/estado'; Method = 'GET'; Body = $null; Type = 'JSON' },
    @{ Name = '02-auth'; Port = 5000; Url = 'http://127.0.0.1:5000/test-db'; Method = 'GET'; Body = $null; Type = 'JSON' },
    @{ Name = '03-propietarios'; Port = 8003; Url = 'http://127.0.0.1:8003/propietarios/listar'; Method = 'POST'; Body = '<listarPropietariosRequest/>'; Type = 'XML' },
    @{ Name = '04-mascotas'; Port = 8081; Url = 'http://127.0.0.1:8081/api/mascotas/estado'; Method = 'GET'; Body = $null; Type = 'TEXT' },
    @{ Name = '05-personal'; Port = 8005; Url = 'http://127.0.0.1:8005/veterinarios/especialidades'; Method = 'POST'; Body = '<listarEspecialidadesRequest/>'; Type = 'XML' },
    @{ Name = '06-venta-node'; Port = 3000; Url = 'http://127.0.0.1:3000/api/salud'; Method = 'GET'; Body = $null; Type = 'JSON' },
    @{ Name = '07-citas'; Port = 8007; Url = 'http://127.0.0.1:8007/citas/listar'; Method = 'POST'; Body = '<listarCitasRequest><id_propietario>1</id_propietario></listarCitasRequest>'; Type = 'XML' },
    @{ Name = '08-farmacia'; Port = 8008; Url = 'http://127.0.0.1:8008/farmacia/productos'; Method = 'GET'; Body = $null; Type = 'XML' },
    @{ Name = '10-notificaciones'; Port = 8010; Url = 'http://127.0.0.1:8010/notificaciones/consultar/NOT-NO-EXISTE'; Method = 'GET'; Body = $null; Type = 'XML' }
)

foreach ($service in $services) {
    $portOpen = Test-NetConnection 127.0.0.1 -Port $service.Port -InformationLevel Quiet
    if (-not $portOpen) {
        Write-Warning "$($service.Name.PadRight(18)): puerto $($service.Port) no disponible"
        continue
    }

    try {
        if ($service.Method -eq 'GET') {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $service.Url -Method Get
        } else {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $service.Url -Method Post -ContentType 'text/xml' -Body $service.Body
        }

        if ($service.Type -eq 'XML' -and $response.Content -notmatch '<\?xml|<[^>]+Response|<error') {
            throw 'La respuesta no parece XML'
        }

        Write-Host "$($service.Name.PadRight(18)): OK (HTTP $($response.StatusCode) - $($service.Type))" -ForegroundColor Green
    } catch {
        $resp = $_.Exception.Response
        if ($resp -and [int]$resp.StatusCode -eq 404 -and $service.Name -eq '10-notificaciones') {
            Write-Host "$($service.Name.PadRight(18)): OK (HTTP 404 - Controlado XML)" -ForegroundColor Green
            continue
        }
        $status = if ($resp) { [int]$resp.StatusCode } else { 'sin respuesta' }
        Write-Warning "$($service.Name.PadRight(18)): fallo HTTP ($status) - $($_.Exception.Message)"
    }
}

Write-Host "`nPrueba de humo finalizada.`n" -ForegroundColor Cyan
