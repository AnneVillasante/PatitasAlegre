<?php

namespace App\Config;

use App\Controllers\PropietarioController;

class Rutas
{
    private array $mapa = [
        'POST /propietarios/registrar' => ['PropietarioController', 'registrar'],
        'POST /propietarios/consultar' => ['PropietarioController', 'consultar'],
        'POST /propietarios/listar' => ['PropietarioController', 'listar'],
        'POST /propietarios/actualizar' => ['PropietarioController', 'actualizar'],
        'POST /propietarios/eliminar' => ['PropietarioController', 'eliminar'],
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
        $controller = new $controllerClass();
        $controller->$metodoName();
    }
}
