<?php

namespace App\Config;

use App\Controllers\CitaController;

class Rutas
{
    private array $mapa = [
        'POST /citas/crear' => ['CitaController', 'crear'],
        'POST /citas/consultar' => ['CitaController', 'consultar'],
        'POST /citas/listar' => ['CitaController', 'listarPorPropietario'],
        'POST /citas/cancelar' => ['CitaController', 'cancelar'],
    ];

    public function despachar(): void
    {
        $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $clave = "{$metodo} {$uri}";

        if (!isset($this->mapa[$clave])) {
            http_response_code(404);
            header('Content-Type: text/xml; charset=utf-8');
            echo '<?xml version="1.0" encoding="UTF-8"?><error><codigo>404</codigo><mensaje>Ruta no encontrada</mensaje></error>';
            return;
        }

        [$controllerName, $metodoName] = $this->mapa[$clave];
        $controllerClass = "App\\Controllers\\{$controllerName}";
        (new $controllerClass())->$metodoName();
    }
}
