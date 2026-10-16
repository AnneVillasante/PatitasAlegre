$ErrorActionPreference = 'Stop'

$services = @(
    @{ Name = '03-propietarios'; Port = 8003; Url = 'http://127.0.0.1:8003/propietarios/listar'; Body = '<listarPropietariosRequest/>' },
    @{ Name = '05-personal'; Port = 8005; Url = 'http://127.0.0.1:8005/veterinarios/especialidades'; Body = '<listarEspecialidadesRequest/>' },
    @{ Name = '07-citas'; Port = 8007; Url = 'http://127.0.0.1:8007/citas/listar'; Body = '<listarCitasRequest><id_propietario>1</id_propietario></listarCitasRequest>' },
    # @{ Name = '08-farmacia (Excluido)'; Port = 8008; Url = 'http://127.0.0.1:8008/farmacia/productos'; Body = $null },
    @{ Name = '10-notificaciones'; Port = 8010; Url = 'http://127.0.0.1:8010/notificaciones/consultar/NOT-NO-EXISTE'; Body = $null }
)

foreach ($service in $services) {
    $portOpen = Test-NetConnection 127.0.0.1 -Port $service.Port -InformationLevel Quiet
    if (-not $portOpen) {
        Write-Warning "$($service.Name): puerto $($service.Port) no disponible"
        continue
    }

    try {
        if ($null -eq $service.Body) {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $service.Url -Method Get
        } else {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $service.Url -Method Post -ContentType 'text/xml' -Body $service.Body
        }
        if ($response.Content -notmatch '<\?xml|<[^>]+Response') {
            throw 'La respuesta no parece XML'
        }
        Write-Host "$($service.Name): OK ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 'sin respuesta' }
        Write-Warning "$($service.Name): fallo HTTP ($status) - $($_.Exception.Message)"
    }
}
