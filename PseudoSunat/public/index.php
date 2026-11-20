<?php
require_once __DIR__ . '/../src/SunatDemoService.php';

use PseudoSunat\SunatDemoService;

header('Content-Type: application/xml; charset=utf-8');

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// 1. Endpoint B2B Facturación Electrónica (CPE)
if ($metodo === 'POST' && ($uri === '/ws/sunat/facturacion' || $uri === '/ws/sunat/emitir')) {
    try {
        $xmlInput = simplexml_load_string((string) file_get_contents('php://input'));
        $doc = trim((string) ($xmlInput->documentoCliente ?? ''));
        $monto = (float) ($xmlInput->montoTotal ?? 0);

        // Prueba de rechazo en vivo para Saga: RUC 20000000001 (BAJA DEFINITIVA)
        if ($doc === '20000000001') {
            http_response_code(422);
            echo '<?xml version="1.0" encoding="UTF-8"?>';
            echo '<EmitirComprobanteResponse>';
            echo '<codigo>422</codigo>';
            echo '<estado>RECHAZADO</estado>';
            echo '<mensaje>RUC 20000000001 en estado BAJA DEFINITIVA - No habilitado para emitir comprobantes</mensaje>';
            echo '</EmitirComprobanteResponse>';
            exit;
        }

        // Emisión exitosa de comprobante con CDR
        $correlativo = rand(1000, 9999);
        $hash = md5($doc . microtime());
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<EmitirComprobanteResponse>';
        echo '<codigo>0000</codigo>';
        echo '<estado>ACEPTADO</estado>';
        echo '<serieCorrelativo>F001-0000' . $correlativo . '</serieCorrelativo>';
        echo '<documentoCliente>' . htmlspecialchars($doc) . '</documentoCliente>';
        echo '<montoTotal>' . number_format($monto, 2, '.', '') . '</montoTotal>';
        echo '<mensaje>Comprobante aceptado por SUNAT (CDR Generado)</mensaje>';
        echo '<hashCdr>' . $hash . '</hashCdr>';
        echo '<fechaEmision>' . date('Y-m-d\TH:i:s') . '</fechaEmision>';
        echo '</EmitirComprobanteResponse>';
    } catch (\Throwable $e) {
        http_response_code(400);
        echo '<?xml version="1.0" encoding="UTF-8"?><EmitirComprobanteResponse><codigo>400</codigo><mensaje>' . htmlspecialchars($e->getMessage()) . '</mensaje></EmitirComprobanteResponse>';
    }
    exit;
}

// 2. Endpoint Consulta RUC (Padrón B2B)
if ($metodo === 'POST' && $uri === '/sunat/consultar-ruc') {
    // Validación B2B: si viene X-API-Key, validarla
    $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
    if ($apiKey !== '' && $apiKey !== 'SUNAT-B2B-SECRET-2026') {
        http_response_code(401);
        echo '<?xml version="1.0" encoding="UTF-8"?><error><codigo>401</codigo><mensaje>X-API-Key B2B invalida</mensaje></error>';
        exit;
    }

    try {
        $xmlInput = simplexml_load_string((string) file_get_contents('php://input'));
        $ruc = trim((string) ($xmlInput->ruc ?? ''));

        $resultado = (new SunatDemoService())->consultar($ruc);

        if (($resultado['success'] ?? false) !== true) {
            http_response_code(404);
            echo '<?xml version="1.0" encoding="UTF-8"?>';
            echo '<consultarRucResponse><success>false</success>';
            echo '<mensaje>' . htmlspecialchars($resultado['mensaje']) . '</mensaje>';
            echo '<ruc>' . htmlspecialchars($ruc) . '</ruc>';
            echo '</consultarRucResponse>';
            exit;
        }

        $d = $resultado['datos'];
        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<consultarRucResponse><success>true</success>';
        echo '<mensaje>' . htmlspecialchars($resultado['mensaje']) . '</mensaje>';
        echo '<datos>';
        foreach ($d as $k => $v) {
            echo "<{$k}>" . htmlspecialchars($v) . "</{$k}>";
        }
        echo '</datos></consultarRucResponse>';
    } catch (\InvalidArgumentException $e) {
        http_response_code(400);
        echo '<?xml version="1.0" encoding="UTF-8"?><consultarRucResponse><success>false</success><mensaje>' . htmlspecialchars($e->getMessage()) . '</mensaje></consultarRucResponse>';
    }
    exit;
}

http_response_code(404);
echo '<?xml version="1.0" encoding="UTF-8"?><error><codigo>404</codigo><mensaje>Operacion no soportada en PseudoSunat</mensaje></error>';
