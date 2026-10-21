<?php

namespace App\Services;

use RuntimeException;

class EsbClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim($_ENV['ESB_URL'] ?? 'http://localhost:8280/services', '/');
    }

    public function enviar(string $proxyName, string $xmlPayload, string $soapAction = ''): string
    {
        $url = "{$this->baseUrl}/{$proxyName}";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xmlPayload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: text/xml; charset=utf-8',
                "SOAPAction: {$soapAction}",
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $respuesta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($respuesta === false) {
            throw new RuntimeException("Error de conexión al ESB: {$error}");
        }
        if ($httpCode >= 400) {
            throw new RuntimeException("ESB respondió con HTTP {$httpCode}");
        }

        return $respuesta;
    }
}
