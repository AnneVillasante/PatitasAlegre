<?php

use App\Controllers\NotificacionController;

return function (string $metodo, string $ruta): void {
    $controller = new NotificacionController();

    if ($metodo === 'POST' && $ruta === '/notificaciones/enviar') {
        $controller->enviar();
        return;
    }

    if ($metodo === 'GET' && preg_match('#^/notificaciones/consultar/([A-Za-z0-9-]+)$#', $ruta, $matches)) {
        $controller->consultar($matches[1]);
        return;
    }

    http_response_code(404);
    header('Content-Type: application/xml; charset=UTF-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><error><codigo>404</codigo><mensaje>Recurso no encontrado</mensaje></error>';
};
