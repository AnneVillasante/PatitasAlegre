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
            throw new RuntimeException('Error al parsear XML: ' . $mensaje);
        }

        return self::convertirAArray($xml);
    }

    private static function convertirAArray(SimpleXMLElement $xml): array
    {
        $resultado = [];
        foreach ($xml->children() as $hijo) {
            $nombre = $hijo->getName();
            $valor = trim((string) $hijo);
            $resultado[$nombre] = $valor !== '' ? $valor : null;
        }
        return $resultado;
    }
}
