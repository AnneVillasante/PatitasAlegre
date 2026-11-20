<?php

namespace App\Services;

use RuntimeException;

class EsbClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim($_ENV['ESB_URL'] ?? 'http://localhost:8290/services', '/');
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

    public function consultarRucSunat(string $ruc): array
    {
        $url = "{$this->baseUrl}/SunatProxy/sunat/consultar-ruc";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['ruc' => $ruc]),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json; charset=utf-8',
                'X-Source-Service: 03-propietarios'
            ],
            CURLOPT_TIMEOUT => 10,
        ]);

        $respuesta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($respuesta === false) {
            return ['httpCode' => 502, 'body' => ['success' => false, 'mensaje' => 'ESB no disponible']];
        }

        return [
            'httpCode' => $httpCode,
            'body' => json_decode($respuesta, true) ?? ['success' => false, 'mensaje' => 'Respuesta inválida del ESB']
        ];
    }
}
