<?php

namespace App\Services;

use RuntimeException;

class EsbClient
{
    private string $esbUrl;

    public function __construct()
    {
        $this->esbUrl = rtrim($_ENV['ESB_URL'] ?? 'http://localhost:8280/services', '/');
    }

    public function enviarCallback(string $proxyName, string $xmlPayload, string $action = ''): string
    {
        $ch = curl_init("{$this->esbUrl}/{$proxyName}");
        if ($ch === false) {
            throw new RuntimeException('No se pudo iniciar cURL');
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $xmlPayload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/xml; charset=utf-8',
                "SOAPAction: {$action}",
            ],
            CURLOPT_TIMEOUT => (int) ($_ENV['ESB_TIMEOUT'] ?? 30),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new RuntimeException("Falla de comunicación con ESB ({$proxyName}): {$error}");
        }
        if ($httpCode >= 400) {
            throw new RuntimeException("ESB respondió HTTP {$httpCode}");
        }
        return (string) $response;
    }
}
