<?php

namespace App\Services;

use RuntimeException;

class EsbClient
{
    private string $baseUrl;
    private int $timeout;
    private bool $habilitado;

    public function __construct()
    {
        $this->baseUrl = rtrim($_ENV['ESB_URL'] ?? 'http://localhost:8280/services', '/');
        $this->timeout = max(1, (int) ($_ENV['ESB_TIMEOUT'] ?? 30));
        $this->habilitado = filter_var(
            $_ENV['ESB_HABILITADO'] ?? 'true',
            FILTER_VALIDATE_BOOLEAN
        );
    }

    public function enviar(string $proxy, string $xmlPayload, string $soapAction = ''): string
    {
        if (!$this->habilitado) {
            throw new RuntimeException('ESB deshabilitado en configuración');
        }

        $url = "{$this->baseUrl}/{$proxy}";
        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException("No se pudo iniciar cURL para {$proxy}");
        }

        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xmlPayload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: text/xml; charset=utf-8',
                "SOAPAction: {$soapAction}",
            ],
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => min(10, $this->timeout),
        ]);

        $respuesta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($respuesta === false) {
            throw new RuntimeException("Error de conexión al ESB ({$proxy}): {$error}");
        }
        if ($httpCode >= 400) {
            throw new RuntimeException("ESB {$proxy} respondió HTTP {$httpCode}");
        }

        return $respuesta;
    }

    public function estaHabilitado(): bool
    {
        return $this->habilitado;
    }

    public static function respuestaAArray(string $xmlString): array
    {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlString);
        libxml_clear_errors();

        if ($xml === false) {
            return [];
        }

        return json_decode(json_encode($xml), true) ?: [];
    }

    public static function esError(array $respuesta): bool
    {
        return isset($respuesta['estado'])
            && strtoupper((string) $respuesta['estado']) === 'FALLIDO';
    }

    public static function mensajeError(array $respuesta): string
    {
        return (string) ($respuesta['mensaje'] ?? 'Error desconocido en el servicio remoto');
    }
}
