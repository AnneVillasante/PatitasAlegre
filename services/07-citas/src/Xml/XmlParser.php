<?php

namespace App\Xml;

use RuntimeException;
use SimpleXMLElement;

class XmlParser
{
    public static function parsear(string $xmlString): array
    {
        if (empty(trim($xmlString))) {
            throw new RuntimeException('XML vacío');
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlString);

        if ($xml === false) {
            $errores = libxml_get_errors();
            libxml_clear_errors();
            $mensaje = $errores ? trim($errores[0]->message) : 'XML inválido';
            throw new RuntimeException('XML inválido: ' . $mensaje);
        }

        return self::convertir($xml);
    }

    private static function convertir(SimpleXMLElement $nodo): array
    {
        $resultado = [];
        foreach ($nodo->children() as $hijo) {
            $nombre = $hijo->getName();
            if ($hijo->count() > 0) {
                $resultado[$nombre] = self::convertir($hijo);
            } else {
                $resultado[$nombre] = trim((string) $hijo) ?: null;
            }
        }
        return $resultado;
    }
}
