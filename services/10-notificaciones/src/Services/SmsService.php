<?php

namespace App\Services;

class SmsService
{
    public function enviar(string $telefono, string $mensaje): bool
    {
        error_log("[SMS SIMULADO] Enviando SMS a {$telefono}: {$mensaje}");
        return true;
    }
}
